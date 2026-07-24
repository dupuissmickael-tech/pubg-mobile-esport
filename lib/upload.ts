import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import sharp from "sharp";
import exifr from "exifr";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
const MAX_PHOTO_AGE_MS = 48 * 60 * 60 * 1000; // 48h
const FUTURE_TOLERANCE_MS = 60 * 60 * 1000; // 1h de marge (horloges d'appareil imprécises)

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

export interface AuthenticityCheck {
  authentic: boolean;
  reason: string;
}

/**
 * Vérifie, sur la photo BRUTE (avant suppression EXIF), qu'elle ressemble à
 * une vraie prise de vue récente par un smartphone : modèle d'appareil
 * présent et date de prise de vue dans les dernières 48h. Ne prouve ni
 * l'authenticité du contenu (le prix, le magasin) ni l'absence de
 * falsification délibérée des métadonnées — voir les limites documentées
 * pour l'utilisateur.
 */
async function checkAuthenticity(buffer: Buffer): Promise<AuthenticityCheck> {
  let tags: { Model?: string; DateTimeOriginal?: Date; CreateDate?: Date } | null;
  try {
    tags = await exifr.parse(buffer, {
      pick: ["Model", "DateTimeOriginal", "CreateDate"],
    });
  } catch {
    tags = null;
  }

  if (!tags || !tags.Model) {
    return {
      authentic: false,
      reason: "Aucun modèle d'appareil détecté dans les métadonnées de la photo.",
    };
  }

  const takenAt = tags.DateTimeOriginal ?? tags.CreateDate;
  if (!takenAt || Number.isNaN(takenAt.getTime())) {
    return {
      authentic: false,
      reason: "Aucune date de prise de vue exploitable dans les métadonnées.",
    };
  }

  const ageMs = Date.now() - takenAt.getTime();
  if (ageMs > MAX_PHOTO_AGE_MS) {
    return {
      authentic: false,
      reason: `Photo prise il y a plus de 48h (${Math.round(ageMs / (60 * 60 * 1000))}h).`,
    };
  }
  if (ageMs < -FUTURE_TOLERANCE_MS) {
    return {
      authentic: false,
      reason: "Date de prise de vue dans le futur par rapport au serveur.",
    };
  }

  return {
    authentic: true,
    reason: `Modèle d'appareil et date de prise de vue cohérents (${tags.Model}).`,
  };
}

/**
 * Ré-encode l'image sans ses métadonnées (EXIF, ICC, XMP) : les photos de
 * téléphone embarquent souvent la géolocalisation GPS, l'horodatage précis
 * et le modèle de l'appareil, ce qui romprait l'anonymat promis aux
 * déclarants. `.rotate()` applique l'orientation EXIF avant suppression
 * pour que l'image reste correctement orientée une fois celle-ci retirée.
 * Toujours appliqué, y compris pour les photos mises en file de
 * modération : la vérification d'authenticité ne doit pas devenir un
 * prétexte pour conserver des métadonnées identifiantes.
 */
async function stripMetadata(buffer: Buffer, mimeType: string): Promise<Buffer> {
  const image = sharp(buffer).rotate();
  if (mimeType === "image/png") return image.png().toBuffer();
  if (mimeType === "image/webp") return image.webp().toBuffer();
  return image.jpeg().toBuffer();
}

export interface UploadedPhoto {
  url: string;
  authentic: boolean;
  reason: string;
}

/**
 * En production (Vercel), le système de fichiers est en lecture seule :
 * les photos sont envoyées à Vercel Blob. En local, sans
 * BLOB_READ_WRITE_TOKEN, on écrit sur disque et on sert via
 * /api/uploads/[filename] — suffisant pour le développement, pas pour la prod.
 */
export async function saveUploadedPhoto(file: File): Promise<UploadedPhoto> {
  const extension = validate(file);
  const filename = `${crypto.randomUUID()}.${extension}`;
  const rawBuffer = Buffer.from(await file.arrayBuffer());

  const { authentic, reason } = await checkAuthenticity(rawBuffer);

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
    return { url: blob.url, authentic, reason };
  }

  await fs.mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, filename);
  await fs.writeFile(filePath, cleanedBuffer);
  return { url: `/api/uploads/${filename}`, authentic, reason };
}
