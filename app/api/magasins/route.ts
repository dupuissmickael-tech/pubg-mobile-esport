import { NextResponse } from "next/server";
import { listMagasins } from "@/lib/db";

export async function GET() {
  const magasins = await listMagasins();
  return NextResponse.json({ magasins });
}
