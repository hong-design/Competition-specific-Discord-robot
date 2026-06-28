# Discord Bot Template

這是一個用 `discord.js v14` 建立的 Discord 機器人模板，提供基本的管理、公告、投票與社群互動功能。

## 文件導航

- `DOCS.md`：所有文件的總入口
- `COMMANDS.md`：白話版指令手冊
- `QUICKSTART.md`：5 分鐘快速啟動
- `SETUP.md`：完整安裝流程
- `DEPLOYMENT_CHECKLIST.md`：正式上線前檢查清單

## 功能總覽

### 管理功能
- `/ban`：封鎖成員並記錄黑名單
- `/kick`：踢出成員
- `/mute`：暫時禁言
- `/unmute`：解除禁言
- `/warn`：警告成員
- `/purge`：批次刪除訊息
- `/lockdown`：鎖定頻道
- `/unlock`：解除鎖定
- `/slowmode`：設定慢速模式

### 社群功能
- `/announce`：發送公告
- `/poll`：建立投票
- `/reactionrole`：建立反應領取身分組
- `/serverinfo`：查看伺服器資訊
- `/userinfo`：查看成員資訊

### 活動功能
- `/checkin`：開放報到、成員自行報到、管理員代報到
- `/matchcall`：快速發送活動通知、地點與倒數時間
- `/result`：發布結果公告並記錄內容
- `/eventhub`：生成活動總覽面板

### 記錄與稽核
- `/report`：回報違規行為
- `/modlog`：查看管理紀錄
- `/blacklist`：查看或移除黑名單
- `/stats`：查看伺服器管理統計
- `/help`：查看指令說明

## 環境需求

- Node.js `>= 18`
- npm
- Discord Bot Token

## 我要怎麼把這份機器人套成我自己的

這份專案本質上就是一個 Discord Bot 模板。你要「套」起來，實際上就是做下面 5 件事：

1. 在 Discord Developer Portal 建立你自己的 Application 和 Bot。
2. 把你自己的 Bot Token 寫進 `.env`。
3. 用你自己的 Bot 邀請連結把它加進伺服器。
4. 把專案裡寫死的品牌字樣改成你的名稱。
5. 啟動後用 `/help`、`/serverinfo` 之類的指令驗證。

## 套版流程

### 1. 建立你自己的 Discord Bot

前往 [Discord Developer Portal](https://discord.com/developers/applications)：

1. 點 `New Application`
2. 輸入你的機器人名稱
3. 進入 `Bot`
4. 點 `Add Bot`
5. 複製 Token

建議同時開啟這兩個 Intents：

- `SERVER MEMBERS INTENT`
- `MESSAGE CONTENT INTENT`

### 2. 邀請 Bot 進你的伺服器

在 `OAuth2 > URL Generator` 勾選：

- Scopes：`bot`、`applications.commands`
- Bot Permissions：`View Channels`、`Send Messages`、`Embed Links`、`Read Message History`、`Manage Messages`、`Manage Channels`、`Manage Roles`、`Kick Members`、`Ban Members`、`Moderate Members`、`View Audit Log`

產生連結後，用那條 URL 把你的 Bot 邀進目標伺服器。

### 3. 安裝與設定

先安裝依賴：

```bash
npm install
```

建立環境變數檔：

```bash
cp .env.example .env
```

Windows PowerShell：

```powershell
Copy-Item .env.example .env
```

把 `.env` 改成這樣：

```env
DISCORD_TOKEN=你的_bot_token
DISCORD_CLIENT_ID=你的應用程式ID
DISCORD_GUILD_ID=你的測試伺服器ID
DISCORD_ENV=development
DISCORD_AUTO_REGISTER_COMMANDS=false
```

說明：

- `DISCORD_TOKEN`：必填，Bot 啟動時需要。
- `DISCORD_CLIENT_ID`：必填，用於部署 Slash Commands。
- `DISCORD_GUILD_ID`：建議開發時先填，Guild Commands 會先註冊到單一伺服器，更新比較快。
- `DISCORD_ENV`：可選，`development` 或 `production`。
- `DISCORD_AUTO_REGISTER_COMMANDS`：可選，若設定為 `true`，啟動時會自動註冊 Slash Commands。建議使用 `npm run deploy:commands` 進行命令部署。

### 4. 啟動

```bash
npm start
```

如果成功，終端機會看到登入與註冊 Slash Commands 的訊息。

### 5. 驗證

進 Discord 後先測這幾個：

- `/help`
- `/serverinfo`
- `/poll`
- `/purge amount:5`

如果你有填 `GUILD_ID`，通常幾秒到幾分鐘內就會看到指令。沒有填的話，走全域註冊，可能要等更久。

## 哪些地方要改，才算真的套成你的 Bot

### 必改

- Discord Developer Portal：改 Bot 名稱、頭像、About Me。
- `.env`：換成你自己的 `DISCORD_TOKEN`。
- `index.js`：目前狀態文字會顯示 `Discord Bot | /help`。
- `commands/help.js`：已替換為 `Discord Bot` 品牌字樣。
- `package.json`：可改 `name`、`description`、`author`。

### 建議一起改

- `README.md`
- `SETUP.md`
- `QUICKSTART.md`
- `DEPLOYMENT_CHECKLIST.md`

### 快速找出品牌字串

```bash
rg -n "Discord Bot" .
```

如果你在 Windows PowerShell 執行，也可以直接用同一條指令。

### 注意

`config.example.js` 目前只是示意檔，主程式 `index.js` 沒有載入它。也就是說，你改這個檔案，不會直接改到執行中的 Bot 行為。

## 常見自訂方式

### 這份專案適合社群與活動管理的地方

- 可以用 `/checkin open` 開放某一輪活動報到，再讓成員用 `/checkin join` 自行報到
- 可以用 `/checkin mark` 幫沒空操作指令的成員代報到
- 可以用 `/matchcall` 快速發布活動通知、場地資訊與倒數時間
- 可以用 `/result` 公布活動結果與相關內容，並把結果存檔
- 可以用 `/eventhub` 產生一張總覽卡，集中顯示目前報到狀態與近期結果
- 新增的 JSON 儲存工具會用原子寫入，降低資料檔損壞機率

### 新增一個 Slash Command

1. 在 `commands/` 新增一個 `.js`
2. 匯出 `data` 和 `execute`
3. 重啟 bot

啟動時 `index.js` 會自動讀 `commands/` 底下的檔案並重新註冊指令。

如果你不想動內建指令，也可以把你自己寫的新指令放進 `custom-commands/`。
這個資料夾同樣支援子資料夾，而且會在啟動時自動載入。

### 新增事件監聽

1. 在 `events/` 新增一個 `.js`
2. 匯出 `name` 和 `execute`
3. 重啟 bot

### 調整資料儲存

這份專案目前把資料寫在 `data/`：

- `data/logs.json`
- `data/warnings.json`
- `data/blacklist.json`
- `data/reactionroles.json`
- `data/bot.sqlite` (SQLite persisted guild settings, check-ins, results, and activity records)

註：`data/checkins.json` 與 `data/results.json` 已改為 SQLite 儲存，新的資料會寫入 `data/bot.sqlite`。
如果你要檢查或遷移舊資料，請留意相關的儲存模組與 SQLite 設定。

## 專案結構

```text
.
├─ index.js
├─ commands/
├─ custom-commands/
├─ events/
├─ utils/
├─ data/
├─ package.json
└─ README.md
```

## 常見問題

### 指令沒有出現

- 確認 Bot 已邀請進伺服器，而且有 `applications.commands`
- 確認 `.env` 的 `DISCORD_TOKEN` 正確
- 有填 `GUILD_ID` 就重開一次 bot
- 沒填 `GUILD_ID` 代表走全域註冊，可能要等一段時間

### 指令執行失敗

- 檢查 Bot 角色權限是否足夠
- 檢查頻道覆寫權限是否擋住 Bot
- `purge` 不能批次刪除超過 14 天的訊息，這是 Discord 限制

### 想換名字但 Discord 裡沒變

程式內字串和 Discord Portal 的 Bot 名稱是兩件事：

- Portal 控制的是 Bot 顯示名稱和頭像
- 專案檔案控制的是訊息內容、幫助面板、狀態文字

兩邊都要改。

## 一句話版本

如果你只是想先套起來，最短流程就是：

1. 建自己的 Discord Bot
2. 把 Token 填進 `.env`
3. 邀請 Bot 進伺服器
4. `npm install`
5. `npm start`
6. 搜 `Discord Bot` 確認品牌字串都已換好
