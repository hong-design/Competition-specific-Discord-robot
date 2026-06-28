const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { logAction } = require('../utils/logger');
const path = require('path');
const { ensureJsonFile, readJsonFile, writeJsonFile } = require('../utils/jsonStore');

const warningsPath = path.join(__dirname, '../data/warnings.json');

function ensureWarningsFile() {
  ensureJsonFile(warningsPath, {});
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('警告成員')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('要警告的用戶')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('警告原因')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    ensureWarningsFile();

    if (user.id === interaction.client.user.id) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ 無法警告')
            .setDescription('無法警告機器人本身。')
        ],
        ephemeral: true
      });
    }

    try {
      const warnings = readJsonFile(warningsPath, {});
      
      if (!warnings[user.id]) {
        warnings[user.id] = [];
      }

      warnings[user.id].push({
        reason,
        warnedBy: interaction.user.tag,
        timestamp: new Date().toISOString()
      });

      writeJsonFile(warningsPath, warnings);

      const warningCount = warnings[user.id].length;

      logAction({
        type: 'WARN',
        userId: user.id,
        userTag: user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        reason: reason,
        details: { count: warningCount }
      });

      const successEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('⚠️ 已警告成員')
        .addFields(
          { name: '用戶', value: user.tag, inline: true },
          { name: '警告次數', value: `${warningCount}`, inline: true },
          { name: '原因', value: reason }
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });
    } catch (err) {
      console.error('警告命令錯誤:', err);
      logAction({
        type: 'ERROR',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild.name,
        reason: '警告失敗'
      });

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ 警告失敗')
            .setDescription('警告用戶時出現錯誤。')
        ],
        ephemeral: true
      });
    }
  }
};
