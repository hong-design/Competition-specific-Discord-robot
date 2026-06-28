const path = require('path');
const fs = require('fs');

function ensureDirectory(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const SQLITE_PATH = path.join(__dirname, '../../data/bot.sqlite');
ensureDirectory(SQLITE_PATH);

let Database;
try {
  Database = require('better-sqlite3');
} catch (error) {
  console.error('[DB] 無法載入 better-sqlite3 模組。請執行 `npm install better-sqlite3`。');
  throw error;
}

const db = new Database(SQLITE_PATH, { verbose: null });
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS guild_settings (
      guild_id TEXT PRIMARY KEY,
      guild_name TEXT,
      admin_role_id TEXT,
      announcement_channel_id TEXT,
      report_channel_id TEXT,
      timezone TEXT DEFAULT 'UTC',
      bot_brand_name TEXT DEFAULT 'Discord Bot',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL,
      user_id TEXT,
      user_tag TEXT,
      guild_id TEXT,
      guild_name TEXT,
      reason TEXT,
      details TEXT
    );

    CREATE TABLE IF NOT EXISTS checkin_sessions (
      guild_id TEXT PRIMARY KEY,
      active INTEGER NOT NULL,
      title TEXT,
      note TEXT,
      channel_id TEXT,
      opened_at TEXT,
      opened_by_id TEXT,
      opened_by_tag TEXT,
      checked_in_user_ids TEXT
    );

    CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      guild_name TEXT,
      round TEXT,
      team1 TEXT,
      team2 TEXT,
      score1 INTEGER,
      score2 INTEGER,
      winner TEXT,
      loser TEXT,
      best_of INTEGER,
      map TEXT,
      stream TEXT,
      note TEXT,
      channel_id TEXT,
      reported_by TEXT,
      reported_by_tag TEXT,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      state TEXT NOT NULL,
      registration_open_at TEXT,
      registration_close_at TEXT,
      checkin_open_at TEXT,
      checkin_close_at TEXT,
      started_at TEXT,
      completed_at TEXT,
      cancelled_at TEXT,
      min_team_size INTEGER DEFAULT 1,
      max_team_size INTEGER DEFAULT 5,
      allow_subs INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      name TEXT NOT NULL,
      leader_id TEXT NOT NULL,
      member_ids TEXT,
      substitute_ids TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL,
      guild_id TEXT NOT NULL,
      round TEXT,
      team1_id TEXT,
      team2_id TEXT,
      team1_name TEXT,
      team2_name TEXT,
      status TEXT NOT NULL,
      score1 INTEGER,
      score2 INTEGER,
      winner_team_id TEXT,
      scheduled_at TEXT,
      result_at TEXT,
      result_details TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
    );
  `);
}

initializeDatabase();

function serializeJson(value) {
  return JSON.stringify(value || []);
}

function deserializeJson(value) {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

module.exports = {
  db,
  initializeDatabase,
  serializeJson,
  deserializeJson,
};