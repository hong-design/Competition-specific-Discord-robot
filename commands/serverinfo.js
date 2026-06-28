const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Show server statistics and basic info')
    .setDMPermission(false),

  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild) {
      return interaction.reply({
        content: 'This command can only be used in a server.',
        ephemeral: true,
      });
    }

    const owner = await guild.fetchOwner().catch(() => null);

    const textChannels = guild.channels.cache.filter((ch) => ch.isTextBased()).size;
    const voiceChannels = guild.channels.cache.filter((ch) => ch.isVoiceBased()).size;

    const embed = new EmbedBuilder()
      .setColor('#1ABC9C')
      .setTitle(`${guild.name} - Server Info`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: 'Server ID', value: guild.id, inline: true },
        { name: 'Owner', value: owner ? `${owner.user.tag}` : 'Unknown', inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
        { name: 'Members', value: String(guild.memberCount), inline: true },
        { name: 'Roles', value: String(guild.roles.cache.size), inline: true },
        { name: 'Boost Level', value: `Tier ${guild.premiumTier}`, inline: true },
        { name: 'Text Channels', value: String(textChannels), inline: true },
        { name: 'Voice Channels', value: String(voiceChannels), inline: true },
        { name: 'Emojis', value: String(guild.emojis.cache.size), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
