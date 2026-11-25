"use client";

import type { TreinoDoDia } from "@/lib/treinos/types";
import { contarSeries } from "@/lib/treinos/store";
import { IconeCheck } from "./Icones";

const CORES = ["#E8531A", "#FF8A3D", "#22C55E", "#60A5FA", "#EDEDF0", "#FACC15"];

function numero(v: string) {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

/** Confete em CSS (respeita "reduzir movimento"). */
function Confete() {
  return (
    <div className="tg-confete" aria-hidden="true">
      {Array.from({ length: 36 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${(i * 37) % 100}%`,
            background: CORES[i % CORES.length],
            animationDelay: `${(i % 9) * 0.07}s`,
            animationDuration: `${1.6 + (i % 5) * 0.25}s`,
            transform: `rotate(${i * 23}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/** Resumo do treino: antes de concluir (confirmação) e depois (comemoração). */
export function Comemoracao({
  treino,
  onConcluir,
  onContinuar,
  onVoltar,
  onVerLista,
}: {
  treino: TreinoDoDia;
  onConcluir: () => void;
  onContinuar: () => void;
  onVoltar: () => void;
  onVerLista: () => void;
}) {
  const c = contarSeries(treino);
  const concluido = treino.status === "concluido";
  const faltam = c.total - c.feitas;
  const volume = treino.exercicios
    .filter((e) => e.tipo !== "cardio")
    .reduce((a, e) => a + e.series.filter((s) => s.feita).reduce((b, s) => b + numero(s.carga) * numero(s.reps), 0), 0);
  const minutos = treino.exercicios
    .filter((e) => e.tipo === "cardio")
    .reduce((a, e) => a + e.series.filter((s) => s.feita).reduce((b, s) => b + numero(s.carga), 0), 0);
  const exerciciosCompletos = treino.exercicios.filter((e) => e.series.length > 0 && e.series.every((s) => s.feita)).length;

  return (
    <div className={"tg-fim" + (concluido ? " concluido" : "")}>
      {concluido && <Confete />}
      <div className="tg-fim-icone">
        <IconeCheck size={40} />
      </div>
      <h2 className="tg-fim-titulo">{concluido ? "Treino concluído!" : faltam === 0 ? "Todas as séries feitas!" : "Finalizar treino?"}</h2>
      <p className="tg-fim-sub">
        {concluido
          ? "Salvo no Histórico. Bom trabalho."
          : faltam === 0
            ? "Mandou bem. Toque em concluir para salvar no Histórico."
            : `${faltam} ${faltam === 1 ? "série ficou" : "séries ficaram"} sem marcar e ${faltam === 1 ? "fica registrada" : "ficam registradas"} como não ${faltam === 1 ? "feita" : "feitas"}.`}
      </p>
      <div className="tg-stats">
        <div>
          <strong>
            {c.feitas}/{c.total}
          </strong>
          <span>séries</span>
        </div>
        <div>
          <strong>
            {exerciciosCompletos}/{treino.exercicios.length}
          </strong>
          <span>exercícios</span>
        </div>
        <div>
          <strong>{minutos > 0 && volume === 0 ? minutos.toLocaleString("pt-BR") : Math.round(volume).toLocaleString("pt-BR")}</strong>
          <span>{minutos > 0 && volume === 0 ? "min de cardio" : "kg de volume"}</span>
        </div>
      </div>
      {concluido ? (
        <div className="tg-fim-botoes">
          <button className="tr-btn tr-btn-primary tr-btn-lg tr-btn-block" onClick={onVoltar}>
            Voltar para os treinos
          </button>
          <button className="tr-btn tr-btn-block" onClick={onVerLista}>
            Ver e editar as séries
          </button>
        </div>
      ) : (
        <div className="tg-fim-botoes">
          <button className="tr-btn tr-btn-success tr-btn-lg tr-btn-block" onClick={onConcluir}>
            <IconeCheck /> Concluir treino
          </button>
          <button className="tr-btn tr-btn-block" onClick={onContinuar}>
            Continuar treinando
          </button>
        </div>
      )}
    </div>
  );
}
