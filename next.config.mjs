// Les en-têtes de sécurité (dont le CSP à nonce) sont posés par
// middleware.ts, pas ici : le CSP a besoin d'un nonce généré par requête,
// impossible à faire dans next.config.mjs (statique, évalué une fois au
// build). Voir middleware.ts pour le détail.

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
