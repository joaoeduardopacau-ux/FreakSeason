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

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span className="font-medium">{label}</span>
        <span className={excedeu ? "text-red-500 font-semibold" : ""}>
          {atual}{unidade} / {meta}{unidade}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${excedeu ? "bg-red-400" : cor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
