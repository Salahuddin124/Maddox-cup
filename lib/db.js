import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DEFAULT_DATABASE_PATH = path.join(
  process.cwd(),
  "data",
  "maddoxx-cup.db",
);

export const databasePath = process.env.MADDOXX_DB_PATH
  ? path.resolve(process.env.MADDOXX_DB_PATH)
  : DEFAULT_DATABASE_PATH;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reference TEXT NOT NULL UNIQUE,
    tournament TEXT NOT NULL,
    team_name TEXT NOT NULL,
    browser_token_hash TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 5),
    in_game_name TEXT NOT NULL,
    steam_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (
      role IN ('carry', 'midlaner', 'offlaner', 'soft-support', 'hard-support')
    ),
    current_mmr INTEGER NOT NULL CHECK (current_mmr >= 0),
    peak_mmr INTEGER NOT NULL CHECK (peak_mmr >= 0),
    discord_url TEXT NOT NULL,
    UNIQUE (team_id, slot),
    CHECK (peak_mmr >= current_mmr)
  );

  CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
`;

function migrate(database) {
  const teamColumns = database.prepare("PRAGMA table_info(teams)").all();
  const hasBrowserToken = teamColumns.some(
    (column) => column.name === "browser_token_hash",
  );

  if (!hasBrowserToken) {
    database.exec("ALTER TABLE teams ADD COLUMN browser_token_hash TEXT");
  }

  database.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_browser_token_hash
      ON teams(browser_token_hash)
      WHERE browser_token_hash IS NOT NULL;
  `);
}

function openDatabase() {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
  database.exec(SCHEMA);
  migrate(database);

  return database;
}

export function getDb() {
  if (!globalThis.__maddoxxCupDatabase) {
    globalThis.__maddoxxCupDatabase = openDatabase();
  }

  return globalThis.__maddoxxCupDatabase;
}
