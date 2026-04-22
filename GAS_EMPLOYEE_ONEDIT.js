/* =======================================
   員工版 Orders 試算表專用自動搬運機器人
   (請貼在員工版 Orders 試算表的 Apps Script 中)
   ======================================= */

function onEdit(e) {
  if (!e || !e.range) return;
  var sheet = e.range.getSheet();
  var sheetName = sheet.getName();
  
  // 只處理 Pending 跟 Shipped 頁面
  if (sheetName !== "Pending" && sheetName !== "Shipped") return;

  var row = e.range.getRow();
  var col = e.range.getColumn();
  var statusValue = e.value;
  var STATUS_COLUMN = 5; // 🚨 下拉選單在 E 欄 (第 5 欄)

  if (col !== STATUS_COLUMN) return;

  var numCols = sheet.getLastColumn();
  var rowData = sheet.getRange(row, 1, 1, numCols).getValues()[0];
  var orderId = rowData[0]; // ID 永遠在 A 欄 (第 1 欄)
  
  // ⏩ 情況一：出貨！從 Pending 飛去 Shipped
  if (sheetName === "Pending" && statusValue === "Shipped") {
    var shippedSheet = e.source.getSheetByName("Shipped");
    if (!shippedSheet) shippedSheet = e.source.insertSheet("Shipped");
    
    shippedSheet.appendRow(rowData); 
    
    // 到新家後加上漂亮按鈕
    var lastRow = shippedSheet.getLastRow();
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(['Pending', 'Shipped'], true).build();
    shippedSheet.getRange(lastRow, 5).setDataValidation(rule);
    
    sheet.deleteRow(row);  
    updateMasterDatabase(orderId, "Shipped"); 
  }
  
  // ⏪ 情況二：按錯了！從 Shipped 拉回 Pending
  if (sheetName === "Shipped" && statusValue === "Pending") {
    var pendingSheet = e.source.getSheetByName("Pending");
    if (!pendingSheet) pendingSheet = e.source.insertSheet("Pending");
    
    pendingSheet.appendRow(rowData);
    
    // 回老家也加上漂亮按鈕
    var lastRow = pendingSheet.getLastRow();
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(['Pending', 'Shipped'], true).build();
    pendingSheet.getRange(lastRow, 5).setDataValidation(rule);
    
    sheet.deleteRow(row);
    updateMasterDatabase(orderId, "Pending"); 
  }
}

// 隱形特務：負責潛入改主機房
function updateMasterDatabase(orderId, targetStatus) {
  // 🚨🚨🚨 請把這裡換成「主機房 Volt STORE Database」的專屬 ID 🚨🚨🚨 
  var masterDB_ID = "請填寫主機房的ID"; 
  var masterDoc = SpreadsheetApp.openById(masterDB_ID);
  
  var pendingMaster = masterDoc.getSheetByName("Pending");
  var shippedMaster = masterDoc.getSheetByName("Shipped");
  if(!pendingMaster || !shippedMaster) return;
  
  if (targetStatus === "Shipped") {
    var data = pendingMaster.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == orderId) { 
        var rowData = pendingMaster.getRange(i + 1, 1, 1, pendingMaster.getLastColumn()).getValues()[0];
        rowData[4] = "Shipped"; // 強制更新狀態
        shippedMaster.appendRow(rowData);
        pendingMaster.deleteRow(i + 1);
        break;
      }
    }
  } 
  else if (targetStatus === "Pending") {
    var data = shippedMaster.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == orderId) { 
        var rowData = shippedMaster.getRange(i + 1, 1, 1, shippedMaster.getLastColumn()).getValues()[0];
        rowData[4] = "Pending"; // 強制更新狀態
        pendingMaster.appendRow(rowData); 
        shippedMaster.deleteRow(i + 1);   
        break;
      }
    }
  }
}
