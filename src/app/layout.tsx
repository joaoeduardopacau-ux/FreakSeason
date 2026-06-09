import type { Metadata } from "next";
import { Bebas_Neue, Barlow_Condensed, UnifrakturMaguntia } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import BottomNav from "@/components/BottomNav";

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas",
  display: "swap",
});

const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

const gothic = UnifrakturMaguntia({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-gothic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreakSeason",
  description: "Organize seus treinos, dieta e calorias",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        className={`${bebas.variable} ${barlow.variable} ${gothic.variable}`}
        style={{ fontFamily: "var(--font-barlow), Arial Narrow, Arial, sans-serif" }}
      >
        <AppProvider>
          <div className="max-w-md mx-auto min-h-screen flex flex-col">
            <main className="flex-1 pb-20">{children}</main>
            <BottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
