# Discord Bot 指令白話手冊

這份就是白話版說明書。

如果你只是想知道：

- 這個指令是幹嘛的
- 什麼時候該用
- 要怎麼打

看這份就夠了。

## 先講最重要的

在 Discord 聊天框輸入 `/`，就能看到這台 bot 的所有指令。

如果你只想在 Discord 裡直接看說明，也可以打：

```text
/help
```

## 指令分成哪幾類

- 管理人用的：封鎖、踢人、禁言、刪訊息、鎖頻道
- 一般伺服器功能：公告、投票、反應身分組、查伺服器資訊
- 紀錄跟稽核：舉報、黑名單、日誌、統計
- 活動專用：報到、通知、發布結果、看活動總覽

---

## 管理類

### `/ban`

這是幹嘛的：
把某個人直接封鎖，順便寫進黑名單。

什麼時候用：
有人嚴重違規、不想再讓他進來。

怎麼打：

```text
/ban user:@玩家
/ban user:@玩家 reason:惡意鬧場
```

誰能用：
有 `BanMembers` 權限的人。

### `/kick`

這是幹嘛的：
把人踢出去，但不是永久黑名單。

什麼時候用：
有人短時間鬧場，但你不一定要永封。

怎麼打：

```text
/kick user:@玩家
/kick user:@玩家 reason:洗頻
```

誰能用：
有 `KickMembers` 權限的人。

### `/mute`

這是幹嘛的：
暫時禁言一個人。

什麼時候用：
比賽中洗頻、吵架、亂發言，但還不用直接踢掉。

怎麼打：

```text
/mute user:@玩家 minutes:10
/mute user:@玩家 minutes:60 reason:比賽期間亂刷
```

誰能用：
有 `ModerateMembers` 權限的人。

### `/unmute`

這是幹嘛的：
把禁言解除。

什麼時候用：
時間到了，或你要提早放人。

怎麼打：

```text
/unmute user:@玩家
/unmute user:@玩家 reason:處理完成
```

誰能用：
有 `ModerateMembers` 權限的人。

### `/warn`

這是幹嘛的：
給某個人記一筆警告。

什麼時候用：
還不想直接處罰，但要留下紀錄。

怎麼打：

```text
/warn user:@玩家 reason:未依規定報到
```

誰能用：
有 `ModerateMembers` 權限的人。

### `/purge`

這是幹嘛的：
一口氣刪掉一批訊息。

什麼時候用：
有人洗頻、發錯一大串、要清聊天區。

怎麼打：

```text
/purge amount:20
/purge amount:10 user:@玩家
```

補充：
- `amount` 最多 100
- 超過 14 天的舊訊息，Discord 不給批次刪
- 釘選訊息不會刪

誰能用：
有 `ManageMessages` 權限的人。

### `/lockdown`

這是幹嘛的：
把頻道先鎖起來，不讓大家講話。

什麼時候用：
比賽開始、開會、吵架失控、要暫停聊天的時候。

怎麼打：

```text
/lockdown
/lockdown channel:#大廳
/lockdown channel:#大廳 reason:比賽進行中
```

誰能用：
有 `ManageChannels` 權限的人。

### `/unlock`

這是幹嘛的：
把鎖住的頻道打開。

什麼時候用：
比賽結束、公告完畢、聊天恢復正常。

怎麼打：

```text
/unlock
/unlock channel:#大廳
/unlock channel:#大廳 reason:比賽已結束
```

誰能用：
有 `ManageChannels` 權限的人。

### `/slowmode`

這是幹嘛的：
限制大家幾秒才能發一次訊息。

什麼時候用：
聊天太快、活動頻道太亂，但你又不想直接鎖頻道。

怎麼打：

```text
/slowmode seconds:5
/slowmode seconds:30 channel:#聊天室
/slowmode seconds:0 channel:#聊天室
```

補充：
- `seconds:0` 代表關閉慢速模式

誰能用：
有 `ManageChannels` 權限的人。

---

## 公告、互動、查資訊

### `/announce`

這是幹嘛的：
發正式公告。

什麼時候用：
要公告賽程、規則、直播連結、開賽通知、延賽通知。

怎麼打：

```text
/announce channel:#公告
/announce channel:#公告 color:FF0000 mention:true pin:true
```

你送出之後，會跳一個表單讓你填：
- 標題
- 內容
- 圖片
- 縮圖
- 頁腳

誰能用：
有 `ManageGuild` 權限的人。

### `/poll`

這是幹嘛的：
快速做投票。

什麼時候用：
投票比賽時間、地圖、模式、活動安排。

怎麼打：

```text
/poll question:今天幾點開打 option1:19:00 option2:20:00
/poll question:季軍賽要不要直播 option1:要 option2:不要 channel:#投票區
```

誰能用：
能發訊息的人都可以。

### `/reactionrole`

這是幹嘛的：
做「按表情拿身分組」。

什麼時候用：
讓大家自己拿成員、觀眾、工作人員、小組身分組。

怎麼打：

```text
/reactionrole create channel:#領取身分組 role:@成員 emoji:✅ message:點這個表情領取身分組
/reactionrole list
/reactionrole remove id:1710000000000
```

誰能用：
有 `ManageRoles` 和 `ManageMessages` 權限的人。

### `/userinfo`

這是幹嘛的：
看某個人的資料。

你會看到：
- 帳號
- ID
- 何時創帳
- 何時進伺服器
- 警告次數
- 身分組

怎麼打：

```text
/userinfo
/userinfo user:@玩家
```

### `/serverinfo`

這是幹嘛的：
看這個伺服器的基本資料。

你會看到：
- 伺服器 ID
- 擁有者
- 建立時間
- 成員數
- 角色數
- 頻道數

怎麼打：

```text
/serverinfo
```

### `/help`

這是幹嘛的：
在 Discord 裡直接看指令說明。

怎麼打：

```text
/help
/help command:checkin
/help command:matchcall
```

---

## 紀錄、稽核、查後台

### `/modlog`

這是幹嘛的：
看管理日誌。

什麼時候用：
想知道最近誰 ban 誰、誰 mute 誰、誰出錯。

怎麼打：

```text
/modlog
/modlog type:WARN
/modlog type:ERROR count:20
```

誰能用：
有 `ViewAuditLog` 權限的人。

### `/blacklist`

這是幹嘛的：
看黑名單、查人有沒有在黑名單、把人從黑名單移掉。

怎麼打：

```text
/blacklist view
/blacklist view page:2
/blacklist check user:@玩家
/blacklist remove userid:123456789012345678
```

誰能用：
有 `BanMembers` 權限的人。

### `/report`

這是幹嘛的：
舉報某個人的不當行為。

什麼時候用：
有人騷擾、廣告、詐騙、仇恨言論。

怎麼打：

```text
/report user:@玩家 reason:harassment description:持續私訊騷擾
```

可選原因：
- `harassment`
- `spam`
- `hate_speech`
- `inappropriate`
- `scam`
- `other`

### `/stats`

這是幹嘛的：
看這台機器人目前累積了多少管理與活動資料。

你會看到像這些：
- 封鎖幾次
- 禁言幾次
- 舉報幾次
- 開過幾次報到
- 發過幾次活動通知
- 發過幾次賽果

怎麼打：

```text
/stats
```

誰能用：
- 管理員
- 或 `.env` 裡設定的 `ADMIN_ROLE_ID` 那個角色

---

## 活動專用

### `/checkin`

這是幹嘛的：
成員報到系統。

這個指令有很多子功能。

#### `/checkin open`

白話：
開一輪新的報到。

怎麼打：

```text
/checkin open title:活動報到
/checkin open title:活動報到 note:請 10 分鐘內完成 channel:#報到區
```

#### `/checkin join`

白話：
成員自己按這個，表示「我到了」。

怎麼打：

```text
/checkin join
```

#### `/checkin leave`

白話：
剛剛按錯、或要取消報到。

怎麼打：

```text
/checkin leave
```

#### `/checkin status`

白話：
看現在有沒有在報到，還有你自己是不是已經報到了。

怎麼打：

```text
/checkin status
```

#### `/checkin list`

白話：
看完整報到名單。

怎麼打：

```text
/checkin list
```

#### `/checkin close`

白話：
把這輪報到收掉。

怎麼打：

```text
/checkin close
```

#### `/checkin mark`

白話：
管理員手動幫某位成員補報到。

怎麼打：

```text
/checkin mark user:@玩家
```

#### `/checkin unmark`

白話：
把某個人從報到名單拿掉。

怎麼打：

```text
/checkin unmark user:@玩家
```

誰能用：
- 一般成員可用：`join`、`leave`、`status`、`list`
- 管理員可用：`open`、`close`、`mark`、`unmark`

### `/matchcall`

這是幹嘛的：
通知雙方成員準備活動。

白話講，就是發一則：
- 誰打誰
- 在哪裡打
- 幾分鐘後開始
- 有沒有直播

怎麼打：

```text
/matchcall round:活動A組 team1:小組A team2:小組B
/matchcall round:活動A組 team1:小組A team2:小組B bestof:3 start_in:10 room:#活動房 ping:true
```

你可以加的東西：
- `mention1` / `mention2`：直接 ping 雙方
- `room`：房間或語音頻道
- `bestof`：BO1、BO3、BO5
- `start_in`：幾分鐘後開打
- `stream`：直播資訊
- `note`：備註

誰能用：
有 `ManageGuild` 權限的人。

### `/result`

這是幹嘛的：
發賽果。

白話講，就是公告：
- 誰贏了
- 比分多少
- BO 幾
- 哪張地圖
- 有沒有 VOD

怎麼打：

```text
/result round:活動總結 team1:小組A score1:3 team2:小組B score2:1
/result round:活動總結 team1:小組A score1:3 team2:小組B score2:1 bestof:5 stream:https://example.com/live
```

補充：
- 不可以填平手
- 這個指令會把結果存下來，之後 `eventhub` 會抓最近賽果

誰能用：
有 `ManageGuild` 權限的人。

### `/eventhub`

這是幹嘛的：
生成活動總覽面板。

白話講，就是做一張集中資訊卡，讓大家一眼看到：
- 現在有沒有在報到
- 最近幾場比賽結果
- 常用活動指令
- 基本活動統計

怎麼打：

```text
/eventhub
/eventhub channel:#活動資訊
/eventhub channel:#活動資訊 title:今晚活動總覽
```

誰能用：
有 `ManageGuild` 權限的人。

---

## 如果你是活動管理員，最常用的是這幾個

開賽前：

```text
/checkin open title:活動報到
/eventhub channel:#活動資訊
```

要叫人進場：

```text
/matchcall round:活動A組 team1:小組A team2:小組B bestof:3 start_in:10
```

打完要公布：

```text
/result round:活動A組 team1:小組A score1:2 team2:小組B score2:1
```

收報到：

```text
/checkin close
```

---

## 如果你自己還要加新指令

- 內建指令在 `commands/`
- 你自己新增的，建議放 `custom-commands/`

寫完之後重開 bot：

```powershell
npm start
```

這樣新的 Slash Commands 才會重新註冊。
