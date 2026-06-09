const bar = { fontFamily: "var(--font-barlow), Arial Narrow, sans-serif" };

interface MacroBarProps {
  label: string;
  atual: number;
  meta: number;
  cor: string;
  unidade?: string;
}

const colorMap: Record<string, string> = {
  "bg-blue-400":   "#1E90FF",
  "bg-yellow-400": "var(--yellow)",
  "bg-orange-400": "#FF6A00",
};

export default function MacroBar({ label, atual, meta, cor, unidade = "g" }: MacroBarProps) {
  const pct = Math.min((atual / meta) * 100, 100);
  const over = atual > meta;
  const fill = over ? "var(--red)" : (colorMap[cor] ?? "var(--yellow)");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <span style={{ ...bar, fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.2em",
          color: "var(--grey)", textTransform: "uppercase" as const }}>
          {label}
        </span>
        <span style={{ ...bar, fontSize: "0.6rem", fontWeight: 700,
          color: over ? "var(--red)" : "var(--grey)" }}>
          {atual}{unidade} / {meta}{unidade}
        </span>
      </div>
      <div style={{ height: "5px", background: "var(--border)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: fill, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}
