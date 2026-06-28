const { db, serializeJson, deserializeJson } = require('../src/database/sqlite');

function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Check-in session persistence
const upsertCheckinSession = db.prepare(`
  INSERT INTO checkin_sessions (
    guild_id, active, title, note, channel_id, opened_at, opened_by_id, opened_by_tag, checked_in_user_ids
  ) VALUES (@guild_id, @active, @title, @note, @channel_id, @opened_at, @opened_by_id, @opened_by_tag, @checked_in_user_ids)
  ON CONFLICT(guild_id) DO UPDATE SET
    active = excluded.active,
    title = excluded.title,
    note = excluded.note,
    channel_id = excluded.channel_id,
    opened_at = excluded.opened_at,
    opened_by_id = excluded.opened_by_id,
    opened_by_tag = excluded.opened_by_tag,
    checked_in_user_ids = excluded.checked_in_user_ids;
`);

const getCheckinSessionStmt = db.prepare(`SELECT * FROM checkin_sessions WHERE guild_id = ?`);
const deleteCheckinSessionStmt = db.prepare(`DELETE FROM checkin_sessions WHERE guild_id = ?`);
const selectAllCheckinSessionsStmt = db.prepare(`SELECT * FROM checkin_sessions`);

function normalizeCheckinSession(raw) {
  if (!raw) return null;
  return {
    guildId: raw.guild_id,
    active: Boolean(raw.active),
    title: raw.title,
    note: raw.note,
    channelId: raw.channel_id,
    openedAt: raw.opened_at,
    openedById: raw.opened_by_id,
    openedByTag: raw.opened_by_tag,
    checkedInUserIds: deserializeJson(raw.checked_in_user_ids),
  };
}

function saveCheckinSession(session) {
  upsertCheckinSession.run({
    guild_id: session.guildId,
    active: session.active ? 1 : 0,
    title: session.title,
    note: session.note,
    channel_id: session.channelId,
    opened_at: session.openedAt,
    opened_by_id: session.openedById,
    opened_by_tag: session.openedByTag,
    checked_in_user_ids: serializeJson(session.checkedInUserIds),
  });
}

function getGuildCheckin(guildId) {
  const row = getCheckinSessionStmt.get(guildId);
  return normalizeCheckinSession(row);
}

function readCheckinSessions() {
  return getAllCheckinSessions();
}

function getAllCheckinSessions() {
  const rows = selectAllCheckinSessionsStmt.all();
  return rows.reduce((acc, row) => {
    const session = normalizeCheckinSession(row);
    if (session) acc[session.guildId] = session;
    return acc;
  }, {});
}

function writeCheckinSessions(sessions) {
  if (!sessions || typeof sessions !== 'object') return;
  for (const guildId of Object.keys(sessions)) {
    saveCheckinSession({
      guildId,
      active: sessions[guildId].active,
      title: sessions[guildId].title,
      note: sessions[guildId].note,
      channelId: sessions[guildId].channelId,
      openedAt: sessions[guildId].openedAt,
      openedById: sessions[guildId].openedById,
      openedByTag: sessions[guildId].openedByTag,
      checkedInUserIds: sessions[guildId].checkedInUserIds,
    });
  }
}

function deleteGuildCheckin(guildId) {
  deleteCheckinSessionStmt.run(guildId);
}

// Results persistence
const insertResultStmt = db.prepare(`
  INSERT INTO results (
    id, guild_id, guild_name, round, team1, team2, score1, score2, winner, loser,
    best_of, map, stream, note, channel_id, reported_by, reported_by_tag, timestamp
  ) VALUES (
    @id, @guild_id, @guild_name, @round, @team1, @team2, @score1, @score2, @winner, @loser,
    @best_of, @map, @stream, @note, @channel_id, @reported_by, @reported_by_tag, @timestamp
  )
`);

const selectResultsByGuildStmt = db.prepare(`SELECT * FROM results WHERE guild_id = ? ORDER BY timestamp DESC`);
const selectRecentResultsByGuildStmt = db.prepare(`SELECT * FROM results WHERE guild_id = ? ORDER BY timestamp DESC LIMIT ?`);

function addResult(result) {
  insertResultStmt.run({
    id: result.id,
    guild_id: result.guildId,
    guild_name: result.guildName,
    round: result.round,
    team1: result.team1,
    team2: result.team2,
    score1: result.score1,
    score2: result.score2,
    winner: result.winner,
    loser: result.loser,
    best_of: result.bestOf,
    map: result.map,
    stream: result.stream,
    note: result.note,
    channel_id: result.channelId,
    reported_by: result.reportedBy,
    reported_by_tag: result.reportedByTag,
    timestamp: result.timestamp,
  });
  return result;
}

function getGuildResults(guildId) {
  return selectResultsByGuildStmt.all(guildId).map((row) => ({
    id: row.id,
    guildId: row.guild_id,
    guildName: row.guild_name,
    round: row.round,
    team1: row.team1,
    team2: row.team2,
    score1: row.score1,
    score2: row.score2,
    winner: row.winner,
    loser: row.loser,
    bestOf: row.best_of,
    map: row.map,
    stream: row.stream,
    note: row.note,
    channelId: row.channel_id,
    reportedBy: row.reported_by,
    reportedByTag: row.reported_by_tag,
    timestamp: row.timestamp,
  }));
}

function getRecentGuildResults(guildId, limit = 5) {
  return selectRecentResultsByGuildStmt.all(guildId, limit).map((row) => ({
    id: row.id,
    guildId: row.guild_id,
    guildName: row.guild_name,
    round: row.round,
    team1: row.team1,
    team2: row.team2,
    score1: row.score1,
    score2: row.score2,
    winner: row.winner,
    loser: row.loser,
    bestOf: row.best_of,
    map: row.map,
    stream: row.stream,
    note: row.note,
    channelId: row.channel_id,
    reportedBy: row.reported_by,
    reportedByTag: row.reported_by_tag,
    timestamp: row.timestamp,
  }));
}

module.exports = {
  getGuildCheckin,
  readCheckinSessions,
  getAllCheckinSessions,
  saveCheckinSession,
  deleteGuildCheckin,
  addResult,
  getGuildResults,
  getRecentGuildResults,
};
