"use client";

import { useEffect, useRef, useState } from "react";
import type { ExercicioDoTreino, Serie, TreinoDoDia } from "@/lib/treinos/types";
import { adicionarSerie, alternarSerieFeita, atualizarObservacoes, atualizarSerie } from "@/lib/treinos/store";
import { gifIdDoExercicio } from "@/lib/treinos/catalogo";
import { tecnicaPorId } from "@/lib/treinos/tecnicas";
import { useMidia } from "@/lib/treinos/midia";
import { dataCurta } from "@/lib/treinos/datas";
import { limparDecimal, limparInteiro, limparTexto, rotulos, somarPasso } from "@/lib/treinos/campos";
import { IconeBaixo, IconeCheck, IconeDireita, IconeEsquerda, IconeMais } from "./Icones";

type Alvo = { ex: number; serie: number };

/** Primeira série ainda não feita, a partir de um exercício (dá a volta na lista). */
function proximaPendente(treino: TreinoDoDia, aPartirDe: number): Alvo | null {
  const n = treino.exercicios.length;
  for (let k = 0; k < n; k++) {
    const ex = (aPartirDe + k) % n;
    const s = treino.exercicios[ex].series.findIndex((x) => !x.feita);
    if (s >= 0) return { ex, serie: s };
  }
  return null;
}

function vibrar(ms: number | number[]) {
  try {
    navigator.vibrate?.(ms);
  } catch {}
}

/** GIF grande do exercício (anima enquanto a tela está aberta). */
function GifGrande({ exercicioId, nome }: { exercicioId: string; nome: string }) {
  const gifId = gifIdDoExercicio(exercicioId);
  const src = useMidia("gif", gifId);
  if (!gifId) return null;
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- GIF animado local
    <img className="tg-gif" src={src} alt={`Demonstração de ${nome}`} width={240} height={240} />
  ) : (
    <div className="tg-gif tr-gif-espera" role="status">
      {src === null ? "GIF indisponível" : "Carregando…"}
    </div>
  );
}

export function TreinoGuiado({
  chave,
  treino,
  anteriores,
  onTecnica,
  onAdicionarExercicio,
  onFinalizar,
}: {
  chave: string;
  treino: TreinoDoDia;
  anteriores: Map<string, { data: string; series: Serie[] } | null>;
  onTecnica: (item: ExercicioDoTreino) => void;
  onAdicionarExercicio: () => void;
  onFinalizar: () => void;
}) {
  const [alvo, setAlvo] = useState<Alvo>(() => proximaPendente(treino, 0) ?? { ex: 0, serie: 0 });
  const [direcao, setDirecao] = useState<"frente" | "tras">("frente");
  const [acendeu, setAcendeu] = useState<string | null>(null);
  const [obsAberta, setObsAberta] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  const total = treino.exercicios.length;
  const exIdx = Math.min(alvo.ex, total - 1);
  const item = treino.exercicios[exIdx];
  if (!item) return null;
  const serieIdx = Math.min(alvo.serie, item.series.length - 1);
  const serie = item.series[serieIdx];
  const cardio = item.tipo === "cardio";
  const r = rotulos(item.tipo);
  const tec = tecnicaPorId(item.tecnica);
  const anterior = anteriores.get(item.exercicioId) ?? null;
  const ref = anterior?.series[serieIdx];
  const tudoFeito = treino.exercicios.every((e) => e.series.every((x) => x.feita));

  function irPara(ex: number, s?: number) {
    const e = treino.exercicios[ex];
    if (!e) return;
    setDirecao(ex >= exIdx ? "frente" : "tras");
    const pendente = e.series.findIndex((x) => !x.feita);
    setAlvo({ ex, serie: s ?? (pendente >= 0 ? pendente : 0) });
    setObsAberta(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function feito() {
    if (!serie) return;
    const marcando = !serie.feita;
    alternarSerieFeita(chave, item.id, serie.id);
    if (!marcando) return;
    vibrar(30);
    setAcendeu(serie.id);
    // decide o próximo passo com base no estado atualizado
    const depois: TreinoDoDia = {
      ...treino,
      exercicios: treino.exercicios.map((e) =>
        e.id === item.id ? { ...e, series: e.series.map((x) => (x.id === serie.id ? { ...x, feita: true } : x)) } : e
      ),
    };
    const mesma = depois.exercicios[exIdx].series.findIndex((x, k) => k > serieIdx && !x.feita);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setAcendeu(null);
      if (mesma >= 0) {
        setAlvo({ ex: exIdx, serie: mesma });
        return;
      }
      const prox = proximaPendente(depois, exIdx + 1);
      if (prox) {
        vibrar([40, 60, 40]);
        setDirecao("frente");
        setAlvo(prox);
        setObsAberta(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        vibrar([60, 80, 60, 80, 120]);
        onFinalizar();
      }
    }, 450);
  }

  const set = (patch: Partial<Serie>) => atualizarSerie(chave, item.id, serie.id, patch);

  return (
    <div className="tg">
      {/* exercícios do treino */}
      <div className="tg-mapa" role="tablist" aria-label="Exercícios do treino">
        {treino.exercicios.map((e, i) => {
          const completo = e.series.every((x) => x.feita);
          return (
            <button
              key={e.id}
              role="tab"
              aria-selected={i === exIdx}
              aria-label={`${e.nome}${completo ? ", concluído" : ""}`}
              className={"tg-ponto" + (i === exIdx ? " atual" : "") + (completo ? " ok" : "")}
              onClick={() => irPara(i)}
            >
              {completo ? <IconeCheck size={12} /> : i + 1}
            </button>
          );
        })}
      </div>

      <section key={item.id} className={"tg-cartao entra-" + direcao} aria-label={item.nome}>
        <div className="tg-topo">
          <span className="tg-contador">
            Exercício {exIdx + 1} de {total}
          </span>
          <button className="tg-tecnica" onClick={() => onTecnica(item)} aria-label={`Técnica de ${item.nome}: ${tec?.nome ?? "nenhuma"}. Trocar`}>
            {tec?.nome ?? "Técnica"} <IconeBaixo size={14} />
          </button>
        </div>
        <h2 className="tg-nome">{item.nome}</h2>
        <GifGrande exercicioId={item.exercicioId} nome={item.nome} />
        {tec && tec.id !== "tradicional" && tec.id !== "cardio_continuo" && <p className="tg-dica">{tec.comoFazer}</p>}
        {anterior && (
          <p className="tg-anterior">
            Última vez ({dataCurta(anterior.data)}):{" "}
            {anterior.series
              .filter((s) => s.carga || s.reps)
              .map((s) => (cardio ? `${s.carga || "–"} min` : `${s.carga || "–"}×${s.reps || "–"}`))
              .join(" · ")}
          </p>
        )}

        {/* séries */}
        <div className="tg-series" role="group" aria-label={`Séries de ${item.nome}`}>
          {item.series.map((s, i) => (
            <button
              key={s.id}
              className={"tg-chip" + (i === serieIdx ? " atual" : "") + (s.feita ? " feita" : "") + (acendeu === s.id ? " acende" : "")}
              onClick={() => setAlvo({ ex: exIdx, serie: i })}
              aria-label={`${r.linha} ${i + 1}${s.feita ? ", feita" : ""}`}
              aria-pressed={i === serieIdx}
            >
              <span className="tg-chip-num">{s.feita ? <IconeCheck size={13} /> : i + 1}</span>
              <span className="tg-chip-val">
                {s.carga || "–"}
                {cardio ? "′" : "×"}
                {cardio ? "" : s.reps || "–"}
              </span>
            </button>
          ))}
          <button className="tg-chip mais" onClick={() => adicionarSerie(chave, item.id)} aria-label={`Adicionar ${r.linha.toLowerCase()} em ${item.nome}`}>
            <IconeMais size={16} />
          </button>
        </div>

        {serie && (
          <div className={"tg-serie" + (serie.feita ? " feita" : "") + (acendeu === serie.id ? " acende" : "")}>
            <div className="tg-serie-titulo">
              {r.linha} {serieIdx + 1} de {item.series.length}
              {serie.feita && <span className="tg-ok"> · feita</span>}
            </div>

            <div className="tg-campo">
              <span className="tg-rot">{cardio ? "Minutos" : "Carga (kg)"}</span>
              <div className="tg-ajuste">
                <button className="tg-passo" onClick={() => set({ carga: somarPasso(serie.carga, cardio ? -1 : -2.5) })} aria-label={cardio ? "Menos 1 minuto" : "Menos 2,5 kg"}>
                  {cardio ? "−1" : "−2,5"}
                </button>
                <input
                  className="tg-num"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={ref?.carga || r.phA}
                  value={serie.carga}
                  aria-label={cardio ? `Minutos do bloco ${serieIdx + 1} de ${item.nome}` : `Carga em kg da série ${serieIdx + 1} de ${item.nome}`}
                  onChange={(e) => set({ carga: limparDecimal(e.target.value) })}
                />
                <button className="tg-passo" onClick={() => set({ carga: somarPasso(serie.carga, cardio ? 1 : 2.5) })} aria-label={cardio ? "Mais 1 minuto" : "Mais 2,5 kg"}>
                  {cardio ? "+1" : "+2,5"}
                </button>
              </div>
            </div>

            <div className="tg-campo">
              <span className="tg-rot">{cardio ? "Intensidade" : "Repetições"}</span>
              {cardio ? (
                <input
                  className="tg-num texto"
                  type="text"
                  autoComplete="off"
                  placeholder={ref?.reps || r.phB}
                  value={serie.reps}
                  aria-label={`Intensidade do bloco ${serieIdx + 1} de ${item.nome}`}
                  onChange={(e) => set({ reps: limparTexto(e.target.value) })}
                />
              ) : (
                <div className="tg-ajuste">
                  <button className="tg-passo" onClick={() => set({ reps: somarPasso(serie.reps, -1) })} aria-label="Menos 1 repetição">
                    −1
                  </button>
                  <input
                    className="tg-num"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    placeholder={ref?.reps || r.phB}
                    value={serie.reps}
                    aria-label={`Repetições da série ${serieIdx + 1} de ${item.nome}`}
                    onChange={(e) => set({ reps: limparInteiro(e.target.value) })}
                  />
                  <button className="tg-passo" onClick={() => set({ reps: somarPasso(serie.reps, 1) })} aria-label="Mais 1 repetição">
                    +1
                  </button>
                </div>
              )}
            </div>

            {acendeu === serie.id ? (
              <div className="tg-feito ok" role="status">
                <IconeCheck size={26} /> Feita!
              </div>
            ) : (
              <button className={"tg-feito" + (serie.feita ? " desfazer" : "")} onClick={feito}>
                {serie.feita ? (
                  "Desmarcar série"
                ) : (
                  <>
                    <IconeCheck size={26} /> Feito
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <button className="tg-obs-toggle" onClick={() => setObsAberta((v) => !v)} aria-expanded={obsAberta}>
          Observações {item.observacoes ? "· 1" : ""}
          <IconeBaixo size={14} />
        </button>
        {obsAberta && (
          <textarea
            className="tr-obs"
            style={{ width: "100%", margin: "6px 0 0" }}
            rows={2}
            placeholder="Como foi? Ajuste de banco, pegada, sensação…"
            value={item.observacoes}
            aria-label={`Observações de ${item.nome}`}
            onChange={(e) => atualizarObservacoes(chave, item.id, e.target.value)}
          />
        )}
      </section>

      <div className="tg-nav">
        <button className="tr-btn" disabled={exIdx === 0} onClick={() => irPara(exIdx - 1)} aria-label="Exercício anterior">
          <IconeEsquerda size={20} /> Anterior
        </button>
        {exIdx < total - 1 ? (
          <button className="tr-btn" onClick={() => irPara(exIdx + 1)} aria-label="Próximo exercício">
            Próximo <IconeDireita size={20} />
          </button>
        ) : (
          <button className={"tr-btn" + (tudoFeito ? " tr-btn-success" : "")} onClick={onFinalizar}>
            Finalizar <IconeCheck size={20} />
          </button>
        )}
      </div>

      <button className="tr-btn tr-btn-ghost tr-btn-block" style={{ marginTop: 8, color: "var(--text2)", borderColor: "transparent" }} onClick={onAdicionarExercicio}>
        <IconeMais size={18} /> Adicionar exercício só hoje
      </button>
    </div>
  );
}
