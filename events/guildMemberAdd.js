const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { runtimeConfig } = require('../utils/runtimeConfig');
const { resolveTextChannel } = require('../utils/channelResolver');

const blacklistPath = path.join(__dirname, '../data/blacklist.json');

function readBlacklist() {
  if (!fs.existsSync(blacklistPath)) return [];

  try {
    const raw = fs.readFileSync(blacklistPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
}

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    try {
      const blacklist = readBlacklist();
      const blacklistEntry = blacklist.find((entry) => entry.id === member.id);

      if (blacklistEntry && runtimeConfig.features.autoBanBlacklistedUsers) {
        try {
          await member.ban({
            reason: `Blacklisted user rejoined: ${blacklistEntry.reason || 'No reason provided'}`,
          });
          console.log(`[JOIN] Auto-banned blacklisted user: ${member.user.tag}`);
        } catch (error) {
          console.error('[JOIN] Failed to auto-ban blacklisted user:', error);
        }
        return;
      }

      if (!runtimeConfig.features.welcomeMessage) return;

      const welcomeChannel = await resolveTextChannel(member.guild, {
        channelId: runtimeConfig.welcomeChannelId,
        fallbackNames: runtimeConfig.fallbackChannelNames.welcome,
      });

      if (!welcomeChannel) return;

      const descriptionLines = [
        `歡迎 ${member} 加入 **${member.guild.name}**。`,
        '先看看社群資訊，完成身分確認後就可以開始交流。',
      ];

      if (runtimeConfig.rulesChannelId) {
        descriptionLines.push(`請先閱讀 <#${runtimeConfig.rulesChannelId}>。`);
      }

      if (runtimeConfig.introChannelId) {
        descriptionLines.push(`也歡迎到 <#${runtimeConfig.introChannelId}> 自我介紹。`);
      }

      if (runtimeConfig.links.website) {
        descriptionLines.push(`[工作室網站](${runtimeConfig.links.website})`);
      }

      if (runtimeConfig.links.invite) {
        descriptionLines.push(`[群組邀請備用連結](${runtimeConfig.links.invite})`);
      }

      const welcomeEmbed = new EmbedBuilder()
        .setColor(runtimeConfig.accentColor)
        .setTitle(`歡迎來到 ${runtimeConfig.brandName}`)
        .setDescription(descriptionLines.join('\n'))
        .addFields(
          { name: '目前成員', value: String(member.guild.memberCount), inline: true },
          { name: '帳號', value: member.user.tag, inline: true }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `${runtimeConfig.brandName} onboarding` })
        .setTimestamp();

      await welcomeChannel.send({ embeds: [welcomeEmbed] });
    } catch (error) {
      console.error('[JOIN] guildMemberAdd handler failed:', error);
    }
  },
};
