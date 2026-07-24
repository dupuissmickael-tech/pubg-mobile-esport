const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Vérifie le jeton Cloudflare Turnstile envoyé par le formulaire.
 * Si TURNSTILE_SECRET_KEY n'est pas configuré (dev local, ou avant que
 * le compte Turnstile soit créé), la vérification est court-circuitée
 * pour ne jamais bloquer le développement — voir .env.example.
 */
export async function verifyTurnstileToken(
  token: string | null,
  remoteIp?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return true;
  }
  if (!token) {
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
