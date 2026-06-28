const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('查看機器人幫助信息')
    .addStringOption(option =>
      option
        .setName('command')
        .setDescription('查詢特定命令的幫助')
        .addChoices(
          { name: '封鎖 (ban)', value: 'ban' },
          { name: '踢出 (kick)', value: 'kick' },
          { name: '禁言 (mute)', value: 'mute' },
          { name: '解除禁言 (unmute)', value: 'unmute' },
          { name: '警告 (warn)', value: 'warn' },
          { name: '舉報 (report)', value: 'report' },
          { name: '公告 (announce)', value: 'announce' },
          { name: '活動報到 (checkin)', value: 'checkin' },
          { name: '結果公告 (result)', value: 'result' },
          { name: '活動通知 (matchcall)', value: 'matchcall' },
          { name: '活動總覽 (eventhub)', value: 'eventhub' },
          { name: '用戶資訊 (userinfo)', value: 'userinfo' },
          { name: '日誌 (modlog)', value: 'modlog' },
          { name: '黑名單 (blacklist)', value: 'blacklist' },
          { name: '設定 (config)', value: 'config' }
        )
        .setRequired(false)
    )
    .setDMPermission(true),

  async execute(interaction) {
    const command = interaction.options.getString('command');

    if (!command) {
      // 顯示全部命令
      const mainEmbed = new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('📖 Discord Bot 幫助中心')
        .setDescription('使用斜杠命令 `/` 來使用機器人。以下是可用的命令列表：')
        .addFields(
          {
            name: '🔨 管理命令',
            value: '`/ban` - 永久封鎖成員\n`/kick` - 踢出成員\n`/mute` - 禁言成員\n`/unmute` - 解除禁言',
            inline: false
          },
          {
            name: '⚠️ 懲罰系統',
            value: '`/warn` - 警告成員\n`/report` - 舉報不當行為',
            inline: false
          },
          {
            name: '📢 伺服器工具',
            value: '`/announce` - 發送公告\n`/modlog` - 查看管理日誌\n`/blacklist` - 黑名單管理\n`/config view` - 查看伺服器設定\n`/config reset` - 重設伺服器設定',
            inline: false
          },
          {
            name: '🏆 活動功能',
            value: '`/checkin` - 開放與管理活動報到\n`/matchcall` - 快速發布活動通知\n`/result` - 發布活動結果與內容\n`/eventhub` - 生成活動總覽面板',
            inline: false
          },
          {
            name: '👤 成員信息',
            value: '`/userinfo` - 查看用戶信息',
            inline: false
          },
          {
            name: '💡 提示',
            value: '使用 `/help [命令名]` 查看特定命令的詳細幫助',
            inline: false
          }
        )
        .setFooter({ text: 'Discord Bot | 適合社群與活動管理' })
        .setTimestamp();

      return await interaction.reply({ embeds: [mainEmbed], ephemeral: true });
    }

    // 特定命令幫助
    const helpDocs = {
      ban: new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🔨 封鎖成員 (/ban)')
        .addFields(
          { name: '描述', value: '永久封鎖一名成員並加入黑名單' },
          { name: '用法', value: '`/ban user:<用戶> reason:<原因>`' },
          { name: '參數', value: '• **user** - 要封鎖的成員（必填）\n• **reason** - 封鎖原因（選填）' },
          { name: '權限要求', value: '需要 BanMembers 權限' },
          { name: '例子', value: '`/ban user:@用戶 reason:騷擾其他成員`' }
        ),
      
      kick: new EmbedBuilder()
        .setColor('#FF6600')
        .setTitle('👢 踢出成員 (/kick)')
        .addFields(
          { name: '描述', value: '從伺服器踢出一名成員' },
          { name: '用法', value: '`/kick user:<用戶> reason:<原因>`' },
          { name: '參數', value: '• **user** - 要踢出的成員（必填）\n• **reason** - 踢出原因（選填）' },
          { name: '權限要求', value: '需要 KickMembers 權限' },
          { name: '例子', value: '`/kick user:@用戶 reason:違反伺服器規則`' }
        ),
      
      mute: new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🔇 禁言成員 (/mute)')
        .addFields(
          { name: '描述', value: '暫時禁言一名成員（無法在伺服器發言）' },
          { name: '用法', value: '`/mute user:<用戶> minutes:<分鐘> reason:<原因>`' },
          { name: '參數', value: '• **user** - 要禁言的成員（必填）\n• **minutes** - 禁言時長（1-40320 分鐘）（必填）\n• **reason** - 禁言原因（選填）' },
          { name: '權限要求', value: '需要 ModerateMembers 權限' },
          { name: '例子', value: '`/mute user:@用戶 minutes:60 reason:洗屏`' }
        ),
      
      unmute: new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🔊 解除禁言 (/unmute)')
        .addFields(
          { name: '描述', value: '解除一名成員的禁言' },
          { name: '用法', value: '`/unmute user:<用戶> reason:<原因>`' },
          { name: '參數', value: '• **user** - 要解除禁言的成員（必填）\n• **reason** - 解除原因（選填）' },
          { name: '權限要求', value: '需要 ModerateMembers 權限' },
          { name: '例子', value: '`/unmute user:@用戶 reason:已改正`' }
        ),
      
      warn: new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('⚠️ 警告成員 (/warn)')
        .addFields(
          { name: '描述', value: '對成員進行警告記錄' },
          { name: '用法', value: '`/warn user:<用戶> reason:<原因>`' },
          { name: '參數', value: '• **user** - 要警告的成員（必填）\n• **reason** - 警告原因（必填）' },
          { name: '權限要求', value: '需要 ModerateMembers 權限' },
          { name: '例子', value: '`/warn user:@用戶 reason:多次洗屏`' }
        ),
      
      report: new EmbedBuilder()
        .setColor('#FF1493')
        .setTitle('📢 舉報成員 (/report)')
        .addFields(
          { name: '描述', value: '舉報成員的不當行為' },
          { name: '用法', value: '`/report user:<用戶> reason:<原因> description:<詳情>`' },
          { name: '舉報類型', value: '• harassment - 騷擾或欺凌\n• spam - 垃圾信息/廣告\n• hate_speech - 仇恨言論\n• inappropriate - 不當內容\n• scam - 詐騙\n• other - 其他' },
          { name: '例子', value: '`/report user:@用戶 reason:harassment description:他在 DM 騷擾我`' }
        ),
      config: new EmbedBuilder()
        .setColor('#0099FF')
        .setTitle('⚙️ 設定管理 (/config)')
        .addFields(
          { name: '描述', value: '查看或重設本伺服器的 Bot 設定' },
          { name: '用法', value: '`/config view` 或 `/config reset`' },
          { name: '子指令', value: '• **view** - 查看已保存的設定\n• **reset** - 重設設定並清除儲存的配置' },
          { name: '權限要求', value: '需要 ManageGuild 權限' },
          { name: '例子', value: '`/config view`' }
        ),      
      announce: new EmbedBuilder()
        .setColor('#9370DB')
        .setTitle('📣 發送公告 (/announce)')
        .addFields(
          { name: '描述', value: '向指定頻道發送嵌入式公告' },
          { name: '用法', value: '`/announce channel:<頻道> title:<標題> description:<內容> color:<顏色>`' },
          { name: '參數', value: '• **channel** - 公告頻道（必填）\n• **title** - 公告標題（必填）\n• **description** - 公告內容（必填）\n• **color** - 顏色（可選，十六進制，如 0099FF）' },
          { name: '權限要求', value: '需要 ManageMessages 權限' },
          { name: '例子', value: '`/announce channel:#公告 title:規則更新 description:新增禁止討論敏感話題`' }
        ),

      checkin: new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('✅ 活動報到 (/checkin)')
        .addFields(
          { name: '描述', value: '管理員可開啟報到場次，成員可自行報到或取消報到。' },
          { name: '常用子命令', value: '`/checkin open`\n`/checkin join`\n`/checkin leave`\n`/checkin status`\n`/checkin list`\n`/checkin close`' },
          { name: '管理功能', value: '`/checkin mark user:<成員>` 代為報到\n`/checkin unmark user:<成員>` 取消代報到' },
          { name: '權限要求', value: '所有人可報到；開啟、關閉、代報到需要活動管理權限。' },
          { name: '例子', value: '`/checkin open title:活動報到 note:請 10 分鐘內完成`' }
        ),

      matchcall: new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('📢 活動通知 (/matchcall)')
        .addFields(
          { name: '描述', value: '快速通知雙方成員或小組準備活動，支援地點、倒數與補充資訊。' },
          { name: '用法', value: '`/matchcall round:<活動名稱> team1:<小組1> team2:<小組2>`' },
          { name: '常用參數', value: '• **mention1 / mention2** - 直接 ping 小組或成員\n• **room** - 活動房 / 語音房\n• **bestof** - 版本或輪次資訊\n• **start_in** - 幾分鐘後開始\n• **stream** - 直播或連結\n• **note** - 其他備註' },
          { name: '權限要求', value: '需要 ManageGuild 權限' },
          { name: '例子', value: '`/matchcall round:活動A組 team1:小組A team2:小組B bestof:3 start_in:10`' }
        ),

      result: new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('🏆 活動結果 (/result)')
        .addFields(
          { name: '描述', value: '發布活動結果與相關資訊，並自動記錄到結果檔。' },
          { name: '用法', value: '`/result round:<活動名稱> team1:<小組1> score1:<分數> team2:<小組2> score2:<分數>`' },
          { name: '常用參數', value: '• **mention1 / mention2** - @ 雙方\n• **channel** - 發布頻道\n• **bestof** - 輪次或版本資訊\n• **map** - 地圖或模式\n• **stream** - 直播或連結\n• **note** - 補充備註' },
          { name: '權限要求', value: '需要 ManageGuild 權限' },
          { name: '例子', value: '`/result round:活動總結 team1:小組A score1:3 team2:小組B score2:1 bestof:5`' }
        ),

      eventhub: new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🏟️ 活動總覽 (/eventhub)')
        .addFields(
          { name: '描述', value: '顯示目前報到狀態、近期結果、營運指令與活動統計。' },
          { name: '用法', value: '`/eventhub` 或 `/eventhub channel:<頻道>`' },
          { name: '適合用途', value: '• 活動大廳置頂資訊\n• 管理員快速巡檢\n• 開始前統一公告目前狀態' },
          { name: '權限要求', value: '需要 ManageGuild 權限' },
          { name: '例子', value: '`/eventhub channel:#活動資訊 title:今日活動總覽`' }
        ),
      
      userinfo: new EmbedBuilder()
        .setColor('#00CED1')
        .setTitle('👤 用戶信息 (/userinfo)')
        .addFields(
          { name: '描述', value: '查看成員的詳細信息' },
          { name: '用法', value: '`/userinfo user:<用戶>`' },
          { name: '參數', value: '• **user** - 要查詢的成員（可選，不填則查詢自己）' },
          { name: '顯示內容', value: '• 用戶名和 ID\n• 帳戶建立時間\n• 加入伺服器時間\n• 警告次數\n• 身份組和暱稱' },
          { name: '例子', value: '`/userinfo user:@用戶` 或 `/userinfo`' }
        ),
      
      modlog: new EmbedBuilder()
        .setColor('#20B2AA')
        .setTitle('📋 管理日誌 (/modlog)')
        .addFields(
          { name: '描述', value: '查看伺服器的管理操作日誌' },
          { name: '用法', value: '`/modlog type:<類型> count:<數量>`' },
          { name: '參數', value: '• **type** - 日誌類型過濾（可選）：all|BAN|MUTE|UNMUTE|WARN|ERROR\n• **count** - 顯示最新 N 條（1-50，默認 10）' },
          { name: '權限要求', value: '需要 ViewAuditLog 權限' },
          { name: '例子', value: '`/modlog type:WARN count:20`' }
        ),
      
      blacklist: new EmbedBuilder()
        .setColor('#8B0000')
        .setTitle('🚫 黑名單管理 (/blacklist)')
        .addFields(
          { name: '描述', value: '查看和管理伺服器黑名單' },
          { name: '子命令', value: '• **view** - 查看黑名單\n• **check** - 檢查用戶是否在黑名單中\n• **remove** - 從黑名單移除用戶' },
          { name: '使用例子', value: '`/blacklist view page:1`\n`/blacklist check user:@用戶`\n`/blacklist remove userid:123456789`' },
          { name: '權限要求', value: '需要 BanMembers 權限' }
        )
    };

    const embed = helpDocs[command];
    if (embed) {
      embed.setFooter({ text: 'Discord Bot | 適合社群與活動管理' });
      embed.setTimestamp();
      return await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ 命令不存在')
          .setDescription('無法找到該命令的幫助信息。')
      ],
      ephemeral: true
    });
  }
};
