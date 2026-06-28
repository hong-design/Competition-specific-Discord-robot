本地部署說明（Windows PowerShell）

前置：請先將專案資料夾切到：

```powershell
cd "c:\path\to\your\project"
```

1) 建立 `.env`（或將 `.env.example` 複製並加入你的 Token）：

```powershell
copy .env.example .env
# 然後用編輯器把 .env 裡的 DISCORD_TOKEN 替換為你的機器人 Token
notepad .env
```

或使用 PowerShell 直接寫入（請在執行前把 YOUR_TOKEN 換成真實的 Token）：

```powershell
"DISCORD_TOKEN=YOUR_TOKEN" | Out-File -Encoding utf8 .env
```

2) 安裝相依套件：

```powershell
npm install
```

3) 啟動機器人（前台）：

```powershell
npm start
```

4) 若要在背景管理（建議使用 PM2）：

```powershell
npm i -g pm2
pm run start
# 或使用 pm2 管理 npm script
pm2 start npm --name discord-bot-template -- start
pm2 save
```

5) 檢查日誌：

```powershell
# 若使用前台啟動：控制台會輸出日誌
# 若使用 pm2：
pm2 logs discord-bot-template --lines 200
```

注意：
- 此專案使用 `dotenv`，啟動時會從 `.env` 讀取 `DISCORD_TOKEN`。
- Node.js 版本至少需要 v18 或更高（請確認 `node --version`）。
