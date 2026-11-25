"use client";

import { useState } from "react";
import type { ExercicioDoTreino, Serie, TreinoDoDia } from "@/lib/treinos/types";
import {
  adicionarSerie,
  alternarSerieFeita,
  atualizarObservacoes,
  atualizarSerie,
  trocarExercicios,
  removerSerie,
} from "@/lib/treinos/store";
import { tecnicaPorId } from "@/lib/treinos/tecnicas";
import { dataCurta } from "@/lib/treinos/datas";
import { limparDecimal, limparInteiro, limparTexto } from "@/lib/treinos/campos";
import { MiniGif, VisualizadorGif } from "./Gif";
import { Sheet } from "./Sheet";
import { IconeBaixo, IconeCheck, IconeCima, IconeLixo, IconeMais, IconeMaisOpcoes, IconeMenos } from "./Icones";

type Anteriores = Map<string, { data: string; series: Serie[] } | null>;

/** Um exercício em formato compacto: cabeçalho numa linha e uma linha baixa por série. */
function ExercicioCompacto({
  chave,
  item,
  anterior,
  aberto,
  onAlternar,
  onMenu,
  onGif,
}: {
  chave: string;
  item: ExercicioDoTreino;
  anterior: { data: string; series: Serie[] } | null;
  aberto: boolean;
  onAlternar?: () => void;
  onMenu: () => void;
  onGif: () => void;
}) {
  const cardio = item.tipo === "cardio";
  const feitas = item.series.filter((s) => s.feita).length;
  const tec = tecnicaPorId(item.tecnica);
  const completo = feitas === item.series.length && item.series.length > 0;

  return (
    <section className={"lc-ex" + (completo ? " completo" : "")} aria-label={item.nome}>
      <div className="lc-topo">
        <button className="lc-thumb" onClick={onGif} aria-label={`Ver GIF de ${item.nome}`}>
          <MiniGif exercicioId={item.exercicioId} tamanho={44} />
        </button>
        <button className="lc-titulo" onClick={onAlternar} disabled={!onAlternar} aria-expanded={onAlternar ? aberto : undefined}>
          <span className="lc-nome">{item.nome}</span>
          <span className="lc-sub">
            {tec && tec.id !== "tradicional" && tec.id !== "cardio_continuo" ? <span className="lc-tec">{tec.nome}</span> : null}
            <span>
              {feitas}/{item.series.length} {cardio ? "blocos" : "séries"}
            </span>
            {anterior && (
              <span className="lc-ultima">
                · últ. {anterior.series.filter((s) => s.carga).map((s) => s.carga).slice(0, 3).join("/") || dataCurta(anterior.data).slice(0, 5)}
              </span>
            )}
          </span>
        </button>
        <button className="lc-menu" onClick={onMenu} aria-label={`Opções de ${item.nome}`}>
          <IconeMaisOpcoes size={20} />
        </button>
      </div>

      {aberto && (
        <div className="lc-series">
          {item.series.map((s, i) => {
            const ref = anterior?.series[i];
            return (
              <div key={s.id} className={"lc-serie" + (s.feita ? " feita" : "")}>
                <span className="lc-num">{i + 1}</span>
                <label className="lc-caixa">
                  <input
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={ref?.carga || "–"}
                    value={s.carga}
                    aria-label={cardio ? `Minutos do bloco ${i + 1} de ${item.nome}` : `Carga em kg da série ${i + 1} de ${item.nome}`}
                    onChange={(e) => atualizarSerie(chave, item.id, s.id, { carga: limparDecimal(e.target.value) })}
                  />
                  <span className="lc-unid">{cardio ? "min" : "kg"}</span>
                </label>
                <label className="lc-caixa">
                  {cardio ? (
                    <input
                      type="text"
                      autoComplete="off"
                      className="texto"
                      placeholder={ref?.reps || "intensidade"}
                      value={s.reps}
                      aria-label={`Intensidade do bloco ${i + 1} de ${item.nome}`}
                      onChange={(e) => atualizarSerie(chave, item.id, s.id, { reps: limparTexto(e.target.value) })}
                    />
                  ) : (
                    <>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                        placeholder={ref?.reps || "–"}
                        value={s.reps}
                        aria-label={`Repetições da série ${i + 1} de ${item.nome}`}
                        onChange={(e) => atualizarSerie(chave, item.id, s.id, { reps: limparInteiro(e.target.value) })}
                      />
                      <span className="lc-unid">reps</span>
                    </>
                  )}
                </label>
                <button
                  className="lc-check"
                  aria-pressed={s.feita}
                  aria-label={`Marcar ${cardio ? "bloco" : "série"} ${i + 1} de ${item.nome} como feita`}
                  onClick={() => alternarSerieFeita(chave, item.id, s.id)}
                >
                  <IconeCheck size={22} />
                </button>
              </div>
            );
          })}
          <div className="lc-acoes">
            <button
              className="lc-acao"
              onClick={() => {
                const ultima = item.series[item.series.length - 1];
                if (ultima) removerSerie(chave, item.id, ultima.id);
              }}
              disabled={item.series.length <= 1}
              aria-label={`Remover a última série de ${item.nome}`}
            >
              <IconeMenos size={16} /> {cardio ? "bloco" : "série"}
            </button>
            <button className="lc-acao" onClick={() => adicionarSerie(chave, item.id)} aria-label={`Adicionar série em ${item.nome}`}>
              <IconeMais size={16} /> {cardio ? "bloco" : "série"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/** Lista do treino: só o que falta fazer em destaque; concluídos recolhidos no fim. */
export function ListaCompacta({
  chave,
  treino,
  anteriores,
  onTecnica,
  onRemover,
}: {
  chave: string;
  treino: TreinoDoDia;
  anteriores: Anteriores;
  onTecnica: (item: ExercicioDoTreino) => void;
  onRemover: (item: ExercicioDoTreino) => void;
}) {
  const [verConcluidos, setVerConcluidos] = useState(false);
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [menu, setMenu] = useState<ExercicioDoTreino | null>(null);
  const [gif, setGif] = useState<ExercicioDoTreino | null>(null);

  const completo = (e: ExercicioDoTreino) => e.series.length > 0 && e.series.every((s) => s.feita);
  const pendentes = treino.exercicios.filter((e) => !completo(e));
  const feitos = treino.exercicios.filter(completo);
  // mover acontece entre os exercícios visíveis do mesmo grupo (pendentes ou concluídos)
  const grupoDe = (e: ExercicioDoTreino) => (completo(e) ? feitos : pendentes);
  const vizinho = (e: ExercicioDoTreino, dir: -1 | 1) => {
    const g = grupoDe(e);
    return g[g.findIndex((x) => x.id === e.id) + dir];
  };
  const alternar = (id: string) =>
    setAbertos((a) => {
      const n = new Set(a);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const itemMenu = menu ? treino.exercicios.find((e) => e.id === menu.id) ?? null : null;

  return (
    <div className="lc">
      {pendentes.length > 0 ? (
        <>
          <div className="lc-secao">
            Faltam {pendentes.length} {pendentes.length === 1 ? "exercício" : "exercícios"}
          </div>
          {pendentes.map((e) => (
            <ExercicioCompacto
              key={e.id}
              chave={chave}
              item={e}
              anterior={anteriores.get(e.exercicioId) ?? null}
              aberto
              onMenu={() => setMenu(e)}
              onGif={() => setGif(e)}
            />
          ))}
        </>
      ) : (
        <div className="lc-tudo" role="status">
          <IconeCheck size={20} /> Todos os exercícios foram feitos.
        </div>
      )}

      {feitos.length > 0 && (
        <div className="lc-concluidos">
          <button className="lc-concluidos-btn" onClick={() => setVerConcluidos((v) => !v)} aria-expanded={verConcluidos}>
            <span className="lc-ok">
              <IconeCheck size={14} />
            </span>
            Concluídos ({feitos.length})
            <span style={{ marginLeft: "auto", display: "inline-flex", transform: verConcluidos ? "rotate(180deg)" : undefined }}>
              <IconeBaixo size={18} />
            </span>
          </button>
          {verConcluidos &&
            feitos.map((e) => (
              <ExercicioCompacto
                key={e.id}
                chave={chave}
                item={e}
                anterior={anteriores.get(e.exercicioId) ?? null}
                aberto={abertos.has(e.id)}
                onAlternar={() => alternar(e.id)}
                onMenu={() => setMenu(e)}
                onGif={() => setGif(e)}
              />
            ))}
        </div>
      )}

      {itemMenu && (
        <Sheet titulo={itemMenu.nome} onFechar={() => setMenu(null)}>
          <div className="lc-menu-linha">
            <button
              className="tr-btn"
              style={{ flex: 1 }}
              disabled={!vizinho(itemMenu, -1)}
              onClick={() => {
                const v = vizinho(itemMenu, -1);
                if (v) trocarExercicios(chave, itemMenu.id, v.id);
              }}
              aria-label={`Mover ${itemMenu.nome} para cima`}
            >
              <IconeCima size={18} /> Subir
            </button>
            <button
              className="tr-btn"
              style={{ flex: 1 }}
              disabled={!vizinho(itemMenu, 1)}
              onClick={() => {
                const v = vizinho(itemMenu, 1);
                if (v) trocarExercicios(chave, itemMenu.id, v.id);
              }}
              aria-label={`Mover ${itemMenu.nome} para baixo`}
            >
              <IconeBaixo size={18} /> Descer
            </button>
          </div>
          <button
            className="tr-tecnica"
            style={{ marginTop: 10 }}
            onClick={() => {
              setMenu(null);
              onTecnica(itemMenu);
            }}
            aria-label={`Técnica de ${itemMenu.nome}: ${tecnicaPorId(itemMenu.tecnica)?.nome ?? "nenhuma"}. Trocar`}
          >
            <span className="tr-tecnica-rot">{itemMenu.tipo === "cardio" ? "Tipo" : "Técnica"}</span>
            <span style={{ flex: 1, textAlign: "left" }}>{tecnicaPorId(itemMenu.tecnica)?.nome ?? "Escolher"}</span>
            <IconeBaixo size={18} />
          </button>
          <label className="tr-field-label" htmlFor="lc-obs">
            Observações
          </label>
          <textarea
            id="lc-obs"
            className="tr-obs"
            style={{ width: "100%", margin: 0 }}
            rows={3}
            placeholder="Ajuste de banco, pegada, sensação…"
            value={itemMenu.observacoes}
            aria-label={`Observações de ${itemMenu.nome}`}
            onChange={(ev) => atualizarObservacoes(chave, itemMenu.id, ev.target.value)}
          />
          <button
            className="tr-btn tr-btn-ghost tr-btn-block"
            style={{ color: "var(--red)", borderColor: "transparent", marginTop: 12 }}
            onClick={() => {
              setMenu(null);
              onRemover(itemMenu);
            }}
            aria-label={`Remover ${itemMenu.nome}`}
          >
            <IconeLixo size={18} /> Remover deste treino
          </button>
        </Sheet>
      )}

      {gif && <VisualizadorGif exercicioId={gif.exercicioId} nome={gif.nome} grupo={gif.grupo} tecnica={gif.tecnica} onFechar={() => setGif(null)} />}
    </div>
  );
}
