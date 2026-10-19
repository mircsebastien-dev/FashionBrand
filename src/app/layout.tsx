import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "FashionBrand — T-Shirts audacieux",
  description: "La nouvelle génération de T-shirts. Coton bio, coupes parfaites, prix justes.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="fr">
      <body>
        <CartProvider>
          <Header session={session} />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
