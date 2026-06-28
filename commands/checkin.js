const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType,
} = require('discord.js');
const { logAction } = require('../utils/logger');
const {
  getGuildCheckin,
  saveCheckinSession,
  deleteGuildCheckin,
} = require('../utils/tournamentStore');

function hasCheckinManagerPermission(interaction) {
  return (
    interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ||
    interaction.memberPermissions?.has(PermissionFlagsBits.ManageEvents) ||
    interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)
  );
}

async function ensureCheckinManager(interaction) {
  if (hasCheckinManagerPermission(interaction)) return true;

  await interaction.reply({
    content: '只有活動管理員可以執行這個報到管理操作。',
    ephemeral: true,
  });
  return false;
}

function uniqueUserIds(userIds) {
  return [...new Set(Array.isArray(userIds) ? userIds.filter(Boolean) : [])];
}

function formatTimestamp(isoString, style = 'f') {
  const time = new Date(isoString).getTime();
  if (!Number.isFinite(time)) return '未知';
  return `<t:${Math.floor(time / 1000)}:${style}>`;
}

function buildCheckinEmbed(interaction, session, { showMembers = false } = {}) {
  const checkedInUserIds = uniqueUserIds(session.checkedInUserIds);
  const preview = checkedInUserIds.slice(0, showMembers ? 25 : 10).map((id) => `<@${id}>`);
  const hiddenCount = Math.max(checkedInUserIds.length - preview.length, 0);

  const embed = new EmbedBuilder()
    .setColor('#2ECC71')
    .setTitle(`✅ 活動報到${session.active ? '進行中' : '已結束'}`)
    .setDescription(
      [
        `**場次 / 標題：** ${session.title}`,
        session.note ? `**備註：** ${session.note}` : null,
        '',
        session.active
          ? '成員可使用 `/checkin join` 報到，若點錯可用 `/checkin leave` 取消。'
          : '本輪報到已結束。',
      ]
        .filter(Boolean)
        .join('\n')
    )
    .addFields(
      { name: '報到人數', value: `${checkedInUserIds.length} 人`, inline: true },
      { name: '報到頻道', value: `<#${session.channelId}>`, inline: true },
      { name: '開啟時間', value: formatTimestamp(session.openedAt, 'R'), inline: true }
    )
    .setFooter({ text: `開啟者 ${session.openedByTag}` })
    .setTimestamp();

  if (interaction?.user) {
    embed.addFields({
      name: '我的狀態',
      value: checkedInUserIds.includes(interaction.user.id) ? '已報到' : '尚未報到',
      inline: true,
    });
  }

  if (preview.length) {
    embed.addFields({
      name: showMembers ? '已報到名單' : '名單預覽',
      value: `${preview.join(' ')}${hiddenCount ? `\n...以及另外 ${hiddenCount} 位` : ''}`,
      inline: false,
    });
  } else {
    embed.addFields({
      name: '已報到名單',
      value: '目前還沒有人報到。',
      inline: false,
    });
  }

  return embed;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkin')
    .setDescription('活動報到管理與成員報到')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('open')
        .setDescription('開啟一輪活動報到')
        .addStringOption((option) =>
          option.setName('title').setDescription('報到標題，例如：活動報到').setRequired(true)
        )
        .addStringOption((option) =>
          option.setName('note').setDescription('補充說明，例如：請於 10 分鐘內完成').setRequired(false)
        )
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('要公告報到的頻道，預設當前頻道')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('close').setDescription('關閉目前的活動報到')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('join').setDescription('為自己完成活動報到')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('leave').setDescription('取消自己的活動報到')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('status').setDescription('查看目前報到狀態')
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list').setDescription('查看完整已報到名單')
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('mark')
        .setDescription('由管理員代為標記成員已報到')
        .addUserOption((option) =>
          option.setName('user').setDescription('要標記的成員').setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('unmark')
        .setDescription('由管理員移除某位成員的報到狀態')
        .addUserOption((option) =>
          option.setName('user').setDescription('要移除的成員').setRequired(true)
        )
    )
    .setDMPermission(false),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const session = getGuildCheckin(interaction.guildId);

    if (subcommand === 'open') {
      if (!(await ensureCheckinManager(interaction))) return;

      if (session?.active) {
        return interaction.reply({
          content: '目前已經有一個進行中的報到場次，請先 `/checkin close` 再重新開啟。',
          ephemeral: true,
        });
      }

      const title = interaction.options.getString('title');
      const note = interaction.options.getString('note') || '';
      const channel = interaction.options.getChannel('channel') || interaction.channel;

      if (!channel?.isTextBased()) {
        return interaction.reply({
          content: '請提供有效的文字頻道。',
          ephemeral: true,
        });
      }

      const nextSession = {
        active: true,
        title,
        note,
        channelId: channel.id,
        openedAt: new Date().toISOString(),
        openedById: interaction.user.id,
        openedByTag: interaction.user.tag,
        checkedInUserIds: [],
      };

      const embed = buildCheckinEmbed(interaction, nextSession);
      try {
        await channel.send({ embeds: [embed] });
      } catch (error) {
        console.error('checkin open announce failed:', error);
        return interaction.reply({
          content: '無法在指定頻道發送報到公告，請檢查我的發言與嵌入連結權限。',
          ephemeral: true,
        });
      }

      saveCheckinSession({
        guildId: interaction.guildId,
        ...nextSession,
      });

      logAction({
        type: 'CHECKIN_OPEN',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild?.name,
        reason: `Opened check-in: ${title}`,
        details: { channelId: channel.id },
      });

      return interaction.reply({
        content: `已在 <#${channel.id}> 開啟活動報到：**${title}**`,
        ephemeral: true,
      });
    }

    if (!session?.active) {
      return interaction.reply({
        content: '目前沒有開放中的活動報到。請先由管理員執行 `/checkin open`。',
        ephemeral: true,
      });
    }

    const checkedInUserIds = uniqueUserIds(session.checkedInUserIds);

    if (subcommand === 'close') {
      if (!(await ensureCheckinManager(interaction))) return;

      const closingSession = { ...session, checkedInUserIds };
      deleteGuildCheckin(interaction.guildId);

      const embed = buildCheckinEmbed(interaction, { ...closingSession, active: false }, { showMembers: true })
        .setColor('#E67E22')
        .setTitle('🛑 活動報到已關閉');

      const sessionChannel =
        interaction.guild.channels.cache.get(closingSession.channelId) ||
        (await interaction.guild.channels.fetch(closingSession.channelId).catch(() => null));

      if (sessionChannel?.isTextBased()) {
        await sessionChannel.send({ embeds: [embed] }).catch(() => null);
      }

      logAction({
        type: 'CHECKIN_CLOSE',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild?.name,
        reason: `Closed check-in: ${closingSession.title}`,
        details: { count: checkedInUserIds.length },
      });

      return interaction.reply({
        content: `已關閉報到：**${closingSession.title}**，共 ${checkedInUserIds.length} 人完成報到。`,
        ephemeral: true,
      });
    }

    if (subcommand === 'join') {
      if (checkedInUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: '你已經報到過了。',
          ephemeral: true,
        });
      }

      checkedInUserIds.push(interaction.user.id);
      session.checkedInUserIds = checkedInUserIds;
      saveCheckinSession({ guildId: interaction.guildId, ...session });

      logAction({
        type: 'CHECKIN_JOIN',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild?.name,
        reason: `Joined check-in: ${session.title}`,
        details: { count: checkedInUserIds.length },
      });

      return interaction.reply({
        content: `報到成功，目前共有 ${checkedInUserIds.length} 人完成報到。`,
        ephemeral: true,
      });
    }

    if (subcommand === 'leave') {
      if (!checkedInUserIds.includes(interaction.user.id)) {
        return interaction.reply({
          content: '你目前不在報到名單內。',
          ephemeral: true,
        });
      }

      session.checkedInUserIds = checkedInUserIds.filter((userId) => userId !== interaction.user.id);
      saveCheckinSession({ guildId: interaction.guildId, ...session });

      logAction({
        type: 'CHECKIN_LEAVE',
        userId: interaction.user.id,
        userTag: interaction.user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild?.name,
        reason: `Left check-in: ${session.title}`,
        details: { count: session.checkedInUserIds.length },
      });

      return interaction.reply({
        content: `已取消報到，目前共有 ${session.checkedInUserIds.length} 人完成報到。`,
        ephemeral: true,
      });
    }

    if (subcommand === 'status') {
      return interaction.reply({
        embeds: [buildCheckinEmbed(interaction, { ...session, checkedInUserIds })],
        ephemeral: true,
      });
    }

    if (subcommand === 'list') {
      return interaction.reply({
        embeds: [buildCheckinEmbed(interaction, { ...session, checkedInUserIds }, { showMembers: true })],
        ephemeral: true,
      });
    }

    if (subcommand === 'mark' || subcommand === 'unmark') {
      if (!(await ensureCheckinManager(interaction))) return;

      const user = interaction.options.getUser('user');
      const alreadyCheckedIn = checkedInUserIds.includes(user.id);

      if (subcommand === 'mark') {
        if (alreadyCheckedIn) {
          return interaction.reply({
            content: `${user.tag} 已經在報到名單中。`,
            ephemeral: true,
          });
        }

        checkedInUserIds.push(user.id);
        session.checkedInUserIds = checkedInUserIds;
        saveCheckinSession({ guildId: interaction.guildId, ...session });

        logAction({
          type: 'CHECKIN_MARK',
          userId: user.id,
          userTag: user.tag,
          guildId: interaction.guildId,
          guildName: interaction.guild?.name,
          reason: `Marked checked in for ${session.title}`,
          details: { markedBy: interaction.user.id, count: checkedInUserIds.length },
        });

        return interaction.reply({
          content: `已將 ${user.tag} 標記為完成報到。`,
          ephemeral: true,
        });
      }

      if (!alreadyCheckedIn) {
        return interaction.reply({
          content: `${user.tag} 目前不在報到名單中。`,
          ephemeral: true,
        });
      }

      session.checkedInUserIds = checkedInUserIds.filter((userId) => userId !== user.id);
      saveCheckinSession({ guildId: interaction.guildId, ...session });

      logAction({
        type: 'CHECKIN_UNMARK',
        userId: user.id,
        userTag: user.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild?.name,
        reason: `Removed from check-in for ${session.title}`,
        details: { removedBy: interaction.user.id, count: session.checkedInUserIds.length },
      });

      return interaction.reply({
        content: `已將 ${user.tag} 從報到名單移除。`,
        ephemeral: true,
      });
    }

    return interaction.reply({
      content: '未知的報到子命令。',
      ephemeral: true,
    });
  },
};
