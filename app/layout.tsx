import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "VeyPri — Veille citoyenne des prix BQP en Guadeloupe",
  description:
    "Signalez, de façon anonyme, un écart entre le prix observé en magasin et le prix plafond du Bouclier Qualité Prix (BQP) en Guadeloupe.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lire le nonce (posé par middleware.ts) force le rendu dynamique de
  // toute l'appli : indispensable pour que le nonce du CSP corresponde
  // bien, à chaque requête, à celui des scripts inline générés par
  // Next.js. Sans ça, une page prérendue statiquement embarquerait un
  // nonce périmé et casserait de nouveau la CSP en production.
  await headers();

  return (
    <html lang="fr">
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
