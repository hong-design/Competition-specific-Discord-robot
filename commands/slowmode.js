const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const { logAction } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set channel slowmode (0-21600 seconds)')
    .addIntegerOption((option) =>
      option
        .setName('seconds')
        .setDescription('Slowmode duration in seconds (0 = off)')
        .setMinValue(0)
        .setMaxValue(21600)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Target channel (defaults to current channel)')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (!channel || !channel.isTextBased() || typeof channel.setRateLimitPerUser !== 'function') {
      return interaction.reply({
        content: 'This channel does not support slowmode.',
        ephemeral: true,
      });
    }

    try {
      await channel.setRateLimitPerUser(
        seconds,
        `Changed by ${interaction.user.tag} (${interaction.user.id})`
      );

      logAction({
        type: 'SLOWMODE',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild?.name,
        reason: `Set #${channel.name} slowmode to ${seconds}s`,
        details: { channelId: channel.id, seconds },
      });

      const embed = new EmbedBuilder()
        .setColor('#3498DB')
        .setTitle('Slowmode Updated')
        .addFields(
          { name: 'Channel', value: `<#${channel.id}>`, inline: true },
          { name: 'Slowmode', value: seconds === 0 ? 'Off' : `${seconds}s`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('slowmode command failed:', error);
      await interaction.reply({
        content: 'Failed to update slowmode. Check my Manage Channels permission.',
        ephemeral: true,
      });
    }
  },
};
