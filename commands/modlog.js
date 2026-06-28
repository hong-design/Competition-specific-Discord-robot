const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { getLogs } = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('modlog')
    .setDescription('查看管理日誌')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('篩選日誌類型')
        .addChoices(
          { name: '全部', value: 'all' },
          { name: '封鎖', value: 'BAN' },
          { name: '禁言', value: 'MUTE' },
          { name: '解除禁言', value: 'UNMUTE' },
          { name: '警告', value: 'WARN' },
          { name: '錯誤', value: 'ERROR' }
        )
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option
        .setName('count')
        .setDescription('顯示最新 N 條日誌（預設 10，最多 50）')
        .setMinValue(1)
        .setMaxValue(50)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
    .setDMPermission(false),

  async execute(interaction) {
    const type = interaction.options.getString('type') || 'all';
    const count = interaction.options.getInteger('count') || 10;

    let logs = getLogs({ guildId: interaction.guildId });

    if (type !== 'all') {
      logs = logs.filter(log => log.type === type);
    }

    if (logs.length === 0) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('📋 管理日誌')
            .setDescription('尚無符合條件的日誌記錄。')
        ],
        ephemeral: true
      });
    }

    const recentLogs = logs.slice(-count).reverse();

    const logEmbed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('📋 管理日誌')
      .setDescription(
        recentLogs
          .map(log => {
            const icon = {
              BAN: '🔨',
              MUTE: '🔇',
              UNMUTE: '🔊',
              WARN: '⚠️',
              ERROR: '❌'
            }[log.type] || '📝';
            
            return `${icon} \`[${log.type}]\` ${log.userTag} - ${log.reason}`;
          })
          .join('\n')
      )
      .setFooter({ text: `展示 ${recentLogs.length}/${logs.length} 條日誌` })
      .setTimestamp();

    await interaction.reply({ embeds: [logEmbed] });
  }
};