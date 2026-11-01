import { cookies, headers } from "next/headers";
import { COOKIE, validSession } from "./auth-core";

export * from "./auth-core";

export async function clientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

export async function isAdmin() {
  return validSession((await cookies()).get(COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("You are signed out. Sign in again to save.");
}
