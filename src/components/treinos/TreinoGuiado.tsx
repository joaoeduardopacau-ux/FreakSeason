"use client";

import { useEffect, useRef, useState } from "react";
import type { ExercicioDoTreino, Serie, TreinoDoDia } from "@/lib/treinos/types";
import { adicionarSerie, alternarSerieFeita, atualizarObservacoes, atualizarSerie } from "@/lib/treinos/store";
import { gifIdDoExercicio } from "@/lib/treinos/catalogo";
import { tecnicaPorId } from "@/lib/treinos/tecnicas";
import { useMidia } from "@/lib/treinos/midia";
import { dataCurta } from "@/lib/treinos/datas";
import { limparDecimal, limparInteiro, limparTexto, rotulos, somarPasso } from "@/lib/treinos/campos";
import { VisualizadorGif } from "./Gif";
import { Sheet } from "./Sheet";
import { IconeBaixo, IconeCheck, IconeDireita, IconeEsquerda, IconeMais, IconeMaisOpcoes } from "./Icones";

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

/** GIF do exercício (animado); tocar abre em tamanho grande. */
function GifCompacto({ exercicioId, nome, onAbrir }: { exercicioId: string; nome: string; onAbrir: () => void }) {
  const gifId = gifIdDoExercicio(exercicioId);
  const src = useMidia("gif", gifId);
  if (!gifId) return <div className="tg-gif sem" aria-hidden="true" />;
  return (
    <button className="tg-gif-btn" onClick={onAbrir} aria-label={`Ver GIF de ${nome} em tamanho grande`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- GIF animado local
        <img className="tg-gif" src={src} alt={`Demonstração de ${nome}`} width={104} height={104} />
      ) : (
        <span className="tg-gif tr-gif-espera">{src === null ? "—" : "…"}</span>
      )}
    </button>
  );
}

export function TreinoGuiado({
  chave,
  treino,
  anteriores,
  onTecnica,
  onAdicionarExercicio,
  onDescartar,
  onFinalizar,
}: {
  chave: string;
  treino: TreinoDoDia;
  anteriores: Map<string, { data: string; series: Serie[] } | null>;
  onTecnica: (item: ExercicioDoTreino) => void;
  onAdicionarExercicio: () => void;
  onDescartar: () => void;
  onFinalizar: () => void;
}) {
  const [alvo, setAlvo] = useState<Alvo>(() => proximaPendente(treino, 0) ?? { ex: 0, serie: 0 });
  const [direcao, setDirecao] = useState<"frente" | "tras">("frente");
  const [acendeu, setAcendeu] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [gifGrande, setGifGrande] = useState(false);
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
  const passos = cardio ? [-5, -1, 1, 5] : [-5, -2, 2, 5];

  function irPara(ex: number) {
    const e = treino.exercicios[ex];
    if (!e) return;
    setDirecao(ex >= exIdx ? "frente" : "tras");
    const pendente = e.series.findIndex((x) => !x.feita);
    setAlvo({ ex, serie: pendente >= 0 ? pendente : 0 });
  }

  function feito() {
    if (!serie) return;
    const marcando = !serie.feita;
    alternarSerieFeita(chave, item.id, serie.id);
    if (!marcando) return;
    vibrar(30);
    setAcendeu(serie.id);
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
      } else {
        vibrar([60, 80, 60, 80, 120]);
        onFinalizar();
      }
    }, 450);
  }

  const set = (patch: Partial<Serie>) => atualizarSerie(chave, item.id, serie.id, patch);
  const formatarPasso = (p: number) => `${p > 0 ? "+" : "−"}${Math.abs(p)}`;

  return (
    <div className="tg">
      <div className="tg-linha-mapa">
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
        <button className="tg-mais" onClick={() => setMenu(true)} aria-label="Mais opções do treino">
          <IconeMaisOpcoes size={20} />
        </button>
      </div>

      <section key={item.id} className={"tg-cartao entra-" + direcao} aria-label={item.nome}>
        <div className="tg-cabeca">
          <GifCompacto exercicioId={item.exercicioId} nome={item.nome} onAbrir={() => setGifGrande(true)} />
          <div className="tg-info">
            <span className="tg-contador">
              Exercício {exIdx + 1} de {total}
            </span>
            <h2 className="tg-nome">{item.nome}</h2>
            <button className="tg-tecnica" onClick={() => onTecnica(item)} aria-label={`Técnica de ${item.nome}: ${tec?.nome ?? "nenhuma"}. Trocar`}>
              <span>{tec?.nome ?? "Técnica"}</span> <IconeBaixo size={14} />
            </button>
            {anterior && (
              <span className="tg-anterior">
                Última ({dataCurta(anterior.data).slice(0, 5)}):{" "}
                {anterior.series
                  .filter((s) => s.carga || s.reps)
                  .map((s) => (cardio ? `${s.carga || "–"}′` : `${s.carga || "–"}×${s.reps || "–"}`))
                  .join(" ")}
              </span>
            )}
          </div>
        </div>

        <div className="tg-series" role="group" aria-label={`Séries de ${item.nome}`}>
          {item.series.map((s, i) => (
            <button
              key={s.id}
              className={"tg-chip" + (i === serieIdx ? " atual" : "") + (s.feita ? " feita" : "") + (acendeu === s.id ? " acende" : "")}
              onClick={() => setAlvo({ ex: exIdx, serie: i })}
              aria-label={`${r.linha} ${i + 1}${s.feita ? ", feita" : ""}`}
              aria-pressed={i === serieIdx}
            >
              <span className="tg-chip-num">{s.feita ? <IconeCheck size={12} /> : i + 1}</span>
              <span className="tg-chip-val">
                {s.carga || "–"}
                {cardio ? "′" : "×"}
                {cardio ? "" : s.reps || "–"}
              </span>
            </button>
          ))}
          <button className="tg-chip mais" onClick={() => adicionarSerie(chave, item.id)} aria-label={`Adicionar ${r.linha.toLowerCase()} em ${item.nome}`}>
            <IconeMais size={15} />
          </button>
        </div>

        {serie && (
          <div className={"tg-serie" + (serie.feita ? " feita" : "") + (acendeu === serie.id ? " acende" : "")}>
            <div className="tg-sr" aria-live="polite">
              {r.linha} {serieIdx + 1} de {item.series.length}
              {serie.feita ? " · feita" : ""}
            </div>

            <div className="tg-ajuste carga">
              {passos.slice(0, 2).map((p) => (
                <button key={p} className="tg-passo" onClick={() => set({ carga: somarPasso(serie.carga, p) })} aria-label={cardio ? `${formatarPasso(p)} minutos` : `${formatarPasso(p)} kg`}>
                  {formatarPasso(p)}
                </button>
              ))}
              <label className="tg-num-caixa">
                <span className="tg-unid">{cardio ? "min" : "kg"}</span>
                <input
                  className="tg-num"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder={ref?.carga || "0"}
                  value={serie.carga}
                  aria-label={cardio ? `Minutos do bloco ${serieIdx + 1} de ${item.nome}` : `Carga em kg da série ${serieIdx + 1} de ${item.nome}`}
                  onChange={(e) => set({ carga: limparDecimal(e.target.value) })}
                />
              </label>
              {passos.slice(2).map((p) => (
                <button key={p} className="tg-passo" onClick={() => set({ carga: somarPasso(serie.carga, p) })} aria-label={cardio ? `${formatarPasso(p)} minutos` : `${formatarPasso(p)} kg`}>
                  {formatarPasso(p)}
                </button>
              ))}
            </div>

            {cardio ? (
              <input
                className="tg-num texto tg-espaco"
                type="text"
                autoComplete="off"
                placeholder={ref?.reps || r.phB}
                value={serie.reps}
                aria-label={`Intensidade do bloco ${serieIdx + 1} de ${item.nome}`}
                onChange={(e) => set({ reps: limparTexto(e.target.value) })}
              />
            ) : (
              <div className="tg-ajuste reps tg-espaco">
                <button className="tg-passo" onClick={() => set({ reps: somarPasso(serie.reps, -1) })} aria-label="Menos 1 repetição">
                  −1
                </button>
                <label className="tg-num-caixa">
                  <span className="tg-unid">reps</span>
                  <input
                    className="tg-num"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    placeholder={ref?.reps || "0"}
                    value={serie.reps}
                    aria-label={`Repetições da série ${serieIdx + 1} de ${item.nome}`}
                    onChange={(e) => set({ reps: limparInteiro(e.target.value) })}
                  />
                </label>
                <button className="tg-passo" onClick={() => set({ reps: somarPasso(serie.reps, 1) })} aria-label="Mais 1 repetição">
                  +1
                </button>
              </div>
            )}

            {acendeu === serie.id ? (
              <div className="tg-feito ok" role="status">
                <IconeCheck size={24} /> Feita!
              </div>
            ) : (
              <button className={"tg-feito" + (serie.feita ? " desfazer" : "")} onClick={feito}>
                {serie.feita ? (
                  "Desmarcar série"
                ) : (
                  <>
                    <IconeCheck size={24} /> Feito
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </section>

      <div className="tg-nav">
        <button className="tr-btn" disabled={exIdx === 0} onClick={() => irPara(exIdx - 1)} aria-label="Exercício anterior">
          <IconeEsquerda size={18} /> Anterior
        </button>
        {exIdx < total - 1 ? (
          <button className="tr-btn" onClick={() => irPara(exIdx + 1)} aria-label="Próximo exercício">
            Próximo <IconeDireita size={18} />
          </button>
        ) : (
          <button className={"tr-btn" + (tudoFeito ? " tr-btn-success" : "")} onClick={onFinalizar}>
            Finalizar <IconeCheck size={18} />
          </button>
        )}
      </div>

      {gifGrande && (
        <VisualizadorGif exercicioId={item.exercicioId} nome={item.nome} grupo={item.grupo} tecnica={item.tecnica} onFechar={() => setGifGrande(false)} />
      )}

      {menu && (
        <Sheet titulo={item.nome} onFechar={() => setMenu(false)}>
          <label className="tr-field-label" htmlFor="tg-obs" style={{ marginTop: 0 }}>
            Observações deste exercício
          </label>
          <textarea
            id="tg-obs"
            className="tr-obs"
            style={{ width: "100%", margin: 0 }}
            rows={3}
            placeholder="Ajuste de banco, pegada, sensação…"
            value={item.observacoes}
            aria-label={`Observações de ${item.nome}`}
            onChange={(e) => atualizarObservacoes(chave, item.id, e.target.value)}
          />
          {tec && (
            <p className="tr-note" style={{ marginTop: 12, display: "block" }}>
              <strong style={{ color: "var(--text)" }}>{tec.nome}:</strong> {tec.comoFazer}
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
            <button
              className="tr-btn tr-btn-block"
              onClick={() => {
                setMenu(false);
                onAdicionarExercicio();
              }}
            >
              <IconeMais size={18} /> Adicionar exercício só hoje
            </button>
            <button
              className="tr-btn tr-btn-ghost tr-btn-block"
              style={{ color: "var(--red)", borderColor: "transparent" }}
              onClick={() => {
                setMenu(false);
                onDescartar();
              }}
            >
              Descartar este treino
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
