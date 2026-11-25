"use client";

import { useEffect, useRef, useState } from "react";
import type { ExercicioDoTreino, Serie, TreinoDoDia } from "@/lib/treinos/types";
import { adicionarSerie, alternarSerieFeita, atualizarSerie, removerSerie } from "@/lib/treinos/store";
import { gifIdDoExercicio } from "@/lib/treinos/catalogo";
import { tecnicaPorId } from "@/lib/treinos/tecnicas";
import { useMidia } from "@/lib/treinos/midia";
import { dataCurta } from "@/lib/treinos/datas";
import { limparDecimal, limparInteiro, limparTexto, rotulos, somarPasso } from "@/lib/treinos/campos";
import { VisualizadorGif } from "./Gif";
import { IconeBaixo, IconeCheck, IconeDireita, IconeEsquerda, IconeMais, IconeMenos } from "./Icones";

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
function GifCompacto({ exercicioId, nome, tamanho, onAbrir }: { exercicioId: string; nome: string; tamanho: number; onAbrir: () => void }) {
  const gifId = gifIdDoExercicio(exercicioId);
  const src = useMidia("gif", gifId);
  const estilo = { width: tamanho, height: tamanho };
  if (!gifId) return <div className="tg-gif sem" style={estilo} aria-hidden="true" />;
  return (
    <button className="tg-gif-btn" onClick={onAbrir} aria-label={`Ver GIF de ${nome} em tamanho grande`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- GIF animado local
        <img className="tg-gif" src={src} alt={`Demonstração de ${nome}`} width={tamanho} height={tamanho} style={estilo} />
      ) : (
        <span className="tg-gif tr-gif-espera" style={estilo}>
          {src === null ? "—" : "…"}
        </span>
      )}
    </button>
  );
}

const GIF_PEQUENO = 96;
const GIF_MINIMO_EMPILHADO = 130; // abaixo disso, vale mais o GIF ao lado do nome
const GIF_MAXIMO = 380;

type Layout = { modo: "lado" | "empilhado"; gif: number };

/**
 * Mede o espaço livre entre o topo do treino guiado e a barra de abas e decide
 * o tamanho do GIF: pequeno ao lado do nome (telas baixas) ou grande, abaixo
 * do nome, ocupando a sobra (telas altas, como o app instalado).
 */
function useLayoutGuiado(chaves: unknown[]) {
  const raiz = useRef<HTMLDivElement>(null);
  const cabeca = useRef<HTMLDivElement>(null);
  const info = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout>({ modo: "lado", gif: GIF_PEQUENO });
  const layoutAtual = useRef(layout);
  useEffect(() => {
    layoutAtual.current = layout;
  }, [layout]);

  useEffect(() => {
    let quadro = 0;
    const calcular = () => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => {
        const r = raiz.current, c = cabeca.current, i = info.current;
        if (!r || !c || !i) return;
        const barra = document.querySelector("nav")?.getBoundingClientRect().top ?? window.innerHeight;
        // quanto sobra (ou falta, se negativo) até o limite sem rolagem: acima da barra de abas
        // e sem passar da altura da tela somando os espaços que vêm depois do conteúdo
        const rect = r.getBoundingClientRect();
        const fimConteudo = rect.bottom + window.scrollY;
        const main = r.closest("main");
        const pagina = r.closest(".tr-page");
        const espacoDepois =
          (main ? parseFloat(getComputedStyle(main).paddingBottom) || 0 : 0) +
          (pagina ? pagina.getBoundingClientRect().bottom - rect.bottom : 0);
        const limite = Math.min(barra - 8, window.innerHeight - espacoDepois - 1);
        const delta = Math.floor(limite - fimConteudo);
        const atual = layoutAtual.current;
        // tamanho que o GIF empilhado teria para a tela fechar certinho
        const alvo =
          atual.modo === "empilhado" ? atual.gif + delta : delta + c.offsetHeight - i.offsetHeight - 10;
        const gif = Math.floor(Math.min(alvo, c.clientWidth, GIF_MAXIMO));
        const novo: Layout = gif >= GIF_MINIMO_EMPILHADO ? { modo: "empilhado", gif } : { modo: "lado", gif: GIF_PEQUENO };
        setLayout((atual) => (atual.modo === novo.modo && Math.abs(atual.gif - novo.gif) < 4 ? atual : novo));
      });
    };
    calcular();
    window.addEventListener("resize", calcular);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(calcular) : null;
    if (ro && info.current) ro.observe(info.current);
    if (ro && raiz.current) ro.observe(raiz.current);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("resize", calcular);
      ro?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recalcula quando muda o exercício/série
  }, chaves);

  return { raiz, cabeca, info, layout };
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
  const [gifGrande, setGifGrande] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);
  const exAtual = treino.exercicios[Math.min(alvo.ex, treino.exercicios.length - 1)];
  const { raiz, cabeca, info, layout } = useLayoutGuiado([exAtual?.id, exAtual?.series.length, alvo.serie]);

  // deixa a série atual visível na fila de séries (que rola de lado)
  useEffect(() => {
    const lista = raiz.current?.querySelector<HTMLElement>(".tg-series");
    const chip = lista?.querySelector<HTMLElement>(".tg-chip.atual");
    if (lista && chip) lista.scrollTo({ left: chip.offsetLeft - lista.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [raiz, exAtual?.id, alvo.serie, exAtual?.series.length]);

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
    <div className="tg" ref={raiz}>
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
          <button className="tg-ponto novo" onClick={onAdicionarExercicio} aria-label="Adicionar exercício só hoje">
            <IconeMais size={14} />
          </button>
        </div>
      </div>

      <section key={item.id} className={"tg-cartao entra-" + direcao} aria-label={item.nome}>
        <div className={"tg-cabeca " + layout.modo} ref={cabeca}>
          <GifCompacto exercicioId={item.exercicioId} nome={item.nome} tamanho={layout.gif} onAbrir={() => setGifGrande(true)} />
          <div className="tg-info" ref={info}>
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

        <div className="tg-series-linha">
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
          </div>
          <div className="tg-series-acoes">
            <button
              className="tg-chip mais"
              onClick={() => {
                const ultima = item.series[item.series.length - 1];
                if (ultima) removerSerie(chave, item.id, ultima.id);
              }}
              disabled={item.series.length <= 1}
              aria-label={`Remover ${r.linha.toLowerCase()} de ${item.nome}`}
            >
              <IconeMenos size={15} />
            </button>
            <button className="tg-chip mais" onClick={() => adicionarSerie(chave, item.id)} aria-label={`Adicionar ${r.linha.toLowerCase()} em ${item.nome}`}>
              <IconeMais size={15} />
            </button>
          </div>
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

    </div>
  );
}
