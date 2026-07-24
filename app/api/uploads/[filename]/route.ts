import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const FILENAME_PATTERN = /^[a-f0-9-]{36}\.(jpg|png|webp)$/i;

const uploadsDir = path.join(process.cwd(), "uploads");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!FILENAME_PATTERN.test(filename)) {
    return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
  }

  const extension = filename.split(".").pop()!.toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  const filePath = path.join(uploadsDir, filename);

  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable." }, { status: 404 });
  }
}
