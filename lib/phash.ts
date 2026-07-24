import sharp from "sharp";

const HASH_WIDTH = 9;
const HASH_HEIGHT = 8;

/**
 * dHash (difference hash) : réduit l'image à une grille 9x8 en niveaux de
 * gris, puis encode en binaire si chaque pixel est plus clair que son
 * voisin de droite. Donne un hash de 64 bits stable face aux petites
 * variations (recompression, léger recadrage, flou de visage) mais très
 * différent entre deux images distinctes — suffisant pour repérer des
 * quasi-doublons sans bibliothèque externe.
 */
export async function computePerceptualHash(buffer: Buffer): Promise<string> {
  const { data } = await sharp(buffer)
    .grayscale()
    .resize(HASH_WIDTH, HASH_HEIGHT, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let bits = "";
  for (let row = 0; row < HASH_HEIGHT; row++) {
    for (let col = 0; col < HASH_WIDTH - 1; col++) {
      const left = data[row * HASH_WIDTH + col];
      const right = data[row * HASH_WIDTH + col + 1];
      bits += left > right ? "1" : "0";
    }
  }

  // 64 bits -> 16 caractères hexadécimaux, plus compact à stocker/comparer.
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  }
  return hex;
}

export function hammingDistance(hexA: string, hexB: string): number {
  if (hexA.length !== hexB.length) return Number.MAX_SAFE_INTEGER;
  let distance = 0;
  for (let i = 0; i < hexA.length; i++) {
    const diff = parseInt(hexA[i], 16) ^ parseInt(hexB[i], 16);
    distance += [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4][diff];
  }
  return distance;
}

/** Seuil empirique : deux hashes à 64 bits distants de <=10 bits sont
 * presque toujours la même image (ou une variante très proche). */
export const DUPLICATE_THRESHOLD = 10;
