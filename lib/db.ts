import { createClient, type Client } from "@libsql/client";
import { hammingDistance, DUPLICATE_THRESHOLD } from "@/lib/phash";

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
          categorie TEXT NOT NULL DEFAULT 'Autre',
          commune TEXT NOT NULL DEFAULT '',
          prix_observe REAL NOT NULL,
          prix_plafond_bqp REAL NOT NULL,
          photo_url TEXT NOT NULL,
          photo_hash TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'published',
          exif_notes TEXT NOT NULL DEFAULT '',
          metadata_verified INTEGER NOT NULL DEFAULT 1,
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
      await client.execute(`
        CREATE TABLE IF NOT EXISTS magasins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nom TEXT NOT NULL UNIQUE
        );
      `);
    })();
  }
  return schemaReady;
}

/** "rejected" retire un signalement de la publication (action admin). */
export type SignalementStatus = "published" | "rejected";

export interface Signalement {
  id: number;
  magasin: string;
  produit: string;
  categorie: string;
  commune: string;
  prix_observe: number;
  prix_plafond_bqp: number;
  photo_url: string;
  /** Hash perceptuel — jamais exposé publiquement, sert à repérer les doublons sur /admin. */
  photo_hash: string;
  created_at: string;
  status: SignalementStatus;
  exif_notes: string;
  /** Résultat de la vérification EXIF — jamais exposé publiquement, réservé à /admin. */
  metadata_verified: boolean;
  flag_count: number;
}

function rowToSignalement(row: Record<string, unknown>): Signalement {
  return {
    id: Number(row.id),
    magasin: String(row.magasin),
    produit: String(row.produit),
    categorie: String(row.categorie),
    commune: String(row.commune),
    prix_observe: Number(row.prix_observe),
    prix_plafond_bqp: Number(row.prix_plafond_bqp),
    photo_url: String(row.photo_url),
    photo_hash: String(row.photo_hash),
    created_at: String(row.created_at),
    status: row.status as SignalementStatus,
    exif_notes: String(row.exif_notes),
    metadata_verified: Number(row.metadata_verified) === 1,
    flag_count: Number(row.flag_count),
  };
}

const SELECT_COLUMNS = `
  id, magasin, produit, categorie, commune, prix_observe, prix_plafond_bqp,
  photo_url, photo_hash, created_at, status, exif_notes, metadata_verified, flag_count
`;

export async function insertSignalement(
  data: Omit<Signalement, "id" | "flag_count">
): Promise<Signalement> {
  await ensureSchema();
  const result = await client.execute({
    sql: `
      INSERT INTO signalements
        (magasin, produit, categorie, commune, prix_observe, prix_plafond_bqp,
         photo_url, photo_hash, created_at, status, exif_notes, metadata_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      data.magasin,
      data.produit,
      data.categorie,
      data.commune,
      data.prix_observe,
      data.prix_plafond_bqp,
      data.photo_url,
      data.photo_hash,
      data.created_at,
      data.status,
      data.exif_notes,
      data.metadata_verified ? 1 : 0,
    ],
  });
  return { id: Number(result.lastInsertRowid), flag_count: 0, ...data };
}

export interface SignalementFilters {
  categorie?: string;
  commune?: string;
}

/** Liste publique : tous les signalements publiés (vérifiés ou non), avec filtres optionnels. */
export async function listRecentSignalements(
  limit = 50,
  filters: SignalementFilters = {}
): Promise<Signalement[]> {
  await ensureSchema();
  const conditions = ["status = 'published'"];
  const args: (string | number)[] = [];

  if (filters.categorie) {
    conditions.push("categorie = ?");
    args.push(filters.categorie);
  }
  if (filters.commune) {
    conditions.push("commune = ?");
    args.push(filters.commune);
  }
  args.push(limit);

  const result = await client.execute({
    sql: `
      SELECT ${SELECT_COLUMNS}
      FROM signalements
      WHERE ${conditions.join(" AND ")}
      ORDER BY created_at DESC, id DESC
      LIMIT ?
    `,
    args,
  });
  return result.rows.map((row) => rowToSignalement(row as Record<string, unknown>));
}

export async function countPublishedSignalements(): Promise<number> {
  await ensureSchema();
  const result = await client.execute(
    `SELECT COUNT(*) as total FROM signalements WHERE status = 'published'`
  );
  return Number(result.rows[0]?.total ?? 0);
}

/** Admin : signalements publiés dont les métadonnées EXIF n'ont pas pu être vérifiées. */
export async function listUnverifiedSignalements(
  limit = 100
): Promise<Signalement[]> {
  await ensureSchema();
  const result = await client.execute({
    sql: `
      SELECT ${SELECT_COLUMNS}
      FROM signalements
      WHERE status = 'published' AND metadata_verified = 0
      ORDER BY created_at DESC
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

export interface DuplicateGroup {
  signalement: Signalement;
  matches: Signalement[];
}

/**
 * Admin : regroupe les signalements publiés dont le hash perceptuel de la
 * photo est très proche (probable doublon). Calculé à la volée — O(n²) sur
 * les signalements publiés, largement suffisant au volume attendu pour ce
 * projet ; à revoir si la base grossit fortement.
 */
export async function listPossibleDuplicates(
  limit = 500
): Promise<DuplicateGroup[]> {
  await ensureSchema();
  const result = await client.execute({
    sql: `
      SELECT ${SELECT_COLUMNS}
      FROM signalements
      WHERE status = 'published' AND photo_hash != ''
      ORDER BY created_at DESC
      LIMIT ?
    `,
    args: [limit],
  });
  const all = result.rows.map((row) => rowToSignalement(row as Record<string, unknown>));

  const groups: DuplicateGroup[] = [];
  const seen = new Set<number>();

  for (const s of all) {
    if (seen.has(s.id)) continue;
    const matches = all.filter(
      (other) =>
        other.id !== s.id &&
        !seen.has(other.id) &&
        hammingDistance(s.photo_hash, other.photo_hash) <= DUPLICATE_THRESHOLD
    );
    if (matches.length > 0) {
      seen.add(s.id);
      matches.forEach((m) => seen.add(m.id));
      groups.push({ signalement: s, matches });
    }
  }

  return groups;
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
  status: SignalementStatus
): Promise<void> {
  await ensureSchema();
  await client.execute({
    sql: `UPDATE signalements SET status = ? WHERE id = ?`,
    args: [status, id],
  });
}

export async function listMagasins(): Promise<string[]> {
  await ensureSchema();
  const result = await client.execute(
    `SELECT nom FROM magasins ORDER BY nom COLLATE NOCASE ASC`
  );
  return result.rows.map((row) => String(row.nom));
}

/** Enregistre le magasin s'il n'existe pas déjà (insensible à la casse/espaces). */
export async function ensureMagasin(nom: string): Promise<void> {
  await ensureSchema();
  const trimmed = nom.trim();
  if (!trimmed) return;
  await client.execute({
    sql: `INSERT INTO magasins (nom) VALUES (?) ON CONFLICT(nom) DO NOTHING`,
    args: [trimmed],
  });
}

export { client, ensureSchema };
