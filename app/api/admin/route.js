import { ensureSchema, getPool } from "../../../lib/db";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  createAdminToken,
  verifyAdminToken,
  verifyPassphrase,
} from "../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function noStoreJson(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");

  return Response.json(body, { ...init, headers });
}

function readCookie(request, name) {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;

    if (part.slice(0, separator).trim() !== name) continue;

    return part.slice(separator + 1).trim() || null;
  }

  return null;
}

function isSecureRequest(request) {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    return forwarded.split(",")[0].trim() === "https";
  }

  return new URL(request.url).protocol === "https:";
}

function buildAdminCookie(token, request, maxAge = ADMIN_COOKIE_MAX_AGE) {
  const parts = [
    `${ADMIN_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];

  if (isSecureRequest(request)) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function unauthorized() {
  return noStoreJson(
    { ok: false, error: "Admin authentication required." },
    { status: 401 },
  );
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return noStoreJson(
      { ok: false, error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const passphrase =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload.passphrase
      : "";

  if (!verifyPassphrase(passphrase)) {
    // Slows down repeated guesses without adding a dependency.
    await new Promise((resolve) => setTimeout(resolve, 400));

    return noStoreJson(
      { ok: false, error: "Incorrect pass phrase." },
      { status: 401 },
    );
  }

  return noStoreJson(
    { ok: true },
    {
      headers: {
        "Set-Cookie": buildAdminCookie(createAdminToken(), request),
      },
    },
  );
}

export async function GET(request) {
  const token = readCookie(request, ADMIN_COOKIE);

  if (!token || !verifyAdminToken(token)) {
    return unauthorized();
  }

  try {
    await ensureSchema();

    const { rows } = await getPool().query(`
      SELECT
        t.id AS team_id,
        t.reference,
        t.team_name,
        t.created_at,
        p.slot,
        p.in_game_name,
        p.steam_id,
        p.phone,
        p.role,
        p.current_mmr,
        p.peak_mmr,
        p.discord_url
      FROM teams t
      LEFT JOIN players p ON p.team_id = t.id
      ORDER BY t.created_at DESC, t.id DESC, p.slot ASC
    `);

    const teams = [];
    const teamsById = new Map();

    for (const row of rows) {
      let team = teamsById.get(row.team_id);

      if (!team) {
        team = {
          id: row.team_id,
          reference: row.reference,
          teamName: row.team_name,
          createdAt: row.created_at,
          players: [],
        };

        teamsById.set(row.team_id, team);
        teams.push(team);
      }

      if (row.slot === null) continue;

      team.players.push({
        id: row.slot,
        ign: row.in_game_name,
        steamId: row.steam_id,
        phone: row.phone,
        role: row.role,
        currentMmr: row.current_mmr,
        peakMmr: row.peak_mmr,
        discord: row.discord_url,
      });
    }

    return noStoreJson({ ok: true, teams });
  } catch (error) {
    console.error("Failed to load admin teams:", error);

    return noStoreJson(
      { ok: false, error: "Couldn't load teams. Please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  return noStoreJson(
    { ok: true },
    { headers: { "Set-Cookie": buildAdminCookie("", request, 0) } },
  );
}
