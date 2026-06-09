interface MacroBarProps {
  label: string;
  atual: number;
  meta: number;
  cor: "protein" | "carbs" | "fat";
  unidade?: string;
}

const colorMap: Record<string, string> = {
  protein: "var(--blue)",
  carbs: "var(--green)",
  fat: "var(--accent)",
};

export default function MacroBar({ label, atual, meta, cor, unidade = "g" }: MacroBarProps) {
  const pct = meta > 0 ? Math.min((atual / meta) * 100, 100) : 0;
  const over = atual > meta;
  const fill = over ? "var(--red)" : (colorMap[cor] ?? "var(--accent)");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
        <span className="stat-label">{label}</span>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: over ? "var(--red)" : "var(--text2)",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          {atual}{unidade} / {meta}{unidade}
        </span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: fill }}
        />
      </div>
    </div>
  );
}
