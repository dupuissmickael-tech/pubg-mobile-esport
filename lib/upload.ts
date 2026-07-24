import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";

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
 * Ré-encode l'image sans ses métadonnées (EXIF, ICC, XMP) : les photos de
 * téléphone embarquent souvent la géolocalisation GPS, l'horodatage précis
 * et le modèle de l'appareil, ce qui romprait l'anonymat promis aux
 * déclarants. `.rotate()` applique l'orientation EXIF avant suppression
 * pour que l'image reste correctement orientée une fois celle-ci retirée.
 */
async function stripMetadata(buffer: Buffer, mimeType: string): Promise<Buffer> {
  const image = sharp(buffer).rotate();
  if (mimeType === "image/png") return image.png().toBuffer();
  if (mimeType === "image/webp") return image.webp().toBuffer();
  return image.jpeg().toBuffer();
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
  const rawBuffer = Buffer.from(await file.arrayBuffer());

  let cleanedBuffer: Buffer;
  try {
    cleanedBuffer = await stripMetadata(rawBuffer, file.type);
  } catch {
    throw new Error(
      "Impossible de traiter cette image. Essayez une autre photo."
    );
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(filename, cleanedBuffer, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  await fs.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, cleanedBuffer);
  return `/api/uploads/${filename}`;
}
