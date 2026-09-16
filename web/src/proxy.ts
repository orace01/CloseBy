import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: it looks for the session cookie without touching the
// database. Pages still verify the session through the data access layer.
const PROTECTED_PREFIXES = [
  "/tableau-de-bord",
  "/campagnes",
  "/prospects",
  "/boites-mail",
  "/credits",
  "/reglages",
  "/bienvenue",
  "/admin",
];

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isProtected && !getSessionCookie(request)) {
    const login = new URL("/connexion", request.url);
    login.searchParams.set("suite", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icon.svg|.*\\.(?:png|jpg|svg|ico)$).*)"],
};
