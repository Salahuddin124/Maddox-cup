import { ensureSchema, getPool } from "../../../lib/db";
import {
  ADMIN_COOKIE,
  readCookie,
  verifyAdminToken,
} from "../../../lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMATS = new Set(["single", "double", "round-robin", "swiss"]);
const MATCH_KEY = /^[a-z]+-\d+-\d+$/;

// Scores are entered manually and stop at 2. A Best of 1 finishes 1-0; a Best
// of 3 finishes 2-0 or 2-1 (either side may win).
const SCORE_RULES = new Map([
  ["1-0", 1],
  ["0-1", 1],
  ["2-0", 3],
  ["0-2", 3],
  ["2-1", 3],
  ["1-2", 3],
]);

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

function cleanInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

// A 2-0/0-2 Best of 3 has only two played games; a 2-1/1-2 series has three.
function playedGameCount(bestOf, scoreA, scoreB) {
  if (bestOf === 1) return 1;
  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB)) return 3;
  return scoreA + scoreB === 2 && Math.max(scoreA, scoreB) === 2 ? 2 : 3;
}

// One ID per game actually played. Empty slots are allowed for games not
// played yet, but a sweep cannot keep a third ID from a previous 2-1 score.
function cleanMatchIds(value, gameCount) {
  const list = Array.isArray(value) ? value : [];
  const cleaned = [];

  for (let index = 0; index < gameCount; index += 1) {
    const entry = list[index];
    if (entry === undefined || entry === null || entry === "") {
      cleaned.push("");
      continue;
    }
    if (typeof entry !== "string" || !/^\d{1,20}$/.test(entry.trim())) {
      return null;
    }
    cleaned.push(entry.trim());
  }

  return cleaned;
}

export async function GET(request) {
  if (!isAuthorized(request)) return unauthorized();

  try {
    await ensureSchema();

    const { rows } = await getPool().query(`
      SELECT format, match_key AS "matchKey", best_of AS "bestOf",
             team_a_id AS "teamAId", team_b_id AS "teamBId",
             score_a AS "scoreA", score_b AS "scoreB",
             match_ids AS "matchIds",
             to_char(updated_at, 'YYYY-MM-DD"T"HH24:MI:SSOF') AS "updatedAt"
      FROM match_results
      ORDER BY format, match_key
    `);

    return noStoreJson({ ok: true, results: rows });
  } catch (error) {
    console.error("Failed to load match results:", error);

    return noStoreJson(
      { ok: false, error: "Couldn't load the saved scores." },
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
  const bestOf = cleanInteger(payload?.bestOf);
  const teamAId = cleanInteger(payload?.teamAId);
  const teamBId = cleanInteger(payload?.teamBId);
  const scoreA = cleanInteger(payload?.scoreA);
  const scoreB = cleanInteger(payload?.scoreB);
  const matchIds = cleanMatchIds(
    payload?.matchIds,
    playedGameCount(bestOf, scoreA, scoreB),
  );
  const scoreKey = `${scoreA}-${scoreB}`;

  if (
    !FORMATS.has(format) ||
    typeof matchKey !== "string" ||
    !MATCH_KEY.test(matchKey) ||
    teamAId === null ||
    teamBId === null ||
    teamAId === 0 ||
    teamBId === 0 ||
    teamAId === teamBId ||
    scoreA === null ||
    scoreB === null ||
    matchIds === null ||
    SCORE_RULES.get(scoreKey) !== bestOf
  ) {
    return noStoreJson(
      { ok: false, error: "Invalid score entry." },
      { status: 400 },
    );
  }

  try {
    await ensureSchema();

    await getPool().query(
      `
        INSERT INTO match_results
          (format, match_key, best_of, team_a_id, team_b_id,
           score_a, score_b, match_ids, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, now())
        ON CONFLICT (format, match_key) DO UPDATE
        SET best_of = EXCLUDED.best_of,
            team_a_id = EXCLUDED.team_a_id,
            team_b_id = EXCLUDED.team_b_id,
            score_a = EXCLUDED.score_a,
            score_b = EXCLUDED.score_b,
            match_ids = EXCLUDED.match_ids,
            updated_at = now()
      `,
      [format, matchKey, bestOf, teamAId, teamBId, scoreA, scoreB, JSON.stringify(matchIds)],
    );

    return noStoreJson({
      ok: true,
      format,
      matchKey,
      bestOf,
      teamAId,
      teamBId,
      scoreA,
      scoreB,
      matchIds,
    });
  } catch (error) {
    console.error("Failed to save match score:", error);

    return noStoreJson(
      { ok: false, error: "Couldn't save the score." },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  if (!isAuthorized(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const matchKeysParam = searchParams.get("matchKeys");
  const matchKey = searchParams.get("matchKey");
  const format = searchParams.get("format") ?? "double";

  // A single key clears one fixture; a comma-separated list is used when an
  // earlier result changes and every dependent score must be invalidated.
  const matchKeys = matchKeysParam
    ? matchKeysParam.split(",").map((key) => key.trim()).filter(Boolean)
    : matchKey
      ? [matchKey]
      : [];

  if (
    !FORMATS.has(format) ||
    matchKeys.some((key) => !MATCH_KEY.test(key))
  ) {
    return noStoreJson(
      { ok: false, error: "Invalid score entry." },
      { status: 400 },
    );
  }

  try {
    await ensureSchema();

    if (matchKeys.length) {
      await getPool().query(
        "DELETE FROM match_results WHERE format = $1 AND match_key = ANY($2::text[])",
        [format, matchKeys],
      );
    } else {
      await getPool().query("DELETE FROM match_results");
    }

    return noStoreJson({ ok: true, deleted: matchKeys });
  } catch (error) {
    console.error("Failed to reset match scores:", error);

    return noStoreJson(
      { ok: false, error: "Couldn't reset the scores." },
      { status: 500 },
    );
  }
}
