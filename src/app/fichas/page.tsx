"use client";

import { Suspense, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  adicionarItensFicha,
  criarFicha,
  definirTecnicaFicha,
  duplicarFicha,
  excluirFicha,
  removerItemFicha,
  renomearFicha,
  ultimaVezFicha,
  useTreinos,
} from "@/lib/treinos/store";
import { dataCurta } from "@/lib/treinos/datas";
import { tecnicaPorId } from "@/lib/treinos/tecnicas";
import { siglaFicha } from "@/lib/treinos/campos";
import type { DadosTreinos, Ficha, ItemPlano } from "@/lib/treinos/types";
import { CartaoItemPlano } from "@/components/treinos/CartaoItemPlano";
import { ModelosProntos } from "@/components/treinos/ModelosProntos";
import { SeletorExercicios } from "@/components/treinos/SeletorExercicios";
import { SeletorTecnica } from "@/components/treinos/SeletorTecnica";
import { Confirmacao } from "@/components/treinos/Sheet";
import { IconeCelular, IconeCopiar, IconeDireita, IconeEsquerda, IconeMais } from "@/components/treinos/Icones";

export default function Page() {
  return (
    <Suspense fallback={<Carregando />}>
      <Fichas />
    </Suspense>
  );
}

function Carregando() {
  return (
    <div className="tr-page" style={{ paddingTop: 40, textAlign: "center", color: "var(--text2)" }}>
      Carregando treinos…
    </div>
  );
}

function Fichas() {
  const estado = useTreinos();
  const params = useSearchParams();
  const pathname = usePathname();
  const fichaId = params.get("ficha");

  if (!estado) return <Carregando />;

  const abrir = (id: string | null) => {
    // só muda o parâmetro da URL (History API nativo, integrado ao useSearchParams)
    window.history.replaceState(null, "", id ? `${pathname}?ficha=${id}` : pathname);
    window.scrollTo({ top: 0 });
  };

  const ficha = fichaId ? estado.dados.fichas.find((f) => f.id === fichaId) : undefined;
  return ficha ? (
    <DetalheFicha key={ficha.id} ficha={ficha} dados={estado.dados} onAbrir={abrir} />
  ) : (
    <ListaFichas dados={estado.dados} onAbrir={abrir} />
  );
}

/** Última data em que a ficha foi usada na aba Treinos. */
/** Última data em que a ficha foi feita (a data vem do registro, não da chave). */
function ultimoUso(dados: DadosTreinos, fichaId: string) {
  return ultimaVezFicha(dados, fichaId) ?? undefined;
}

function resumoItens(f: Ficha) {
  const cardio = f.itens.filter((i) => i.tipo === "cardio").length;
  const forca = f.itens.length - cardio;
  return [forca > 0 && `${forca} ${forca === 1 ? "exercício" : "exercícios"}`, cardio > 0 && `${cardio} cardio`]
    .filter(Boolean)
    .join(" + ");
}

function ListaFichas({ dados, onAbrir }: { dados: DadosTreinos; onAbrir: (id: string) => void }) {
  const novo = () => onAbrir(criarFicha());
  const [modelos, setModelos] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const botaoModelos = (destaque: boolean) => (
    <button
      className={"tr-btn tr-btn-block" + (destaque ? " tr-btn-lg" : "")}
      style={{ marginTop: 12 }}
      onClick={() => setModelos(true)}
    >
      <IconeCopiar size={20} /> Modelos prontos (PPL, Full body, GVT…)
    </button>
  );
  return (
    <div className="tr-page">
      <header style={{ padding: "20px 0 16px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>Meus treinos</h1>
        <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4, lineHeight: 1.4 }}>
          Monte suas fichas (Treino A, B, C…). Na aba Treinos, escolha qual vai fazer no dia.
        </p>
      </header>

      {dados.fichas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "28px 4px 8px" }}>
          <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Nenhum treino montado</p>
          <p style={{ fontSize: 15, color: "var(--text2)", marginBottom: 20 }}>
            Crie o Treino A com os exercícios, técnicas e cardio que você costuma fazer.
          </p>
          <button className="tr-btn tr-btn-primary tr-btn-lg tr-btn-block" onClick={novo}>
            <IconeMais /> Criar Treino A
          </button>
          {botaoModelos(true)}
        </div>
      ) : (
        <>
          {dados.fichas.map((f) => {
            const uso = ultimoUso(dados, f.id);
            return (
              <button key={f.id} className="tr-semana-dia" onClick={() => onAbrir(f.id)}>
                <span className="tr-semana-sigla">{siglaFicha(f.nome)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 16, fontWeight: 700 }}>{f.nome.trim() || "Treino sem nome"}</span>
                  {f.descricao.trim() && (
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600, marginTop: 2 }}>{f.descricao}</span>
                  )}
                  <span style={{ display: "block", fontSize: 13, color: "var(--text2)", marginTop: 2 }}>
                    {f.itens.length === 0 ? "Vazio · toque para montar" : resumoItens(f)}
                    {uso && ` · feito em ${dataCurta(uso)}`}
                  </span>
                </span>
                <span style={{ color: "var(--text3)" }}>
                  <IconeDireita />
                </span>
              </button>
            );
          })}
          <button className="tr-btn tr-btn-block" style={{ marginTop: 12, borderStyle: "dashed" }} onClick={novo}>
            <IconeMais size={20} /> Novo treino
          </button>
          {botaoModelos(false)}
        </>
      )}

      {modelos && (
        <ModelosProntos
          onFechar={() => setModelos(false)}
          onCriadas={(qtd, nome) => {
            setModelos(false);
            setAviso(`${qtd} ${qtd === 1 ? "ficha criada" : "fichas criadas"}: ${nome}.`);
            setTimeout(() => setAviso(null), 4000);
            window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          }}
        />
      )}
      {aviso && (
        <div className="tr-toast" role="status">
          <span style={{ flex: 1 }}>{aviso}</span>
        </div>
      )}

      <p className="tr-note" style={{ marginTop: 24, justifyContent: "center", textAlign: "center" }}>
        <IconeCelular size={16} />
        <span>Seus treinos ficam salvos apenas neste aparelho e navegador.</span>
      </p>
    </div>
  );
}

type Dialogo =
  | { tipo: "seletor" }
  | { tipo: "tecnica"; item: ItemPlano }
  | { tipo: "remover"; item: ItemPlano }
  | { tipo: "excluir" }
  | null;

function DetalheFicha({
  ficha,
  dados,
  onAbrir,
}: {
  ficha: Ficha;
  dados: DadosTreinos;
  onAbrir: (id: string | null) => void;
}) {
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const vazio = ficha.itens.length === 0;
  const totalSeries = ficha.itens.reduce((a, i) => a + (i.tipo === "cardio" ? 0 : i.series.length), 0);
  const minutosCardio = ficha.itens
    .filter((i) => i.tipo === "cardio")
    .reduce((a, i) => a + i.series.reduce((b, s) => b + (parseFloat(s.carga.replace(",", ".")) || 0), 0), 0);

  function mostrarAviso(t: string) {
    setAviso(t);
    setTimeout(() => setAviso(null), 3000);
  }

  return (
    <div className="tr-page">
      <header className="tr-day">
        <div className="tr-day-row">
          <button className="tr-icon-btn" onClick={() => onAbrir(null)} aria-label="Voltar para meus treinos">
            <IconeEsquerda />
          </button>
          <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
            <div className="tr-day-weekday" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {ficha.nome.trim() || "Treino sem nome"}
            </div>
            <div className="tr-day-date">{ficha.descricao.trim() || "Meus treinos"}</div>
          </div>
          <span style={{ width: 48 }} />
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <label className="tr-field-label" htmlFor="ficha-nome">
            Nome
          </label>
          <input
            id="ficha-nome"
            className="tr-input"
            placeholder="Treino A"
            value={ficha.nome}
            maxLength={30}
            onChange={(e) => renomearFicha(ficha.id, { nome: e.target.value })}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <label className="tr-field-label" htmlFor="ficha-descricao">
            Músculos / descrição
          </label>
          <input
            id="ficha-descricao"
            className="tr-input"
            placeholder="Ex.: Peito e tríceps"
            value={ficha.descricao}
            maxLength={40}
            onChange={(e) => renomearFicha(ficha.id, { descricao: e.target.value })}
          />
        </div>
      </div>

      {!vazio && (
        <p style={{ fontSize: 14, color: "var(--text2)", margin: "12px 0" }}>
          {resumoItens(ficha)}
          {totalSeries > 0 && ` · ${totalSeries} séries de força`}
          {minutosCardio > 0 && ` · ${minutosCardio.toLocaleString("pt-BR")} min de cardio`}
        </p>
      )}

      {vazio ? (
        <div style={{ textAlign: "center", padding: "28px 4px 8px" }}>
          <p style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Nenhum exercício neste treino</p>
          <p style={{ fontSize: 15, color: "var(--text2)", marginBottom: 20 }}>
            Adicione exercícios de musculação e cardio e escolha a técnica de cada um.
          </p>
          <button className="tr-btn tr-btn-primary tr-btn-lg tr-btn-block" onClick={() => setDialogo({ tipo: "seletor" })}>
            <IconeMais /> Adicionar exercícios
          </button>
        </div>
      ) : (
        <>
          {ficha.itens.map((item, i) => (
            <CartaoItemPlano
              key={item.id}
              fichaId={ficha.id}
              item={item}
              indice={i}
              total={ficha.itens.length}
              onTecnica={() => setDialogo({ tipo: "tecnica", item })}
              onRemover={() => setDialogo({ tipo: "remover", item })}
            />
          ))}
          <button className="tr-btn tr-btn-block" style={{ marginTop: 12, borderStyle: "dashed" }} onClick={() => setDialogo({ tipo: "seletor" })}>
            <IconeMais size={20} /> Adicionar exercícios
          </button>
        </>
      )}

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        {!vazio && (
          <button className="tr-btn tr-btn-primary tr-btn-lg tr-btn-block" onClick={() => onAbrir(null)}>
            Salvo · voltar para meus treinos
          </button>
        )}
        {!vazio && (
          <button
            className="tr-btn tr-btn-block"
            onClick={() => {
              const id = duplicarFicha(ficha.id);
              if (id) onAbrir(id);
            }}
          >
            <IconeCopiar size={20} /> Duplicar como novo treino
          </button>
        )}
        {!vazio && (
          <Link
            href="/treinos"
            className="tr-btn tr-btn-ghost tr-btn-block"
            style={{ textDecoration: "none", borderColor: "transparent", color: "var(--text2)" }}
          >
            Ir para Treinos
          </Link>
        )}
        <button
          className="tr-btn tr-btn-ghost tr-btn-block"
          style={{ color: "var(--red)", borderColor: "transparent" }}
          onClick={() => setDialogo({ tipo: "excluir" })}
        >
          Excluir {ficha.nome.trim() || "treino"}
        </button>
      </div>

      <p className="tr-note" style={{ marginTop: 24, justifyContent: "center", textAlign: "center" }}>
        <IconeCelular size={16} />
        <span>Cada alteração é salva automaticamente neste aparelho.</span>
      </p>

      {dialogo?.tipo === "seletor" && (
        <SeletorExercicios
          dados={dados}
          jaNoTreino={new Set(ficha.itens.map((i) => i.exercicioId))}
          onFechar={() => setDialogo(null)}
          onAdicionar={(itens) => {
            adicionarItensFicha(ficha.id, itens);
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
            definirTecnicaFicha(ficha.id, dialogo.item.id, t);
            setDialogo(null);
            mostrarAviso(`${dialogo.item.nome}: ${tecnicaPorId(t)?.nome}.`);
          }}
        />
      )}

      {dialogo?.tipo === "remover" && (
        <Confirmacao
          titulo="Remover exercício?"
          texto={`${dialogo.item.nome} sai do ${ficha.nome.trim() || "treino"}. Treinos já registrados não mudam.`}
          confirmar="Remover"
          perigo
          onCancelar={() => setDialogo(null)}
          onConfirmar={() => {
            removerItemFicha(ficha.id, dialogo.item.id);
            setDialogo(null);
          }}
        />
      )}

      {dialogo?.tipo === "excluir" && (
        <Confirmacao
          titulo={`Excluir ${ficha.nome.trim() || "treino"}?`}
          texto="A ficha e seus exercícios serão apagados. Os treinos já registrados no Histórico não mudam."
          confirmar="Excluir"
          perigo
          onCancelar={() => setDialogo(null)}
          onConfirmar={() => {
            excluirFicha(ficha.id);
            onAbrir(null);
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
