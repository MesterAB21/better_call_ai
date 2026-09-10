import { NextResponse, type NextRequest } from "next/server";

// /app is intentionally open to anonymous visitors (guest mode):
// conversations live in localStorage and only enter the database after sign-in.
const AUTH_ONLY_ROUTES = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  const isAuthOnly = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r));

  if (isAuthOnly && token) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login"],
};