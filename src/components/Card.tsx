interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  accent?: boolean;
}

export default function Card({ children, className = "", title, accent = false }: CardProps) {
  return (
    <div
      className={`bg-card border border-border-gold rounded-sm p-4 ${className}`}
      style={{
        borderTopColor: accent ? "var(--gold)" : undefined,
        borderTopWidth: accent ? "2px" : undefined,
        boxShadow: "0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,144,10,0.06)",
      }}
    >
      {title && (
        <div className="mb-3">
          <h3
            className="font-oswald uppercase tracking-widest text-gold text-sm font-semibold"
            style={{ letterSpacing: "0.2em" }}
          >
            {title}
          </h3>
          <div className="mt-1 h-px" style={{ background: "linear-gradient(to right, var(--gold), rgba(212,144,10,0.2), transparent)" }} />
        </div>
      )}
      {children}
    </div>
  );
}
