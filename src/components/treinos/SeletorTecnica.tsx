"use client";

import type { TecnicaId, TipoExercicio } from "@/lib/treinos/types";
import { CATEGORIAS_CARDIO, CATEGORIAS_FORCA, TECNICAS } from "@/lib/treinos/tecnicas";
import { Sheet } from "./Sheet";
import { IconeCheck } from "./Icones";

export function SeletorTecnica({
  nome,
  tipo,
  atual,
  ajustaSeries,
  onEscolher,
  onFechar,
}: {
  nome: string;
  tipo: TipoExercicio;
  atual?: TecnicaId;
  ajustaSeries?: boolean;
  onEscolher: (t: TecnicaId) => void;
  onFechar: () => void;
}) {
  const categorias = tipo === "cardio" ? CATEGORIAS_CARDIO : CATEGORIAS_FORCA;
  return (
    <Sheet titulo={tipo === "cardio" ? "Tipo de cardio" : "Técnica do exercício"} onFechar={onFechar} cheia>
      <p className="tr-note" style={{ marginBottom: 4 }}>
        <span>
          {nome}
          {ajustaSeries ? ". As séries são ajustadas para o modelo da técnica e as cargas que você já colocou são mantidas." : "."}
        </span>
      </p>
      {categorias.map((cat) => {
        const lista = TECNICAS.filter((t) => t.tipo === tipo && t.categoria === cat);
        if (lista.length === 0) return null;
        return (
          <div key={cat} role="group" aria-label={cat}>
            <div className="tr-tec-grupo">{cat}</div>
            {lista.map((t) => (
              <button key={t.id} className="tr-ex-item" aria-pressed={t.id === atual} onClick={() => onEscolher(t.id)}>
                <span className="tr-box" style={{ borderRadius: 999 }}>
                  <IconeCheck size={16} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 16, fontWeight: 700 }}>{t.nome}</span>
                  <span style={{ display: "block", fontSize: 13, color: "var(--text2)", marginTop: 2, lineHeight: 1.35 }}>
                    {t.resumo}
                    {t.descanso ? ` Descanso: ${t.descanso}.` : ""}
                  </span>
                  {t.origem && <span className="tr-tec-extra">{t.origem}</span>}
                </span>
              </button>
            ))}
          </div>
        );
      })}
    </Sheet>
  );
}
