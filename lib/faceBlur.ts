import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";

const MODEL_PATH = path.join(
  process.cwd(),
  "node_modules/@vladmandic/face-api/model"
);

let modelReady: Promise<void> | null = null;

/**
 * Charge le détecteur depuis les poids embarqués dans le paquet npm — aucun
 * appel réseau au runtime, contrairement à la plupart des modèles TF.js
 * (voir README pour le compromis : dépendance native lourde en échange de
 * ne rien envoyer à un tiers).
 */
async function ensureModel(): Promise<void> {
  if (!modelReady) {
    modelReady = (async () => {
      const faceapi = await import("@vladmandic/face-api");
      await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH);
    })();
  }
  return modelReady;
}

/**
 * Floute (pixelise) tous les visages détectés dans la photo — pas
 * uniquement celui du déclarant, toute personne présente sur l'image.
 * Best-effort et jamais bloquant : si le modèle ne charge pas ou que la
 * détection échoue, la photo d'origine est renvoyée telle quelle plutôt que
 * de faire échouer tout le signalement.
 */
export async function blurFaces(buffer: Buffer): Promise<Buffer> {
  try {
    await ensureModel();
    const faceapi = await import("@vladmandic/face-api");
    const tf = await import("@tensorflow/tfjs");

    const { data, info } = await sharp(buffer)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const tensor = tf.tensor3d(new Uint8Array(data), [
      info.height,
      info.width,
      info.channels,
    ]);
    let detections;
    try {
      // @vladmandic/face-api embarque sa propre copie de @tensorflow/tfjs-core,
      // distincte (mais structurellement identique) de celle importée ici :
      // TypeScript les traite comme des types nominalement différents.
      detections = await faceapi.detectAllFaces(
        tensor as unknown as Parameters<typeof faceapi.detectAllFaces>[0],
        new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
      );
    } finally {
      tensor.dispose();
    }

    if (!detections || detections.length === 0) {
      return buffer;
    }

    const PADDING_RATIO = 0.3; // marge de sécurité autour de chaque visage détecté
    const PIXELATION_BLOCKS = 10; // plus petit = pixelisation plus forte

    const rawOverlays = await Promise.all(
      detections.slice(0, 30).map(async (d): Promise<OverlayOptions | null> => {
        const padX = d.box.width * PADDING_RATIO;
        const padY = d.box.height * PADDING_RATIO;
        const left = Math.max(0, Math.round(d.box.x - padX));
        const top = Math.max(0, Math.round(d.box.y - padY));
        const width = Math.min(
          info.width - left,
          Math.round(d.box.width + padX * 2)
        );
        const height = Math.min(
          info.height - top,
          Math.round(d.box.height + padY * 2)
        );
        if (width <= 0 || height <= 0) return null;

        const smallW = Math.max(1, Math.round(width / PIXELATION_BLOCKS));
        const smallH = Math.max(1, Math.round(height / PIXELATION_BLOCKS));

        const pixelated = await sharp(buffer)
          .extract({ left, top, width, height })
          .resize(smallW, smallH, { fit: "fill" })
          .resize(width, height, { fit: "fill", kernel: "nearest" })
          .toBuffer();

        return { input: pixelated, left, top };
      })
    );
    const overlays = rawOverlays.filter((o): o is OverlayOptions => o !== null);

    if (overlays.length === 0) return buffer;

    return await sharp(buffer).composite(overlays).toBuffer();
  } catch (err) {
    console.error("Floutage de visage échoué, photo publiée non retouchée :", err);
    return buffer;
  }
}
