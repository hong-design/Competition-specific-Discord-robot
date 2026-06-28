// config.example.js
// 這是配置文件的示例 - 複製為 config.js 並根據需要修改

module.exports = {
  // 機器人設置
  bot: {
    name: 'Discord Bot Template',
    version: '2.0.0',
    prefix: '/',  // 斜杠命令
    ownerIds:[
      // 在這裡添加機器人擁有者的 ID
      // 例如: '123456789012345678'
    ]
  },

  // 日誌設置
  logging: {
    // 是否記錄日誌
    enabled: true,
    // 日誌級別: 'debug', 'info', 'warn', 'error'
    level: 'info',
    // 最大日誌條數
    maxLogs: 10000,
    // 自動清理多久前的日誌（天數）
    autoCleanupDays: 30
  },

  // 自動化設置
  automation: {
    // 啟用自動歡迎消息
    welcomeMessage: true,
    // 歡迎消息頻道名稱
    welcomeChannel: 'welcome',
    
    // 啟用自動黑名單檢查
    autoBlacklistCheck: true,
    
    // 啟用自動日誌記錄
    autoLogging: true,
    
    // 啟用離開通知
    leaveNotification: true
  },

  // 黑名單設置
  blacklist: {
    // 新成員加入時檢查黑名單
    checkOnJoin: true,
    // 自動踢出黑名單成員
    autoBan: true
  },

  // 命令設置
  commands: {
    // 謝謝功能的冷卻時間（秒）
    cooldown: 3,
    // 顯示命令使用情況
    showUsage: true
  },

  // 審核設置
  moderation: {
    // 禁言的最大時長（分鐘）
    maxMuteTime: 40320,  // 28 天
    // 最少禁言時間（分鐘）
    minMuteTime: 1,
    // 警告限制（達到該次數時自動踢出）
    warnLimit: 5,
    // 警告過期時間（天數）
    warnExpireDays: 30
  },

  // 文件路徑設置
  paths: {
    dataDir: './data',
    logsFile: './data/logs.json',
    warningsFile: './data/warnings.json',
    blacklistFile: './data/blacklist.json',
    reportsFile: './data/reports.json'
  },

  // 顏色設置（十六進制）
  colors: {
    success: '#00FF00',      // 綠色
    error: '#FF0000',        // 紅色
    warning: '#FFA500',      // 橙色
    info: '#0099FF',         // 藍色
    primary: '#9370DB'       // 紫色
  },

  // 機器人狀態
  status: {
    // 'WATCHING', 'PLAYING', 'LISTENING', 'COMPETING'
    type: 'WATCHING',
    text: '伺服器安全'
  }
};
