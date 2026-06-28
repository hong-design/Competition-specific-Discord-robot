require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
  EmbedBuilder,
  Partials,
  PermissionFlagsBits,
} = require('discord.js');
const { logAction, clearOldLogs, flushLogs } = require('./utils/logger');
const { runtimeConfig } = require('./utils/runtimeConfig');
const { getGuildSettings, deleteGuildSettings } = require('./src/database/guildSettings');

// 從統一設定模組讀取 Discord 設定
const discordConfig = require('./src/config/discord');

const DISCORD_TOKEN = discordConfig.TOKEN;
const CLIENT_ID = discordConfig.CLIENT_ID;
const GUILD_ID = discordConfig.GUILD_ID;
const ENVIRONMENT = discordConfig.ENVIRONMENT;
const AUTO_REGISTER_COMMANDS = discordConfig.AUTO_REGISTER_COMMANDS;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
const slashCommandPayload = [];

function collectJsFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue;

    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJsFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

function loadCommands() {
  const commandRoots = [
    path.join(__dirname, 'commands'),
    path.join(__dirname, 'custom-commands'),
  ];
  const commandFiles = commandRoots.flatMap((commandsPath) => collectJsFiles(commandsPath));

  for (const filePath of commandFiles) {
    const label = path.relative(__dirname, filePath);
    try {
      const command = require(filePath);
      if (!command?.data || typeof command.execute !== 'function') {
        console.warn(`[BOOT] Skipped invalid command module: ${label}`);
        continue;
      }

      client.commands.set(command.data.name, command);
      slashCommandPayload.push(command.data.toJSON());
    } catch (error) {
      console.error(`[BOOT] Failed to load command "${label}":`, error);
    }
  }
}

function loadEvents() {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = collectJsFiles(eventsPath);

  for (const filePath of eventFiles) {
    const label = path.relative(__dirname, filePath);
    try {
      const event = require(filePath);
      if (!event?.name || typeof event.execute !== 'function') {
        console.warn(`[BOOT] Skipped invalid event module: ${label}`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    } catch (error) {
      console.error(`[BOOT] Failed to load event "${label}":`, error);
    }
  }
}

function sanitizeHexColor(rawColor) {
  const fallbackColor = String(runtimeConfig.accentColor || '#5865F2')
    .replace('#', '')
    .trim();
  const cleaned = String(rawColor || fallbackColor).replace('#', '').trim();
  return /^[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned : fallbackColor;
}

async function handleAnnounceModal(interaction) {
  const id = interaction.customId || '';
  if (!id.startsWith('announceModal|')) return false;

  const parts = id.split('|');
  const channelId = parts[1];
  const color = sanitizeHexColor(parts[2]);
  const mention = parts[3] === '1';
  const pin = parts[4] === '1';

  if (!interaction.guild || !channelId) {
    await interaction.reply({
      content: '無效的公告參數，請重新執行 /announce。',
      ephemeral: true,
    });
    return true;
  }

  const title = interaction.fields.getTextInputValue('announce_title') || '公告';
  const description =
    interaction.fields.getTextInputValue('announce_description') || '';
  const imageUrl = interaction.fields.getTextInputValue('announce_image') || null;
  const thumbnailUrl =
    interaction.fields.getTextInputValue('announce_thumbnail') || null;
  const footer = interaction.fields.getTextInputValue('announce_footer') || null;

  const cached = interaction.guild.channels.cache.get(channelId);
  const targetChannel =
    cached ||
    (await interaction.guild.channels.fetch(channelId).catch(() => null));

  if (!targetChannel || !targetChannel.isTextBased()) {
    await interaction.reply({
      content: '找不到可發送公告的文字頻道。',
      ephemeral: true,
    });
    return true;
  }

  const embed = new EmbedBuilder()
    .setColor(`#${color}`)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  if (thumbnailUrl) embed.setThumbnail(thumbnailUrl);
  if (imageUrl) embed.setImage(imageUrl);
  if (footer) embed.setFooter({ text: footer });

  const payload = { embeds: [embed] };
  if (mention) {
    payload.content = '@everyone';
    payload.allowedMentions = { parse: ['everyone'] };
  }

  const sent = await targetChannel.send(payload);
  if (pin && typeof sent.pin === 'function') {
    await sent.pin().catch(() => {});
  }

  await interaction.reply({ content: '公告已成功發送。', ephemeral: true });
  return true;
}

async function registerSlashCommands() {
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  if (ENVIRONMENT === 'development' && GUILD_ID) {
    // Development 模式：註冊 Guild Commands（快速測試）
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: slashCommandPayload,
    });
    console.log(
      `[BOOT] Registered ${slashCommandPayload.length} guild commands in development mode (Guild: ${GUILD_ID}).`
    );
    return;
  }

  // Production 模式：註冊 Global Commands
  await rest.put(Routes.applicationCommands(CLIENT_ID), {
    body: slashCommandPayload,
  });
  console.log(
    `[BOOT] Registered ${slashCommandPayload.length} global commands. ` +
    'Note: Global commands may take up to 1 hour to appear in Discord.'
  );
}

async function onInteractionCreate(interaction) {
  try {
    if (interaction.isModalSubmit()) {
      const handled = await handleAnnounceModal(interaction);
      if (handled) return;
    }

    if (interaction.isButton()) {
      const [action, guildId] = interaction.customId.split('|');
      if (!guildId) return;

      const settings = getGuildSettings(guildId);
      if (!settings) {
        await interaction.reply({
          content: '❌ 此伺服器目前沒有已儲存的設定。',
          ephemeral: true,
        });
        return;
      }

      if (action === 'configView') {
        const embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🔧 伺服器設定')
          .addFields(
            {
              name: '🛡️ 管理員身分組',
              value: `<@&${settings.adminRoleId}>`,
              inline: true,
            },
            {
              name: '📢 公告頻道',
              value: `<#${settings.announcementChannelId}>`,
              inline: true,
            },
            {
              name: '🚨 回報頻道',
              value: `<#${settings.reportChannelId}>`,
              inline: true,
            },
            {
              name: '🕐 時區',
              value: settings.timezone || 'UTC',
              inline: true,
            },
            {
              name: '🤖 Bot 品牌名稱',
              value: settings.botBrandName || 'Discord Bot',
              inline: true,
            },
            {
              name: '📅 設定時間',
              value: `<t:${Math.floor(new Date(settings.updatedAt).getTime() / 1000)}:R>`,
              inline: true,
            }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      if (action === 'configReset') {
        if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) && !interaction.member?.roles?.cache.has(settings.adminRoleId)) {
          await interaction.reply({
            content: '❌ 只有 Manage Guild 權限或設定中的管理員身分組成員可重設設定。',
            ephemeral: true,
          });
          return;
        }

        deleteGuildSettings(guildId);
        await interaction.reply({ content: '✅ 已成功重設此伺服器的 Bot 設定。', ephemeral: true });
        return;
      }
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
  } catch (error) {
    console.error('[INTERACTION] Failed to process interaction:', error);
    try {
      logAction({
        type: 'ERROR',
        userTag: interaction.user?.tag,
        guildId: interaction.guildId,
        guildName: interaction.guild?.name,
        reason: `Interaction failed: ${error.message}`,
      });
    } catch (_) {}

    const errorEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('執行失敗')
      .setDescription('操作時發生錯誤，請稍後再試。')
      .setTimestamp();

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
    }
  }
}

function installProcessGuards() {
  process.on('unhandledRejection', (reason) => {
    console.error('[PROCESS] Unhandled rejection:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('[PROCESS] Uncaught exception:', error);
  });

  const shutdown = () => {
    try {
      flushLogs();
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

loadCommands();
loadEvents();
installProcessGuards();

client.on('interactionCreate', onInteractionCreate);

client.once('ready', async () => {
  console.log(`[BOOT] Logged in as ${client.user.tag}`);
  console.log(`[CONFIG] Environment: ${ENVIRONMENT}`);
  console.log(`[CONFIG] CLIENT_ID: ${CLIENT_ID}`);
  if (ENVIRONMENT === 'development' && GUILD_ID) {
    console.log(`[CONFIG] GUILD_ID: ${GUILD_ID}`);
  } else if (ENVIRONMENT === 'production') {
    console.log(`[CONFIG] GUILD_ID: Not set (production mode - global commands)`);
  }

  try {
    clearOldLogs(30);
  } catch (error) {
    console.error('[BOOT] Failed to prune old logs:', error);
  }

  if (AUTO_REGISTER_COMMANDS) {
    try {
      await registerSlashCommands();
    } catch (error) {
      console.error('[BOOT] Failed to register slash commands:', error);
    }
  } else {
    console.log('[BOOT] Skipping slash command registration on startup. Use `npm run deploy:commands` to deploy commands manually.');
  }

  client.user.setActivity(runtimeConfig.activityText, {
    type: runtimeConfig.activityType,
  });

  console.log(
    `[BOOT] Bot is ready! | Activity: ${runtimeConfig.activityType} ${runtimeConfig.activityText}`
  );
});

client.login(DISCORD_TOKEN);
