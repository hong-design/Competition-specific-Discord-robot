/**
 * Guild Settings 存儲層
 * 
 * 用途：為每個 Discord Guild 存儲配置設定
 * 格式：SQLite
 * 位置：data/bot.sqlite
 * 
 * 結構：guild_settings table with one row per guild
 */

const { db } = require('./sqlite');

const getGuildSettingsStmt = db.prepare(`SELECT * FROM guild_settings WHERE guild_id = ?`);
const upsertGuildSettingsStmt = db.prepare(`
  INSERT INTO guild_settings (
    guild_id, guild_name, admin_role_id, announcement_channel_id, report_channel_id,
    timezone, bot_brand_name, created_at, updated_at
  ) VALUES (
    @guild_id, @guild_name, @admin_role_id, @announcement_channel_id, @report_channel_id,
    @timezone, @bot_brand_name, @created_at, @updated_at
  )
  ON CONFLICT(guild_id) DO UPDATE SET
    guild_name = excluded.guild_name,
    admin_role_id = excluded.admin_role_id,
    announcement_channel_id = excluded.announcement_channel_id,
    report_channel_id = excluded.report_channel_id,
    timezone = excluded.timezone,
    bot_brand_name = excluded.bot_brand_name,
    updated_at = excluded.updated_at
`);
const deleteGuildSettingsStmt = db.prepare(`DELETE FROM guild_settings WHERE guild_id = ?`);

function normalizeGuildSettings(row) {
  if (!row) return null;
  return {
    guildId: row.guild_id,
    guildName: row.guild_name,
    adminRoleId: row.admin_role_id,
    announcementChannelId: row.announcement_channel_id,
    reportChannelId: row.report_channel_id,
    timezone: row.timezone || 'UTC',
    botBrandName: row.bot_brand_name || 'Discord Bot',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getGuildSettings(guildId) {
  if (!guildId) return null;
  const row = getGuildSettingsStmt.get(guildId);
  return normalizeGuildSettings(row);
}

function setGuildSettings(guildId, settings) {
  if (!guildId) {
    throw new Error('Guild ID is required');
  }

  const existing = getGuildSettings(guildId);
  const now = new Date().toISOString();
  const createdAt = existing?.createdAt || now;

  upsertGuildSettingsStmt.run({
    guild_id: guildId,
    guild_name: settings.guildName || existing?.guildName || null,
    admin_role_id: settings.adminRoleId || existing?.adminRoleId || null,
    announcement_channel_id: settings.announcementChannelId || existing?.announcementChannelId || null,
    report_channel_id: settings.reportChannelId || existing?.reportChannelId || null,
    timezone: settings.timezone || existing?.timezone || 'UTC',
    bot_brand_name: settings.botBrandName || existing?.botBrandName || 'Discord Bot',
    created_at: createdAt,
    updated_at: now,
  });

  return getGuildSettings(guildId);
}

function deleteGuildSettings(guildId) {
  if (!guildId) return false;
  const existing = getGuildSettings(guildId);
  if (!existing) return false;
  deleteGuildSettingsStmt.run(guildId);
  return true;
}

function isGuildConfigured(guildId) {
  const settings = getGuildSettings(guildId);
  return Boolean(settings?.adminRoleId && settings?.announcementChannelId);
}

module.exports = {
  getGuildSettings,
  setGuildSettings,
  deleteGuildSettings,
  isGuildConfigured,
};
