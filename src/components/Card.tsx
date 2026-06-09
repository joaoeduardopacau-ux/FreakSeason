interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  accent?: boolean;
  style?: React.CSSProperties;
}

export default function Card({ children, className = "", title, accent = false, style }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--s1)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        borderLeft: accent ? "2px solid var(--accent)" : undefined,
        overflow: "hidden",
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            padding: "10px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span className="stat-label">{title}</span>
        </div>
      )}
      <div style={{ padding: "16px" }}>{children}</div>
    </div>
  );
}
