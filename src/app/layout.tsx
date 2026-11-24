import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import BottomNav from "@/components/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreakSeason · Treinos",
  description: "Monte, execute e acompanhe seus treinos de musculação.",
  appleWebApp: { capable: true, title: "FreakSeason", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0C0C0E",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.variable}>
        <AppProvider>
          <div className="max-w-md mx-auto min-h-screen flex flex-col">
            <main className="flex-1 pb-[calc(76px+env(safe-area-inset-bottom))]">{children}</main>
            <BottomNav />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
