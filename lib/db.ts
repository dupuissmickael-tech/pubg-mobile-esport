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
    schemaReady = (async () => {
      await client.execute(`
        CREATE TABLE IF NOT EXISTS signalements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          magasin TEXT NOT NULL,
          produit TEXT NOT NULL,
          prix_observe REAL NOT NULL,
          prix_plafond_bqp REAL NOT NULL,
          photo_url TEXT NOT NULL,
          created_at TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'published',
          exif_notes TEXT NOT NULL DEFAULT '',
          flag_count INTEGER NOT NULL DEFAULT 0
        );
      `);
      await client.execute(`
        CREATE TABLE IF NOT EXISTS rate_limits (
          token_hash TEXT PRIMARY KEY,
          count INTEGER NOT NULL,
          window_start TEXT NOT NULL
        );
      `);
    })();
  }
  return schemaReady;
}

export type SignalementStatus = "published" | "pending_review" | "rejected";

export interface Signalement {
  id: number;
  magasin: string;
  produit: string;
  prix_observe: number;
  prix_plafond_bqp: number;
  photo_url: string;
  created_at: string;
  status: SignalementStatus;
  exif_notes: string;
  flag_count: number;
}

function rowToSignalement(row: Record<string, unknown>): Signalement {
  return {
    id: Number(row.id),
    magasin: String(row.magasin),
    produit: String(row.produit),
    prix_observe: Number(row.prix_observe),
    prix_plafond_bqp: Number(row.prix_plafond_bqp),
    photo_url: String(row.photo_url),
    created_at: String(row.created_at),
    status: row.status as SignalementStatus,
    exif_notes: String(row.exif_notes),
    flag_count: Number(row.flag_count),
  };
}

const SELECT_COLUMNS = `
  id, magasin, produit, prix_observe, prix_plafond_bqp, photo_url, created_at,
  status, exif_notes, flag_count
`;

export async function insertSignalement(
  data: Omit<Signalement, "id" | "flag_count">
): Promise<Signalement> {
  await ensureSchema();
  const result = await client.execute({
    sql: `
      INSERT INTO signalements
        (magasin, produit, prix_observe, prix_plafond_bqp, photo_url, created_at, status, exif_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      data.magasin,
      data.produit,
      data.prix_observe,
      data.prix_plafond_bqp,
      data.photo_url,
      data.created_at,
      data.status,
      data.exif_notes,
    ],
  });
  return { id: Number(result.lastInsertRowid), flag_count: 0, ...data };
}

/** Liste publique : uniquement les signalements publiés. */
export async function listRecentSignalements(
  limit = 50
): Promise<Signalement[]> {
  await ensureSchema();
  const result = await client.execute({
    sql: `
      SELECT ${SELECT_COLUMNS}
      FROM signalements
      WHERE status = 'published'
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `,
    args: [limit],
  });
  return result.rows.map((row) => rowToSignalement(row as Record<string, unknown>));
}

/** File de modération admin : signalements en attente de vérification. */
export async function listPendingSignalements(
  limit = 100
): Promise<Signalement[]> {
  await ensureSchema();
  const result = await client.execute({
    sql: `
      SELECT ${SELECT_COLUMNS}
      FROM signalements
      WHERE status = 'pending_review'
      ORDER BY created_at ASC
      LIMIT ?
    `,
    args: [limit],
  });
  return result.rows.map((row) => rowToSignalement(row as Record<string, unknown>));
}

/** Admin : signalements publiés ayant reçu au moins un signalement "douteux". */
export async function listFlaggedSignalements(
  limit = 100
): Promise<Signalement[]> {
  await ensureSchema();
  const result = await client.execute({
    sql: `
      SELECT ${SELECT_COLUMNS}
      FROM signalements
      WHERE flag_count > 0 AND status = 'published'
      ORDER BY flag_count DESC, created_at DESC
      LIMIT ?
    `,
    args: [limit],
  });
  return result.rows.map((row) => rowToSignalement(row as Record<string, unknown>));
}

export async function incrementFlagCount(id: number): Promise<void> {
  await ensureSchema();
  await client.execute({
    sql: `UPDATE signalements SET flag_count = flag_count + 1 WHERE id = ?`,
    args: [id],
  });
}

export async function setSignalementStatus(
  id: number,
  status: "published" | "rejected"
): Promise<void> {
  await ensureSchema();
  await client.execute({
    sql: `UPDATE signalements SET status = ? WHERE id = ?`,
    args: [status, id],
  });
}

export { client, ensureSchema };
