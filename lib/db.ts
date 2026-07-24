import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "veypri.db");

declare global {
  // eslint-disable-next-line no-var
  var __veypriDb: DatabaseSync | undefined;
}

const db = globalThis.__veypriDb ?? new DatabaseSync(dbPath);

if (process.env.NODE_ENV !== "production") {
  globalThis.__veypriDb = db;
}

db.exec("PRAGMA journal_mode = WAL;");

db.exec(`
  CREATE TABLE IF NOT EXISTS signalements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    magasin TEXT NOT NULL,
    produit TEXT NOT NULL,
    prix_observe REAL NOT NULL,
    prix_plafond_bqp REAL NOT NULL,
    photo_filename TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

export interface Signalement {
  id: number;
  magasin: string;
  produit: string;
  prix_observe: number;
  prix_plafond_bqp: number;
  photo_filename: string;
  created_at: string;
}

export function insertSignalement(
  data: Omit<Signalement, "id">
): Signalement {
  const stmt = db.prepare(`
    INSERT INTO signalements (magasin, produit, prix_observe, prix_plafond_bqp, photo_filename, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.magasin,
    data.produit,
    data.prix_observe,
    data.prix_plafond_bqp,
    data.photo_filename,
    data.created_at
  );
  return { id: Number(result.lastInsertRowid), ...data };
}

export function listRecentSignalements(limit = 50): Signalement[] {
  const stmt = db.prepare(`
    SELECT id, magasin, produit, prix_observe, prix_plafond_bqp, photo_filename, created_at
    FROM signalements
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `);
  return stmt.all(limit) as unknown as Signalement[];
}

export default db;
