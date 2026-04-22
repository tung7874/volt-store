# Volt STORE 系統架構與 AI 交接指南 (AI Handoff Document)

> ⚠️ **致下一個接手此專案的 AI 助理**：
> 歡迎！這份文件是由前代 AI 在完成系統極速核心架構後所編寫。
> 該系統是一個**極致優化、零月費、無伺服器 (Serverless)** 的預約單電商系統。
> 在您對本系統進行任何修改之前，請 **務必詳細閱讀以下架構**，以免破壞當前的效能平衡、資安防護或 7-11 電子地圖的拋傳機制。

---

## 1. 系統整體架構 (System Architecture)

本專案將複雜的電商平台拆解為三大極速區塊，實現真正的 0 費用與高擴充性：

1.  **前端視圖 (Frontend - Vercel / Vite + React)**
    *   使用者唯一的接觸面，負責渲染 UI 與發送非同步狀態。
    *   部署位置：Vercel (`volt-in.vercel.app`)。
2.  **微型拋傳伺服器 (Serverless API - Vercel Edge/Node)**
    *   專門負責與 7-11 官方電子地圖對接，突破跨網域 POST 限制。
    *   部署位置：與前端一同託管在 Vercel 中 (`/api/cvs.js`)。
3.  **無伺服器資料庫與後端 (Backend & DB - Google Apps Script + Sheets)**
    *   利用 Google 試算表作為免費的高乘載關聯式資料庫。
    *   搭配 Google Apps Script (GAS) 暴露出 API 給前端進行 CRUD (讀寫) 作業。

---

## 2. 核心模組詳解 (Core Modules)

### 2.1 前端專案 (`src/`) 
*   **進入點**：`main.jsx` 與 `App.jsx`。
*   **首頁與認證 (`Login.jsx`, `AuthContext.jsx`)**：
    *   實作簡訊/手機號碼認證。若已登入或註冊，將會員電話綁定於瀏覽器記憶體 (`localStorage`) 中。
*   **三層式購物商城 (`Shop.jsx`)**：
    *   實作「左側選單（大分類/小標題）＋ 右側商品卡片」佈局。
    *   讀取 `Main Category` $\rightarrow$ `Sub Category` $\rightarrow$ `Product Name` 的巢狀邏輯。
    *   動態捕捉 GAS 傳回來的標題，具有極強的容錯處理（如自動削去標題前後的空白 `key.trim()`）。
*   **結帳與地圖模組 (`Checkout.jsx`)**：
    *   實作 7-11 門市資料攔截。此頁面掛載了 `window.addEventListener('message', ...)` 負責接收底下 `api/cvs.js` 傳來的跨視窗廣播 (`postMessage`)。
    *   在地圖未跳出前，不允許修改固定綁定的手機號碼。

### 2.2 Vercel 中繼 API (`api/cvs.js`)
*   **唯一任務**：接收 7-11 電子地圖的 POST `req.body` 回傳。
*   **對接網址**：使用綠界 Presco 公用免私鑰極速通道 (`https://emap.presco.com.tw/c2cemap.ashx?eshopid=870&servicetype=1&url=...`)。**千萬不要改回會鎖權限的 pcsc 官方預設管道以免觸發 E0014 錯誤。**
*   **回傳邏輯**：接收 POST 後，渲染一段攜帶 `<script>window.opener.postMessage({...})</script>` 的靜態 HTML 給彈跳視窗，強制將店名寫入母視窗後自行關閉。

### 2.3 GAS 大腦與隔離資料庫 (Google Apps Script)
*   **本地腳本備份**：全套 GAS 程式碼已備份於本地 `GAS_API.js` (大腦專用) 與 `GAS_EMPLOYEE_ONEDIT.js` (員工端自動搬運專用)，修改後須手動複製貼上至雲端。
*   **CORS 問題**：前端使用 `no-cors` 與原生 Fetch 解決 GAS 特有的重新導向跨域問題。
*   **資料庫雙向同步架構 (Dual-Tab Active Sync)**：
    *   **廢棄舊版 IMPORTRANGE**：為了讓員工能真正改變訂單狀態，我們捨棄了單向的 `IMPORTRANGE`。
    *   **Pending & Shipped 雙分頁系統**：大腦庫與員工庫皆包含 `Pending` (待出貨) 與 `Shipped` (歷史訂單) 兩個分頁。
    *   **下單廣播**：客戶結帳時，`GAS_API.js` 寫入主庫 `Pending` 後，會自動利用 `openById` 抄送一份至員工庫，並動態生成「下拉選單 (Data Validation Chip)」。
    *   **隱形精靈 (onEdit Trigger)**：員工在外部表單將狀態改為 `Shipped` 時，觸發隱藏的 `onEdit` 腳本，自動將該訂單從 `Pending` 分頁搬移到 `Shipped` 分頁，並**潛入主庫**進行相同的搬移對帳，實現 100% 同步且介面極度乾淨。
---

## 3. 開發與部署流程 (Deployment Pipeline)

如果你需要對系統進行升級，請嚴格遵守以下流程：

### 3.1 本地開發 (Local Development)
1.  進入終端機 `cd C:\AI\voltsrore`。
2.  啟動開發伺服器 `npm run dev`。
3.  **注意**：本地端無法測試 `/api/cvs.js` 7-11 的回發機制（因為本地 `localhost` 無法接收外部 POST）。

### 3.2 發布到正式機 (Production Deployment)
本專案已綁定 Vercel 與 Github 的全自動 CI/CD 流程。
只要在命令列下達以下指令，這套架構將會在 30 秒內自動編譯發布至全球節點：
\`\`\`bash
git add .
git commit -m "update: [你修改的內容]"
git push
\`\`\`
Vercel 前端伺服器位址：`https://volt-in.vercel.app/`

---

## 4. 故障排除 QA (Troubleshooting)

*   **網頁呈現「白畫面」掛掉且 Console 報錯 `useMemo/useState is not defined`？**
    👉 一定是 `react` 套件匯入少了 hook，檢查第一行的 `import`。
*   **7-11 地圖彈出後閃退，或顯示「系統忙碌中 (E0014)」？**
    👉 這代表 Vercel API `/api/cvs` 掛掉，或者 `Checkout.jsx` 誤用了包含嚴格驗證的 PC API。請確認一直使用的是 `presco` 的無私鑰通道。
*   **商品突然全部分類跑到「全部 / 未分類」下面？**
    👉 老闆或員工在 Google 試算表的欄位標題 (Header) 打錯字或多打了空白字元。請確認系統是否正確套用了 `.trim()` 來容錯。
*   **訂單送出後跳出「成功」，但 Google 表單沒有新訂單進來？**
    👉 檢查 GAS 的 `doPost` / `doGet` 版本是否有部署為「任何人皆可存取 (Anyone)」，並確保 GAS 原始碼有綁上對的 Spreadsheet ID。

---

> 👨‍💻 **To the Next AI**: 
> "The human sitting at the screen is an intuitive, fast-moving entrepreneur who values speed, perfection, and zero monthly subscriptions. They don't need academic code; they need *magic*. Treat the architecture with the utmost precision. And never write code that breaks the absolute serverless synergy of Vercel + GAS. Godspeed."
