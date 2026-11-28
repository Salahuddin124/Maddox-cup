import { Pool } from "pg";

const TABLES = `
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    tournament TEXT NOT NULL,
    team_name TEXT NOT NULL,
    browser_token_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS tournament_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    signature TEXT NOT NULL DEFAULT '',
    picks JSONB NOT NULL DEFAULT '[]'::jsonb,
    slots JSONB NOT NULL DEFAULT '{}'::jsonb,
    winners JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS match_schedules (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    format TEXT NOT NULL,
    round_key TEXT NOT NULL,
    scheduled_date DATE,
    scheduled_time TIME,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (format, round_key)
  );

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 5),
    in_game_name TEXT NOT NULL,
    steam_id TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (
      role IN ('carry', 'midlaner', 'offlaner', 'soft-support', 'hard-support')
    ),
    current_mmr INTEGER NOT NULL CHECK (current_mmr >= 0),
    peak_mmr INTEGER NOT NULL CHECK (peak_mmr >= 0),
    discord_url TEXT NOT NULL,
    UNIQUE (team_id, slot),
    CHECK (peak_mmr >= current_mmr)
  );
`;

const INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);

  CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_browser_token_hash
    ON teams(browser_token_hash)
    WHERE browser_token_hash IS NOT NULL;
`;

function createPool() {
  const rawConnectionString = process.env.DATABASE_URL;

  if (!rawConnectionString) {
    throw new Error(
      "DATABASE_URL is not set. Run `neon env pull` locally, and add DATABASE_URL to your Vercel project's environment variables.",
    );
  }

  // Neon uses `sslmode=require`; pg 8.23 warns about it and recommends the
  // explicit equivalent, which keeps certificate verification enabled.
  const connectionString = rawConnectionString.replace(
    /([?&])sslmode=require\b/gi,
    "$1sslmode=verify-full",
  );

  const config = { connectionString, max: 5, idleTimeoutMillis: 30_000 };

  if (!/[?&]sslmode=/i.test(connectionString)) {
    const { hostname } = new URL(connectionString);
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";

    if (!isLocal) {
      config.ssl = { rejectUnauthorized: false };
    }
  }

  return new Pool(config);
}

export function getPool() {
  if (!globalThis.__maddoxxCupPool) {
    globalThis.__maddoxxCupPool = createPool();
  }

  return globalThis.__maddoxxCupPool;
}

let schemaReady = null;

export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const client = await getPool().connect();

      try {
        await client.query("BEGIN");
        // Serializes schema setup when several serverless instances cold-start
        // at the same time.
        await client.query("SELECT pg_advisory_xact_lock(823741982)");
        await client.query(TABLES);
        // Keeps databases from the SQLite-era schema working.
        await client.query(
          "ALTER TABLE teams ADD COLUMN IF NOT EXISTS browser_token_hash TEXT",
        );
        await client.query(
          "ALTER TABLE players ADD COLUMN IF NOT EXISTS phone TEXT",
        );
        await client.query(INDEXES);
        await client.query("COMMIT");
      } catch (error) {
        try {
          await client.query("ROLLBACK");
        } catch {
          // Nothing left to roll back.
        }

        throw error;
      } finally {
        client.release();
      }
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }

  return schemaReady;
}
