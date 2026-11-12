# MADDOXX CUP

Dota 2 tournament registration for **MADDOXX CUP**, built with Next.js. The entire
registration interface lives in `app/App.jsx` as a single client component with
its CSS in a `<style>` tag, as requested. Submissions are validated again on the
server and saved to a local SQLite database.

## Run locally

Requires Node.js 22 or newer (the SQLite driver targets Node 22+).

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Production:

```bash
npm run build
npm start
```

## Database

SQLite is used through `better-sqlite3`. The database is created automatically
the first time it is needed at:

```
data/maddoxx-cup.db
```

Set `MADDOXX_DB_PATH` to use a different file:

```bash
MADDOXX_DB_PATH=/absolute/path/to/maddoxx-cup.db npm run dev
```

## Viewing submissions

Fastest option — a readable table in the terminal:

```bash
npm run submissions
```

This prints every team with its reference, timestamp, and five-player roster.

You can also open the database with any SQLite tool, such as
[DB Browser for SQLite](https://sqlitebrowser.org/), and browse the `teams` and
`players` tables. The file is a normal SQLite database, so the `sqlite3` CLI
works too:

```bash
sqlite3 data/maddoxx-cup.db \
  "SELECT t.id, t.reference, t.team_name, t.created_at, COUNT(p.id) AS player_count
   FROM teams t LEFT JOIN players p ON p.team_id = t.id
   GROUP BY t.id ORDER BY t.id DESC;"
```

Roster for a specific team:

```bash
sqlite3 -header -column data/maddoxx-cup.db \
  "SELECT p.slot, p.in_game_name, p.role, p.current_mmr, p.peak_mmr,
          p.steam_id, p.discord_url
   FROM players p WHERE p.team_id = 1 ORDER BY p.slot;"
```

## One registration per browser

Each successful submission sets an `HttpOnly`, `SameSite=Lax` cookie named
`maddoxx_browser` that lasts one year. Only a SHA-256 hash of that random token is
stored in `teams.browser_token_hash`, which has a unique index.

- On page load the client calls `GET /api/register`. If the cookie maps to a
  saved team, the success screen is shown instead of the form.
- If that browser submits again through “Edit roster”, the existing row and its
  five players are updated in place. The reference stays the same and a second
  team is never inserted.
- The unique index also prevents a duplicate row if two tabs submit at the same
  time; the losing request falls back to an update.
- Identity is per browser profile. Clearing cookies, using private browsing, or
  using a different browser will look like a new registration. Preventing that
  requires user accounts, which this project intentionally does not have.

### Schema

`teams`

| Column               | Type    | Notes                                              |
| -------------------- | ------- | -------------------------------------------------- |
| `id`                 | INTEGER | Primary key                                        |
| `reference`          | TEXT    | Unique public registration code                    |
| `tournament`         | TEXT    | Tournament name                                    |
| `team_name`          | TEXT    | Registered team name                               |
| `browser_token_hash` | TEXT    | SHA-256 of the browser cookie; unique when present |
| `created_at`         | TEXT    | UTC timestamp                                      |

`players`

| Column         | Type    | Notes                                      |
| -------------- | ------- | ------------------------------------------ |
| `id`           | INTEGER | Primary key                                |
| `team_id`      | INTEGER | Foreign key to `teams.id` (cascade delete) |
| `slot`         | INTEGER | Player number, 1–5                         |
| `in_game_name` | TEXT    | In-game name                               |
| `steam_id`     | TEXT    | Steam ID or friend ID                      |
| `role`         | TEXT    | One of the five tournament roles           |
| `current_mmr`  | INTEGER | 0 or more                                  |
| `peak_mmr`     | INTEGER | 0 or more, never below current MMR         |
| `discord_url`  | TEXT    | Discord profile link                       |

## API

`POST /api/register`

```json
{
  "tournament": "MADDOXX CUP",
  "teamName": "Nightfall Five",
  "players": [
    {
      "id": 1,
      "ign": "Player name",
      "steamId": "76561198000000000",
      "role": "carry",
      "currentMmr": 6200,
      "peakMmr": 7100,
      "discord": "https://discord.com/users/123456789"
    }
  ]
}
```

The API requires exactly five players, validates every field, rejects peak MMR
below current MMR, and writes the team and its roster in one transaction. A
first-time submission returns `201`:

```json
{ "ok": true, "id": 1, "reference": "MC-8F3A92C1D4", "updated": false }
```

A submission from a browser that already registered updates that team instead
and returns `200` with the same `id` and `reference`:

```json
{ "ok": true, "id": 1, "reference": "MC-8F3A92C1D4", "updated": true }
```

`GET /api/register` returns the registration attached to the browser cookie, so
the UI can restore the success screen on reload:

```json
{
  "ok": true,
  "registered": true,
  "registration": {
    "id": 1,
    "reference": "MC-8F3A92C1D4",
    "teamName": "Nightfall Five",
    "createdAt": "2026-11-12T16:40:12.819Z",
    "players": [
      {
        "id": 1,
        "ign": "Player name",
        "steamId": "76561198000000000",
        "role": "carry",
        "currentMmr": 6200,
        "peakMmr": 7100,
        "discord": "https://discord.com/users/123456789"
      }
    ]
  }
}
```

Without a cookie, `GET` returns `{ "ok": true, "registered": false }`.

## Notes

- SQLite data lives on the local filesystem. For a serverless host, attach
  persistent storage or swap the database layer for a hosted database.
- The client still logs the `{ tournament, teamName, players }` payload to the
  console and only shows the success screen after the database write succeeds.
- Client and server both validate the roster. Duplicate roles produce a warning
  in the UI but are not blocked by the database.
