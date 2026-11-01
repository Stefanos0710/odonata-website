// Creates a secret for two-factor login. Usage: npm run setup-2fa
import crypto from "node:crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const bits = [...crypto.randomBytes(20)].map((b) => b.toString(2).padStart(8, "0")).join("");
const secret = bits.match(/.{5}/g).map((b) => alphabet[parseInt(b, 2)]).join("");
const url = `otpauth://totp/Odonata:admin?secret=${secret}&issuer=Odonata&digits=6&period=30`;

console.log(`
1. In your authenticator app (Google Authenticator, Authy, 1Password, ...) add an account
   by entering this setup key by hand (time-based):

   ${secret.match(/.{4}/g).join(" ")}

   Or open this link on your phone / paste it into a QR code generator you trust:
   ${url}

2. Add it to .env.local (and to Vercel's environment variables):

   ADMIN_TOTP_SECRET=${secret}

Keep it secret: anyone with this key can create login codes.
`);
