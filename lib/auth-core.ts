import crypto from "node:crypto";

const PROD = process.env.NODE_ENV === "production";
// __Host- cookies can only be set over HTTPS, for this exact host, on path / — no subdomain can overwrite them.
export const COOKIE = PROD ? "__Host-odonata_admin" : "odonata_admin";
export const SESSION_DAYS = 7;

const PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const TOTP_SECRET = process.env.ADMIN_TOTP_SECRET?.replace(/\s/g, "").toUpperCase() ?? "";
export const totpEnabled = !!TOTP_SECRET;

/** Why login is unavailable, or null when it's configured well enough. */
export function configProblem() {
  if (!PASSWORD) return "ADMIN_PASSWORD is not set on the server.";
  if (PROD && PASSWORD.length < 12) return "ADMIN_PASSWORD must be at least 12 characters.";
  if (PROD && !TOTP_SECRET) return "Two-factor login is required in production. Set ADMIN_TOTP_SECRET (run npm run setup-2fa).";
  return null;
}

// Changing the password or the 2FA secret signs out every session.
const signingKey = () =>
  process.env.SESSION_SECRET ?? crypto.createHash("sha256").update(`odonata-session:${PASSWORD}:${TOTP_SECRET}`).digest("hex");

const sign = (data: string) => crypto.createHmac("sha256", signingKey()).update(data).digest("base64url");

function same(a: string, b: string) {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export const checkPassword = (pw: string) => !!PASSWORD && same(pw, PASSWORD);

/* ---------- TOTP (RFC 6238, what Google Authenticator / Authy / 1Password use) ---------- */

function base32(s: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const c of s.replace(/=+$/, "")) bits += alphabet.indexOf(c).toString(2).padStart(5, "0");
  return Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)));
}

function hotp(key: Buffer, counter: number) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac("sha1", key).update(msg).digest();
  const o = h[h.length - 1] & 0xf;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

// ponytail: in-memory, so replay protection is per server instance; codes still expire after ~30 s anyway.
let lastCounter = 0;

export function checkTotp(code: string, now = Date.now()) {
  if (!TOTP_SECRET) return true;
  if (!/^\d{6}$/.test(code)) return false;
  const key = base32(TOTP_SECRET);
  const counter = Math.floor(now / 30_000);
  for (const c of [counter, counter - 1, counter + 1]) {
    if (c > lastCounter && same(hotp(key, c), code)) {
      lastCounter = c; // each code works once
      return true;
    }
  }
  return false;
}

/* ---------- Brute-force protection ---------- */

// ponytail: in-memory per server instance. Enough to make guessing hopeless with a long password and 2FA;
// move to a shared store (e.g. Upstash Redis) if the site ever gets real attack traffic.
const attempts = new Map<string, { fails: number; lockedUntil: number }>();
const recentFails: number[] = [];
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;

export function lockedFor(ip: string, now = Date.now()) {
  while (recentFails.length && recentFails[0] < now - LOCK_MS) recentFails.shift();
  if (recentFails.length >= 30) return LOCK_MS; // many IPs guessing at once: pause logins for everyone
  return Math.max(0, (attempts.get(ip)?.lockedUntil ?? 0) - now);
}

export function recordFailure(ip: string, now = Date.now()) {
  recentFails.push(now);
  const a = attempts.get(ip) ?? { fails: 0, lockedUntil: 0 };
  a.fails++;
  // 5 wrong tries: 15 min lock, then 30, 60, … for every further 5.
  if (a.fails % MAX_FAILS === 0) a.lockedUntil = now + LOCK_MS * 2 ** (a.fails / MAX_FAILS - 1);
  attempts.set(ip, a);
}

export const recordSuccess = (ip: string) => attempts.delete(ip);

/* ---------- Sessions ---------- */

export function createSession(now = Date.now()) {
  const data = `${now + SESSION_DAYS * 86_400_000}.${crypto.randomBytes(16).toString("base64url")}`;
  return `${data}.${sign(data)}`;
}

export function validSession(token: string | undefined, now = Date.now()) {
  if (!token || configProblem()) return false;
  const [exp, nonce, sig] = token.split(".");
  if (!exp || !nonce || !sig || !same(sig, sign(`${exp}.${nonce}`))) return false;
  return Number(exp) > now;
}
