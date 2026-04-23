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
  var itemsStr = Array.isArray(data.items) ? data.items.join('\n') : String(data.items);
  
  // 動態掃描並配對 10 個欄位，永遠不怕位移！
  var headers = pendingMasterSheet.getDataRange().getValues()[0] || ['orderId', 'time', 'phone', 'recipientName', 'recipientPhone', 'storeId', 'items', 'total', 'status', 'tracking'];
  
  var mappedData = {
    orderId: orderId, 
    time: time, 
    phone: data.phone, 
    recipientName: data.name || '',
    recipientPhone: data.recipientPhone || data.phone, 
    storeId: data.storeId || '',
    items: itemsStr, 
    total: data.totalPrice, 
    status: 'Pending', 
    tracking: ''
  };
  
  var newRow = [];
  for (var j = 0; j < headers.length; j++) {
    newRow.push(mappedData[headers[j]] || '');
  }
  
  pendingMasterSheet.appendRow(newRow);

  try {
    var employeeDbId = IDS.orders; 
    var employeeDb = SpreadsheetApp.openById(employeeDbId);
    var pendingEmployeeSheet = employeeDb.getSheetByName("Pending");
    
    if (pendingEmployeeSheet) {
      pendingEmployeeSheet.appendRow(newRow); 
      
      // 找出 Status 所在的欄位來掛上按鈕 (通常是第9欄 'status')
      var statusColIndex = headers.indexOf('status') + 1;
      if(statusColIndex === 0) statusColIndex = 9; 
      
      var lastRow = pendingEmployeeSheet.getLastRow();
      var cellToMakeDropdown = pendingEmployeeSheet.getRange(lastRow, statusColIndex); 
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
    if(data.length < 2) return;
    
    var headers = data[0];
    var phoneIdx = headers.indexOf('phone');
    if(phoneIdx === -1) phoneIdx = 2; // Default to Column C
    
    var itemsIdx = headers.indexOf('items');
    if(itemsIdx === -1) itemsIdx = 6; // Default to Column G
    
    var idIdx = headers.indexOf('orderId');
    if(idIdx === -1) idIdx = 0;
    
    var totalIdx = headers.indexOf('total');
    if(totalIdx === -1) totalIdx = 7;
    
    var statusIdx = headers.indexOf('status');
    if(statusIdx === -1) statusIdx = 8;
    
    var timeIdx = headers.indexOf('time');
    if(timeIdx === -1) timeIdx = 1;

    for (var i = 1; i < data.length; i++) {
      var rowCleanPhone = String(data[i][phoneIdx]).replace(/^'/, ''); 
      if (rowCleanPhone === cleanPhone) {
        var itemsParsed = [];
        try {
           itemsParsed = JSON.parse(data[i][itemsIdx]); 
        } catch(e){}
        
        var itemsStr = data[i][itemsIdx];
        if (Array.isArray(itemsParsed)) {
           itemsStr = itemsParsed.map(function(item) {
              return item.name + ' x ' + item.qty;
           }).join(', ');
        }
        
        orders.push({
           id: data[i][idIdx],
           phone: data[i][phoneIdx],
           items: itemsStr,
           total: data[i][totalIdx],       
           status: data[i][statusIdx],      
           date: data[i][timeIdx]         
        });
      }
    }
  }
  
  fetchFromSheet(pendingSheet);
  fetchFromSheet(shippedSheet);
  
  orders.sort(function(a, b) {
     return new Date(b.date) - new Date(a.date);
  });
  
  return ContentService.createTextOutput(JSON.stringify({status: 'success', data: orders})).setMimeType(ContentService.MimeType.JSON);
}
