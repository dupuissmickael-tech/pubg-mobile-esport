import { NextRequest, NextResponse } from "next/server";
import {
  insertSignalement,
  listRecentSignalements,
  ensureMagasin,
  type Signalement,
} from "@/lib/db";
import { saveUploadedPhoto } from "@/lib/upload";
import { parsePrice, parseText } from "@/lib/validation";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { PRODUCT_CATEGORIES, GUADELOUPE_COMMUNES } from "@/lib/constants";
import {
  checkRateLimit,
  RATE_LIMIT_COOKIE,
  RATE_LIMIT_MAX_AGE_SECONDS,
} from "@/lib/rateLimit";

/** Ne jamais exposer flag_count / exif_notes / photo_hash au public : réservés à /admin. */
function toPublicShape(s: Signalement) {
  return {
    id: s.id,
    magasin: s.magasin,
    produit: s.produit,
    categorie: s.categorie,
    commune: s.commune,
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categorie = searchParams.get("categorie") || undefined;
  const commune = searchParams.get("commune") || undefined;

  const signalements = await listRecentSignalements(50, { categorie, commune });
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
  const categorieRaw = formData.get("categorie");
  const communeRaw = formData.get("commune");
  const prixObserve = parsePrice(formData.get("prix_observe"));
  const prixPlafond = parsePrice(formData.get("prix_plafond_bqp"));
  const photo = formData.get("photo");
  const turnstileToken = formData.get("cf-turnstile-response");

  const categorie =
    typeof categorieRaw === "string" &&
    (PRODUCT_CATEGORIES as readonly string[]).includes(categorieRaw)
      ? categorieRaw
      : null;
  const commune =
    typeof communeRaw === "string" &&
    (GUADELOUPE_COMMUNES as readonly string[]).includes(communeRaw)
      ? communeRaw
      : null;

  const errors: string[] = [];
  if (!magasin) errors.push("Le nom du magasin doit contenir entre 2 et 200 caractères.");
  if (!produit) errors.push("Le nom du produit doit contenir entre 2 et 200 caractères.");
  if (!categorie) errors.push("Merci de choisir une catégorie de produit valide.");
  if (!commune) errors.push("Merci de choisir une commune valide.");
  if (prixObserve === null) errors.push("Le prix observé doit être un nombre positif (ex : 3.50).");
  if (prixPlafond === null) errors.push("Le prix affiché en rayon sous le logo BQP doit être un nombre positif (ex : 2.90).");
  if (!(photo instanceof File) || photo.size === 0) {
    errors.push("Une photo de l'étiquette est requise comme preuve.");
  }

  const humanVerified = await verifyTurnstileToken(
    typeof turnstileToken === "string" ? turnstileToken : null,
    request.headers.get("x-forwarded-for") ?? undefined
  );
  if (!humanVerified) {
    errors.push("Vérification anti-robot échouée. Merci de réessayer.");
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
  let hash: string;
  try {
    const uploaded = await saveUploadedPhoto(photo as File);
    photoUrl = uploaded.url;
    authentic = uploaded.authentic;
    reason = uploaded.reason;
    hash = uploaded.hash;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur lors de l'enregistrement de la photo.";
    return withRateLimitCookie(NextResponse.json({ error: message }, { status: 400 }), token);
  }

  await ensureMagasin(magasin as string);

  // Publié immédiatement dans tous les cas : une photo dont les métadonnées
  // ne sont pas vérifiables (ex. renvoyée via WhatsApp, qui strippe l'EXIF)
  // est presque toujours légitime. metadata_verified sert de signal de
  // modération interne, jamais de blocage à la publication.
  const signalement = await insertSignalement({
    magasin: magasin as string,
    produit: produit as string,
    categorie: categorie as string,
    commune: commune as string,
    prix_observe: prixObserve as number,
    prix_plafond_bqp: prixPlafond as number,
    photo_url: photoUrl,
    photo_hash: hash,
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
