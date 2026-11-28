import { ensureSchema, getPool } from "../../../lib/db";
import {
  ADMIN_COOKIE,
  readCookie,
  verifyAdminToken,
} from "../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PICKS = 8;
const BALL_NUMBER = /^[1-8]$/;

function noStoreJson(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");

  return Response.json(body, { ...init, headers });
}

function unauthorized() {
  return noStoreJson(
    { ok: false, error: "Admin authentication required." },
    { status: 401 },
  );
}

function isAuthorized(request) {
  const token = readCookie(request, ADMIN_COOKIE);
  return Boolean(token && verifyAdminToken(token));
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cleanPicks(value) {
  if (!Array.isArray(value) || value.length > MAX_PICKS) return null;

  return value.map((pick) => {
    if (!isRecord(pick)) return null;
    const ballNumber = String(pick.ballNumber ?? "");
    const team = typeof pick.team === "string" ? pick.team.trim() : "";
    if (!BALL_NUMBER.test(ballNumber) || team === "") return null;

    return {
      ballNumber: Number(ballNumber),
      team,
      teamId:
        pick.teamId === undefined || pick.teamId === null
          ? null
          : Number(pick.teamId) || null,
    };
  }).filter(Boolean);
}

export async function GET(request) {
  if (!isAuthorized(request)) return unauthorized();

  try {
    await ensureSchema();

    const { rows } = await getPool().query(`
      SELECT signature, picks, slots, winners,
             to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS "updatedAt"
      FROM tournament_state
      WHERE id = 1
    `);

    return noStoreJson({ ok: true, state: rows[0] ?? null });
  } catch (error) {
    console.error("Failed to load tournament state:", error);

    return noStoreJson(
      { ok: false, error: "Couldn't load the saved tournament state." },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  if (!isAuthorized(request)) return unauthorized();

  let payload;
  try {
    payload = await request.json();
  } catch {
    return noStoreJson(
      { ok: false, error: "Invalid JSON request body." },
      { status: 400 },
    );
  }

  const picks = cleanPicks(payload?.picks);
  if (
    typeof payload?.signature !== "string" ||
    picks === null ||
    !isRecord(payload?.slots) ||
    !isRecord(payload?.winners)
  ) {
    return noStoreJson(
      { ok: false, error: "Invalid tournament state." },
      { status: 400 },
    );
  }

  try {
    await ensureSchema();

    await getPool().query(
      `
        INSERT INTO tournament_state
          (id, signature, picks, slots, winners, updated_at)
        VALUES (1, $1, $2::jsonb, $3::jsonb, $4::jsonb, now())
        ON CONFLICT (id) DO UPDATE
        SET signature = EXCLUDED.signature,
            picks = EXCLUDED.picks,
            slots = EXCLUDED.slots,
            winners = EXCLUDED.winners,
            updated_at = now()
      `,
      [
        payload.signature,
        JSON.stringify(picks),
        JSON.stringify(payload.slots),
        JSON.stringify(payload.winners),
      ],
    );

    return noStoreJson({ ok: true, signature: payload.signature });
  } catch (error) {
    console.error("Failed to save tournament state:", error);

    return noStoreJson(
      { ok: false, error: "Couldn't save the tournament state." },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  if (!isAuthorized(request)) return unauthorized();

  try {
    await ensureSchema();
    await getPool().query("DELETE FROM tournament_state WHERE id = 1");

    return noStoreJson({ ok: true });
  } catch (error) {
    console.error("Failed to reset tournament state:", error);

    return noStoreJson(
      { ok: false, error: "Couldn't reset the tournament state." },
      { status: 500 },
    );
  }
}
