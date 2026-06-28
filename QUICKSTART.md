# ⚡ 快速啟動指南（5 分鐘）

## 🎯 目標
在 5 分鐘內讓你的 Discord 機器人啟動並運行

---

## 📋 準備條件
✅ Node.js 18+ 已安裝  
✅ npm 已安裝  
✅ 有效的 Discord Bot Token

---

## 🚀 快速啟動步驟

### 第 1 步：獲取 Bot Token（1 分鐘）
如果你還沒有 token，按照以下步驟：

1. 訪問 [Discord Developer Portal](https://discord.com/developers/applications)
2. 選擇或創建你的應用
3. 左側選擇「Bot」
4. 複製 Token（點擊「Copy」）

> ⚠️ **警告**：永遠不要分享你的 Token！

---

### 第 2 步：配置環境（1 分鐘）

在項目根目錄中：

```bash
# 複製配置文件
cp .env.example .env
```

編輯 `.env` 文件：
```
DISCORD_TOKEN=your_token_here
```

替換 `your_token_here` 為你的實際 token。

---

### 第 3 步：安裝依賴（2 分鐘）

```bash
npm install
```

等待安裝完成。看到類似輸出：
```
added XX packages
```

---

### 第 4 步：啟動機器人（1 分鐘）

```bash
npm start
```

你應該看到：
```
✅ Discord Bot 已啟動：YourBot#1234
📝 已載入 11 個斜杠命令
✅ 斜杠命令已成功註冊
```

---

## 🎮 測試機器人

### 在 Discord 中測試：

1. **打開你的伺服器**
2. **輸入 `/help`** 和回車
3. **應該看到幫助菜單**

如果能看到幫助菜單，**恭喜！機器人已成功運行！** 🎉

---

## 📚 下一步

| 想要做什麼？ | 請查看文件 |
|-----------|---------|
| 詳細了解所有命令 | `COMMANDS.md` 或 `/help` |
| 完整設置指南 | `SETUP.md` |
| 看所有文件入口 | `DOCS.md` |
| 部署到生產環境 | `DEPLOYMENT_CHECKLIST.md` |
| 查看所有改進 | `IMPROVEMENTS.md` |

---

## ❓ 快速故障排除

### 「機器人不在線」
```bash
# 檢查 token 是否正確
# 重新啟動
npm start
```

### 「看不到斜杠命令」
- 等待 1-5 分鐘讓 Discord 同步
- 按 Ctrl+R 刷新 Discord
- 確保機器人已加入你的伺服器

### 「Command failed to run」
- 確保機器人有足夠的権限
- 檢查你是否有執行該命令所需的正確並限
- 查看控制台錯誤消息

---

## 🎯 常用命令

```
/help                   # 查看所有命令
/help command:ban       # 查看特定命令幫助
/userinfo               # 查看你的信息
/userinfo user:@用戶  # 查看他人信息
/modlog                 # 查看管理日誌
```

---

## 💡 提示

- 機器人使用 **斜杠命令**（輸入 `/` 並看選項）
- 所有敏感信息都存儲在 `data/` 目錄中
- 查看 `data/logs.json` 了解使用情況

---

**完成！你已經成功啟動了 Discord Bot！** 🚀

需要更多幫助？查看 `README.md` 或 `SETUP.md`。
