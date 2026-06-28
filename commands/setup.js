/**
 * /setup 命令
 * 
 * 用途：首次配置 Discord 伺服器
 * 限制：只有 Manage Guild 權限的成員可執行
 * 功能：設定管理員 Role、公告頻道、回報頻道、時區、Bot 品牌名稱
 */

const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { logAction } = require('../utils/logger');
const { getGuildSettings, setGuildSettings } = require('../src/database/guildSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('設定此伺服器的 Bot 配置（僅限 Manage Guild 權限）')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addRoleOption((option) =>
      option
        .setName('admin_role')
        .setDescription('設定管理員身分組')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('announcement_channel')
        .setDescription('設定公告頻道')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('report_channel')
        .setDescription('設定回報頻道')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('timezone')
        .setDescription('設定時區（例：Asia/Taipei, UTC, etc）')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('bot_brand_name')
        .setDescription('設定 Bot 品牌名稱（可選）')
        .setRequired(false)
    ),

  async execute(interaction) {
    try {
      // 權限檢查
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await interaction.reply({
          content: '❌ 只有具備 Manage Guild 權限的成員可執行此指令。',
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      const guildId = interaction.guildId;
      const guild = interaction.guild;

      // 讀取選項
      const adminRole = interaction.options.getRole('admin_role');
      const announcementChannel = interaction.options.getChannel('announcement_channel');
      const reportChannel = interaction.options.getChannel('report_channel');
      const timezone = interaction.options.getString('timezone') || 'UTC';
      const botBrandName = interaction.options.getString('bot_brand_name') || 'Discord Bot';

      // 驗證頻道
      if (!announcementChannel.isTextBased()) {
        await interaction.editReply({
          content: '❌ 公告頻道必須是文字頻道。',
        });
        return;
      }

      if (!reportChannel.isTextBased()) {
        await interaction.editReply({
          content: '❌ 回報頻道必須是文字頻道。',
        });
        return;
      }

      // 驗證 Bot 有權限在頻道發送訊息
      const botMember = await guild.members.fetchMe();
      const announcementPerms = announcementChannel.permissionsFor(botMember);
      const reportPerms = reportChannel.permissionsFor(botMember);

      if (!announcementPerms.has(PermissionFlagsBits.SendMessages)) {
        await interaction.editReply({
          content: `❌ Bot 無法在 <#${announcementChannel.id}> 發送訊息。請檢查頻道權限。`,
        });
        return;
      }

      if (!reportPerms.has(PermissionFlagsBits.SendMessages)) {
        await interaction.editReply({
          content: `❌ Bot 無法在 <#${reportChannel.id}> 發送訊息。請檢查頻道權限。`,
        });
        return;
      }

      // 儲存設定
      const settings = setGuildSettings(guildId, {
        guildId,
        guildName: guild.name,
        adminRoleId: adminRole.id,
        announcementChannelId: announcementChannel.id,
        reportChannelId: reportChannel.id,
        timezone,
        botBrandName,
      });

      // 記錄操作
      logAction({
        type: 'SETUP',
        userTag: interaction.user.tag,
        guildId,
        guildName: guild.name,
        reason: `Setup completed: Admin Role=${adminRole.name}, Announcement Channel=${announcementChannel.name}, Report Channel=${reportChannel.name}`,
      });

      // 回應確認
      const embed = new EmbedBuilder()
        .setColor('#2ECC71')
        .setTitle('✅ 設定完成')
        .setDescription('此伺服器的 Bot 配置已成功保存。')
        .addFields(
          {
            name: '🛡️ 管理員身分組',
            value: `<@&${adminRole.id}>`,
            inline: true,
          },
          {
            name: '📢 公告頻道',
            value: `<#${announcementChannel.id}>`,
            inline: true,
          },
          {
            name: '🚨 回報頻道',
            value: `<#${reportChannel.id}>`,
            inline: true,
          },
          {
            name: '🕐 時區',
            value: timezone,
            inline: true,
          },
          {
            name: '🤖 Bot 品牌名稱',
            value: botBrandName,
            inline: true,
          },
          {
            name: '💾 設定時間',
            value: `<t:${Math.floor(Date.now() / 1000)}:R>`,
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({ text: '設定已保存到資料庫' });

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`configView|${guildId}`)
          .setLabel('查看設定')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(`configReset|${guildId}`)
          .setLabel('重設設定')
          .setStyle(ButtonStyle.Danger)
      );

      await interaction.editReply({
        embeds: [embed],
        components: [buttons],
      });

    } catch (error) {
      console.error('[SETUP] 設定失敗:', error);
      try {
        await interaction.editReply({
          content: '❌ 設定過程中發生錯誤。請檢查 Bot 權限並重試。',
        });
      } catch (_) {
        console.error('[SETUP] 無法回應交互:', _);
      }
    }
  },
};
