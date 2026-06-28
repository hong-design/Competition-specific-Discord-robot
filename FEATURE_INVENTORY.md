# 功能盤點 - Discord Bot Template v2.0

**建立日期：** 2025-06-29  
**目的：** 詳盡列出所有現有功能、Slash Commands、事件、權限需求與依賴設定，作為開源化重構的基準。

---

## 1. Slash Commands 清單

### 1.1 管理指令

#### `/ban`
- **用途：** 封鎖成員並記錄黑名單
- **參數：** 
  - `target` (Mentionable)：要封鎖的成員
  - `reason` (String, optional)：封鎖原因
- **權限需求：** `BAN_MEMBERS` 或 `ManageGuild`
- **依賴資料：** 
  - `data/blacklist.json`：儲存黑名單
  - `data/logs.json`：管理紀錄
- **當前是否綁定舊設定：** 否

#### `/kick`
- **用途：** 踢出成員
- **參數：** 
  - `target` (Mentionable)：要踢出的成員
  - `reason` (String, optional)：踢出原因
- **權限需求：** `KICK_MEMBERS` 或 `ManageGuild`
- **依賴資料：** `data/logs.json`
- **當前是否綁定舊設定：** 否

#### `/mute`
- **用途：** 暫時禁言成員
- **參數：** 
  - `target` (Mentionable)：要禁言的成員
  - `duration_seconds` (Integer)：禁言秒數
  - `reason` (String, optional)：原因
- **權限需求：** `MODERATE_MEMBERS` 或 `ManageGuild`
- **依賴資料：** `data/logs.json`
- **當前是否綁定舊設定：** 否

#### `/unmute`
- **用途：** 解除禁言
- **參數：** 
  - `target` (Mentionable)：要解除禁言的成員
- **權限需求：** `MODERATE_MEMBERS` 或 `ManageGuild`
- **依賴資料：** `data/logs.json`
- **當前是否綁定舊設定：** 否

#### `/warn`
- **用途：** 警告成員
- **參數：** 
  - `target` (Mentionable)：要警告的成員
  - `reason` (String)：警告原因
- **權限需求：** `ManageGuild`
- **依賴資料：** `data/warnings.json`
- **當前是否綁定舊設定：** 否

#### `/purge`
- **用途：** 批次刪除訊息
- **參數：** 
  - `count` (Integer)：要刪除的訊息數
  - `target` (Mentionable, optional)：指定要刪除該成員的訊息
  - `contains` (String, optional)：刪除包含特定文字的訊息
- **權限需求：** `ManageMessages`
- **依賴資料：** `data/logs.json`
- **當前是否綁定舊設定：** 否

#### `/lockdown`
- **用途：** 鎖定頻道（禁止成員發言）
- **參數：** 
  - `reason` (String, optional)：鎖定原因
- **權限需求：** `ManageChannels`
- **依賴資料：** `data/logs.json`
- **當前是否綁定舊設定：** 否

#### `/unlock`
- **用途：** 解除鎖定
- **參數：** 無
- **權限需求：** `ManageChannels`
- **依賴資料：** `data/logs.json`
- **當前是否綁定舊設定：** 否

#### `/slowmode`
- **用途：** 設定頻道慢速模式
- **參數：** 
  - `seconds` (Integer)：冷卻秒數（0 = 關閉）
  - `reason` (String, optional)：原因
- **權限需求：** `ManageChannels`
- **依賴資料：** `data/logs.json`
- **當前是否綁定舊設定：** 否

### 1.2 社群指令

#### `/announce`
- **用途：** 發送公告
- **參數：** 
  - `channel` (Channel)：要發佈的頻道
  - `title` (String)：公告標題
  - `content` (String)：公告內容
  - `mention_role` (Role, optional)：要 @ 的身分組
- **權限需求：** `ManageGuild` 或 `ManageMessages`
- **依賴資料：** `data/logs.json`
- **當前是否綁定舊設定：** 否

#### `/poll`
- **用途：** 建立投票
- **參數：** 
  - `question` (String)：投票問題
  - `option1` (String)：選項 1
  - `option2` (String)：選項 2
  - `option3...5` (String, optional)：選項 3～5
- **權限需求：** `ManageGuild`
- **依賴資料：** 無（使用 Reaction）
- **當前是否綁定舊設定：** 否

#### `/reactionrole`
- **用途：** 建立 Reaction 領取身分組
- **參數：** 
  - `message_id` (String)：訊息 ID
  - `reaction` (String)：Emoji
  - `role` (Role)：要領取的身分組
  - `custom_message` (String, optional)：自訂說明
- **權限需求：** `ManageRoles` 或 `ManageGuild`
- **依賴資料：** `data/reactionroles.json`
- **當前是否綁定舊設定：** 否

#### `/serverinfo`
- **用途：** 查看伺服器資訊
- **參數：** 無
- **權限需求：** 無
- **依賴資料：** 無
- **當前是否綁定舊設定：** 否

#### `/userinfo`
- **用途：** 查看成員資訊
- **參數：** 
  - `user` (User, optional)：要查看的成員（預設自己）
- **權限需求：** 無
- **依賴資料：** 無
- **當前是否綁定舊設定：** 否

#### `/help`
- **用途：** 顯示指令說明
- **參數：** 
  - `command` (String, optional)：特定指令名稱
- **權限需求：** 無
- **依賴資料：** 無
- **當前是否綁定舊設定：** 否

### 1.3 賽事指令

#### `/checkin`
- **用途：** 開放報到、選手自行報到、管理員代報到
- **參數：**
  - Subcommand: `open`
    - `title` (String)：場次名稱
    - `channel` (Channel, optional)：報到頻道
    - `note` (String, optional)：備註
  - Subcommand: `join`
    - 無參數（自動報到）
  - Subcommand: `leave`
    - 無參數（取消報到）
  - Subcommand: `list`
    - 無參數
  - Subcommand: `close`
    - 無參數
  - Subcommand: `manual-join`
    - `user` (User)：要代報到的使用者
  - Subcommand: `manual-leave`
    - `user` (User)：要移除的使用者
- **權限需求：** 
  - `open/close/manual-*` = `ManageGuild` 或 `ManageEvents` 或 `ManageChannels`
  - `join/leave/list` = 無限制
- **依賴資料：** 
  - `data/checkins.json`：報到會話
  - `data/logs.json`：審計
- **當前是否綁定舊設定：** 否

#### `/matchcall`
- **用途：** 快速發送對戰通知、房間資訊與倒數時間
- **參數：**
  - `round_info` (String)：賽程資訊
  - `team1_name` (String)：隊伍 1 名稱
  - `team2_name` (String)：隊伍 2 名稱
  - `room` (String, optional)：房間號或代碼
  - `note` (String, optional)：額外提醒
  - `countdown_seconds` (Integer, optional)：倒數秒數
  - `team1_mention` (Mentionable, optional)：隊伍 1 身分組
  - `team2_mention` (Mentionable, optional)：隊伍 2 身分組
- **權限需求：** `ManageGuild` 或 `ManageEvents`
- **依賴資料：** `data/logs.json`
- **當前是否綁定舊設定：** 否

#### `/result`
- **用途：** 發送賽事結果與比分
- **參數：**
  - `round` (String)：賽程名稱
  - `team1` (String)：隊伍 1 名稱
  - `score1` (Integer)：隊伍 1 分數
  - `team2` (String)：隊伍 2 名稱
  - `score2` (Integer)：隊伍 2 分數
  - `mention1` (Mentionable, optional)：隊伍 1 要 @ 的對象
  - `mention2` (Mentionable, optional)：隊伍 2 要 @ 的對象
  - `channel` (Channel, optional)：發佈頻道
- **權限需求：** `ManageGuild` 或 `ManageEvents`
- **依賴資料：** 
  - `data/results.json`：賽果記錄
  - `data/logs.json`：審計
- **當前是否綁定舊設定：** 否

#### `/eventhub`
- **用途：** 生成賽事總覽面板（顯示報到狀態、統計、近期賽果）
- **參數：**
  - `custom_title` (String, optional)：自訂標題
- **權限需求：** 無
- **依賴資料：** 
  - 從 `/checkin` 記錄讀取報到會話
  - 從 `data/results.json` 讀取近期賽果
  - `data/logs.json` 讀取統計
- **當前是否綁定舊設定：** 否

### 1.4 記錄與稽核指令

#### `/report`
- **用途：** 回報違規行為
- **參數：**
  - `target` (Mentionable)：被回報的成員
  - `reason` (String)：回報原因
  - `channel` (Channel, optional)：回報頻道
  - `evidence` (Attachment, optional)：附件（截圖等）
- **權限需求：** 無
- **依賴資料：** `data/reports.json`
- **當前是否綁定舊設定：** 否

#### `/modlog`
- **用途：** 查看管理紀錄
- **參數：**
  - `filter` (String, optional)：篩選類型（ban, kick, warn, etc）
  - `limit` (Integer, optional)：顯示筆數
- **權限需求：** `ManageGuild`
- **依賴資料：** `data/logs.json`
- **當前是否綁定舊設定：** 否

#### `/blacklist`
- **用途：** 查看或移除黑名單
- **參數：**
  - Subcommand: `list` - 顯示目前黑名單
  - Subcommand: `add` 
    - `user` (User)：要加入黑名單的使用者
    - `reason` (String, optional)：原因
  - Subcommand: `remove`
    - `user_id` (String)：要移除的使用者 ID
- **權限需求：** `ManageGuild` 或 `BAN_MEMBERS`
- **依賴資料：** `data/blacklist.json`
- **當前是否綁定舊設定：** 否

#### `/stats`
- **用途：** 查看伺服器管理統計
- **參數：**
  - `filter` (String, optional)：篩選統計項目
- **權限需求：** `ManageGuild`
- **依賴資料：** `data/logs.json`
- **當前是否綁定舊設定：** 否

---

## 2. 背景事件

### 2.1 `guildMemberAdd`
- **用途：** 新成員加入時的自動操作
- **行為：**
  - 檢查是否在黑名單（若啟用 `AUTO_BAN_BLACKLISTED_USERS`）
  - 自動踢出黑名單成員
  - 發送歡迎訊息（若啟用 `ENABLE_WELCOME_MESSAGE`）
- **依賴設定：**
  - `WELCOME_CHANNEL_ID` 或 `WELCOME_CHANNEL_NAMES`
  - 特性開關：`AUTO_BAN_BLACKLISTED_USERS`, `ENABLE_WELCOME_MESSAGE`
- **依賴資料：** `data/blacklist.json`

### 2.2 `guildMemberRemove`
- **用途：** 成員離開伺服器時
- **行為：**
  - 記錄離開紀錄（若啟用 `ENABLE_LEAVE_LOG`）
- **依賴設定：** `MOD_LOG_CHANNEL_ID` 或 `MOD_LOG_CHANNEL_NAMES`
- **依賴資料：** `data/logs.json`

### 2.3 `guildBanAdd`
- **用途：** 成員被封鎖時
- **行為：**
  - 記錄封鎖紀錄（若啟用 `ENABLE_BAN_LOG`）
- **依賴設定：** `MOD_LOG_CHANNEL_ID` 或 `MOD_LOG_CHANNEL_NAMES`
- **依賴資料：** `data/logs.json`

### 2.4 `messageReactionAdd`
- **用途：** 成員新增訊息反應
- **行為：**
  - 偵測反應領取身分組（Reaction Role）
  - 自動給予對應身分組
- **依賴資料：** `data/reactionroles.json`

### 2.5 `messageReactionRemove`
- **用途：** 成員移除訊息反應
- **行為：**
  - 偵測反應領取身分組
  - 自動移除對應身分組
- **依賴資料：** `data/reactionroles.json`

---

## 3. 資料儲存結構

### 3.1 JSON 檔案

#### `data/blacklist.json`
- **格式：** 陣列
- **結構：**
  ```json
  [
    {
      "userId": "123456789012345678",
      "reason": "垃圾訊息",
      "addedAt": "2025-06-15T10:30:00Z",
      "addedBy": "管理員名稱"
    }
  ]
  ```
- **當前是否包含舊資料：** 需檢查

#### `data/logs.json`
- **格式：** 物件（計數統計）
- **結構：**
  ```json
  {
    "guildId": {
      "bans": 0,
      "kicks": 0,
      "mutes": 0,
      "warns": 0,
      "purges": 0,
      "checkinOpens": 0,
      "checkinJoins": 0,
      "matchCalls": 0,
      "matchResults": 0
    }
  }
  ```
- **當前是否包含舊資料：** 需檢查

#### `data/warnings.json`
- **格式：** 陣列
- **結構：**
  ```json
  [
    {
      "guildId": "987654321098765432",
      "userId": "123456789012345678",
      "reason": "不當言論",
      "warnedAt": "2025-06-15T10:30:00Z",
      "warnedBy": "管理員 ID"
    }
  ]
  ```
- **當前是否包含舊資料：** 需檢查

#### `data/reactionroles.json`
- **格式：** 陣列
- **結構：**
  ```json
  [
    {
      "guildId": "987654321098765432",
      "messageId": "123456789012345678",
      "emoji": "👍",
      "roleId": "111222333444555666",
      "description": "同意規則"
    }
  ]
  ```
- **當前是否包含舊資料：** 需檢查

#### `data/reports.json`
- **格式：** 陣列
- **結構：**
  ```json
  [
    {
      "guildId": "987654321098765432",
      "reportedUserId": "123456789012345678",
      "reportedBy": "234567890123456789",
      "reason": "騷擾他人",
      "reportedAt": "2025-06-15T10:30:00Z"
    }
  ]
  ```
- **當前是否包含舊資料：** 需檢查

### 3.2 記憶體儲存

#### Check-in 會話
- **位置：** `utils/tournamentStore.js` 中讀寫 `data/checkins.json`
- **結構：**
  ```json
  {
    "guildId": {
      "active": true,
      "title": "8 強賽第一輪",
      "note": "準時出現",
      "channelId": "111222333444555666",
      "openedAt": "2025-06-15T10:30:00Z",
      "openedByTag": "Admin#1234",
      "checkedInUserIds": ["123456789012345678", "234567890123456789"]
    }
  }
  ```
- **當前是否包含舊資料：** 需檢查

#### 賽果記錄
- **位置：** `utils/tournamentStore.js` 中讀寫 `data/results.json`
- **結構：**
  ```json
  [
    {
      "guildId": "987654321098765432",
      "round": "四強 A 組",
      "team1": "隊伍 A",
      "score1": 2,
      "team2": "隊伍 B",
      "score2": 1,
      "winner": "隊伍 A",
      "recordedBy": "管理員 ID",
      "recordedAt": "2025-06-15T14:30:00Z",
      "timestamp": "2025-06-15T14:30:00Z"
    }
  ]
  ```
- **當前是否包含舊資料：** 需檢查

---

## 4. 設定系統

### 4.1 環境變數 (`.env`)

#### 已實作變數
- `BOT_BRAND_NAME`：Bot 品牌名稱
- `BOT_ACCENT_COLOR`：主題色
- `BOT_ACTIVITY_TEXT`：Bot 狀態文字
- `BOT_ACTIVITY_TYPE`：Bot 狀態類型（WATCHING, PLAYING, LISTENING 等）
- `WELCOME_CHANNEL_ID`：歡迎頻道 ID（硬編碼）
- `MOD_LOG_CHANNEL_ID`：Mod Log 頻道 ID（硬編碼）
- `REPORT_CHANNEL_ID`：回報頻道 ID（硬編碼）
- `RULES_CHANNEL_ID`：規則頻道 ID（硬編碼）
- `INTRO_CHANNEL_ID`：介紹頻道 ID（硬編碼）
- `WELCOME_CHANNEL_NAMES`：歡迎頻道名稱列表（Fallback）
- `MOD_LOG_CHANNEL_NAMES`：Mod Log 頻道名稱列表（Fallback）
- `REPORT_CHANNEL_NAMES`：回報頻道名稱列表（Fallback）
- `STUDIO_WEBSITE_URL`：工作室網站
- `STUDIO_INVITE_URL`：工作室邀請連結
- `AUTO_BAN_BLACKLISTED_USERS`：自動踢出黑名單成員
- `ENABLE_WELCOME_MESSAGE`：啟用歡迎訊息
- `ENABLE_LEAVE_LOG`：啟用離開日誌
- `ENABLE_BAN_LOG`：啟用封鎖日誌

#### 缺失變數（需要新增）
- `DISCORD_TOKEN`：Bot Token（已在 index.js 讀取）
- `DISCORD_CLIENT_ID`：Application ID
- `DISCORD_GUILD_ID`：Development Guild ID
- `DISCORD_ENV`：環境（development/production）

### 4.2 設定檔案

#### `config.example.js`
- **當前狀態：** 已存在但未被使用
- **包含內容：** Bot 名稱、日誌設定、自動化設定、黑名單設定
- **需要操作：** 統合到統一設定模組

---

## 5. 功能依賴分析

### 5.1 綁定私有設定的功能

| 功能 | 目前依賴 | 開源化方案 |
|------|---------|---------|
| 歡迎訊息 | `WELCOME_CHANNEL_ID` / `WELCOME_CHANNEL_NAMES` | → `/setup` 配置 + 資料庫 |
| Mod Log | `MOD_LOG_CHANNEL_ID` / `MOD_LOG_CHANNEL_NAMES` | → `/setup` 配置 + 資料庫 |
| 回報管道 | `REPORT_CHANNEL_ID` / `REPORT_CHANNEL_NAMES` | → `/setup` 配置 + 資料庫 |
| Bot 品牌 | `BOT_BRAND_NAME` | → `/setup` 配置 + 資料庫 |
| Bot 主題色 | `BOT_ACCENT_COLOR` | → `/setup` 配置 + 資料庫 |
| 工作室連結 | `STUDIO_WEBSITE_URL`, `STUDIO_INVITE_URL` | → 保留環境變數或 `/setup` 配置 |

### 5.2 無需修改的功能

| 功能 | 原因 |
|------|------|
| `/ban`, `/kick`, `/mute` 等管理指令 | 無硬編碼私有設定 |
| `/poll`, `/announce`, `/reactionrole` | 無硬編碼私有設定 |
| `/checkin`, `/matchcall`, `/result` | 已使用 Guild-scoped 資料 |
| `/modlog`, `/stats` | 使用通用統計結構 |
| `/help`, `/userinfo`, `/serverinfo` | 完全通用 |

---

## 6. 既有功能清單確認

### 6.1 Slash Commands（共 23 個）

**管理類（9 個）：**
- ✅ `/ban`
- ✅ `/kick`
- ✅ `/mute`
- ✅ `/unmute`
- ✅ `/warn`
- ✅ `/purge`
- ✅ `/lockdown`
- ✅ `/unlock`
- ✅ `/slowmode`

**社群類（6 個）：**
- ✅ `/announce`
- ✅ `/poll`
- ✅ `/reactionrole`
- ✅ `/serverinfo`
- ✅ `/userinfo`
- ✅ `/help`

**賽事類（4 個）：**
- ✅ `/checkin`
- ✅ `/matchcall`
- ✅ `/result`
- ✅ `/eventhub`

**記錄類（4 個）：**
- ✅ `/report`
- ✅ `/modlog`
- ✅ `/blacklist`
- ✅ `/stats`

### 6.2 背景事件（5 個）

- ✅ `guildMemberAdd`
- ✅ `guildMemberRemove`
- ✅ `guildBanAdd`
- ✅ `messageReactionAdd`
- ✅ `messageReactionRemove`

### 6.3 公開化後需要新增的功能

- ❌ `/setup` - 首次設定伺服器
- ❌ `/config view` - 查看設定
- ❌ `/config reset` - 重設設定

---

## 7. 檔案依賴樹

```
index.js
├── commands/ (23 個指令檔)
├── events/ (5 個事件檔)
├── utils/
│   ├── logger.js → data/logs.json, data/reports.json
│   ├── jsonStore.js → 通用 JSON 讀寫
│   ├── tournamentStore.js → data/checkins.json, data/results.json
│   ├── runtimeConfig.js → 環境變數設定
│   └── channelResolver.js
├── custom-commands/
│   └── _template.js （模板）
├── data/
│   ├── blacklist.json
│   ├── logs.json
│   ├── reactionroles.json
│   ├── reports.json
│   ├── warnings.json
│   └── checkins.json (from tournamentStore)
│   └── results.json (from tournamentStore)
├── .env （環境變數）
└── package.json
```

---

## 8. 總結與後續操作

### 8.1 現狀評估

✅ **優勢：**
- 已有完整的指令系統
- 已使用 guild-scoped 資料結構
- 已有環境變數配置框架
- 5 個背景事件支援多 Guild
- JSON 儲存可快速遷移至 SQLite

⚠️ **需要改進的地方：**
- 某些頻道 ID 依賴硬編碼（需 Fallback 至 `CHANNEL_NAMES`）
- 缺少 `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, `DISCORD_ENV` 設定
- 缺少統一的設定模組（分散在多個檔案）
- 需要建立 `/setup` 流程持久化設定
- 缺少權限驗證層
- 無資料庫持久化（僅有 JSON）

### 8.2 下一步驟

1. **第一階段完成：** 本文件與 `OPEN_SOURCE_AUDIT.md` 
2. **第二階段：** 建立統一設定模組 (`src/config/discord.js`)
3. **第三階段：** 修正 `index.js` 與啟動流程
4. **第四階段：** 建立 `scripts/deploy-commands.js`
5. **第五階段：** 建立 SQLite 資料庫層與 `/setup` 指令
6. **第六階段：** 建立 `/config` 指令
7. **第七階段：** 清除識別資源
8. **第八、九階段：** 更新文件與設定
9. **第十階段：** 完整驗證

