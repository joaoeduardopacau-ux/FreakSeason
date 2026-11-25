import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import RegistrarSW from "@/components/RegistrarSW";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Freak",
  description: "Monte suas fichas, registre cada série e acompanhe seus treinos.",
  applicationName: "Freak",
  appleWebApp: { capable: true, title: "Freak", statusBarStyle: "black" },
  formatDetection: { telephone: false },
  other: { "apple-mobile-web-app-capable": "yes" },
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
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
          <main className="flex-1 pb-[calc(76px+env(safe-area-inset-bottom))]">{children}</main>
          <BottomNav />
          <RegistrarSW />
        </div>
      </body>
    </html>
  );
}
