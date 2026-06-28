# custom-commands

把你自己要加的 Slash Commands 放在這個資料夾。

規則：

- 只要是 `.js` 檔，啟動 bot 時就會自動載入
- 可以再分子資料夾，例如 `custom-commands/tournament/` 或 `custom-commands/fun/`
- 檔名或資料夾名稱如果以 `_` 開頭，載入器會略過
- 寫完新指令後，重開 bot 一次讓 Slash Commands 重新註冊

建議做法：

- 原本內建功能繼續放 `commands/`
- 你自己新增或測試中的功能放 `custom-commands/`

快速範例結構：

```text
custom-commands/
├─ README.md
├─ _template.js
└─ tournament/
   └─ my-command.js
```
