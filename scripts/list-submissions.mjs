import { databasePath, getDb } from "../lib/db.js";

const db = getDb();

const teams = db
  .prepare(
    `
      SELECT id, reference, team_name, created_at
      FROM teams
      ORDER BY id DESC
    `,
  )
  .all();

const playersForTeam = db.prepare(`
  SELECT
    slot AS player,
    in_game_name AS name,
    role,
    current_mmr AS currentMMR,
    peak_mmr AS peakMMR,
    steam_id AS steamId,
    discord_url AS discord
  FROM players
  WHERE team_id = ?
  ORDER BY slot ASC
`);

if (teams.length === 0) {
  console.log(`No registrations yet.\nDatabase: ${databasePath}`);
} else {
  for (const team of teams) {
    console.log(
      `\n${team.team_name}  |  ${team.reference}  |  ${team.created_at}`,
    );
    console.table(playersForTeam.all(team.id));
  }

  console.log(
    `\n${teams.length} registered team${teams.length === 1 ? "" : "s"}.\nDatabase: ${databasePath}`,
  );
}
