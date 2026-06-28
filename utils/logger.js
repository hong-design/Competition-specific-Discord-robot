const path = require('path');
const { ensureJsonFile, readJsonFile, writeJsonFile } = require('./jsonStore');
const { readCheckinSessions, getGuildResults } = require('./tournamentStore');

const dataDir = path.join(__dirname, '../data');
const logPath = path.join(dataDir, 'logs.json');
const warningsPath = path.join(dataDir, 'warnings.json');
const blacklistPath = path.join(dataDir, 'blacklist.json');
const reportsPath = path.join(dataDir, 'reports.json');

const MAX_LOGS = 10000;
const FLUSH_DELAY_MS = 250;

let logsCache = null;
let isDirty = false;
let flushTimer = null;

function ensureDataFiles() {
  ensureJsonFile(logPath, []);
  ensureJsonFile(warningsPath, {});
  ensureJsonFile(blacklistPath, []);
  ensureJsonFile(reportsPath, []);
}

function readJsonSafe(filePath, fallbackValue) {
  return readJsonFile(filePath, fallbackValue);
}

function writeJsonSync(filePath, value) {
  writeJsonFile(filePath, value);
}

function loadLogsCache() {
  ensureDataFiles();
  if (!logsCache) {
    const loaded = readJsonSafe(logPath, []);
    logsCache = Array.isArray(loaded) ? loaded : [];
  }
  return logsCache;
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushLogs();
  }, FLUSH_DELAY_MS);
  if (typeof flushTimer.unref === 'function') flushTimer.unref();
}

function flushLogs() {
  if (!isDirty) return;
  const logs = loadLogsCache();
  writeJsonSync(logPath, logs);
  isDirty = false;
}

function logAction({
  type,
  userId,
  userTag,
  guildId,
  guildName,
  reason,
  details = {},
}) {
  const logs = loadLogsCache();

  logs.push({
    timestamp: new Date().toISOString(),
    type: type || 'UNKNOWN',
    userId: userId || null,
    userTag: userTag || 'Unknown User',
    guildId: guildId || null,
    guildName: guildName || null,
    reason: reason || 'No reason provided',
    details,
  });

  while (logs.length > MAX_LOGS) {
    logs.shift();
  }

  isDirty = true;
  scheduleFlush();
  console.log(`[${type || 'UNKNOWN'}] ${userTag || 'Unknown User'} | ${reason || 'No reason provided'}`);
}

function getLogs(filter = {}) {
  const logs = loadLogsCache();
  let result = logs;

  if (filter.type) result = result.filter((log) => log.type === filter.type);
  if (filter.userId) result = result.filter((log) => log.userId === filter.userId);
  if (filter.guildId) result = result.filter((log) => log.guildId === filter.guildId);

  return result;
}

function clearOldLogs(days = 30) {
  const logs = loadLogsCache();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = logs.filter((entry) => {
    const time = new Date(entry.timestamp).getTime();
    return Number.isFinite(time) && time >= cutoff;
  });

  if (filtered.length !== logs.length) {
    logsCache = filtered;
    isDirty = true;
    flushLogs();
  }
}

function countByType(logs, type) {
  return logs.reduce((count, log) => count + (log.type === type ? 1 : 0), 0);
}

function getStats(guildId) {
  const logs = getLogs(guildId ? { guildId } : {});

  const warningsData = readJsonSafe(warningsPath, {});
  const blacklistData = readJsonSafe(blacklistPath, []);
  const reportsData = readJsonSafe(reportsPath, []);
  const checkinSessions = readCheckinSessions();
  const resultsData = guildId ? getGuildResults(guildId) : [];

  const warnedUsers = Object.keys(warningsData || {}).filter((userId) => {
    const items = warningsData[userId];
    return Array.isArray(items) && items.length > 0;
  });

  const reactionRoleOps = logs.filter(
    (log) =>
      log.type === 'REACTION_ROLE' ||
      log.type === 'REACTIONROLE' ||
      String(log.reason || '').toLowerCase().includes('reaction role')
  ).length;

  const guildResults = Array.isArray(resultsData)
    ? resultsData.filter((result) => !guildId || result.guildId === guildId)
    : [];

  const activeCheckin = guildId ? checkinSessions[guildId] : null;

  return {
    bans: countByType(logs, 'BAN'),
    kicks: countByType(logs, 'KICK'),
    mutes: countByType(logs, 'MUTE'),
    unmutes: countByType(logs, 'UNMUTE'),
    warnings: countByType(logs, 'WARN'),
    reports: countByType(logs, 'REPORT') || (Array.isArray(reportsData) ? reportsData.length : 0),
    errors: countByType(logs, 'ERROR'),
    reactionRoles: reactionRoleOps,
    blacklistCount: Array.isArray(blacklistData) ? blacklistData.length : 0,
    uniqueWarned: warnedUsers.length,
    checkinOpens: countByType(logs, 'CHECKIN_OPEN'),
    checkinJoins: countByType(logs, 'CHECKIN_JOIN') + countByType(logs, 'CHECKIN_MARK'),
    activeCheckinCount: activeCheckin?.active ? (activeCheckin.checkedInUserIds || []).length : 0,
    matchCalls: countByType(logs, 'MATCH_CALL'),
    matchResults: countByType(logs, 'MATCH_RESULT') || guildResults.length,
    storedResults: guildResults.length,
    totalLogs: logs.length,
  };
}

module.exports = {
  logAction,
  getLogs,
  clearOldLogs,
  getStats,
  flushLogs,
};
