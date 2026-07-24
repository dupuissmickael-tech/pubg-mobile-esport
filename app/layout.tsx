import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "VeyPri — Veille citoyenne des prix BQP en Guadeloupe",
  description:
    "Signalez, de façon anonyme, un écart entre le prix observé en magasin et le prix plafond du Bouclier Qualité Prix (BQP) en Guadeloupe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
