import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

const protectedRoutes = [
  "/mes",
  "/grade-semanal",
  "/atividades-padrao",
  "/configuracoes",
  "/painel",
];

const authRoutes = ["/entrar", "/cadastro"];

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/entrar", request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/mes", request.url));
  }

  if (pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL("/mes", request.url));
    } else {
      return NextResponse.redirect(new URL("/entrar", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
