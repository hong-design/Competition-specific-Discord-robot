const { EmbedBuilder } = require('discord.js');
const { logAction } = require('../utils/logger');
const { runtimeConfig } = require('../utils/runtimeConfig');
const { resolveTextChannel } = require('../utils/channelResolver');

module.exports = {
  name: 'guildBanAdd',
  async execute(ban) {
    try {
      if (!runtimeConfig.features.banLog) return;

      const logChannel = await resolveTextChannel(ban.guild, {
        channelId: runtimeConfig.logChannelId,
        fallbackNames: runtimeConfig.fallbackChannelNames.modLog,
      });

      if (logChannel) {
        const banEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('成員遭到封鎖')
          .addFields(
            { name: '使用者', value: ban.user.tag, inline: true },
            { name: 'ID', value: ban.user.id, inline: true },
            { name: '原因', value: ban.reason || '未提供' },
            { name: '時間', value: `<t:${Math.floor(Date.now() / 1000)}:R>` }
          )
          .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: runtimeConfig.brandName })
          .setTimestamp();

        await logChannel.send({ embeds: [banEmbed] });
      }

      logAction({
        type: 'BAN',
        userId: ban.user.id,
        userTag: ban.user.tag,
        guildId: ban.guild.id,
        guildName: ban.guild.name,
        reason: ban.reason || 'No reason provided',
      });
    } catch (error) {
      console.error('[BAN] guildBanAdd handler failed:', error);
    }
  },
};
