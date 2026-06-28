const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} = require('discord.js');
const { logAction } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockdown')
    .setDescription('Lock a text channel to block @everyone from sending messages')
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
        .setDescription('Reason for lockdown')
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
        SendMessages: false,
      });

      logAction({
        type: 'LOCKDOWN',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild?.name,
        reason: `Locked #${channel.name}: ${reason}`,
        details: { channelId: channel.id },
      });

      const embed = new EmbedBuilder()
        .setColor('#E74C3C')
        .setTitle('Channel Locked')
        .setDescription(`<#${channel.id}> is now in lockdown.`)
        .addFields({ name: 'Reason', value: reason })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('lockdown command failed:', error);
      await interaction.reply({
        content:
          'Lockdown failed. Check my permissions (Manage Channels and Manage Roles).',
        ephemeral: true,
      });
    }
  },
};
