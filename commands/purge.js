const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require('discord.js');
const { logAction } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete recent messages in this channel')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('How many messages to delete (1-100)')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('Only delete messages from this user')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const targetUser = interaction.options.getUser('user');
    const channel = interaction.channel;

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({
        content: 'This command can only be used in text channels.',
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const fetched = await channel.messages.fetch({ limit: 100 });
      let messages = [...fetched.values()]
        .filter((msg) => !msg.pinned)
        .sort((a, b) => b.createdTimestamp - a.createdTimestamp);

      if (targetUser) {
        messages = messages.filter((msg) => msg.author?.id === targetUser.id);
      }

      const selected = messages.slice(0, amount);
      const deletable = selected.filter(
        (msg) => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000
      );

      if (deletable.length === 0) {
        return interaction.editReply({
          content:
            'No deletable messages found. Discord cannot bulk delete messages older than 14 days.',
        });
      }

      const result = await channel.bulkDelete(deletable, true);
      const skipped = selected.length - result.size;

      logAction({
        type: 'PURGE',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild?.name,
        reason: `Deleted ${result.size} message(s) in #${channel.name}`,
        details: {
          targetUserId: targetUser?.id || null,
          requested: amount,
          deleted: result.size,
          skipped,
        },
      });

      const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('Purge Complete')
        .addFields(
          { name: 'Channel', value: `<#${channel.id}>`, inline: true },
          { name: 'Deleted', value: String(result.size), inline: true },
          { name: 'Skipped', value: String(skipped), inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('purge command failed:', error);
      await interaction.editReply({
        content:
          'Failed to delete messages. Check my permissions (Manage Messages + Read Message History).',
      });
    }
  },
};
