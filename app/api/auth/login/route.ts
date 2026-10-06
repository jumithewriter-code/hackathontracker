import { NextResponse } from "next/server";
import { readJson } from "@/lib/api";
import { SESSION_COOKIE, configuredPasscode, safeEqual, sessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await readJson(req)) as { passcode?: unknown } | undefined;
  const code = configuredPasscode();
  const given = typeof body?.passcode === "string" ? body.passcode : "";
  if (!code || !safeEqual(await sessionToken(given), await sessionToken(code))) {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return NextResponse.json({ error: "Wrong passcode" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await sessionToken(code), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
