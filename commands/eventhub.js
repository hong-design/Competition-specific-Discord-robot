const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
const { getStats } = require('../utils/logger');
const { getGuildCheckin, getRecentGuildResults } = require('../utils/tournamentStore');

function formatTime(isoString, style = 'R') {
  const time = new Date(isoString).getTime();
  if (!Number.isFinite(time)) return '未知';
  return `<t:${Math.floor(time / 1000)}:${style}>`;
}

function buildHubEmbed(interaction, customTitle) {
  const guild = interaction.guild;
  const stats = getStats(interaction.guildId);
  const activeCheckin = getGuildCheckin(interaction.guildId);
  const recentResults = getRecentGuildResults(interaction.guildId, 5);

  const embed = new EmbedBuilder()
    .setColor('#5865F2')
    .setTitle(customTitle || `🏟️ ${guild.name} 活動總覽`)
    .setDescription('提供目前活動狀態、近期結果與常用營運指令。')
    .setTimestamp();

  embed.addFields({
    name: '📌 目前狀態',
    value: activeCheckin?.active
      ? [
          `報到中：**${activeCheckin.title}**`,
          `人數：**${(activeCheckin.checkedInUserIds || []).length}**`,
          `頻道：<#${activeCheckin.channelId}>`,
          `開啟：${formatTime(activeCheckin.openedAt)}`,
        ].join('\n')
      : '目前沒有開放中的報到。',
    inline: false,
  });

  embed.addFields(
    {
      name: '📊 活動統計',
      value: [
        `開啟報到：**${stats.checkinOpens}**`,
        `完成報到：**${stats.checkinJoins}**`,
        `活動通知：**${stats.matchCalls}**`,
        `結果公告：**${stats.matchResults}**`,
      ].join('\n'),
      inline: true,
    },
    {
      name: '🧭 常用命令',
      value: [
        '`/checkin open` 開放報到',
        '`/checkin list` 查看名單',
        '`/matchcall` 發送通知',
        '`/result` 發布結果',
      ].join('\n'),
      inline: true,
    }
  );

  embed.addFields({
    name: '📝 近期結果',
    value: recentResults.length
      ? recentResults
          .map(
            (result) =>
              `• **${result.round}**｜${result.team1} ${result.score1}:${result.score2} ${result.team2}｜勝者：**${result.winner}**`
          )
          .join('\n')
      : '目前還沒有已記錄的結果。',
    inline: false,
  });

  return embed;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eventhub')
    .setDescription('顯示活動總覽面板')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('若指定則把總覽發到該頻道')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('title').setDescription('自訂面板標題').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title');
    const embed = buildHubEmbed(interaction, title);

    if (!channel) {
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    try {
      await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('eventhub send failed:', error);
      return interaction.reply({
        content: '無法在指定頻道發送活動總覽，請檢查我的發言與嵌入連結權限。',
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: `已在 <#${channel.id}> 發送活動總覽面板。`,
      ephemeral: true,
    });
  },
};
