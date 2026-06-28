const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const { readJsonFile } = require('../utils/jsonStore');

const warningsPath = path.join(__dirname, '../data/warnings.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('查看用戶資訊')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('要查詢的用戶（留空為自己）')
        .setRequired(false)
    )
    .setDMPermission(false),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ 找不到用戶')
            .setDescription('無法找到該用戶的伺服器成員信息。')
        ],
        ephemeral: true
      });
    }

    const warningsData = readJsonFile(warningsPath, {});
    const warnings = warningsData[user.id] || [];

    const userEmbed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle(`👤 ${user.username} 的信息`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addFields(
        { name: '👤 用戶名', value: user.tag, inline: true },
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📅 帳戶建立', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: '🎫 加入伺服器', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
        { name: '⚠️ 警告次數', value: `${warnings.length}`, inline: true },
        { name: '🎭 身份組', value: member.roles.cache.map(r => r.toString()).slice(0, 5).join(', ') || '無', inline: false }
      )
      .setTimestamp();

    if (member.nickname) {
      userEmbed.addFields({ name: '✏️ 暱稱', value: member.nickname, inline: true });
    }

    await interaction.reply({ embeds: [userEmbed] });
  }
};
