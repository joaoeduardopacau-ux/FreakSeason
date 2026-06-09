import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import BottomNav from "@/components/BottomNav";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreakSeason",
  description: "Organize seus treinos, dieta e calorias",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${oswald.variable}`} style={{ fontFamily: "var(--font-oswald), Arial Narrow, Arial, sans-serif" }}>
        <AppProvider>
          <div className="max-w-md mx-auto min-h-screen flex flex-col">
            <main className="flex-1 pb-20 pt-2">{children}</main>
            <BottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
