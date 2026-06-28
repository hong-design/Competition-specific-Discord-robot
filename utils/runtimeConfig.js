function normalizeList(rawValue) {
  return String(rawValue || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(rawValue, fallback = false) {
  if (rawValue === undefined) return fallback;

  const normalized = String(rawValue).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;

  return fallback;
}

const runtimeConfig = {
  brandName: process.env.BOT_BRAND_NAME || 'Discord Bot',
  accentColor: process.env.BOT_ACCENT_COLOR || '#5865F2',
  activityText: process.env.BOT_ACTIVITY_TEXT || 'Discord Bot | /help',
  activityType: (process.env.BOT_ACTIVITY_TYPE || 'WATCHING').toUpperCase(),
  welcomeChannelId: process.env.WELCOME_CHANNEL_ID || null,
  logChannelId: process.env.MOD_LOG_CHANNEL_ID || null,
  reportChannelId: process.env.REPORT_CHANNEL_ID || null,
  rulesChannelId: process.env.RULES_CHANNEL_ID || null,
  introChannelId: process.env.INTRO_CHANNEL_ID || null,
  links: {
    website: process.env.STUDIO_WEBSITE_URL || null,
    invite: process.env.STUDIO_INVITE_URL || null,
  },
  fallbackChannelNames: {
    welcome: normalizeList(process.env.WELCOME_CHANNEL_NAMES || 'welcome,general'),
    modLog: normalizeList(process.env.MOD_LOG_CHANNEL_NAMES || 'mod-logs,modlog'),
    report: normalizeList(process.env.REPORT_CHANNEL_NAMES || 'reports,mod-logs,modlog'),
  },
  features: {
    autoBanBlacklistedUsers: parseBoolean(process.env.AUTO_BAN_BLACKLISTED_USERS, true),
    welcomeMessage: parseBoolean(process.env.ENABLE_WELCOME_MESSAGE, true),
    leaveLog: parseBoolean(process.env.ENABLE_LEAVE_LOG, true),
    banLog: parseBoolean(process.env.ENABLE_BAN_LOG, true),
  },
};

module.exports = {
  runtimeConfig,
};
