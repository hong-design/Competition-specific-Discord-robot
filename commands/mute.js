const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('禁言成員（暫時禁言時間）')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('要禁言的用戶')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('minutes')
        .setDescription('禁言時間（分鐘，1-40320）')
        .setMinValue(1)
        .setMaxValue(40320)
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('禁言原因')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const minutes = interaction.options.getInteger('minutes');
    const reason = interaction.options.getString('reason') || '未提供原因';
    const duration = minutes * 60 * 1000;

    if (!member) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ 無法禁言')
            .setDescription('找不到該成員。')
        ],
        ephemeral: true
      });
    }

    if (member.id === interaction.client.user.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ 無法禁言')
            .setDescription('無法禁言機器人本身。')
        ],
        ephemeral: true
      });
    }

    try {
      await member.timeout(duration, reason);

      logAction({
        type: 'MUTE',
        userId: user.id,
        userTag: user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        reason: reason,
        details: { minutes, duration }
      });

      const successEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('✅ 成功禁言')
        .addFields(
          { name: '用戶', value: user.tag, inline: true },
          { name: '時長', value: `${minutes} 分鐘`, inline: true },
          { name: '原因', value: reason }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (err) {
      console.error('禁言命令錯誤:', err);
      logAction({
        type: 'ERROR',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        reason: '禁言失敗'
      });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ 禁言失敗')
            .setDescription('禁言用戶時出現錯誤。確保機器人權限足夠。')
        ],
        ephemeral: true
      });
    }
  }
};