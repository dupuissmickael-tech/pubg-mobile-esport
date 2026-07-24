import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

const uploadsDir = path.join(process.cwd(), "uploads");

function validate(file: File): string {
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    throw new Error(
      "Format de photo non supporté (JPEG, PNG ou WebP uniquement)."
    );
  }
  if (file.size === 0) {
    throw new Error("La photo est vide.");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("La photo dépasse la taille maximale autorisée (5 Mo).");
  }
  return extension;
}

/**
 * En production (Vercel), le système de fichiers est en lecture seule :
 * les photos sont envoyées à Vercel Blob. En local, sans
 * BLOB_READ_WRITE_TOKEN, on écrit sur disque et on sert via
 * /api/uploads/[filename] — suffisant pour le développement, pas pour la prod.
 */
export async function saveUploadedPhoto(file: File): Promise<string> {
  const extension = validate(file);
  const filename = `${crypto.randomUUID()}.${extension}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  await fs.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  return `/api/uploads/${filename}`;
}
