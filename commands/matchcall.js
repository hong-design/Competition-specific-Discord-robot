const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
const { logAction } = require('../utils/logger');

function toMention(target) {
  if (!target) return null;

  if ('user' in target) return `<@${target.id}>`;
  if ('username' in target) return `<@${target.id}>`;
  return `<@&${target.id}>`;
}

function formatStartTime(minutesFromNow) {
  if (minutesFromNow === null || minutesFromNow === undefined) return null;

  const startsAt = new Date(Date.now() + minutesFromNow * 60 * 1000);
  const timestamp = Math.floor(startsAt.getTime() / 1000);
  return {
    absolute: `<t:${timestamp}:f>`,
    relative: `<t:${timestamp}:R>`,
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('matchcall')
    .setDescription('發布活動通知')
    .addStringOption((option) =>
      option.setName('round').setDescription('活動名稱，例如：活動 A 組').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('team1').setDescription('小組 / 成員 1 名稱').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('team2').setDescription('小組 / 成員 2 名稱').setRequired(true)
    )
    .addMentionableOption((option) =>
      option.setName('mention1').setDescription('要 @ 的小組 / 成員 1（選填）').setRequired(false)
    )
    .addMentionableOption((option) =>
      option.setName('mention2').setDescription('要 @ 的小組 / 成員 2（選填）').setRequired(false)
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('發布通知的頻道，預設目前頻道')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    )
    .addChannelOption((option) =>
      option.setName('room').setDescription('活動房 / 報到房 / 語音房（選填）').setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('bestof')
        .setDescription('BO 幾，例如 1 / 3 / 5')
        .setMinValue(1)
        .setMaxValue(9)
        .setRequired(false)
    )
    .addIntegerOption((option) =>
      option
        .setName('start_in')
        .setDescription('幾分鐘後開打，用來顯示倒數')
        .setMinValue(0)
        .setMaxValue(1440)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('stream').setDescription('直播連結或直播資訊').setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('note').setDescription('額外備註').setRequired(false)
    )
    .addBooleanOption((option) =>
      option.setName('ping').setDescription('是否直接 ping 雙方').setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction) {
    const round = interaction.options.getString('round');
    const team1 = interaction.options.getString('team1');
    const team2 = interaction.options.getString('team2');
    const mention1 = interaction.options.getMentionable('mention1');
    const mention2 = interaction.options.getMentionable('mention2');
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;
    const room = interaction.options.getChannel('room');
    const bestOf = interaction.options.getInteger('bestof');
    const startIn = interaction.options.getInteger('start_in');
    const stream = interaction.options.getString('stream');
    const note = interaction.options.getString('note');
    const shouldPing = interaction.options.getBoolean('ping') ?? true;

    if (!targetChannel?.isTextBased()) {
      return interaction.reply({
        content: '請提供有效的文字頻道。',
        ephemeral: true,
      });
    }

    const startTime = formatStartTime(startIn);
    const mentions = [toMention(mention1), toMention(mention2)].filter(Boolean);

    const embed = new EmbedBuilder()
      .setColor('#E74C3C')
      .setTitle(`📢 活動通知｜${round}`)
      .setDescription(`**${team1}** vs **${team2}**`)
      .addFields(
        { name: '活動組合', value: `${team1} vs ${team2}`, inline: true },
        { name: '活動名稱', value: round, inline: true },
        { name: '輪次', value: bestOf ? `第 ${bestOf} 輪` : '未指定', inline: true }
      )
      .setFooter({ text: `由 ${interaction.user.tag} 發布` })
      .setTimestamp();

    if (room) {
      embed.addFields({
        name: '活動房間',
        value: `<#${room.id}>`,
        inline: true,
      });
    }

    if (startTime) {
      embed.addFields({
        name: '開打時間',
        value: `${startTime.absolute}\n${startTime.relative}`,
        inline: true,
      });
    }

    if (stream) {
      embed.addFields({
        name: '直播資訊',
        value: stream,
        inline: false,
      });
    }

    if (note) {
      embed.addFields({
        name: '備註',
        value: note,
        inline: false,
      });
    }

    try {
      await targetChannel.send({
        content: shouldPing && mentions.length ? mentions.join(' ') : undefined,
        embeds: [embed],
      });
    } catch (error) {
      console.error('matchcall send failed:', error);
      return interaction.reply({
        content: '無法在指定頻道發送活動通知，請檢查我的發言與嵌入連結權限。',
        ephemeral: true,
      });
    }

    logAction({
      type: 'MATCH_CALL',
      userId: interaction.user.id,
      userTag: interaction.user.tag,
      guildId: interaction.guildId,
      guildName: interaction.guild?.name,
      reason: `Posted match call: ${team1} vs ${team2}`,
      details: {
        round,
        channelId: targetChannel.id,
        roomId: room?.id || null,
        bestOf: bestOf || null,
        startIn: startIn ?? null,
      },
    });

    return interaction.reply({
      content: `已在 <#${targetChannel.id}> 發布活動通知：**${team1} vs ${team2}**`,
      ephemeral: true,
    });
  },
};
