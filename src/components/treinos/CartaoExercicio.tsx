"use client";

import type { ExercicioDoTreino, Serie } from "@/lib/treinos/types";
import {
  adicionarSerie,
  atualizarObservacoes,
  atualizarSerie,
  moverExercicio,
  removerSerie,
} from "@/lib/treinos/store";
import { dataCurta } from "@/lib/treinos/datas";
import { IconeBaixo, IconeCheck, IconeCima, IconeLixo, IconeMais, IconeMenos } from "./Icones";

function limparCarga(v: string) {
  // aceita "22,5" ou "22.5"; mantém só um separador decimal
  let s = v.replace(/[^\d.,]/g, "").replace(".", ",");
  const i = s.indexOf(",");
  if (i >= 0) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/,/g, "");
  return s.slice(0, 6);
}

function limparReps(v: string) {
  return v.replace(/\D/g, "").slice(0, 3);
}

export function CartaoExercicio({
  data,
  item,
  indice,
  total,
  anterior,
  onRemover,
}: {
  data: string;
  item: ExercicioDoTreino;
  indice: number;
  total: number;
  anterior: { data: string; series: Serie[] } | null;
  onRemover: () => void;
}) {
  const feitas = item.series.filter((s) => s.feita).length;

  return (
    <section className="tr-card" aria-label={item.nome}>
      <div className="tr-card-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tr-card-title">{item.nome}</div>
          <div className="tr-card-sub">
            {item.grupo} · {feitas}/{item.series.length} séries feitas
          </div>
          {anterior && (
            <div className="tr-card-sub" style={{ fontSize: 12 }}>
              Última vez ({dataCurta(anterior.data)}):{" "}
              {anterior.series
                .filter((s) => s.carga || s.reps)
                .map((s) => `${s.carga || "–"}kg×${s.reps || "–"}`)
                .join(", ")}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="tr-icon-btn tr-icon-btn-sm"
            onClick={() => moverExercicio(data, item.id, -1)}
            disabled={indice === 0}
            aria-label={`Mover ${item.nome} para cima`}
          >
            <IconeCima size={20} />
          </button>
          <button
            className="tr-icon-btn tr-icon-btn-sm"
            onClick={() => moverExercicio(data, item.id, 1)}
            disabled={indice === total - 1}
            aria-label={`Mover ${item.nome} para baixo`}
          >
            <IconeBaixo size={20} />
          </button>
          <button
            className="tr-icon-btn tr-icon-btn-sm"
            style={{ color: "var(--red)" }}
            onClick={onRemover}
            aria-label={`Remover ${item.nome}`}
          >
            <IconeLixo size={19} />
          </button>
        </div>
      </div>

      <div className="tr-sets-head" aria-hidden="true">
        <span style={{ textAlign: "center" }}>Série</span>
        <span>Carga (kg)</span>
        <span>Reps</span>
        <span style={{ textAlign: "center" }}>Feita</span>
      </div>

      {item.series.map((s, i) => {
        const ref = anterior?.series[i];
        return (
          <div key={s.id} className={"tr-set" + (s.feita ? " feita" : "")}>
            <div className="tr-set-num">{i + 1}</div>
            <input
              className="tr-num"
              type="text"
              inputMode="decimal"
              enterKeyHint="next"
              autoComplete="off"
              placeholder={ref?.carga || "kg"}
              value={s.carga}
              aria-label={`Carga em kg da série ${i + 1} de ${item.nome}`}
              onChange={(e) => atualizarSerie(data, item.id, s.id, { carga: limparCarga(e.target.value) })}
            />
            <input
              className="tr-num"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              enterKeyHint="done"
              autoComplete="off"
              placeholder={ref?.reps || "reps"}
              value={s.reps}
              aria-label={`Repetições da série ${i + 1} de ${item.nome}`}
              onChange={(e) => atualizarSerie(data, item.id, s.id, { reps: limparReps(e.target.value) })}
            />
            <button
              className="tr-check"
              aria-pressed={s.feita}
              aria-label={`Marcar série ${i + 1} de ${item.nome} como feita`}
              onClick={() => atualizarSerie(data, item.id, s.id, { feita: !s.feita })}
            >
              <IconeCheck size={26} />
            </button>
          </div>
        );
      })}

      <div className="tr-card-foot">
        <button
          className="tr-btn"
          onClick={() => {
            const ultima = item.series[item.series.length - 1];
            if (ultima) removerSerie(data, item.id, ultima.id);
          }}
          disabled={item.series.length <= 1}
          aria-label={`Remover a última série de ${item.nome}`}
        >
          <IconeMenos size={20} /> Série
        </button>
        <button className="tr-btn" onClick={() => adicionarSerie(data, item.id)} aria-label={`Adicionar série em ${item.nome}`}>
          <IconeMais size={20} /> Série
        </button>
      </div>

      <textarea
        className="tr-obs"
        rows={1}
        placeholder="Observações (opcional)"
        value={item.observacoes}
        aria-label={`Observações de ${item.nome}`}
        onChange={(e) => atualizarObservacoes(data, item.id, e.target.value)}
      />
    </section>
  );
}
