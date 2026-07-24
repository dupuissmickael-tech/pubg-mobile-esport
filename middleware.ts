import { NextResponse, type NextRequest } from "next/server";

/**
 * Basic Auth minimale pour /admin. Suffisant pour un usage mono-admin (v1) :
 * pas de limitation des tentatives, pas de journal d'accès. À renforcer
 * avant d'ouvrir l'accès à plusieurs personnes.
 */
export function middleware(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    return new NextResponse("Administration non configurée (ADMIN_PASSWORD manquant).", {
      status: 503,
    });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    const suppliedPassword = decoded.slice(separatorIndex + 1);
    if (separatorIndex !== -1 && suppliedPassword === password) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentification requise.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="VeyPri Admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
