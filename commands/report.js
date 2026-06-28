const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const { logAction } = require('../utils/logger');
const { ensureJsonFile, readJsonFile, writeJsonFile } = require('../utils/jsonStore');
const { runtimeConfig } = require('../utils/runtimeConfig');
const { resolveTextChannel } = require('../utils/channelResolver');

const reportsPath = path.join(__dirname, '../data/reports.json');

const REASON_LABELS = {
  harassment: '騷擾或霸凌',
  spam: '洗版或垃圾訊息',
  hate_speech: '仇恨言論',
  inappropriate: '不當內容',
  scam: '詐騙或可疑連結',
  other: '其他',
};

function ensureReportsFile() {
  ensureJsonFile(reportsPath, []);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('report')
    .setDescription('檢舉成員並通知管理團隊')
    .addUserOption((option) =>
      option.setName('user').setDescription('要檢舉的成員').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('檢舉原因')
        .setRequired(true)
        .addChoices(
          { name: '騷擾或霸凌', value: 'harassment' },
          { name: '洗版或垃圾訊息', value: 'spam' },
          { name: '仇恨言論', value: 'hate_speech' },
          { name: '不當內容', value: 'inappropriate' },
          { name: '詐騙或可疑連結', value: 'scam' },
          { name: '其他', value: 'other' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('description')
        .setDescription('補充細節，幫助管理員更快處理')
        .setRequired(false)
    )
    .setDMPermission(false),

  async execute(interaction) {
    ensureReportsFile();

    const reportedUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const description = interaction.options.getString('description') || '未提供補充說明';

    if (reportedUser.id === interaction.user.id) {
      return interaction.reply({
        content: '不能檢舉自己。',
        ephemeral: true,
      });
    }

    if (reportedUser.bot) {
      return interaction.reply({
        content: '目前不支援檢舉機器人帳號。',
        ephemeral: true,
      });
    }

    try {
      const reports = readJsonFile(reportsPath, []);
      const reportId = `RPT-${Date.now()}`;
      const reasonLabel = REASON_LABELS[reason] || REASON_LABELS.other;

      const report = {
        id: reportId,
        reportedUserId: reportedUser.id,
        reportedUserTag: reportedUser.tag,
        reportedBy: interaction.user.id,
        reportedByTag: interaction.user.tag,
        reason,
        reasonLabel,
        description,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        timestamp: new Date().toISOString(),
        status: 'pending',
      };

      reports.push(report);
      writeJsonFile(reportsPath, reports);

      logAction({
        type: 'REPORT',
        userId: reportedUser.id,
        userTag: reportedUser.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        reason: reasonLabel,
        details: { reportId, reportedBy: interaction.user.tag },
      });

      const confirmationEmbed = new EmbedBuilder()
        .setColor('#FFD166')
        .setTitle('檢舉已送出')
        .addFields(
          { name: '案件編號', value: reportId, inline: true },
          { name: '被檢舉成員', value: reportedUser.tag, inline: true },
          { name: '原因', value: reasonLabel, inline: true },
          { name: '補充說明', value: description }
        )
        .setFooter({ text: '管理團隊會盡快查看並處理。' })
        .setTimestamp();

      await interaction.reply({
        embeds: [confirmationEmbed],
        ephemeral: true,
      });

      const adminChannel = await resolveTextChannel(interaction.guild, {
        channelId: runtimeConfig.reportChannelId || runtimeConfig.logChannelId,
        fallbackNames: runtimeConfig.fallbackChannelNames.report,
      });

      if (!adminChannel) return;

      const adminEmbed = new EmbedBuilder()
        .setColor('#EF4444')
        .setTitle(`${runtimeConfig.brandName} | 新檢舉案件`)
        .addFields(
          { name: '案件編號', value: reportId, inline: true },
          { name: '狀態', value: '待處理', inline: true },
          { name: '被檢舉成員', value: `${reportedUser.tag} (${reportedUser.id})` },
          { name: '檢舉者', value: `${interaction.user.tag} (${interaction.user.id})` },
          { name: '原因', value: reasonLabel },
          { name: '補充說明', value: description },
          { name: '時間', value: new Date(report.timestamp).toLocaleString('zh-TW') }
        )
        .setFooter({ text: runtimeConfig.brandName })
        .setTimestamp();

      await adminChannel.send({ embeds: [adminEmbed] });
    } catch (error) {
      console.error('[REPORT] Command failed:', error);

      logAction({
        type: 'ERROR',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        reason: 'Report command failed',
      });

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: '檢舉送出時發生錯誤，請稍後再試。',
          ephemeral: true,
        }).catch(() => {});
      } else {
        await interaction.reply({
          content: '檢舉送出時發生錯誤，請稍後再試。',
          ephemeral: true,
        }).catch(() => {});
      }
    }
  },
};
