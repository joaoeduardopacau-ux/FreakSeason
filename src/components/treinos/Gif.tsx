"use client";

import { useState } from "react";
import type { GrupoMuscular, TecnicaId } from "@/lib/treinos/types";
import { gifDoExercicio } from "@/lib/treinos/catalogo";
import { tecnicaPorId } from "@/lib/treinos/tecnicas";
import { Sheet } from "./Sheet";

/** Miniatura do GIF (ou um quadro vazio quando o exercício não tem GIF). */
export function MiniGif({ exercicioId, tamanho = 52 }: { exercicioId: string; tamanho?: number }) {
  const src = gifDoExercicio(exercicioId);
  const [erro, setErro] = useState(false);
  if (!src || erro) {
    return <span className="tr-gif-mini vazio" style={{ width: tamanho, height: tamanho }} aria-hidden="true" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- GIF animado local; next/image não anima sem unoptimized
    <img
      className="tr-gif-mini"
      src={src}
      alt=""
      width={tamanho}
      height={tamanho}
      loading="lazy"
      decoding="async"
      onError={() => setErro(true)}
    />
  );
}

/** Botão "Ver GIF" com miniatura; abre o GIF grande numa folha. */
export function BotaoGif({
  exercicioId,
  nome,
  grupo,
  tecnica,
}: {
  exercicioId: string;
  nome: string;
  grupo: GrupoMuscular;
  tecnica?: TecnicaId;
}) {
  const [aberto, setAberto] = useState(false);
  if (!gifDoExercicio(exercicioId)) return null;
  return (
    <>
      <button className="tr-gif-btn" onClick={() => setAberto(true)} aria-label={`Ver GIF de ${nome}`}>
        <MiniGif exercicioId={exercicioId} tamanho={56} />
        <span className="tr-gif-btn-rot">Ver GIF</span>
      </button>
      {aberto && <VisualizadorGif exercicioId={exercicioId} nome={nome} grupo={grupo} tecnica={tecnica} onFechar={() => setAberto(false)} />}
    </>
  );
}

export function VisualizadorGif({
  exercicioId,
  nome,
  grupo,
  tecnica,
  onFechar,
}: {
  exercicioId: string;
  nome: string;
  grupo: GrupoMuscular;
  tecnica?: TecnicaId;
  onFechar: () => void;
}) {
  const src = gifDoExercicio(exercicioId);
  const t = tecnicaPorId(tecnica);
  return (
    <Sheet titulo={nome} onFechar={onFechar}>
      <p style={{ fontSize: 14, color: "var(--text2)", marginTop: -4, marginBottom: 12 }}>{grupo}</p>
      {src && (
        // eslint-disable-next-line @next/next/no-img-element -- GIF animado local
        <img className="tr-gif-grande" src={src} alt={`Demonstração de ${nome}`} width={360} height={360} />
      )}
      {t && (
        <div style={{ marginTop: 14, background: "var(--s2)", borderRadius: 12, padding: "12px 14px" }}>
          <div className="tr-tecnica-rot">{t.tipo === "cardio" ? "Tipo" : "Técnica"}: {t.nome}</div>
          <p style={{ fontSize: 14, lineHeight: 1.45, marginTop: 6 }}>
            {t.comoFazer}
            {t.descanso ? ` Descanso: ${t.descanso}.` : ""}
          </p>
        </div>
      )}
      <button className="tr-btn tr-btn-block" style={{ marginTop: 16 }} onClick={onFechar}>
        Fechar
      </button>
    </Sheet>
  );
}
