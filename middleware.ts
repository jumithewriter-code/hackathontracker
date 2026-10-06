import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, configuredPasscode, safeEqual, sessionToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const code = configuredPasscode();
  if (!code) {
    // No passcode: open in local dev, refuse in production so the site is never left unlocked.
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return new NextResponse("APP_PASSCODE is not set on the server.", { status: 503 });
  }

  const expected = await sessionToken(code);
  const cookie = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  // Scripts/other clients can send `Authorization: Bearer <passcode>` instead of the cookie.
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const ok = safeEqual(cookie, expected) || (bearer !== "" && safeEqual(await sessionToken(bearer), expected));
  if (ok) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except the login page, auth routes, and static assets.
  matcher: ["/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
