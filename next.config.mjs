// CSP pour Cloudflare Turnstile (script + iframe) et Vercel Blob (images).
// Le motif *.public.blob.vercel-storage.com est celui documenté par Vercel ;
// à vérifier après déploiement si les photos ne s'affichent pas (le nom de
// domaine exact dépend du store Blob créé).
//
// 'unsafe-eval' et 'unsafe-inline' sur script-src ne sont ajoutés qu'en
// développement : le rechargement à chaud de `next dev` utilise eval() et
// casse complètement sans ça (React ne s'hydrate plus). Le build de
// production n'en a pas besoin.
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval' 'unsafe-inline'" : ""}`,
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

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
