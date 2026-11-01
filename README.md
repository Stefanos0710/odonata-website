# Odonata website

The project site and build journal for [Odonata](https://github.com/Stefanos0710/Odonata), an autonomous drone that started at Hack Club Fallout and is heading into the forest for Jugend forscht 2027.

- `/` – project overview, phase timeline, specs and the forest goal
- `/journal` – every build session, grouped by phase, with time worked and photos
- `/admin` – sign in to write, edit or delete entries and upload photos

## Run it locally

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD
npm run setup-2fa            # optional locally, required in production
npm run dev
```

Open http://localhost:3000/admin and sign in. (The admin page isn't linked anywhere on the site; bookmark it.) Locally, publishing writes the entry to `content/journal/` and photos to `public/journal/`. Commit and push them like any other change.

## Writing entries

Each entry is a Markdown file in `content/journal/` with a small header:

```md
---
title: Finished the PCB!
date: 2026-05-21T18:00:00.000Z
minutes: 185
phase: pcb
cover: /journal/7680/01.webp
---
```

The editor at `/admin` fills this in for you. Photos can be added with the button, dragged into the text, or pasted. They are resized in the browser (max 2000 px, WebP) before uploading. Phases are listed in `lib/phases.ts`.

## Login security

- **Two-factor login.** `npm run setup-2fa` prints a setup key for an authenticator app (Google Authenticator, Authy, 1Password, …) and the `ADMIN_TOTP_SECRET` line to add. Each code works once and only for about 30 seconds. Production refuses to log anyone in until this is set and the password is at least 12 characters.
- **Brute-force protection.** After 5 wrong attempts from one address, login is locked for 15 minutes, then 30, 60 and so on. If many addresses fail at once, login pauses for everyone for 15 minutes. Every failed attempt is also slowed down, and the error never says whether the password or the code was wrong.
- **Sessions** are random, signed and expire after 7 days. The cookie is `httpOnly`, `SameSite=Strict` and `__Host-` prefixed in production, so page scripts and other sites can't read or send it. Changing the password, the 2FA secret or `SESSION_SECRET` signs out every session.
- **Uploads** are checked by their actual bytes (JPG, PNG, WebP or GIF only, max 4 MB), not by what the browser claims.
- **Security headers** stop the site being framed by other pages and turn off camera, microphone and location access.

`npm run check-auth` tests the 2FA codes (against the RFC 6238 test vector), session signing and expiry, and the lockout.

## Deploy on Vercel

1. Import this repository on Vercel (framework: Next.js, no extra settings).
2. Add environment variables:
   - `ADMIN_PASSWORD` – your sign-in password (12+ characters)
   - `ADMIN_TOTP_SECRET` – from `npm run setup-2fa`
   - `GITHUB_TOKEN` – a [fine-grained token](https://github.com/settings/personal-access-tokens) for this repo with **Contents: Read and write**
   - `GITHUB_REPO` (default `Stefanos0710/Odonata-Website`) and `GITHUB_BRANCH` (default `main`) if they differ
3. Deploy.

With `GITHUB_TOKEN` set, publishing from `/admin` creates one commit with the entry and its photos. Vercel then redeploys, and the entry is live about a minute later. Everything stays in Git, so the whole journal is versioned.

## Re-importing from Fallout

`scripts/import-fallout.mjs` turned the Fallout journal export into the files in `content/journal/`, downloaded every image, and pulled the time logged per session from the Fallout project page. It replaces `content/journal/`, so only run it again if you want to start over:

```bash
npm run import-fallout -- path/to/odonata-journal.md
```
