const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const { logAction } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel and allow @everyone to send messages again')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Target channel (defaults to current channel)')
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('Reason for unlocking')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: 'Please run this in a text channel.',
        ephemeral: true,
      });
    }

    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: null,
      });

      logAction({
        type: 'UNLOCK',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild?.name,
        reason: `Unlocked #${channel.name}: ${reason}`,
        details: { channelId: channel.id },
      });

      const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('Channel Unlocked')
        .setDescription(`<#${channel.id}> is now unlocked.`)
        .addFields({ name: 'Reason', value: reason })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('unlock command failed:', error);
      await interaction.reply({
        content:
          'Unlock failed. Check my permissions (Manage Channels and Manage Roles).',
        ephemeral: true,
      });
    }
  },
};
