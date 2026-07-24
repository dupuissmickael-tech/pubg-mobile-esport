"use client";

import Script from "next/script";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/**
 * N'affiche rien tant que NEXT_PUBLIC_TURNSTILE_SITE_KEY n'est pas
 * configuré (pas de compte Cloudflare Turnstile créé) — le formulaire
 * reste utilisable sans CAPTCHA en attendant, la vérification serveur
 * (lib/turnstile.ts) est alors elle aussi court-circuitée.
 */
export default function TurnstileWidget() {
  if (!siteKey) return null;

  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
      />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
    </div>
  );
}
