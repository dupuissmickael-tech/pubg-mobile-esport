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

export async function saveUploadedPhoto(file: File): Promise<string> {
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    throw new Error(
      "Format de photo non supporté (JPEG, PNG ou WebP uniquement)."
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("La photo dépasse la taille maximale autorisée (5 Mo).");
  }
  if (file.size === 0) {
    throw new Error("La photo est vide.");
  }

  await fs.mkdir(uploadsDir, { recursive: true });

  const filename = `${crypto.randomUUID()}.${extension}`;
  const filePath = path.join(uploadsDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return filename;
}
