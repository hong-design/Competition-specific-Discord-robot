const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('踢出成員')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('要踢出的成員')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('踢出原因')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    const reason = interaction.options.getString('reason') || '未提供原因';

    if (!member) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ 無法踢出')
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
            .setTitle('❌ 無法踢出')
            .setDescription('無法踢出機器人本身。')
        ],
        ephemeral: true
      });
    }

    try {
      try {
        await user.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('⚠️ 你已被踢出')
              .setDescription(`伺服器：${interaction.guild.name}`)
              .addFields(
                { name: '原因', value: reason },
                { name: '執行者', value: interaction.user.tag }
              )
              .setTimestamp()
          ]
        });
      } catch (err) {
        console.log('無法發送 DM 給用戶');
      }

      await member.kick(reason);

      logAction({
        type: 'KICK',
        userId: user.id,
        userTag: user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        reason: reason
      });

      const successEmbed = new EmbedBuilder()
        .setColor('#FF6600')
        .setTitle('✅ 成功踢出')
        .addFields(
          { name: '用戶', value: user.tag, inline: true },
          { name: 'ID', value: user.id, inline: true },
          { name: '原因', value: reason }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (err) {
      console.error('踢出命令錯誤:', err);
      logAction({
        type: 'ERROR',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        reason: '踢出失敗'
      });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ 踢出失敗')
            .setDescription('踢出用戶時出現錯誤。確保機器人權限足夠。')
        ],
        ephemeral: true
      });
    }
  }
};
