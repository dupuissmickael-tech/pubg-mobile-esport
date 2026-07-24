import { NextRequest, NextResponse } from "next/server";
import { insertSignalement, listRecentSignalements } from "@/lib/db";
import { saveUploadedPhoto } from "@/lib/upload";
import { parsePrice, parseText } from "@/lib/validation";

export async function GET() {
  const signalements = await listRecentSignalements(50);
  return NextResponse.json({ signalements });
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const magasin = parseText(formData.get("magasin"));
  const produit = parseText(formData.get("produit"));
  const prixObserve = parsePrice(formData.get("prix_observe"));
  const prixPlafond = parsePrice(formData.get("prix_plafond_bqp"));
  const photo = formData.get("photo");

  const errors: string[] = [];
  if (!magasin) errors.push("Le nom du magasin doit contenir entre 2 et 200 caractères.");
  if (!produit) errors.push("Le nom du produit doit contenir entre 2 et 200 caractères.");
  if (prixObserve === null) errors.push("Le prix observé doit être un nombre positif (ex : 3.50).");
  if (prixPlafond === null) errors.push("Le prix plafond BQP doit être un nombre positif (ex : 2.90).");
  if (!(photo instanceof File) || photo.size === 0) {
    errors.push("Une photo de l'étiquette est requise comme preuve.");
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  }

  let photoUrl: string;
  try {
    photoUrl = await saveUploadedPhoto(photo as File);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur lors de l'enregistrement de la photo.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const signalement = await insertSignalement({
    magasin: magasin as string,
    produit: produit as string,
    prix_observe: prixObserve as number,
    prix_plafond_bqp: prixPlafond as number,
    photo_url: photoUrl,
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ signalement }, { status: 201 });
}
