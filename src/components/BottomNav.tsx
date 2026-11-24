"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.6" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <polyline points="3 3 3 8 8 8" />
      <polyline points="12 7 12 12 15 14" />
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

function WeekIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.6" : "2"} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="7" y1="13" x2="9" y2="13" /><line x1="11" y1="13" x2="13" y2="13" /><line x1="15" y1="13" x2="17" y2="13" />
    </svg>
  );
}

const tabs = [
  { href: "/treinos",   label: "Treinos",   Icon: DumbbellIcon },
  { href: "/fichas",    label: "Fichas",    Icon: WeekIcon },
  { href: "/historico", label: "Histórico", Icon: HistoryIcon },
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
        height: "calc(64px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        maxWidth: "448px",
        margin: "0 auto",
      }}
    >
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            style={{
              flex: 1,
              position: "relative",
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
                fontSize: "11px",
                fontWeight: 600,
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
