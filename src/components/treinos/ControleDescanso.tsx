"use client";

import type { TecnicaId } from "@/lib/treinos/types";
import { formatarTempo, tecnicaPorId } from "@/lib/treinos/tecnicas";
import { iniciarDescanso, iniciarIntervalos } from "@/lib/treinos/temporizador";
import { IconeRelogio } from "./Icones";

const PASSO = 15;

/** Linha "Descanso entre séries: 1:30 [−] [+] [▶]" usada na ficha e no treino. */
export function ControleDescanso({
  nome,
  segundos,
  onMudar,
  podeIniciar,
}: {
  nome: string;
  segundos: number;
  onMudar: (seg: number) => void;
  podeIniciar?: boolean;
}) {
  return (
    <div className="tr-descanso">
      <span className="tr-descanso-rot">Descanso entre séries</span>
      <button className="tr-mini-btn" onClick={() => onMudar(Math.max(5, segundos - PASSO))} aria-label={`Diminuir descanso de ${nome}`}>
        −
      </button>
      <span className="tr-descanso-valor" aria-label={`Descanso de ${nome}: ${formatarTempo(segundos)}`}>
        {formatarTempo(segundos)}
      </span>
      <button className="tr-mini-btn" onClick={() => onMudar(Math.min(600, segundos + PASSO))} aria-label={`Aumentar descanso de ${nome}`}>
        +
      </button>
      {podeIniciar && (
        <button
          className="tr-mini-btn acento"
          onClick={() => iniciarDescanso(segundos, `Descanso · ${nome}`)}
          aria-label={`Iniciar descanso de ${nome}`}
        >
          <IconeRelogio size={16} />
        </button>
      )}
    </div>
  );
}

/** Botão para iniciar o temporizador de intervalos de uma técnica de cardio. */
export function BotaoIntervalos({ nome, tecnica }: { nome: string; tecnica?: TecnicaId }) {
  const t = tecnicaPorId(tecnica);
  if (!t?.intervalo) return null;
  const { trabalho, pausa, rodadas } = t.intervalo;
  const desc = pausa > 0 ? `${rodadas} × ${formatarTempo(trabalho)} / ${formatarTempo(pausa)}` : `${rodadas} × ${formatarTempo(trabalho)}`;
  return (
    <div style={{ padding: "0 14px 10px" }}>
      <button
        className="tr-btn tr-btn-primary tr-btn-block"
        onClick={() => iniciarIntervalos(trabalho, pausa, rodadas, `${t.nome} · ${nome}`)}
        aria-label={`Iniciar intervalos de ${nome}`}
      >
        <IconeRelogio size={20} /> Iniciar intervalos ({desc})
      </button>
    </div>
  );
}
