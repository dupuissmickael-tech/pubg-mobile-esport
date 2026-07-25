import { NextResponse, type NextRequest } from "next/server";

/**
 * CSP par nonce (approche recommandée par Next.js) : un nonce aléatoire est
 * généré à chaque requête et injecté à la fois dans l'en-tête CSP et dans
 * les scripts inline que Next.js lui-même génère (hydratation, streaming
 * RSC) — Next les détecte automatiquement via l'en-tête CSP posé sur la
 * requête entrante. Un attaquant ne peut pas deviner ce nonce, donc
 * 'unsafe-inline' n'est jamais nécessaire en production. 'strict-dynamic'
 * laisse les scripts de confiance (noncés) charger d'autres scripts
 * (chunks Next.js, widget Turnstile injecté dynamiquement) sans avoir à
 * lister chaque domaine de script individuellement.
 *
 * En dev, `next dev` a besoin de eval()/scripts inline pour son rechargement
 * à chaud (HMR) d'une façon incompatible avec un nonce — on garde donc
 * 'unsafe-eval'/'unsafe-inline' uniquement en développement.
 */
function buildCsp(nonce: string, isDev: boolean): string {
  const scriptSrc = isDev
    ? "'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com"
    : `'self' 'nonce-${nonce}' 'strict-dynamic' https://challenges.cloudflare.com`;

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    // blob: est nécessaire pour l'aperçu local de la photo choisie
    // (URL.createObjectURL) avant l'envoi du formulaire.
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
    "font-src 'self'",
    `connect-src 'self' https://challenges.cloudflare.com${isDev ? " ws:" : ""}`,
    "frame-src https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}

const STATIC_SECURITY_HEADERS: [string, string][] = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "SAMEORIGIN"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  [
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  ],
];

/**
 * Basic Auth minimale pour /admin. Suffisant pour un usage mono-admin (v1) :
 * pas de limitation des tentatives, pas de journal d'accès. À renforcer
 * avant d'ouvrir l'accès à plusieurs personnes. Retourne une réponse de
 * refus si l'accès est refusé, ou null si autorisé.
 */
function checkAdminAuth(request: NextRequest): NextResponse | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return new NextResponse(
      "Administration non configurée (ADMIN_PASSWORD manquant).",
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = atob(authHeader.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex !== -1 && decoded.slice(separatorIndex + 1) === password) {
      return null;
    }
  }

  return new NextResponse("Authentification requise.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="VeyPri Admin"' },
  });
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const denied = checkAdminAuth(request);
    if (denied) return denied;
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV !== "production";
  const csp = buildCsp(nonce, isDev);

  // Posé sur la requête sortante : c'est ce que Next.js lit pour nonce
  // automatiquement les scripts inline qu'il génère lui-même.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  for (const [key, value] of STATIC_SECURITY_HEADERS) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
