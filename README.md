# MADDOXX CUP

Dota 2 tournament registration for **MADDOXX CUP**, built with Next.js. The entire
registration interface lives in `app/App.jsx` as a single client component with
its CSS in a `<style>` tag, as requested. Submissions are validated again on the
server and saved to a Neon Postgres database.

## Run locally

Requires Node.js 22 or newer.

```bash
npm install
neon env pull --service postgres
npm run dev
```

`neon env pull` writes `DATABASE_URL` to `.env.local`. If you have not linked a
project yet:

```bash
neon login
neon init -y --org-id <org-id> --project-id <project-id> \
  --branch production --services postgres
neon env pull --service postgres
```

Open `http://localhost:3000`.

Production:

```bash
npm run build
npm start
```

## Demo prefill

For quick testing, the form starts with a complete sample roster. The flag is in
`app/App.jsx`:

```js
const PREFILL_DEMO_DATA = false;
```

- The flag is `false` in the committed app so the form opens empty for real
  registrations. Set it to `true` only for local testing.
- The prefilled roster has all 32 fields filled, five unique roles, valid MMR
  values, and placeholder Steam/Discord values.
- You can edit any field before submitting. After submitting, “Edit roster”
  returns the edited values.

## Database

Submissions are stored in **Neon Postgres**. The app connects with the `pg`
driver using `DATABASE_URL`:

```bash
# .env.local
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
```

The `teams` and `players` tables are created automatically the first time the
API is used, so no manual migration step is required. Use the pooled connection
string for the deployed app.

## Viewing submissions

A readable table in the terminal:

```bash
npm run submissions
```

This prints every team with its reference, timestamp, and five-player roster. It
reads `DATABASE_URL` from `.env.local` (or `.env`).

You can also use the **Neon Console → SQL Editor**, or connect with `psql`:

```bash
neon psql production
```

```sql
SELECT t.id, t.reference, t.team_name, t.created_at, COUNT(p.id) AS player_count
FROM teams t
LEFT JOIN players p ON p.team_id = t.id
GROUP BY t.id
ORDER BY t.id DESC;
```

Roster for a specific team:

```sql
SELECT p.slot, p.in_game_name, p.role, p.current_mmr, p.peak_mmr,
       p.steam_id, p.phone, p.discord_url
FROM players p
WHERE p.team_id = 1
ORDER BY p.slot;
```

## One registration per browser

Each successful submission sets an `HttpOnly`, `SameSite=Lax` cookie named
`maddoxx_browser` that lasts one year. Only a SHA-256 hash of that random token is
stored in `teams.browser_token_hash`, which has a unique index.

- On page load the client calls `GET /api/register`. If the cookie maps to a
  saved team, the success screen is shown instead of the form.
- If that browser submits again through “Edit roster”, the existing row and its
  five players are updated in place in one transaction. The reference stays the
  same and a second team is never inserted.
- The unique index also prevents a duplicate row if two tabs submit at the same
  time; the losing request retries and updates the same team.
- Identity is per browser profile. Clearing cookies, using private browsing, or
  using a different browser will look like a new registration. Preventing that
  requires user accounts, which this project intentionally does not have.

### Schema

`teams`

| Column               | Type        | Notes                                              |
| -------------------- | ----------- | -------------------------------------------------- |
| `id`                 | INTEGER     | Primary key, generated identity                    |
| `reference`          | TEXT        | Unique public registration code                    |
| `tournament`         | TEXT        | Tournament name                                    |
| `team_name`          | TEXT        | Registered team name                               |
| `browser_token_hash` | TEXT        | SHA-256 of the browser cookie; unique when present |
| `created_at`         | TIMESTAMPTZ | Creation time, defaults to `now()`                 |

`players`

| Column         | Type        | Notes                                      |
| -------------- | ----------- | ------------------------------------------ |
| `id`           | INTEGER     | Primary key, generated identity            |
| `team_id`      | INTEGER     | Foreign key to `teams.id` (cascade delete) |
| `slot`         | INTEGER     | Player number, 1–5 (slot 1 is the captain) |
| `in_game_name` | TEXT        | In-game name                               |
| `steam_id`     | TEXT        | Steam ID number or profile link            |
| `phone`        | TEXT        | Captain's phone number (slot 1 only)       |
| `role`         | TEXT        | One of the five tournament roles           |
| `current_mmr`  | INTEGER     | 0 or more                                  |
| `peak_mmr`     | INTEGER     | 0 or more, never below current MMR         |
| `discord_url`  | TEXT        | Discord username, ID, or profile link      |

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
      "phone": "+1 555 010 0000",
      "role": "carry",
      "currentMmr": 6200,
      "peakMmr": 7100,
      "discord": "maddoxx"
    }
  ]
}
```

The API requires exactly five players, validates every field, rejects peak MMR
below current MMR, and writes the team and its roster in one transaction. Player
1 is the captain: `phone` is required there and optional for players 2–5. A
`steamId` may be a SteamID64/friend number or a profile link with or without
`https://` (for example `steamcommunity.com/id/name`). A first-time submission
returns `201`:

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
        "phone": "+1 555 010 0000",
        "role": "carry",
        "currentMmr": 6200,
        "peakMmr": 7100,
        "discord": "maddoxx"
      }
    ]
  }
}
```

Without a cookie, `GET` returns `{ "ok": true, "registered": false }`.

## Admin dashboard

A private dashboard lives at `/admin`. It is not linked from the public page,
carries `noindex` metadata, and `/admin` + `/api/` are disallowed in
`robots.txt`.

- Pass phrase: `dotahub14`. Override it with the `ADMIN_PASSPHRASE` environment
  variable.
- A correct pass phrase sets an `HttpOnly`, `SameSite=Lax` JWT cookie named
  `maddoxx_admin` for 8 hours.
- The JWT is signed with HS256 using `ADMIN_JWT_SECRET`. A development fallback
  exists, but set a long random secret in production.
- The page lists every team with its full roster, a current/peak MMR chart per
  player, and a dashed horizontal line for the team's average current MMR.

Admin API:

- `POST /api/admin` with `{ "passphrase": "dotahub14" }` signs in.
- `GET /api/admin` returns `{ "ok": true, "teams": [...] }` when the cookie is
  valid, otherwise `401`.
- `DELETE /api/admin` clears the admin cookie.

## Deploying to Vercel

1. Import the GitHub repository in Vercel and keep the Next.js preset.
2. Add `DATABASE_URL` to the project's environment variables — use the pooled
   connection string from the Neon Console (or connect the project through the
   Neon integration, which sets it automatically).
3. Add `ADMIN_PASSPHRASE` (defaults to `dotahub14`) and a long random
   `ADMIN_JWT_SECRET` for the admin dashboard.
4. Deploy.

Registrations are stored in Neon, so they survive deployments and are shared
across all function instances.

## Notes

- `DATABASE_URL` is required in production. Without it the API returns `500` and
  logs a clear error instead of losing submissions.
- The client still logs the `{ tournament, teamName, players }` payload to the
  console and only shows the success screen after the database write succeeds.
- Client and server both validate the roster. Duplicate roles produce a warning
  in the UI but are not blocked by the database.
- Steam IDs must be a number (SteamID64/friend code) or a profile link; the
  `https://` prefix is optional. Captain phone numbers allow `+`, digits,
  spaces, `()`, `.`, and `-`, with 7–15 digits.
