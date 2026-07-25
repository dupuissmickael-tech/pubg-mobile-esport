"use client";

import Script from "next/script";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * N'affiche rien tant que NEXT_PUBLIC_TURNSTILE_SITE_KEY n'est pas
 * configuré (pas de compte Cloudflare Turnstile créé) — le formulaire
 * reste utilisable sans CAPTCHA en attendant, la vérification serveur
 * (lib/turnstile.ts) est alors elle aussi court-circuitée.
 *
 * `nonce` doit venir du serveur (posé par middleware.ts, lu via
 * headers() dans un Server Component parent) : sous 'strict-dynamic',
 * un <script src> externe sans nonce n'est autorisé que s'il est injecté
 * par un script déjà noncé — le passer explicitement est plus robuste
 * que de compter sur cette propagation de confiance.
 */
export default function TurnstileWidget({ nonce }: { nonce?: string }) {
  if (!siteKey) return null;

  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        nonce={nonce}
      />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
    </div>
  );
}
