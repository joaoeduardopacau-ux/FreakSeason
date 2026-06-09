import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import BottomNav from "@/components/BottomNav";

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
      <body>
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
