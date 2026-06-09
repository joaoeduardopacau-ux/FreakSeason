"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" fill={active ? "currentColor" : "none"} />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function DumbbellIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v16M18 4v16" strokeWidth={active ? "3" : "2"} />
      <path d="M3 8h3M18 8h3M3 16h3M18 16h3" />
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  );
}

function ForkIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v8m0 0a4 4 0 0 0 4-4M12 10a4 4 0 0 1-4-4M12 10v12" strokeWidth={active ? "2.5" : "2"} />
      <circle cx="12" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4" fill={active ? "currentColor" : "none"} />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

const tabs = [
  { href: "/",        label: "Início",  Icon: HomeIcon },
  { href: "/treinos", label: "Treinos", Icon: DumbbellIcon },
  { href: "/dieta",   label: "Dieta",   Icon: ForkIcon },
  { href: "/perfil",  label: "Perfil",  Icon: PersonIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        background: "#0C0C0E",
        borderTop: "1px solid var(--border)",
        height: "60px",
        maxWidth: "448px",
        margin: "0 auto",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              textDecoration: "none",
              color: active ? "var(--accent)" : "var(--text3)",
              transition: "color 0.15s",
            }}
          >
            <tab.Icon active={active} />
            <span
              style={{
                fontSize: "9px",
                fontWeight: 500,
                letterSpacing: "0.08em",
                fontFamily: "var(--font-inter), sans-serif",
                color: active ? "var(--accent)" : "var(--text3)",
              }}
            >
              {tab.label}
            </span>
            {active && (
              <span
                style={{
                  width: "3px",
                  height: "3px",
                  borderRadius: "999px",
                  background: "var(--accent)",
                  position: "absolute",
                  bottom: "6px",
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
