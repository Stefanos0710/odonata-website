// Run: npm run check-auth — fails loudly if the 2FA, session or lockout logic breaks.
import assert from "node:assert/strict";

process.env.ADMIN_PASSWORD = "correct horse battery staple";
process.env.ADMIN_TOTP_SECRET = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"; // RFC 6238 test key "12345678901234567890"
const auth = await import("../lib/auth-core.ts");

// RFC 6238 test vector: T=59s -> 94287082, last 6 digits.
assert.equal(auth.checkTotp("287082", 59_000), true);
assert.equal(auth.checkTotp("287082", 59_000), false, "a code must not work twice");
assert.equal(auth.checkTotp("000000", 1_000_000_000), false);
assert.equal(auth.checkPassword("correct horse battery staple"), true);
assert.equal(auth.checkPassword("wrong"), false);

const now = Date.now();
const token = auth.createSession(now);
assert.equal(auth.validSession(token, now), true);
assert.equal(auth.validSession(token, now + 8 * 86_400_000), false, "sessions expire");
assert.equal(auth.validSession(token.slice(0, -2) + "xx", now), false, "tampered tokens fail");
assert.equal(auth.validSession(`${now + 1e12}.abc.${token.split(".")[2]}`, now), false, "can't extend expiry");

for (let i = 0; i < 5; i++) auth.recordFailure("1.2.3.4", now);
assert.ok(auth.lockedFor("1.2.3.4", now) > 0, "locked after 5 failures");
assert.equal(auth.lockedFor("5.6.7.8", now), 0, "other IPs unaffected");

console.log("auth checks passed");
