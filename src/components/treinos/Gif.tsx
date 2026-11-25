"use client";

import { useEffect, useRef, useState } from "react";
import type { GrupoMuscular, TecnicaId } from "@/lib/treinos/types";
import { gifIdDoExercicio } from "@/lib/treinos/catalogo";
import { useDescricao, useMidia } from "@/lib/treinos/midia";
import { Sheet } from "./Sheet";

/** Só fica true quando o elemento chega perto da área visível. */
function useVisivel<T extends Element>() {
  const ref = useRef<T>(null);
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visivel) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = setTimeout(() => setVisivel(true), 0);
      return () => clearTimeout(t);
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisivel(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visivel]);
  return [ref, visivel] as const;
}

/** Miniatura estática do exercício (leve), ou um quadro vazio quando não há GIF. */
export function MiniGif({ exercicioId, tamanho = 52 }: { exercicioId: string; tamanho?: number }) {
  const gifId = gifIdDoExercicio(exercicioId);
  const [ref, visivel] = useVisivel<HTMLSpanElement>();
  const src = useMidia("thumb", gifId, visivel);
  const [erro, setErro] = useState(false);
  return (
    <span ref={ref} className="tr-gif-caixa" style={{ width: tamanho, height: tamanho }} aria-hidden="true">
      {gifId && src && !erro ? (
        // eslint-disable-next-line @next/next/no-img-element -- miniatura local
        <img className="tr-gif-mini" src={src} alt="" width={tamanho} height={tamanho} loading="lazy" decoding="async" onError={() => setErro(true)} />
      ) : (
        <span className={"tr-gif-mini vazio" + (gifId && src === undefined ? " carregando" : "")} style={{ width: tamanho, height: tamanho }} />
      )}
    </span>
  );
}

/** Botão "Ver GIF" com miniatura; abre o GIF animado numa folha. */
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
  if (!gifIdDoExercicio(exercicioId)) return null;
  return (
    <>
      <button className="tr-gif-btn" onClick={() => setAberto(true)} aria-label={`Ver GIF de ${nome}`}>
        <MiniGif exercicioId={exercicioId} tamanho={56} />
        <span className="tr-gif-btn-rot">Ver GIF</span>
      </button>
      {aberto && (
        <VisualizadorGif exercicioId={exercicioId} nome={nome} grupo={grupo} tecnica={tecnica} onFechar={() => setAberto(false)} />
      )}
    </>
  );
}

export function VisualizadorGif({
  exercicioId,
  nome,
  grupo,
  onFechar,
}: {
  exercicioId: string;
  nome: string;
  grupo: GrupoMuscular;
  tecnica?: TecnicaId;
  onFechar: () => void;
}) {
  const src = useMidia("gif", gifIdDoExercicio(exercicioId));
  const passos = useDescricao(gifIdDoExercicio(exercicioId));
  return (
    <Sheet titulo={nome} onFechar={onFechar}>
      <p style={{ fontSize: 14, color: "var(--text2)", marginTop: -4, marginBottom: 12 }}>{grupo}</p>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- GIF animado local
        <img className="tr-gif-grande" src={src} alt={`Demonstração de ${nome}`} width={360} height={360} />
      ) : (
        <div className="tr-gif-grande tr-gif-espera" role="status">
          {src === null ? "GIF indisponível" : "Carregando GIF…"}
        </div>
      )}
      {passos === undefined ? (
        <p className="tr-note" role="status" style={{ marginTop: 14, display: "block" }}>
          Carregando descrição…
        </p>
      ) : passos && passos.length > 0 ? (
        <>
          <div className="tr-tecnica-rot" style={{ marginTop: 16 }}>
            Como fazer
          </div>
          <ol className="tr-como">
            {passos.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ol>
        </>
      ) : null}
      <button className="tr-btn tr-btn-block" style={{ marginTop: 16 }} onClick={onFechar}>
        Fechar
      </button>
    </Sheet>
  );
}
