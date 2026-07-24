import { NextRequest, NextResponse } from "next/server";
import { incrementFlagCount } from "@/lib/db";

/**
 * Action publique volontairement sans authentification (cohérent avec
 * l'anonymat du site) : le compteur résultant n'est visible que sur /admin.
 * Aucune protection forte contre le spam de clics — voir les limites
 * documentées pour l'utilisateur.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const signalementId = Number(id);

  if (!Number.isInteger(signalementId) || signalementId <= 0) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  await incrementFlagCount(signalementId);
  return NextResponse.json({ ok: true });
}
