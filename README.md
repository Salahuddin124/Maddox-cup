# MADDOXX CUP

Dota 2 tournament site for **MADDOXX CUP**, built with Next.js. Registration is
now closed: the public page in `app/App.jsx` shows a closed notice and
"Match Schedules — Coming soon". The registration form and its `/api/register`
endpoint have been removed. Existing teams remain readable in the admin
dashboard.

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

## Registration status

Registration closed on 22 November 2026. The public page no longer collects
teams and `/api/register` has been deleted; only the admin dashboard reads the
existing registration data.

## Database

Previously submitted teams are stored in **Neon Postgres**. The admin API
connects with the `pg` driver using `DATABASE_URL`:

```bash
# .env.local
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
```

The `teams` and `players` tables are created automatically the first time the
admin API is used, so no manual migration step is required. Use the pooled
connection string for the deployed app.

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

## Legacy registration data

Registrations created before the closure are kept in the `teams` and `players`
tables below. They are read-only now: the browser cookie flow
(`maddoxx_browser`), the preview/success screen and both `/api/register` methods
were removed along with the form.

## Admin dashboard

A private dashboard lives at `/admin`. It is not linked from the public page,
carries `noindex` metadata, and `/admin` + `/api/` are disallowed in
`robots.txt`.

- `/admin` is gated on the server. The page reads the `maddoxx_admin` cookie
  with `cookies()`, verifies the JWT, and redirects to `/admin/login` when the
  cookie is missing, forged, or expired. The dashboard HTML is never rendered
  for an unauthenticated request.
- `/admin/login` shows the pass phrase form and redirects back to `/admin` if a
  valid cookie is already present.
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
  valid, otherwise `401`. This is the only endpoint that exposes participant
  data, and it always requires the JWT.
- `DELETE /api/admin` clears the admin cookie.

## Deploying to Vercel

1. Import the GitHub repository in Vercel and keep the Next.js preset.
2. Add `DATABASE_URL` to the project's environment variables — use the pooled
   connection string from the Neon Console (or connect the project through the
   Neon integration, which sets it automatically).
3. Add `ADMIN_PASSPHRASE` (defaults to `dotahub14`) and a long random
   `ADMIN_JWT_SECRET` for the admin dashboard.
4. Deploy.

The saved registrations are stored in Neon, so they survive deployments and are
shared across all function instances.

## Notes

- `DATABASE_URL` is required for the admin dashboard. Without it `/api/admin`
  returns `500` with a clear error in the logs.
- The public page is static and makes no API calls.
- The registration form, browser cookie flow and `/api/register` endpoint were
  removed when registration closed on 22 November 2026.
- Existing Neon data is untouched; no teams or players were deleted.
