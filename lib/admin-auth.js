import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "maddoxx_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8;

const DEFAULT_PASSPHRASE = "dotahub14";
const DEFAULT_JWT_SECRET = "maddoxx-cup-admin-jwt-v1";
const TOKEN_ISSUER = "maddoxx-cup-admin";
const TOKEN_SUBJECT = "admin";

function getPassphrase() {
  const value = process.env.ADMIN_PASSPHRASE;
  return value && value.length > 0 ? value : DEFAULT_PASSPHRASE;
}

function getJwtSecret() {
  const value = process.env.ADMIN_JWT_SECRET;
  return value && value.length > 0 ? value : DEFAULT_JWT_SECRET;
}

// Hashing first keeps the comparison constant-time even when the lengths
// differ, so a wrong passphrase cannot be guessed one character at a time.
function safeEqual(a, b) {
  const left = createHash("sha256").update(String(a)).digest();
  const right = createHash("sha256").update(String(b)).digest();

  return timingSafeEqual(left, right);
}

function sign(input) {
  return createHmac("sha256", getJwtSecret()).update(input).digest("base64url");
}

export function verifyPassphrase(candidate) {
  if (typeof candidate !== "string" || candidate.length === 0) {
    return false;
  }

  return safeEqual(candidate, getPassphrase());
}

export function createAdminToken(now = Date.now()) {
  const issuedAt = Math.floor(now / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      sub: TOKEN_SUBJECT,
      iss: TOKEN_ISSUER,
      iat: issuedAt,
      exp: issuedAt + ADMIN_COOKIE_MAX_AGE,
    }),
  ).toString("base64url");
  const signature = sign(`${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
}

export function verifyAdminToken(token) {
  if (typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;

  if (!safeEqual(signature, sign(`${header}.${payload}`))) {
    return false;
  }

  try {
    const decodedHeader = JSON.parse(
      Buffer.from(header, "base64url").toString("utf8"),
    );

    if (decodedHeader.alg !== "HS256") return false;

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );

    if (decoded.sub !== TOKEN_SUBJECT || decoded.iss !== TOKEN_ISSUER) {
      return false;
    }

    if (
      !Number.isFinite(decoded.exp) ||
      decoded.exp <= Math.floor(Date.now() / 1000)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
