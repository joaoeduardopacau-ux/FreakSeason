"use client";

import type { ItemPlano } from "@/lib/treinos/types";
import {
  adicionarSerieFicha,
  atualizarObservacoesFicha,
  atualizarSerieFicha,
  moverItemFicha,
  removerSerieFicha,
} from "@/lib/treinos/store";
import { limparDecimal, limparInteiro, limparTexto, rotulos } from "@/lib/treinos/campos";
import { ChipTecnica } from "./ChipTecnica";
import { IconeBaixo, IconeCima, IconeLixo, IconeMais, IconeMenos } from "./Icones";

/** Exercício dentro de uma ficha: técnica + metas por série (sem marcar como feita). */
export function CartaoItemPlano({
  fichaId,
  item,
  indice,
  total,
  onRemover,
  onTecnica,
}: {
  fichaId: string;
  item: ItemPlano;
  indice: number;
  total: number;
  onRemover: () => void;
  onTecnica: () => void;
}) {
  const cardio = item.tipo === "cardio";
  const r = rotulos(item.tipo);

  return (
    <section className="tr-card" aria-label={item.nome}>
      <div className="tr-card-head">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="tr-card-title">{item.nome}</div>
          <div className="tr-card-sub">
            {item.grupo} · {item.series.length} {cardio ? (item.series.length === 1 ? "bloco" : "blocos") : item.series.length === 1 ? "série" : "séries"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="tr-icon-btn tr-icon-btn-sm"
            onClick={() => moverItemFicha(fichaId, item.id, -1)}
            disabled={indice === 0}
            aria-label={`Mover ${item.nome} para cima`}
          >
            <IconeCima size={20} />
          </button>
          <button
            className="tr-icon-btn tr-icon-btn-sm"
            onClick={() => moverItemFicha(fichaId, item.id, 1)}
            disabled={indice === total - 1}
            aria-label={`Mover ${item.nome} para baixo`}
          >
            <IconeBaixo size={20} />
          </button>
          <button className="tr-icon-btn tr-icon-btn-sm" style={{ color: "var(--red)" }} onClick={onRemover} aria-label={`Remover ${item.nome}`}>
            <IconeLixo size={19} />
          </button>
        </div>
      </div>

      <ChipTecnica tecnica={item.tecnica} nome={item.nome} onClick={onTecnica} />

      <div className="tr-sets-head plano" aria-hidden="true">
        <span style={{ textAlign: "center" }}>{r.linha}</span>
        <span>{cardio ? r.a : "Carga meta (kg)"}</span>
        <span>{cardio ? r.b : "Reps meta"}</span>
      </div>

      {item.series.map((s, i) => (
        <div key={s.id} className="tr-set plano">
          <div className="tr-set-num">{i + 1}</div>
          <input
            className="tr-num"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder={r.phA}
            value={s.carga}
            aria-label={cardio ? `Minutos do bloco ${i + 1} de ${item.nome}` : `Carga meta da série ${i + 1} de ${item.nome}`}
            onChange={(e) => atualizarSerieFicha(fichaId, item.id, s.id, { carga: limparDecimal(e.target.value) })}
          />
          {cardio ? (
            <input
              className="tr-num texto"
              type="text"
              autoComplete="off"
              placeholder={r.phB}
              value={s.reps}
              aria-label={`Intensidade do bloco ${i + 1} de ${item.nome}`}
              onChange={(e) => atualizarSerieFicha(fichaId, item.id, s.id, { reps: limparTexto(e.target.value) })}
            />
          ) : (
            <input
              className="tr-num"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              placeholder={r.phB}
              value={s.reps}
              aria-label={`Repetições meta da série ${i + 1} de ${item.nome}`}
              onChange={(e) => atualizarSerieFicha(fichaId, item.id, s.id, { reps: limparInteiro(e.target.value) })}
            />
          )}
        </div>
      ))}

      <div className="tr-card-foot">
        <button
          className="tr-btn"
          onClick={() => removerSerieFicha(fichaId, item.id)}
          disabled={item.series.length <= 1}
          aria-label={`Remover a última série de ${item.nome}`}
        >
          <IconeMenos size={20} /> {r.linha}
        </button>
        <button className="tr-btn" onClick={() => adicionarSerieFicha(fichaId, item.id)} aria-label={`Adicionar série em ${item.nome}`}>
          <IconeMais size={20} /> {r.linha}
        </button>
      </div>

      <textarea
        className="tr-obs"
        rows={1}
        placeholder="Observações (opcional)"
        value={item.observacoes}
        aria-label={`Observações de ${item.nome}`}
        onChange={(e) => atualizarObservacoesFicha(fichaId, item.id, e.target.value)}
      />
    </section>
  );
}
