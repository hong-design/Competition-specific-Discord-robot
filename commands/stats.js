const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getStats } = require('../utils/logger');
const { getGuildSettings } = require('../src/database/guildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('查看伺服器管理統計概覽（限管理員）')
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
    .setDMPermission(false),

  async execute(interaction) {
    const member = interaction.member;
    const guildSettings = getGuildSettings(interaction.guildId);
    const adminRoleId = guildSettings?.adminRoleId || process.env.ADMIN_ROLE_ID;

    if (adminRoleId) {
      if (!member.roles.cache.has(adminRoleId)) {
        return interaction.reply({ content: '只有管理員身分可使用此指令。', ephemeral: true });
      }
    } else {
      const hasAdmin = member.roles.cache.some(r => r.name === '管理員' || r.name.toLowerCase().includes('admin'));
      if (!hasAdmin) {
        return interaction.reply({ content: '只有管理員身分可使用此指令。請先使用 /setup 設定管理員身分組，或在 `.env` 添加 `ADMIN_ROLE_ID`。', ephemeral: true });
      }
    }

    const stats = getStats(interaction.guildId);

    const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('📊 伺服器管理統計')
      .setDescription(`統計來源：${interaction.guild.name}`)
      .addFields(
        { name: '⚖️ 懲罰統計', value: `\n🔨 封鎖：**${stats.bans}**\n👢 踢出：**${stats.kicks}**\n🔇 禁言：**${stats.mutes}**\n🔊 解禁：**${stats.unmutes}**\n⚠️ 警告：**${stats.warnings}**`.trim(), inline: true },
        { name: '📋 其他統計', value: `\n🚨 舉報：**${stats.reports}**\n❌ 錯誤日誌：**${stats.errors}**\n🚫 黑名單成員：**${stats.blacklistCount}**\n👤 被警告成員：**${stats.uniqueWarned}**\n🔁 反應角色：**${stats.reactionRoles}**`.trim(), inline: true },
        { name: '🏆 活動統計', value: `\n✅ 開啟報到：**${stats.checkinOpens}**\n🙋 完成報到：**${stats.checkinJoins}**\n🟢 本輪已報到：**${stats.activeCheckinCount}**\n📣 活動通知：**${stats.matchCalls}**\n🏁 結果公告：**${stats.matchResults}**`.trim(), inline: false },
        { name: '📈 總計', value: `**${stats.totalLogs}** 條日誌記錄`, inline: false }
      )
      .setFooter({ text: '用 /modlog 查看詳細日誌列表' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
