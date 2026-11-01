"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm({ totp, problem }: { totp: boolean; problem: string | null }) {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="login">
      <h1>Sign in to post</h1>
      <p>Only the owner of this site can add or edit journal entries.</p>
      <label>
        Password
        <input type="password" name="password" required autoFocus autoComplete="current-password" />
      </label>
      {totp && (
        <label>
          Code from your authenticator app
          <input
            name="code"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="123456"
            title="The 6-digit code from your authenticator app"
          />
        </label>
      )}
      {(error || problem) && <p className="form-error" role="alert">{error ?? problem}</p>}
      <button className="button" disabled={pending || !!problem}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
