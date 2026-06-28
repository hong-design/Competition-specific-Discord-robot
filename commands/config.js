const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getGuildSettings, deleteGuildSettings } = require('../src/database/guildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('查看或重設此伺服器的 Bot 設定')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('查看已保存的伺服器設定')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('reset')
        .setDescription('重設伺服器設定，將清除已保存的 Bot 配置')
    ),

  async execute(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) {
      await interaction.reply({ content: '❌ 此指令僅能在伺服器中使用。', ephemeral: true });
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    const settings = getGuildSettings(guildId);

    if (subcommand === 'view') {
      if (!settings) {
        await interaction.reply({
          content: '❌ 此伺服器尚未完成 /setup 設定。請先執行 /setup。',
          ephemeral: true,
        });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🔧 伺服器設定')
        .addFields(
          {
            name: '🛡️ 管理員身分組',
            value: `<@&${settings.adminRoleId}>`,
            inline: true,
          },
          {
            name: '📢 公告頻道',
            value: `<#${settings.announcementChannelId}>`,
            inline: true,
          },
          {
            name: '🚨 回報頻道',
            value: `<#${settings.reportChannelId}>`,
            inline: true,
          },
          {
            name: '🕐 時區',
            value: settings.timezone || 'UTC',
            inline: true,
          },
          {
            name: '🤖 Bot 品牌名稱',
            value: settings.botBrandName || 'Discord Bot',
            inline: true,
          },
          {
            name: '📅 最後更新',
            value: `<t:${Math.floor(new Date(settings.updatedAt).getTime() / 1000)}:R>`,
            inline: true,
          }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (subcommand === 'reset') {
      if (!settings) {
        await interaction.reply({
          content: '❌ 此伺服器尚未設定任何配置，無需重設。',
          ephemeral: true,
        });
        return;
      }

      deleteGuildSettings(guildId);
      await interaction.reply({
        content: '✅ 已成功重設此伺服器的 Bot 設定。請重新執行 /setup 以重新配置。',
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({ content: '❌ 未知的子指令。', ephemeral: true });
  },
};
