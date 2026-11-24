"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  adicionarItensPlano,
  copiarDiaPlano,
  definirTecnicaPlano,
  definirTituloPlano,
  limparDiaPlano,
  removerItemPlano,
  useTreinos,
} from "@/lib/treinos/store";
import { ORDEM_SEMANA, nomeDiaSemana } from "@/lib/treinos/datas";
import { tecnicaPorId } from "@/lib/treinos/tecnicas";
import type { DadosTreinos, ItemPlano } from "@/lib/treinos/types";
import { CartaoItemPlano } from "@/components/treinos/CartaoItemPlano";
import { SeletorExercicios } from "@/components/treinos/SeletorExercicios";
import { SeletorTecnica } from "@/components/treinos/SeletorTecnica";
import { Confirmacao, Sheet } from "@/components/treinos/Sheet";
import { IconeCelular, IconeCopiar, IconeDireita, IconeEsquerda, IconeMais } from "@/components/treinos/Icones";

export default function Page() {
  return (
    <Suspense fallback={<Carregando />}>
      <Semana />
    </Suspense>
  );
}

function Carregando() {
  return (
    <div className="tr-page" style={{ paddingTop: 40, textAlign: "center", color: "var(--text2)" }}>
      Carregando plano…
    </div>
  );
}

const curto = (n: number) => nomeDiaSemana(n).split("-")[0];

function Semana() {
  const estado = useTreinos();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const diaParam = params.get("dia");
  const dia = diaParam !== null && /^[0-6]$/.test(diaParam) ? Number(diaParam) : null;

  if (!estado) return <Carregando />;

  const abrir = (n: number | null) => {
    router.replace(n === null ? pathname : `${pathname}?dia=${n}`, { scroll: false });
    window.scrollTo({ top: 0 });
  };

  return dia === null ? (
    <ListaSemana dados={estado.dados} onAbrir={abrir} />
  ) : (
    <DiaDoPlano key={dia} dia={dia} dados={estado.dados} onVoltar={() => abrir(null)} />
  );
}

function ListaSemana({ dados, onAbrir }: { dados: DadosTreinos; onAbrir: (n: number) => void }) {
  const hoje = new Date().getDay();
  return (
    <div className="tr-page">
      <header style={{ padding: "20px 0 16px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>Semana</h1>
        <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4, lineHeight: 1.4 }}>
          Monte o treino de cada dia da semana. Na aba Treinos, um dia vazio oferece o plano daquele dia.
        </p>
      </header>

      {ORDEM_SEMANA.map((n) => {
        const p = dados.plano[n];
        const itens = p?.itens ?? [];
        const cardio = itens.filter((i) => i.tipo === "cardio").length;
        const forca = itens.length - cardio;
        const grupos = [...new Set(itens.filter((i) => i.tipo !== "cardio").map((i) => i.grupo))];
        return (
          <button key={n} className={"tr-semana-dia" + (n === hoje ? " hoje" : "")} onClick={() => onAbrir(n)}>
            <span className="tr-semana-sigla">{curto(n).slice(0, 3).toUpperCase()}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 16, fontWeight: 700 }}>
                {nomeDiaSemana(n)}
                {n === hoje && <span style={{ color: "var(--accent)", fontSize: 13 }}> · hoje</span>}
              </span>
              {itens.length === 0 ? (
                <span style={{ display: "block", fontSize: 14, color: "var(--text2)", marginTop: 3 }}>
                  {p?.titulo?.trim() || "Descanso · toque para montar"}
                </span>
              ) : (
                <>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 600, marginTop: 3 }}>
                    {p.titulo.trim() || grupos.join(", ") || "Cardio"}
                  </span>
                  <span style={{ display: "block", fontSize: 13, color: "var(--text2)", marginTop: 2 }}>
                    {[
                      forca > 0 && `${forca} ${forca === 1 ? "exercício" : "exercícios"}`,
                      cardio > 0 && `${cardio} cardio`,
                    ]
                      .filter(Boolean)
                      .join(" + ")}
                  </span>
                </>
              )}
            </span>
            <span style={{ color: "var(--text3)" }}>
              <IconeDireita />
            </span>
          </button>
        );
      })}

      <p className="tr-note" style={{ marginTop: 24, justifyContent: "center", textAlign: "center" }}>
        <IconeCelular size={16} />
        <span>O plano fica salvo apenas neste aparelho e navegador.</span>
      </p>
    </div>
  );
}

type Dialogo =
  | { tipo: "seletor" }
  | { tipo: "tecnica"; item: ItemPlano }
  | { tipo: "remover"; item: ItemPlano }
  | { tipo: "copiar" }
  | { tipo: "confirmar-copia"; destino: number }
  | { tipo: "limpar" }
  | null;

function DiaDoPlano({ dia, dados, onVoltar }: { dia: number; dados: DadosTreinos; onVoltar: () => void }) {
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const plano = dados.plano[dia] ?? { titulo: "", itens: [] };
  const vazio = plano.itens.length === 0;
  const totalSeries = plano.itens.reduce((a, i) => a + (i.tipo === "cardio" ? 0 : i.series.length), 0);
  const minutosCardio = plano.itens
    .filter((i) => i.tipo === "cardio")
    .reduce((a, i) => a + i.series.reduce((b, s) => b + (parseFloat(s.carga.replace(",", ".")) || 0), 0), 0);

  function copiar(destino: number) {
    copiarDiaPlano(dia, destino);
    setDialogo(null);
    setAviso(`Plano copiado para ${curto(destino).toLowerCase()}.`);
    setTimeout(() => setAviso(null), 4000);
  }

  return (
    <div className="tr-page">
      <header className="tr-day">
        <div className="tr-day-row">
          <button className="tr-icon-btn" onClick={onVoltar} aria-label="Voltar para a semana">
            <IconeEsquerda />
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div className="tr-day-weekday">{nomeDiaSemana(dia)}</div>
            <div className="tr-day-date">Plano semanal</div>
          </div>
          <span style={{ width: 48 }} />
        </div>
      </header>

      <label className="tr-field-label" htmlFor="titulo-plano">
        Nome do treino
      </label>
      <input
        id="titulo-plano"
        className="tr-input"
        placeholder="Ex.: Peito e tríceps"
        value={plano.titulo}
        maxLength={40}
        onChange={(e) => definirTituloPlano(dia, e.target.value)}
      />

      {!vazio && (
        <p style={{ fontSize: 14, color: "var(--text2)", margin: "12px 0" }}>
          {plano.itens.length} {plano.itens.length === 1 ? "exercício" : "exercícios"}
          {totalSeries > 0 && ` · ${totalSeries} séries de força`}
          {minutosCardio > 0 && ` · ${minutosCardio.toLocaleString("pt-BR")} min de cardio`}
        </p>
      )}

      {vazio ? (
        <div style={{ textAlign: "center", padding: "28px 4px 8px" }}>
          <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Nenhum exercício neste dia</p>
          <p style={{ fontSize: 15, color: "var(--text2)", marginBottom: 20 }}>
            Adicione exercícios de musculação e cardio e escolha a técnica de cada um.
          </p>
          <button className="tr-btn tr-btn-primary tr-btn-lg tr-btn-block" onClick={() => setDialogo({ tipo: "seletor" })}>
            <IconeMais /> Adicionar exercícios
          </button>
        </div>
      ) : (
        <>
          {plano.itens.map((item, i) => (
            <CartaoItemPlano
              key={item.id}
              dia={dia}
              item={item}
              indice={i}
              total={plano.itens.length}
              onTecnica={() => setDialogo({ tipo: "tecnica", item })}
              onRemover={() => setDialogo({ tipo: "remover", item })}
            />
          ))}
          <button className="tr-btn tr-btn-block" style={{ marginTop: 12, borderStyle: "dashed" }} onClick={() => setDialogo({ tipo: "seletor" })}>
            <IconeMais size={20} /> Adicionar exercícios
          </button>
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="tr-btn tr-btn-primary tr-btn-lg tr-btn-block" onClick={onVoltar}>
              Salvo · voltar para a semana
            </button>
            <button className="tr-btn tr-btn-block" onClick={() => setDialogo({ tipo: "copiar" })}>
              <IconeCopiar size={20} /> Copiar para outro dia da semana
            </button>
            <Link
              href="/treinos"
              className="tr-btn tr-btn-ghost tr-btn-block"
              style={{ textDecoration: "none", borderColor: "transparent", color: "var(--text2)" }}
            >
              Ir para Treinos
            </Link>
            <button
              className="tr-btn tr-btn-ghost tr-btn-block"
              style={{ color: "var(--red)", borderColor: "transparent" }}
              onClick={() => setDialogo({ tipo: "limpar" })}
            >
              Limpar {curto(dia).toLowerCase()}
            </button>
          </div>
        </>
      )}

      <p className="tr-note" style={{ marginTop: 24, justifyContent: "center", textAlign: "center" }}>
        <IconeCelular size={16} />
        <span>Cada alteração é salva automaticamente neste aparelho.</span>
      </p>

      {dialogo?.tipo === "seletor" && (
        <SeletorExercicios
          dados={dados}
          jaNoTreino={new Set(plano.itens.map((i) => i.exercicioId))}
          onFechar={() => setDialogo(null)}
          onAdicionar={(itens) => {
            adicionarItensPlano(dia, itens);
            setDialogo(null);
          }}
        />
      )}

      {dialogo?.tipo === "tecnica" && (
        <SeletorTecnica
          nome={dialogo.item.nome}
          tipo={dialogo.item.tipo}
          atual={dialogo.item.tecnica}
          ajustaSeries
          onFechar={() => setDialogo(null)}
          onEscolher={(t) => {
            definirTecnicaPlano(dia, dialogo.item.id, t);
            setDialogo(null);
            setAviso(`${dialogo.item.nome}: ${tecnicaPorId(t)?.nome}.`);
            setTimeout(() => setAviso(null), 3000);
          }}
        />
      )}

      {dialogo?.tipo === "remover" && (
        <Confirmacao
          titulo="Remover exercício?"
          texto={`${dialogo.item.nome} sai do plano de ${curto(dia).toLowerCase()}. Treinos já registrados não mudam.`}
          confirmar="Remover"
          perigo
          onCancelar={() => setDialogo(null)}
          onConfirmar={() => {
            removerItemPlano(dia, dialogo.item.id);
            setDialogo(null);
          }}
        />
      )}

      {dialogo?.tipo === "copiar" && (
        <Sheet titulo="Copiar para qual dia?" onFechar={() => setDialogo(null)}>
          <p className="tr-note" style={{ marginBottom: 12 }}>
            <span>Copia exercícios, técnicas e metas de {curto(dia).toLowerCase()}.</span>
          </p>
          {ORDEM_SEMANA.filter((n) => n !== dia).map((n) => {
            const qtd = dados.plano[n]?.itens.length ?? 0;
            return (
              <button
                key={n}
                className="tr-ex-item"
                onClick={() => (qtd > 0 ? setDialogo({ tipo: "confirmar-copia", destino: n }) : copiar(n))}
              >
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 16, fontWeight: 700 }}>{nomeDiaSemana(n)}</span>
                  <span style={{ display: "block", fontSize: 13, color: "var(--text2)", marginTop: 2 }}>
                    {qtd === 0 ? "Vazio" : `${dados.plano[n].titulo.trim() || "Treino"} · ${qtd} exercícios`}
                  </span>
                </span>
                <IconeDireita size={18} />
              </button>
            );
          })}
        </Sheet>
      )}

      {dialogo?.tipo === "confirmar-copia" && (
        <Confirmacao
          titulo="Substituir plano?"
          texto={`${nomeDiaSemana(dialogo.destino)} já tem ${dados.plano[dialogo.destino]?.itens.length} exercícios no plano. Eles serão substituídos.`}
          confirmar="Substituir"
          perigo
          onCancelar={() => setDialogo({ tipo: "copiar" })}
          onConfirmar={() => copiar(dialogo.destino)}
        />
      )}

      {dialogo?.tipo === "limpar" && (
        <Confirmacao
          titulo={`Limpar ${curto(dia).toLowerCase()}?`}
          texto="Todos os exercícios do plano deste dia serão removidos. Treinos já registrados não mudam."
          confirmar="Limpar"
          perigo
          onCancelar={() => setDialogo(null)}
          onConfirmar={() => {
            limparDiaPlano(dia);
            setDialogo(null);
          }}
        />
      )}

      {aviso && (
        <div className="tr-toast" role="status">
          <span style={{ flex: 1 }}>{aviso}</span>
        </div>
      )}
    </div>
  );
}
