const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const path = require('path');
const { ensureJsonFile, readJsonFile, writeJsonFile } = require('../utils/jsonStore');

const blacklistPath = path.join(__dirname, '../data/blacklist.json');

function ensureBlacklistFile() {
  ensureJsonFile(blacklistPath, []);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('查看或管理黑名單')
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription('查看黑名單')
        .addIntegerOption(option =>
          option
            .setName('page')
            .setDescription('頁碼（每頁 10 條）')
            .setMinValue(1)
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('check')
        .setDescription('檢查用戶是否在黑名單中')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('要檢查的用戶')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('從黑名單移除用戶')
        .addStringOption(option =>
          option
            .setName('userid')
            .setDescription('用戶 ID')
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),

  async execute(interaction) {
    ensureBlacklistFile();
    const blacklist = readJsonFile(blacklistPath, []);

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'view') {
      const page = interaction.options.getInteger('page') || 1;
      const itemsPerPage = 10;
      const totalPages = Math.ceil(blacklist.length / itemsPerPage);

      if (page > totalPages || page < 1) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ 頁碼錯誤')
              .setDescription(`頁碼必須在 1-${totalPages} 之間。`)
          ],
          ephemeral: true
        });
      }

      const startIdx = (page - 1) * itemsPerPage;
      const pageItems = blacklist.slice(startIdx, startIdx + itemsPerPage);

      const viewEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🚫 黑名單')
        .setDescription(
          pageItems.length > 0
            ? pageItems
                .map((entry, i) => {
                  return `${startIdx + i + 1}. **${entry.tag}** (${entry.id})\n   原因：${entry.reason}\n   時間：${new Date(entry.bannedAt).toLocaleString('zh-TW')}`;
                })
                .join('\n\n')
            : '黑名單為空'
        )
        .setFooter({ text: `頁碼 ${page}/${totalPages} | 總計 ${blacklist.length} 條` })
        .setTimestamp();

      await interaction.reply({ embeds: [viewEmbed] });
    } else if (subcommand === 'check') {
      const user = interaction.options.getUser('user');
      const entry = blacklist.find(e => e.id === user.id);

      if (entry) {
        const checkEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('⚠️ 在黑名單中')
          .addFields(
            { name: '用戶', value: entry.tag, inline: true },
            { name: 'ID', value: entry.id, inline: true },
            { name: '原因', value: entry.reason },
            { name: '封鎖時間', value: new Date(entry.bannedAt).toLocaleString('zh-TW') }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [checkEmbed] });
      } else {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#00FF00')
              .setTitle('✅ 不在黑名單中')
              .setDescription(`${user.tag} 不在黑名單中。`)
          ],
          ephemeral: true
        });
      }
    } else if (subcommand === 'remove') {
      const userId = interaction.options.getString('userid');
      const index = blacklist.findIndex(e => e.id === userId);

      if (index === -1) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FF0000')
              .setTitle('❌ 找不到用戶')
              .setDescription('該用戶不在黑名單中。')
          ],
          ephemeral: true
        });
      }

      const removed = blacklist.splice(index, 1)[0];
      writeJsonFile(blacklistPath, blacklist);

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ 已移除黑名單')
            .addFields(
              { name: '用戶', value: removed.tag },
              { name: 'ID', value: removed.id }
            )
            .setTimestamp()
        ]
      });
    }
  }
};
