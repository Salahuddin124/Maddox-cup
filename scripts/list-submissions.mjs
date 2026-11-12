import { existsSync } from "node:fs";
import { ensureSchema, getPool } from "../lib/db.js";

for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) {
    process.loadEnvFile(file);
    break;
  }
}

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Run `neon env pull --service postgres` first.",
  );
  process.exit(1);
}

const { hostname } = new URL(process.env.DATABASE_URL);
const pool = getPool();

try {
  await ensureSchema();

  const { rows: teams } = await pool.query(`
    SELECT id, reference, team_name, created_at
    FROM teams
    ORDER BY id DESC
  `);

  if (teams.length === 0) {
    console.log("No registrations yet.");
  } else {
    for (const team of teams) {
      const { rows: players } = await pool.query(
        `
          SELECT
            slot AS player,
            in_game_name AS name,
            role,
            current_mmr AS "currentMMR",
            peak_mmr AS "peakMMR",
            steam_id AS "steamId",
            discord_url AS discord
          FROM players
          WHERE team_id = $1
          ORDER BY slot ASC
        `,
        [team.id],
      );

      console.log(
        `\n${team.team_name}  |  ${team.reference}  |  ${team.created_at.toISOString()}`,
      );
      console.table(players);
    }

    console.log(
      `\n${teams.length} registered team${teams.length === 1 ? "" : "s"}.`,
    );
  }

  console.log(`Database: Neon Postgres (${hostname})`);
} finally {
  await pool.end();
}
