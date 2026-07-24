import { NextRequest, NextResponse } from "next/server";
import { insertSignalement, listRecentSignalements, type Signalement } from "@/lib/db";
import { saveUploadedPhoto } from "@/lib/upload";
import { parsePrice, parseText } from "@/lib/validation";
import {
  checkRateLimit,
  RATE_LIMIT_COOKIE,
  RATE_LIMIT_MAX_AGE_SECONDS,
} from "@/lib/rateLimit";

/** Ne jamais exposer flag_count / exif_notes au public : réservés à /admin. */
function toPublicShape(s: Signalement) {
  return {
    id: s.id,
    magasin: s.magasin,
    produit: s.produit,
    prix_observe: s.prix_observe,
    prix_plafond_bqp: s.prix_plafond_bqp,
    photo_url: s.photo_url,
    created_at: s.created_at,
  };
}

function withRateLimitCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(RATE_LIMIT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: RATE_LIMIT_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}

export async function GET() {
  const signalements = await listRecentSignalements(50);
  return NextResponse.json({ signalements: signalements.map(toPublicShape) });
}

export async function POST(request: NextRequest) {
  const rlToken = request.cookies.get(RATE_LIMIT_COOKIE)?.value;
  const { allowed, token } = await checkRateLimit(rlToken);

  if (!allowed) {
    return withRateLimitCookie(
      NextResponse.json(
        {
          error:
            "Limite de 3 signalements par heure atteinte pour ce navigateur. Réessayez plus tard.",
        },
        { status: 429 }
      ),
      token
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return withRateLimitCookie(
      NextResponse.json({ error: "Requête invalide." }, { status: 400 }),
      token
    );
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
    return withRateLimitCookie(
      NextResponse.json({ error: errors.join(" ") }, { status: 400 }),
      token
    );
  }

  let photoUrl: string;
  let authentic: boolean;
  let reason: string;
  try {
    const uploaded = await saveUploadedPhoto(photo as File);
    photoUrl = uploaded.url;
    authentic = uploaded.authentic;
    reason = uploaded.reason;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur lors de l'enregistrement de la photo.";
    return withRateLimitCookie(NextResponse.json({ error: message }, { status: 400 }), token);
  }

  // Publié immédiatement dans tous les cas : une photo dont les métadonnées
  // ne sont pas vérifiables (ex. renvoyée via WhatsApp, qui strippe l'EXIF)
  // est presque toujours légitime. metadata_verified sert de signal de
  // modération interne, jamais de blocage à la publication.
  const signalement = await insertSignalement({
    magasin: magasin as string,
    produit: produit as string,
    prix_observe: prixObserve as number,
    prix_plafond_bqp: prixPlafond as number,
    photo_url: photoUrl,
    created_at: new Date().toISOString(),
    status: "published",
    exif_notes: reason,
    metadata_verified: authentic,
  });

  return withRateLimitCookie(
    NextResponse.json({ signalement: toPublicShape(signalement) }, { status: 201 }),
    token
  );
}
