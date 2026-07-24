import { createClient, type Client } from "@libsql/client";

// En production : TURSO_DATABASE_URL (libsql://...) + TURSO_AUTH_TOKEN.
// En local sans compte Turso : repli sur un fichier SQLite local, géré par
// le même client libSQL (mode "embedded", aucun réseau requis).
const url = process.env.TURSO_DATABASE_URL ?? "file:./data/veypri.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

declare global {
  // eslint-disable-next-line no-var
  var __veypriClient: Client | undefined;
}

const client: Client =
  globalThis.__veypriClient ??
  createClient(authToken ? { url, authToken } : { url });

if (process.env.NODE_ENV !== "production") {
  globalThis.__veypriClient = client;
}

let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = client
      .execute(
        `
        CREATE TABLE IF NOT EXISTS signalements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          magasin TEXT NOT NULL,
          produit TEXT NOT NULL,
          prix_observe REAL NOT NULL,
          prix_plafond_bqp REAL NOT NULL,
          photo_url TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `
      )
      .then(() => undefined);
  }
  return schemaReady;
}

export interface Signalement {
  id: number;
  magasin: string;
  produit: string;
  prix_observe: number;
  prix_plafond_bqp: number;
  photo_url: string;
  created_at: string;
}

export async function insertSignalement(
  data: Omit<Signalement, "id">
): Promise<Signalement> {
  await ensureSchema();
  const result = await client.execute({
    sql: `
      INSERT INTO signalements (magasin, produit, prix_observe, prix_plafond_bqp, photo_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      data.magasin,
      data.produit,
      data.prix_observe,
      data.prix_plafond_bqp,
      data.photo_url,
      data.created_at,
    ],
  });
  return { id: Number(result.lastInsertRowid), ...data };
}

export async function listRecentSignalements(
  limit = 50
): Promise<Signalement[]> {
  await ensureSchema();
  const result = await client.execute({
    sql: `
      SELECT id, magasin, produit, prix_observe, prix_plafond_bqp, photo_url, created_at
      FROM signalements
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `,
    args: [limit],
  });
  return result.rows.map((row) => ({
    id: Number(row.id),
    magasin: String(row.magasin),
    produit: String(row.produit),
    prix_observe: Number(row.prix_observe),
    prix_plafond_bqp: Number(row.prix_plafond_bqp),
    photo_url: String(row.photo_url),
    created_at: String(row.created_at),
  }));
}

export default client;
