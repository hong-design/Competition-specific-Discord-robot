const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../utils/logger');
const path = require('path');
const { readJsonFile, writeJsonFile } = require('../utils/jsonStore');

const blacklistPath = path.join(__dirname, '../data/blacklist.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('永久封鎖一名成員')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('要封鎖的用戶')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('封鎖原因')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || '未提供原因';

    if (user.id === interaction.client.user.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ 無法封鎖')
            .setDescription('無法封鎖機器人本身。')
        ],
        ephemeral: true
      });
    }

    try {
      // 嘗試 DM 用戶
      try {
        await user.send({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('⚠️ 你已被封鎖')
              .setDescription(`服務器：${interaction.guild.name}`)
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

      // 執行封鎖
      let member = await interaction.guild.members.fetch(user.id).catch(() => null);
      if (member) {
        await member.ban({ reason });
      } else {
        await interaction.guild.bans.create(user.id, { reason });
      }

      // 記錄到黑名單
      const blacklist = readJsonFile(blacklistPath, []);

      blacklist.push({
        id: user.id,
        tag: user.tag,
        reason,
        bannedBy: interaction.user.tag,
        bannedAt: new Date().toISOString()
      });

      writeJsonFile(blacklistPath, blacklist);

      // 日誌
      logAction({
        type: 'BAN',
        userId: user.id,
        userTag: user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        reason: reason,
        details: { bannedBy: interaction.user.id }
      });

      // 回復用戶
      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('✅ 成功封鎖')
        .addFields(
          { name: '用戶', value: user.tag, inline: true },
          { name: 'ID', value: user.id, inline: true },
          { name: '原因', value: reason }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (err) {
      console.error('封鎖命令錯誤:', err);
      logAction({
        type: 'ERROR',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        reason: '封鎖命令失敗'
      });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ 封鎖失敗')
            .setDescription('封鎖用戶時出現錯誤。確保機器人權限足夠。')
        ],
        ephemeral: true
      });
    }
  }
};
