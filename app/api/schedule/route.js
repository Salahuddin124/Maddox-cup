import { ensureSchema, getPool } from "../../../lib/db";
import { ADMIN_COOKIE, readCookie, verifyAdminToken } from "../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMATS = new Set(["single", "double", "round-robin", "swiss"]);
const MATCH_KEY = /^[a-z]+-\d+-\d+$/;
const DATE_VALUE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_VALUE = /^([01]\d|2[0-3]):[0-5]\d$/;

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

// Empty inputs clear a saved value; anything else must be a valid date/time.
function cleanDate(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !DATE_VALUE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value
    ? false
    : value;
}

function cleanTime(value) {
  if (value === null || value === undefined || value === "") return null;
  return typeof value === "string" && TIME_VALUE.test(value) ? value : false;
}

export async function GET(request) {
  if (!isAuthorized(request)) return unauthorized();

  try {
    await ensureSchema();

    const { rows } = await getPool().query(`
      SELECT format, match_key AS "matchKey",
             to_char(scheduled_date, 'YYYY-MM-DD') AS date,
             to_char(scheduled_time, 'HH24:MI') AS time
      FROM match_schedules
      WHERE match_key IS NOT NULL
      ORDER BY format, match_key
    `);

    return noStoreJson({ ok: true, schedules: rows });
  } catch (error) {
    console.error("Failed to load match schedule:", error);

    return noStoreJson(
      { ok: false, error: "Couldn't load the match schedule." },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  if (!isAuthorized(request)) return unauthorized();

  try {
    await ensureSchema();
    await getPool().query("DELETE FROM match_schedules");

    return noStoreJson({ ok: true });
  } catch (error) {
    console.error("Failed to reset match schedule:", error);

    return noStoreJson(
      { ok: false, error: "Couldn't reset the match schedule." },
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

  const format = payload?.format;
  const matchKey = payload?.matchKey;
  const date = cleanDate(payload?.date);
  const time = cleanTime(payload?.time);

  if (
    !FORMATS.has(format) ||
    typeof matchKey !== "string" ||
    !MATCH_KEY.test(matchKey) ||
    date === false ||
    time === false
  ) {
    return noStoreJson(
      { ok: false, error: "Invalid schedule entry." },
      { status: 400 },
    );
  }

  try {
    await ensureSchema();

    await getPool().query(
      `
        INSERT INTO match_schedules
          (format, match_key, scheduled_date, scheduled_time, updated_at)
        VALUES ($1, $2, $3::date, $4::time, now())
        ON CONFLICT (format, match_key) DO UPDATE
        SET scheduled_date = EXCLUDED.scheduled_date,
            scheduled_time = EXCLUDED.scheduled_time,
            updated_at = now()
      `,
      [format, matchKey, date, time],
    );

    return noStoreJson({ ok: true, format, matchKey, date, time });
  } catch (error) {
    console.error("Failed to save match schedule:", error);

    return noStoreJson(
      { ok: false, error: "Couldn't save the match schedule." },
      { status: 500 },
    );
  }
}
