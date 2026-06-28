# Official Studio Setup

把 bot 放進正式 Discord 群組前，建議先把以下欄位填進 `.env`：

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_test_guild_id
DISCORD_ENV=development
DISCORD_AUTO_REGISTER_COMMANDS=false

BOT_BRAND_NAME=你的工作室名稱
BOT_ACTIVITY_TYPE=WATCHING
BOT_ACTIVITY_TEXT=Discord Bot | /help
BOT_ACCENT_COLOR=#5865F2

WELCOME_CHANNEL_ID=歡迎頻道ID
MOD_LOG_CHANNEL_ID=管理紀錄頻道ID
REPORT_CHANNEL_ID=檢舉頻道ID
RULES_CHANNEL_ID=規則頻道ID
INTRO_CHANNEL_ID=自我介紹頻道ID

STUDIO_WEBSITE_URL=https://your-studio-site.example
STUDIO_INVITE_URL=https://discord.gg/your-invite
```

## 已完成的正式群優化

- Bot 狀態文字可用 `.env` 自訂，不再寫死在程式裡。
- 歡迎訊息已支援品牌名稱、規則頻道、自介頻道、官網連結與邀請連結。
- 離群通知與封鎖通知可指定管理紀錄頻道。
- 檢舉案件可指定獨立檢舉頻道，沒有設定時會回退到管理紀錄頻道。
- 沒填頻道 ID 時，bot 會自動回退找常見頻道名稱，方便先測試再正式部署。

## 頻道回退規則

- 歡迎頻道：`welcome`、`general`
- 管理紀錄頻道：`mod-logs`、`modlog`
- 檢舉頻道：`reports`、`mod-logs`、`modlog`
