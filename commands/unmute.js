const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('解除成員禁言')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('要解除禁言的用戶')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('解除原因')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const reason = interaction.options.getString('reason') || '無';

    if (!member) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ 無法解除禁言')
            .setDescription('找不到該成員。')
        ],
        ephemeral: true
      });
    }

    if (!member.isCommunicationDisabled()) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('ℹ️ 用戶未被禁言')
            .setDescription('該用戶目前沒有被禁言。')
        ],
        ephemeral: true
      });
    }

    try {
      await member.timeout(null, reason);

      logAction({
        type: 'UNMUTE',
        userId: user.id,
        userTag: user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        reason: reason
      });

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ 成功解除禁言')
        .addFields(
          { name: '用戶', value: user.tag, inline: true },
          { name: '原因', value: reason }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (err) {
      console.error('解除禁言錯誤:', err);
      logAction({
        type: 'ERROR',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        reason: '解除禁言失敗'
      });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ 解除禁言失敗')
            .setDescription('解除禁言時出現錯誤。')
        ],
        ephemeral: true
      });
    }
  }
};