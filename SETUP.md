# SETUP 指南

這份文件帶你從 0 到 1 完成 Discord Bot 的安裝與啟動。

如果你要看所有指令怎麼用，直接看 `COMMANDS.md`。

## 1. 建立 Discord Bot

1. 前往 [Discord Developer Portal](https://discord.com/developers/applications)
2. 點選 `New Application`，建立你的應用程式
3. 進入 `Bot` 頁面，點選 `Add Bot`
4. 在 `Bot` 頁面複製 Token（稍後寫入 `.env`）

## 2. 開啟必要 Intents

在 `Bot` 頁面啟用：
- `SERVER MEMBERS INTENT`
- `MESSAGE CONTENT INTENT`

## 3. 邀請 Bot 進伺服器

在 `OAuth2 > URL Generator`：

### Scopes
- `bot`
- `applications.commands`

### Bot Permissions（建議）
- `View Channels`
- `Send Messages`
- `Embed Links`
- `Read Message History`
- `Manage Messages`
- `Manage Channels`
- `Manage Roles`
- `Kick Members`
- `Ban Members`
- `Moderate Members`
- `View Audit Log`

產生 URL 後，用該連結邀請 Bot 進你的伺服器。

## 4. 本機安裝

```bash
npm install
```

## 5. 設定環境變數

建立 `.env`：
```bash
cp .env.example .env
```
PowerShell：
```powershell
Copy-Item .env.example .env
```

填入內容：
```env
DISCORD_TOKEN=你的_bot_token
DISCORD_CLIENT_ID=你的應用程式ID
DISCORD_GUILD_ID=你的伺服器ID            # 可選：測試時建議填寫（註冊快）
DISCORD_ENV=development
DISCORD_AUTO_REGISTER_COMMANDS=false
```

## 6. 啟動機器人

```bash
npm start
```

若成功，終端會出現登入與指令註冊相關訊息。

## 7. 驗證功能

啟動後可先測：
- `/help`
- `/serverinfo`
- `/purge amount:5`
- `/poll question:今天吃什麼 option1:拉麵 option2:火鍋`

## 8. 常見問題

### 指令沒有出現
- 確認 Bot 具備 `applications.commands`
- 若是全域指令，等待幾分鐘到 1 小時
- 重新啟動 Bot

### 指令顯示權限不足
- 檢查 Bot 角色是否有對應權限
- 檢查頻道覆寫是否擋掉權限

### 無法寫入資料
- 確認專案的 `data/` 目錄可寫入

## 9. 部署建議

### PM2
```bash
npm i -g pm2
pm2 start index.js --name discord-bot-template
pm2 save
```

### Docker
```bash
docker build -t discord-bot-template .
docker run -d --name discord-bot-template --env-file .env discord-bot-template
```
