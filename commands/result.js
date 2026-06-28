const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
const { logAction } = require('../utils/logger');
const { addResult } = require('../utils/tournamentStore');

function formatSide(name, mention, score) {
  const prefix = mention ? `${mention} ` : '';
  return `${prefix}**${name}**｜${score}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('result')
    .setDescription('發布活動結果與比分')
    .addStringOption((option) =>
      option.setName('round').setDescription('活動名稱，例如：活動 A 組').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('team1').setDescription('小組 / 成員 1 名稱').setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('score1')
        .setDescription('小組 / 成員 1 分數')
        .setMinValue(0)
        .setMaxValue(99)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('team2').setDescription('小組 / 成員 2 名稱').setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('score2')
        .setDescription('小組 / 成員 2 分數')
        .setMinValue(0)
        .setMaxValue(99)
        .setRequired(true)
    )
    .addMentionableOption((option) =>
      option.setName('mention1').setDescription('小組 / 成員 1 要 @ 的對象').setRequired(false)
    )
    .addMentionableOption((option) =>
      option.setName('mention2').setDescription('小組 / 成員 2 要 @ 的對象').setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('發布結果的頻道，預設目前頻道')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('bestof')
        .setDescription('賽制，例如 BO1 / BO3 / BO5')
        .setMinValue(1)
        .setMaxValue(9)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('map').setDescription('地圖 / 模式 / 組別').setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('stream').setDescription('VOD / 直播連結').setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('note').setDescription('補充說明').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction) {
    const round = interaction.options.getString('round');
    const team1 = interaction.options.getString('team1');
    const team2 = interaction.options.getString('team2');
    const score1 = interaction.options.getInteger('score1');
    const score2 = interaction.options.getInteger('score2');
    const mention1 = interaction.options.getMentionable('mention1');
    const mention2 = interaction.options.getMentionable('mention2');
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const bestOf = interaction.options.getInteger('bestof');
    const map = interaction.options.getString('map');
    const stream = interaction.options.getString('stream');
    const note = interaction.options.getString('note');

    if (!channel?.isTextBased()) {
      return interaction.reply({
        content: '請提供有效的文字頻道。',
        ephemeral: true,
      });
    }

    if (score1 === score2) {
      return interaction.reply({
        content: '活動結果不能平手，請輸入有效比分。',
        ephemeral: true,
      });
    }

    const winnerName = score1 > score2 ? team1 : team2;
    const loserName = score1 > score2 ? team2 : team1;
    const winnerMention = score1 > score2 ? mention1 : mention2;
    const loserMention = score1 > score2 ? mention2 : mention1;

    const resultId = `RES-${Date.now()}`;
    const result = {
      id: resultId,
      guildId: interaction.guildId,
      guildName: interaction.guild?.name || null,
      round,
      team1,
      team2,
      score1,
      score2,
      winner: winnerName,
      loser: loserName,
      bestOf: bestOf || null,
      map: map || null,
      stream: stream || null,
      note: note || null,
      channelId: channel.id,
      reportedBy: interaction.user.id,
      reportedByTag: interaction.user.tag,
      timestamp: new Date().toISOString(),
    };

    const embed = new EmbedBuilder()
      .setColor('#3498DB')
      .setTitle(`🏆 活動結果｜${round}`)
      .setDescription(
        [
          `勝者：${winnerMention ? `<@${winnerMention.id}> ` : ''}**${winnerName}**`,
          '',
          `${formatSide(team1, mention1 ? `<@${mention1.id}>` : null, score1)}`,
          `${formatSide(team2, mention2 ? `<@${mention2.id}>` : null, score2)}`,
        ].join('\n')
      )
      .addFields(
        { name: '勝方', value: winnerName, inline: true },
        { name: '敗方', value: loserName, inline: true },
        { name: '比分', value: `${score1} : ${score2}`, inline: true }
      )
      .setFooter({ text: `結果 ID ${resultId}｜回報者 ${interaction.user.tag}` })
      .setTimestamp();

    if (bestOf) {
      embed.addFields({ name: '輪次', value: `第 ${bestOf} 輪`, inline: true });
    }

    if (map) {
      embed.addFields({ name: '地圖 / 模式', value: map, inline: true });
    }

    if (stream) {
      embed.addFields({ name: '直播 / VOD', value: stream, inline: false });
    }

    if (note) {
      embed.addFields({ name: '備註', value: note, inline: false });
    }

    try {
      await channel.send({
        content: [winnerMention ? `<@${winnerMention.id}>` : null, loserMention ? `<@${loserMention.id}>` : null]
          .filter(Boolean)
          .join(' ') || undefined,
        embeds: [embed],
      });
    } catch (error) {
      console.error('result send failed:', error);
      return interaction.reply({
        content: '無法在指定頻道發送活動結果，請檢查我的發言與嵌入連結權限。',
        ephemeral: true,
      });
    }

    addResult(result);

    logAction({
      type: 'MATCH_RESULT',
      userId: interaction.user.id,
      userTag: interaction.user.tag,
      guildId: interaction.guildId,
      guildName: interaction.guild?.name,
      reason: `Recorded result: ${team1} ${score1}-${score2} ${team2}`,
      details: {
        resultId,
        round,
        winner: winnerName,
        channelId: channel.id,
      },
    });

    return interaction.reply({
      content: `已在 <#${channel.id}> 發布結果：**${winnerName}** 勝過 **${loserName}**。`,
      ephemeral: true,
    });
  },
};
