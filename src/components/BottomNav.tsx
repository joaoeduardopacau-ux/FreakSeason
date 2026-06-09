"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/",        label: "INÍCIO",  icon: "⌂" },
  { href: "/treinos", label: "TREINOS", icon: "▲" },
  { href: "/dieta",   label: "DIETA",   icon: "◉" },
  { href: "/perfil",  label: "PERFIL",  icon: "◈" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      display: "flex", background: "#000000", borderTop: "2px solid var(--yellow)",
      maxWidth: "448px", margin: "0 auto" }}>
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "0.5rem 0",
              background: active ? "var(--yellow)" : "transparent",
              transition: "background 0.15s" }}>
            <span style={{ fontSize: "1rem", color: active ? "#000" : "var(--grey-dark)", lineHeight: 1 }}>
              {tab.icon}
            </span>
            <span style={{
              fontFamily: "var(--font-barlow), Arial Narrow, sans-serif",
              fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.15em",
              color: active ? "#000000" : "var(--grey-dark)",
              marginTop: "0.15rem",
            }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
