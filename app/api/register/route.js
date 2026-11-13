import { createHash, randomBytes } from "node:crypto";
import { ensureSchema, getPool } from "../../../lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOURNAMENT = "MADDOXX CUP";
const BROWSER_COOKIE = "maddoxx_browser";
const BROWSER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const BROWSER_TOKEN_PATTERN = /^[a-f0-9]{64}$/;

const ROLE_VALUES = new Set([
  "carry",
  "midlaner",
  "offlaner",
  "soft-support",
  "hard-support",
]);

const PLAYER_COLUMNS = `
  slot AS id,
  in_game_name AS ign,
  steam_id AS "steamId",
  phone,
  role,
  current_mmr AS "currentMmr",
  peak_mmr AS "peakMmr",
  discord_url AS discord
`;

function noStoreJson(body, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");

  return Response.json(body, { ...init, headers });
}

function readText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidSteamId(value) {
  const text = readText(value);

  if (!text) return false;

  // SteamID64, friend code, or account ID.
  if (/^\d{1,20}$/.test(text)) return true;

  // Profile link with or without the protocol, e.g.
  // steamcommunity.com/id/name or https://s.team/p/abc
  return /^(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(
    text,
  );
}

function isValidPhone(value) {
  const text = readText(value);

  if (!text) return false;

  const digits = text.replace(/\D/g, "");

  return (
    /^[+\d][\d\s().-]*$/.test(text) && digits.length >= 7 && digits.length <= 15
  );
}

function validationError(message) {
  return noStoreJson({ ok: false, error: message }, { status: 400 });
}

function readBrowserToken(request) {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;

    const name = part.slice(0, separator).trim();
    if (name !== BROWSER_COOKIE) continue;

    const value = part.slice(separator + 1).trim();
    return BROWSER_TOKEN_PATTERN.test(value) ? value : null;
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

function buildBrowserCookie(token, request) {
  const parts = [
    `${BROWSER_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${BROWSER_COOKIE_MAX_AGE}`,
  ];

  if (isSecureRequest(request)) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function hashBrowserToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function validateRegistration(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { error: "Invalid request body." };
  }

  const teamName = readText(payload.teamName);

  if (!teamName) {
    return { error: "Team name is required." };
  }

  if (teamName.length > 80) {
    return { error: "Team name must be 80 characters or fewer." };
  }

  if (!Array.isArray(payload.players) || payload.players.length !== 5) {
    return { error: "A team must have exactly five players." };
  }

  const players = [];

  for (let index = 0; index < 5; index += 1) {
    const slot = index + 1;
    const player = payload.players[index];
    const label = slot === 1 ? "Captain" : `Player ${slot}`;

    if (!player || typeof player !== "object" || Array.isArray(player)) {
      return { error: `${label}: invalid player data.` };
    }

    const ign = readText(player.ign);
    if (!ign) {
      return { error: `${label}: in-game name is required.` };
    }
    if (ign.length > 40) {
      return { error: `${label}: in-game name must be 40 characters or fewer.` };
    }

    const steamId = readText(player.steamId);
    if (!steamId) {
      return { error: `${label}: Steam ID or profile link is required.` };
    }
    if (steamId.length > 200) {
      return {
        error: `${label}: Steam ID or profile link must be 200 characters or fewer.`,
      };
    }
    if (!isValidSteamId(steamId)) {
      return {
        error: `${label}: enter a Steam ID number or a profile link.`,
      };
    }

    let phone = "";

    if (slot === 1) {
      phone = readText(player.phone);
      if (!phone) {
        return { error: `${label}: phone number is required.` };
      }
      if (!isValidPhone(phone)) {
        return { error: `${label}: enter a valid phone number.` };
      }
    }

    const role = readText(player.role);
    if (!ROLE_VALUES.has(role)) {
      return { error: `${label}: select a valid primary role.` };
    }

    const currentMmr = player.currentMmr;
    if (!Number.isSafeInteger(currentMmr) || currentMmr < 0) {
      return {
        error: `${label}: current MMR must be a whole number of 0 or more.`,
      };
    }

    const peakMmr = player.peakMmr;
    if (!Number.isSafeInteger(peakMmr) || peakMmr < 0) {
      return {
        error: `${label}: peak MMR must be a whole number of 0 or more.`,
      };
    }

    if (peakMmr < currentMmr) {
      return {
        error: `${label}: peak MMR cannot be lower than current MMR.`,
      };
    }

    const discord = readText(player.discord);
    if (!discord) {
      return { error: `${label}: Discord username or ID is required.` };
    }
    if (discord.length > 200) {
      return {
        error: `${label}: Discord username or ID must be 200 characters or fewer.`,
      };
    }

    players.push({
      ign,
      steamId,
      phone,
      role,
      currentMmr,
      peakMmr,
      discord,
    });
  }

  return { data: { teamName, players } };
}

async function createReference(client) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const reference = `MC-${randomBytes(5).toString("hex").toUpperCase()}`;
    const existing = await client.query(
      "SELECT 1 AS found FROM teams WHERE reference = $1",
      [reference],
    );

    if (existing.rowCount === 0) {
      return reference;
    }
  }

  throw new Error("Could not generate a unique registration reference.");
}

async function loadRegistration(pool, tokenHash) {
  const teamResult = await pool.query(
    `
      SELECT
        id,
        reference,
        team_name AS "teamName",
        created_at AS "createdAt"
      FROM teams
      WHERE browser_token_hash = $1
    `,
    [tokenHash],
  );

  if (teamResult.rowCount === 0) return null;

  const team = teamResult.rows[0];
  const playersResult = await pool.query(
    `
      SELECT ${PLAYER_COLUMNS}
      FROM players
      WHERE team_id = $1
      ORDER BY slot ASC
    `,
    [team.id],
  );

  return {
    id: team.id,
    reference: team.reference,
    teamName: team.teamName,
    createdAt: team.createdAt,
    players: playersResult.rows,
  };
}

async function saveRegistration(pool, tokenHash, teamName, players) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingResult = await client.query(
      `
        SELECT id, reference
        FROM teams
        WHERE browser_token_hash = $1
        FOR UPDATE
      `,
      [tokenHash],
    );

    let teamId;
    let reference;
    let updated = false;

    if (existingResult.rowCount > 0) {
      teamId = existingResult.rows[0].id;
      reference = existingResult.rows[0].reference;
      updated = true;

      await client.query("UPDATE teams SET team_name = $1 WHERE id = $2", [
        teamName,
        teamId,
      ]);
      await client.query("DELETE FROM players WHERE team_id = $1", [teamId]);
    } else {
      reference = await createReference(client);
      const teamResult = await client.query(
        `
          INSERT INTO teams (reference, tournament, team_name, browser_token_hash)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `,
        [reference, TOURNAMENT, teamName, tokenHash],
      );
      teamId = teamResult.rows[0].id;
    }

    for (let index = 0; index < players.length; index += 1) {
      const player = players[index];

      await client.query(
        `
          INSERT INTO players (
            team_id,
            slot,
            in_game_name,
            steam_id,
            phone,
            role,
            current_mmr,
            peak_mmr,
            discord_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          teamId,
          index + 1,
          player.ign,
          player.steamId,
          player.phone || null,
          player.role,
          player.currentMmr,
          player.peakMmr,
          player.discord,
        ],
      );
    }

    await client.query("COMMIT");

    return { teamId, reference, updated };
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
}

export async function GET(request) {
  const browserToken = readBrowserToken(request);

  if (!browserToken) {
    return noStoreJson({ ok: true, registered: false });
  }

  try {
    await ensureSchema();

    const registration = await loadRegistration(
      getPool(),
      hashBrowserToken(browserToken),
    );

    if (!registration) {
      return noStoreJson({ ok: true, registered: false });
    }

    return noStoreJson({ ok: true, registered: true, registration });
  } catch (error) {
    console.error("Failed to load MADDOXX CUP registration:", error);

    return noStoreJson(
      {
        ok: false,
        error: "We couldn't check your registration. Please try again.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return validationError("Invalid JSON request body.");
  }

  const validation = validateRegistration(payload);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { teamName, players } = validation.data;
  const existingToken = readBrowserToken(request);
  const browserToken = existingToken ?? randomBytes(32).toString("hex");
  const tokenHash = hashBrowserToken(browserToken);

  try {
    await ensureSchema();

    const pool = getPool();
    let saved;

    // Two tabs can race on their very first submission. The unique index on
    // browser_token_hash makes one insert fail; retrying then updates the team
    // that the other request just created.
    for (let attempt = 0; ; attempt += 1) {
      try {
        saved = await saveRegistration(pool, tokenHash, teamName, players);
        break;
      } catch (error) {
        if (error?.code === "23505" && attempt < 2) {
          continue;
        }

        throw error;
      }
    }

    return noStoreJson(
      {
        ok: true,
        id: saved.teamId,
        reference: saved.reference,
        updated: saved.updated,
      },
      {
        status: saved.updated ? 200 : 201,
        headers: { "Set-Cookie": buildBrowserCookie(browserToken, request) },
      },
    );
  } catch (error) {
    console.error("Failed to save MADDOXX CUP registration:", error);

    return noStoreJson(
      {
        ok: false,
        error: "We couldn't save your registration. Please try again.",
      },
      { status: 500 },
    );
  }
}
