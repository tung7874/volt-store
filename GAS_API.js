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
    orderid: orderId, 
    time: time, 
    phone: data.phone, 
    recipientname: data.name || '',
    recipientphone: data.recipientPhone || data.phone, 
    storeid: data.storeId || '',
    items: itemsStr, 
    total: data.totalPrice, 
    status: 'Pending', 
    tracking: ''
  };
  
  var newRow = [];
  for (var j = 0; j < headers.length; j++) {
    var h = String(headers[j]).trim().toLowerCase();
    newRow.push(mappedData[h] !== undefined ? mappedData[h] : '');
  }
  
  pendingMasterSheet.appendRow(newRow);

  try {
    var employeeDbId = IDS.orders; 
    var employeeDb = SpreadsheetApp.openById(employeeDbId);
    var pendingEmployeeSheet = employeeDb.getSheetByName("Pending");
    
    if (pendingEmployeeSheet) {
      pendingEmployeeSheet.appendRow(newRow); 
      
      // 找出 Status 所在的欄位來掛上按鈕
      var cleanHeaders = headers.map(function(hd){ return String(hd).trim().toLowerCase(); });
      var statusColIndex = cleanHeaders.indexOf('status') + 1;
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
    
    var headers = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
    var phoneIdx = headers.indexOf('phone');
    if(phoneIdx === -1) phoneIdx = 2; // Default to Column C
    
    var itemsIdx = headers.indexOf('items');
    if(itemsIdx === -1) itemsIdx = 6; // Default to Column G
    
    var idIdx = headers.indexOf('orderid');
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

/* =========================================
   大宗物流：每日自動匯出交貨便 Excel
   ========================================= */
function exportDailyLogistics() {
  var FOLDER_ID = '1hidsE1G5eIsBNukR889_gGau9ud8uqmq';
  
  var masterDb = SpreadsheetApp.getActiveSpreadsheet();
  var pendingSheet = masterDb.getSheetByName("Pending");
  if (!pendingSheet) return;
  
  var data = pendingSheet.getDataRange().getValues();
  if (data.length < 2) return; // 沒訂單
  
  var activeHeaders = data[0].map(function(h) { return String(h).trim().toLowerCase(); });
  var nameIdx = activeHeaders.indexOf('recipientname');
  if (nameIdx === -1) nameIdx = activeHeaders.indexOf('name');
  
  var phoneIdx = activeHeaders.indexOf('recipientphone'); 
  if (phoneIdx === -1) phoneIdx = activeHeaders.indexOf('phone');
  
  var storeIdx = activeHeaders.indexOf('storeid');
  var statusIdx = activeHeaders.indexOf('status');
  
  var exportData = []; // 要貼入物流的資料陣列
  var EXPORT_HEADERS = [
    '服務類型範例(此欄不填寫)', '服務類型(請填寫代碼)', '實際包裹價值(必填)', 
    '寄件人姓名(必填)', '寄件人電話(必填)', '寄件人mail(必填)', 
    '退貨門市', '退貨門市店號', 
    '取件人姓名(必填)', '取件人電話(必填)', '取件人mail(必填)', 
    '取件門市(必填)', '取件門市店號(必填)'
  ];
  exportData.push(EXPORT_HEADERS);
  
  for (var i = 1; i < data.length; i++) {
    // 只有 Pending 的單才要列印！如果他被切去 Shipped 或是別的狀態就跳過
    if (statusIdx !== -1 && data[i][statusIdx] !== 'Pending') continue;
    
    var rawStore = data[i][storeIdx] || '';
    var sName = rawStore;
    var sCode = '';
    
    // 從 "7-11 星騰門市 (217477)" 中精準切字
    var nameMatch = rawStore.match(/(?:7-11\s*)?(.+?門市)/);
    var codeMatch = rawStore.match(/\((\d+)\)/);
    
    if (nameMatch) {
      sName = nameMatch[1].trim();
    }
    if (codeMatch) {
      sCode = codeMatch[1].trim();
    }
    
    exportData.push([
      '', // 服務類型範例
      '2', // 服務類型 (常溫不付款)
      '600', // 預設價值
      '董其昌', // 寄件人
      '0957770704', 
      'X@GMAIL.com', // 寄件email
      '', '', // 退貨門市 / 退貨店號(不填)
      data[i][nameIdx] || '', // 收件人姓名
      String(data[i][phoneIdx] || ''), // 收件電話 (轉成字串確保 0 開頭)
      'X@GMAIL.com', // 收件email
      sName, // 取件門市
      sCode // 取件門市店號
    ]);
  }
  
  if (exportData.length < 2) return; // 如果全部都已被剃除出貨了，就不用印空表格
  
  // 以當天年月日替檔案命名 (例如: 20260423_交貨便)
  var todayStr = Utilities.formatDate(new Date(), "Asia/Taipei", "yyyyMMdd");
  var newSpreadsheet = SpreadsheetApp.create(todayStr + "_交貨便大宗寄件");
  
  // 將資料寫入第一個分頁
  var sheet = newSpreadsheet.getSheets()[0];
  sheet.getRange(1, 1, exportData.length, exportData[0].length).setValues(exportData);
  
  // 移動檔案至你指定的 shipdata 資料夾
  var fileId = newSpreadsheet.getId();
  var file = DriveApp.getFileById(fileId);
  var targetFolder = DriveApp.getFolderById(FOLDER_ID);
  file.moveTo(targetFolder);
}
