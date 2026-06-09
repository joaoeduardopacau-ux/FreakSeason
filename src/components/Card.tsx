const bb = { fontFamily: "var(--font-bebas), Impact, Arial Narrow, sans-serif" };
const bar = { fontFamily: "var(--font-barlow), Arial Narrow, sans-serif" };

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  accent?: boolean;
}

export default function Card({ children, className = "", title, accent = false }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderTop: accent ? "3px solid var(--yellow)" : "1px solid var(--border)",
      }}
    >
      {title && (
        <div style={{ padding: "0.55rem 0.9rem", borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ ...bb, fontSize: "0.9rem", letterSpacing: "0.12em", color: "var(--yellow)" }}>
            {title}
          </span>
          <span style={{ ...bar, fontSize: "0.55rem", color: "var(--grey-dark)", letterSpacing: "0.2em" }}>
            ■■■
          </span>
        </div>
      )}
      <div style={{ padding: "0.9rem" }}>{children}</div>
    </div>
  );
}
