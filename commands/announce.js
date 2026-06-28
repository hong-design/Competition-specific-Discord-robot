const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const { runtimeConfig } = require('../utils/runtimeConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('發送增強版公告（會開啟 Modal 允許多行與更多欄位）')
    .addChannelOption(option => option.setName('channel').setDescription('要發公告的頻道').setRequired(true))
    .addStringOption(option => option.setName('color').setDescription('十六進位色碼，例: FF0000').setRequired(false))
    .addBooleanOption(option => option.setName('mention').setDescription('是否 @everyone').setRequired(false))
    .addBooleanOption(option => option.setName('pin').setDescription('是否釘選公告').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const color = (
      interaction.options.getString('color') ||
      runtimeConfig.accentColor ||
      '#5865F2'
    ).replace('#', '');
    const mention = interaction.options.getBoolean('mention') ? '1' : '0';
    const pin = interaction.options.getBoolean('pin') ? '1' : '0';

    if (!channel || !channel.isTextBased()) return interaction.reply({ content: '請提供有效的文字頻道。', ephemeral: true });

    const modal = new ModalBuilder()
      .setCustomId(`announceModal|${channel.id}|${color}|${mention}|${pin}`)
      .setTitle('建立公告');

    const titleInput = new TextInputBuilder()
      .setCustomId('announce_title')
      .setLabel('標題')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setPlaceholder('公告標題');

    const descInput = new TextInputBuilder()
      .setCustomId('announce_description')
      .setLabel('內容（支援多行）')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setPlaceholder('在此輸入公告多行內容，支援換行與排版');

    const imageInput = new TextInputBuilder()
      .setCustomId('announce_image')
      .setLabel('圖片 URL（選填）')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder('https://...');

    const thumbInput = new TextInputBuilder()
      .setCustomId('announce_thumbnail')
      .setLabel('縮圖 URL（選填）')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder('https://...');

    const footerInput = new TextInputBuilder()
      .setCustomId('announce_footer')
      .setLabel('頁腳文字（選填）')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setPlaceholder('頁腳文字');

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(descInput),
      new ActionRowBuilder().addComponents(imageInput),
      new ActionRowBuilder().addComponents(thumbInput),
      new ActionRowBuilder().addComponents(footerInput),
    );

    await interaction.showModal(modal);
  }
};
