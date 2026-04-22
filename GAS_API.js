/* ========================
   Volt STORE API 終極版
   (請全選複製此檔案內容，貼上至 Google Apps Script)
   ======================== */

const IDS = {
  products: '1cM41Lsi7XeAOVGhgdwlLqgPJ_C1W3ToVQlmVGoCz_Qc',
  users: '1qx93GCpW_VzEVxNMGFR-n_E6rYoSbfBdK33JCjOoBZo',
  config: '1v0XfzcgzHmK2ABdoHmYBBOYIGpUgUOrZwAGN5Egf3rc',
  orders: '1Du9J3X_UMpj-li0HBNidnxwcBOnr234G_WJHPDN9JKE' // 自動抓取員工版 Orders 表單的ID！
};

function getProductsSheet() { return SpreadsheetApp.openById(IDS.products).getSheets()[0]; }
function getUsersSheet() { return SpreadsheetApp.openById(IDS.users).getSheets()[0]; }
function getConfigSheet() { return SpreadsheetApp.openById(IDS.config).getSheets()[0]; }

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'getProducts') return handleGetProducts();
  if (action === 'login') return handleLogin(e.parameter.phone);
  if (action === 'getOrders') return handleGetOrders(e.parameter.phone);
  
  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Unknown action'})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  if (action === 'updateProfile') return handleUpdateProfile(data);
  if (action === 'createOrder') return handleCreateOrder(data);
  return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Unknown action'})).setMimeType(ContentService.MimeType.JSON);
}

function handleGetProducts() {
  try {
    var sheet = getProductsSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var products = [];
    for (var i = 1; i < data.length; i++) {
        var p = {};
        for (var j = 0; j < headers.length; j++) {
        p[headers[j]] = data[i][j];
        }
        products.push(p);
    }
    return ContentService.createTextOutput(JSON.stringify({
        status: 'success', message: 'Products fetched', data: products
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleLogin(phone) {
  var sheet = getUsersSheet();
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var cleanPhone = phone.replace(/^'/, '');
  for (var i = 1; i < data.length; i++) {
    var rowPhone = String(data[i][0]).replace(/^'/, '');
    if (rowPhone === cleanPhone) {
      var user = {};
      for (var j = 0; j < headers.length; j++) {
        user[headers[j]] = data[i][j] ? String(data[i][j]).replace(/^'/, '') : '';
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success', message: 'Login success', data: user
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success', message: 'New user'
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleUpdateProfile(data) {
  var sheet = getUsersSheet();
  var headers = sheet.getDataRange().getValues()[0] || ['phone', 'refPhone', 'name', 'storeId', 'storeName'];
  var newRow = [];
  for (var j = 0; j < headers.length; j++) {
    newRow.push(data[headers[j]] || '');
  }
  sheet.appendRow(newRow);
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success', message: 'Profile updated'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.JSON).setHeader("Access-Control-Allow-Origin", "*").setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS").setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/* =========================================
   以下是全新的訂單與歷史系統 (暴力直球版)
   ========================================= */

function handleCreateOrder(data) {
  var masterDb = SpreadsheetApp.getActiveSpreadsheet();
  var pendingMasterSheet = masterDb.getSheetByName("Pending");
  
  var orderId = 'ORD' + new Date().getTime();
  var time = new Date().toLocaleString('zh-TW', {timeZone: 'Asia/Taipei'});
  var itemsStr = JSON.stringify(data.items);
  
  // 依照 7 個欄位順序：[ID, Phone, Items, TotalPrice, Status, CreatedAt, UpdatedAt]
  var newRow = [orderId, data.phone, itemsStr, data.totalPrice, 'Pending', time, ''];
  
  // 寫入大腦主機房
  pendingMasterSheet.appendRow(newRow);

  // 同步抄送給員工版
  try {
    var employeeDbId = IDS.orders; // 直接抓取最上面你寫好的 IDS
    var employeeDb = SpreadsheetApp.openById(employeeDbId);
    var pendingEmployeeSheet = employeeDb.getSheetByName("Pending");
    
    if (pendingEmployeeSheet) {
      pendingEmployeeSheet.appendRow(newRow); 
      
      // 第 5 欄 Status 自動掉出圓角按鈕
      var lastRow = pendingEmployeeSheet.getLastRow();
      var cellToMakeDropdown = pendingEmployeeSheet.getRange(lastRow, 5); 
      var rule = SpreadsheetApp.newDataValidation().requireValueInList(['Pending', 'Shipped'], true).build();
      cellToMakeDropdown.setDataValidation(rule);
    }
  } catch(e) {
    console.error("同步至員工版失敗");
  }

  return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Order created', orderId: orderId})).setMimeType(ContentService.MimeType.JSON);
}

function handleGetOrders(phone) {
  var masterDb = SpreadsheetApp.getActiveSpreadsheet();
  var pendingSheet = masterDb.getSheetByName("Pending");
  var shippedSheet = masterDb.getSheetByName("Shipped");
  
  var cleanPhone = phone.replace(/^'/, ''); 
  var orders = [];
  
  function fetchFromSheet(sheet) {
    if (!sheet) return;
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var rowCleanPhone = String(data[i][1]).replace(/^'/, ''); 
      if (rowCleanPhone === cleanPhone) {
        var itemsParsed = [];
        try {
           itemsParsed = JSON.parse(data[i][2]); 
        } catch(e){}
        
        var itemsStr = data[i][2];
        if (Array.isArray(itemsParsed)) {
           itemsStr = itemsParsed.map(function(item) {
              return item.name + ' x' + item.qty;
           }).join(', ');
        }
        
        orders.push({
           id: data[i][0],
           phone: data[i][1],
           items: itemsStr,
           total: data[i][3],       
           status: data[i][4],      
           date: data[i][5]         
        });
      }
    }
  }
  
  fetchFromSheet(pendingSheet);
  fetchFromSheet(shippedSheet);
  
  // 依時間排序 (最新在最上)
  orders.sort(function(a, b) {
     return new Date(b.date) - new Date(a.date);
  });
  
  return ContentService.createTextOutput(JSON.stringify({status: 'success', data: orders})).setMimeType(ContentService.MimeType.JSON);
}
