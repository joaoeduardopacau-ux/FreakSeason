interface MacroBarProps {
  label: string;
  atual: number;
  meta: number;
  cor: string;
  unidade?: string;
}

export default function MacroBar({ label, atual, meta, cor, unidade = "g" }: MacroBarProps) {
  const pct = Math.min((atual / meta) * 100, 100);
  const excedeu = atual > meta;

  // Map old Tailwind color classes to CSS color values for vintage theme
  const colorMap: Record<string, string> = {
    "bg-blue-400": "var(--gold-light)",
    "bg-yellow-400": "var(--gold)",
    "bg-orange-400": "#C87020",
    "bg-green-400": "var(--gold-light)",
  };
  const fillColor = excedeu ? "var(--red)" : (colorMap[cor] ?? "var(--gold)");

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span
          className="font-oswald uppercase tracking-widest text-muted"
          style={{ fontSize: "0.65rem", letterSpacing: "0.15em" }}
        >
          {label}
        </span>
        <span
          className="font-oswald"
          style={{
            fontSize: "0.65rem",
            color: excedeu ? "var(--red)" : "var(--muted)",
            fontWeight: excedeu ? "700" : "400",
          }}
        >
          {atual}{unidade} / {meta}{unidade}
        </span>
      </div>
      <div
        className="h-2 rounded-sm overflow-hidden"
        style={{ background: "#1E1400" }}
      >
        <div
          className="h-full rounded-sm transition-all"
          style={{
            width: `${pct}%`,
            background: excedeu
              ? `linear-gradient(90deg, var(--red), #B02020)`
              : `linear-gradient(90deg, ${fillColor}, ${fillColor}cc)`,
            boxShadow: excedeu ? "0 0 6px rgba(139,26,26,0.6)" : `0 0 6px rgba(212,144,10,0.4)`,
          }}
        />
      </div>
    </div>
  );
}
