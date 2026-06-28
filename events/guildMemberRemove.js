const { EmbedBuilder } = require('discord.js');
const { runtimeConfig } = require('../utils/runtimeConfig');
const { resolveTextChannel } = require('../utils/channelResolver');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    try {
      if (!runtimeConfig.features.leaveLog) return;

      const logChannel = await resolveTextChannel(member.guild, {
        channelId: runtimeConfig.logChannelId,
        fallbackNames: runtimeConfig.fallbackChannelNames.modLog,
      });

      if (!logChannel) return;

      const joinedHours = member.joinedTimestamp
        ? `${Math.floor((Date.now() - member.joinedTimestamp) / 1000 / 60 / 60)} 小時`
        : '未知';

      const leaveEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('成員離開伺服器')
        .addFields(
          { name: '使用者', value: member.user.tag, inline: true },
          { name: 'ID', value: member.user.id, inline: true },
          { name: '待了多久', value: joinedHours, inline: true },
          { name: '時間', value: `<t:${Math.floor(Date.now() / 1000)}:R>` }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: runtimeConfig.brandName })
        .setTimestamp();

      await logChannel.send({ embeds: [leaveEmbed] });
    } catch (error) {
      console.error('[LEAVE] guildMemberRemove handler failed:', error);
    }
  },
};
