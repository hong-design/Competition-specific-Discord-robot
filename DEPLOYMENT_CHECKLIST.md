# 🚀 部署檢查清單

## ✅ 部署前驗證

### 1. 環境配置
- [ ] 複製 `.env.example` 為 `.env`
- [ ] 在 `.env` 中填寫有效的 `DISCORD_TOKEN`
- [ ] 確認 `.env` 文件在 `.gitignore` 中（保護敏感信息）
- [ ] 測試 Token 是否有效

### 2. 依賴安裝
- [ ] 運行 `npm install` 並確保沒有錯誤
- [ ] 檢查 `node_modules` 是否成功創建
- [ ] 驗證 Discord.js 版本 >= 14.0.0

### 3. 機器人權限設置（Discord 開發者門戶）
- [ ] 啟用 `SERVER MEMBERS INTENT`
- [ ] 啟用 `MESSAGE CONTENT INTENT`
- [ ] 設置斜杠命令權限
- [ ] 設置以下權限：
  - [ ] View Channels
  - [ ] Send Messages
  - [ ] Embed Links
  - [ ] Read Message History
  - [ ] Kick Members
  - [ ] Ban Members
  - [ ] Moderate Members
  - [ ] Manage Messages
  - [ ] View Audit Log

### 4. 本地測試
- [ ] 運行 `npm start` 按檢查終端輸出
- [ ] 確認看到 "✅ Discord Bot 已啟動"
- [ ] 確認看到 "📝 已載入 11 個斜杠命令"
- [ ] 確認看到 "✅ 斜杠命令已成功註冊"
- [ ] 在測試伺服器中輸入 `/help`

### 5. 命令測試
- [ ] `/help` - 顯示幫助菜單
- [ ] `/help command:ban` - 顯示特定命令幫助
- [ ] `/userinfo` - 顯示自己的信息
- [ ] `/userinfo user:@someone` - 顯示他人信息
- [ ] `/modlog` - 顯示日誌
- [ ] `/modlog type:WARN count:10` - 過濾日誌
- [ ] `/blacklist view` - 查看黑名單（應為空）
- [ ] 按照需要測試其他命令

### 6. 自動化功能測試
- [ ] 新成員加入時收到歡迎消息
- [ ] 在 `#mod-logs` 或 `#modlog` 頻道看到通知
- [ ] 管理操作正確被記錄

### 7. 數據文件驗證
- [ ] `data/` 目錄已創建
- [ ] `data/logs.json` 已創建
- [ ] `data/warnings.json` 已創建
- [ ] `data/blacklist.json` 已創建
- [ ] `data/reports.json` 已創建
- [ ] 所有文件都可以讀寫

### 8. 伺服器準備
- [ ] 機器人已加入目標伺服器
- [ ] 機器人角色位於較高位置
- [ ] 已創建 `#mod-logs` 或 `#modlog` 頻道
- [ ] 已創建 `#welcome` 頻道（可選但推薦）
- [ ] 機器人有足夠的權限訪問這些頻道

---

## 🐳 Docker 部署檢查清單

### 準備階段
- [ ] Docker 已安裝並運行
- [ ] `.env` 文件已配置
- [ ] 項目根目錄中有 `Dockerfile`
- [ ] 項目根目錄中有 `docker-compose.yml`

### 構建和部署
- [ ] 運行 `docker-compose up -d`
- [ ] 運行 `docker logs discord-bot` 檢查日誌
- [ ] 確認機器人成功啟動
- [ ] 在 Discord 中測試命令

### 持久化存儲
- [ ] `data/` 目錄已掛載為 volume
- [ ] 容器重啟後數據仍然存在
- [ ] 可以從主機訪問 `data/` 目錄

---

## 🔒 安全檢查清單

### 代碼安全
- [ ] `.env` 文件未提交到 Git
- [ ] Token 未在任何代碼文件中硬編碼
- [ ] 日誌文件不包含敏感信息
- [ ] `.gitignore` 包含所有敏感文件

### 運行安全
- [ ] 機器人運行在受限權限下（不是 root）
- [ ] 機器人只有必要的伺服器權限
- [ ] 啟用了審計日誌記錄
- [ ] 定期備份 `data/` 目錄

### 權限驗證
- [ ] `BAN` 命令需要 Ban Members 權限
- [ ] `KICK` 命令需要 Kick Members 權限
- [ ] `MUTE` 命令需要 Moderate Members 權限
- [ ] `ANNOUNCE` 命令需要 Manage Messages 權限
- [ ] `MODLOG` 命令需要 View Audit Log 權限

---

## 📊 性能檢查清單

### 初始性能
- [ ] 機器人啟動時間 < 5 秒
- [ ] 斜杠命令註冊時間 < 10 秒
- [ ] 命令響應時間 < 2 秒

### 長期穩定性
- [ ] 運行 24 小時無崩潰
- [ ] 內存使用穩定（監控 5-10 天）
- [ ] 日誌文件大小在可控范圍內
- [ ] 沒有重複的錯誤消息

### 大型伺服器優化
- [ ] 測試 1000+ 成員的伺服器
- [ ] 測試快速的命令執行（多個用戶同時）
- [ ] 測試日誌過濾性能
- [ ] 確認黑名單檢查不會造成延遲

---

## 📝 文檔檢查清單

### 文件存在性
- [ ] `README.md` 存在且完整
- [ ] `SETUP.md` 存在且精確
- [ ] `IMPROVEMENTS.md` 記錄了所有改進
- [ ] `DEPLOYMENT_CHECKLIST.md` 完成度 100%
- [ ] `.env.example` 存在

### 文檔質量
- [ ] 所有命令都有文檔
- [ ] 所有參數都有解釋
- [ ] 包含使用示例
- [ ] 包含故障排除部分
- [ ] 包含常見問題解答

---

## 🔗 生產環境部署

### 前期準備
- [ ] 選擇部署平台（VPS/Heroku/自托管等）
- [ ] 準備好備份和恢復計劃
- [ ] 設置監控和告警
- [ ] 準備好回滾計劃

### 部署
- [ ] 在生產環境中克隆代碼
- [ ] 配置環境變數
- [ ] 安裝依賴
- [ ] 設置自動重啟（systemd/PM2/supervisor）
- [ ] 配置日誌輪換

### 驗證
- [ ] 機器人在生產環境中正常運行
- [ ] 所有命令都能正常執行
- [ ] 日誌正確記錄到生產環境
- [ ] 監控系統正常工作
- [ ] 告警系統正常工作

---

## ⚠️ 常見問題排查

### 機器人不啟動
**檢查項：**
- [ ] `.env` 文件存在且配置正確
- [ ] Token 是否有效
- [ ] Node.js 版本 >= 18
- [ ] 依賴是否完整安裝
- [ ] 是否有端口衝突

**解決方案：**
```bash
# 清除 node_modules 並重新安裝
rm -rf node_modules package-lock.json
npm install
npm start
```

### 命令不響應
**檢查項：**
- [ ] 機器人是否在線
- [ ] 機器人是否有應用程序命令權限
- [ ] 是否等待了 1-5 分鐘讓 Discord 同步
- [ ] 是否刷新了 Discord 客戶端

**解決方案：**
- 等待 Discord 同步命令（可能需要 5 分鐘）
- 刷新 Discord（Ctrl+R）
- 重啟機器人

### 自動功能不工作
**檢查項：**
- [ ] 事件 Intents 是否啟用
- [ ] 機器人是否有相應的事件權限
- [ ] 是否在 `events/` 目錄中有事件文件
- [ ] 是否有錯誤日誌

**解決方案：**
查看 `data/logs.json` 中的錯誤，或檢查控制台輸出

---

## 📞 支援聯係

如遇到問題，請檢查：
1. `README.md` - 常見問題
2. 控制台輸出和日誌
3. `data/logs.json` 中的錯誤記錄

---

## ✨ 最終檢查

- [ ] 所有檢查清單項目都已完成
- [ ] 沒有未解決的錯誤或警告
- [ ] 文檔已更新
- [ ] 團隊已培訓（如適用）
- [ ] 備份計劃已準備

**準備就緒！你可以安全地部署機器人了。** 🎉

---

部署日期：_______________  
部署者：_______________  
驗證者：_______________  
