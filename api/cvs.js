export default function handler(req, res) {
  if (req.method === 'POST') {
    const bodyStr = JSON.stringify(req.body);
    
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="zh-TW">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>門市選擇成功</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f9fafb; margin: 0; }
            .box { text-align: center; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            h1 { font-size: 1.5rem; color: #111827; }
            p { color: #6b7280; }
          </style>
      </head>
      <body>
          <div class="box">
            <h1>門市選擇成功！</h1>
            <p>正在自動帶入資料...</p>
          </div>
          <script>
            try {
              window.opener.postMessage({
                type: 'CVS_STORE_SELECTED',
                payload: ${bodyStr}
              }, '*');
              
              setTimeout(() => {
                window.close();
              }, 500);
            } catch (e) {
              document.querySelector('p').innerText = '帶入失敗，請手動關閉此視窗並確認網頁權限。' + e.toString();
            }
          </script>
      </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(htmlResponse);
  } else {
    res.status(200).send('CVS Map Receiver is active. Ready to receive POST requests.');
  }
}
