import crypto from "node:crypto";
import { client, ensureSchema } from "@/lib/db";

const WINDOW_MS = 60 * 60 * 1000; // 1h
const MAX_PER_WINDOW = 3;

export const RATE_LIMIT_COOKIE = "veypri_rl";
export const RATE_LIMIT_MAX_AGE_SECONDS = WINDOW_MS / 1000;

/**
 * Anti-spam simple : 3 signalements max par heure pour un même navigateur.
 * La clé n'est jamais un identifiant permanent — c'est un token aléatoire
 * régénéré si le cookie est absent (navigation privée, cookies effacés,
 * autre appareil...), et seul son hash est stocké, dans une fenêtre
 * glissante d'1h nettoyée à chaque appel. Ce n'est qu'une friction contre
 * le spam basique, pas un contrôle de sécurité — voir les limites
 * documentées pour l'utilisateur.
 */
export async function checkRateLimit(
  existingToken: string | undefined
): Promise<{ allowed: boolean; token: string }> {
  await ensureSchema();

  const token = existingToken ?? crypto.randomUUID();
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const now = Date.now();

  // Nettoyage opportuniste des fenêtres expirées (pas de tâche planifiée).
  await client.execute({
    sql: `DELETE FROM rate_limits WHERE window_start < ?`,
    args: [new Date(now - WINDOW_MS).toISOString()],
  });

  const existing = await client.execute({
    sql: `SELECT count, window_start FROM rate_limits WHERE token_hash = ?`,
    args: [tokenHash],
  });

  if (existing.rows.length === 0) {
    await client.execute({
      sql: `INSERT INTO rate_limits (token_hash, count, window_start) VALUES (?, 1, ?)`,
      args: [tokenHash, new Date(now).toISOString()],
    });
    return { allowed: true, token };
  }

  const row = existing.rows[0];
  const windowStart = new Date(String(row.window_start)).getTime();
  const count = Number(row.count);

  if (now - windowStart >= WINDOW_MS) {
    await client.execute({
      sql: `UPDATE rate_limits SET count = 1, window_start = ? WHERE token_hash = ?`,
      args: [new Date(now).toISOString(), tokenHash],
    });
    return { allowed: true, token };
  }

  if (count >= MAX_PER_WINDOW) {
    return { allowed: false, token };
  }

  await client.execute({
    sql: `UPDATE rate_limits SET count = count + 1 WHERE token_hash = ?`,
    args: [tokenHash],
  });
  return { allowed: true, token };
}
