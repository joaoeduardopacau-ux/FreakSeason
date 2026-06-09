"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { calcularMetasCalorias } from "@/lib/calculations";
import type { Refeicao, RefeicaoItem } from "@/types";
import Card from "@/components/Card";
import MacroBar from "@/components/MacroBar";

const hoje = new Date().toISOString().split("T")[0];
const vh = { fontFamily: "var(--font-oswald), Arial Narrow, sans-serif" };

const refeicaoOpcoes = [
  { value: "cafe_manha", label: "CAFÉ DA MANHÃ", short: "CAFÉ" },
  { value: "lanche_manha", label: "LANCHE MANHÃ", short: "LANCHE M." },
  { value: "almoco", label: "ALMOÇO", short: "ALMOÇO" },
  { value: "lanche_tarde", label: "LANCHE TARDE", short: "LANCHE T." },
  { value: "jantar", label: "JANTAR", short: "JANTAR" },
  { value: "ceia", label: "CEIA", short: "CEIA" },
] as const;

type RefeicaoTipo = typeof refeicaoOpcoes[number]["value"];

const labelStyle = {
  ...vh,
  fontSize: "0.65rem",
  letterSpacing: "0.18em",
  color: "var(--muted)",
  textTransform: "uppercase" as const,
  display: "block",
  marginBottom: "0.375rem",
  fontWeight: 600,
};

export default function DietaPage() {
  const { data, adicionarRefeicao, removerRefeicao, adicionarAlimento } = useApp();
  const { perfil, alimentos, refeicoes } = data;

  const refeicoesHoje = refeicoes.filter((r) => r.data.startsWith(hoje));

  const totaisHoje = refeicoesHoje.reduce(
    (acc, r) => {
      r.itens.forEach((i) => {
        acc.calorias += i.caloriasTotais;
        acc.proteinas += i.proteinasTotais;
        acc.carboidratos += i.carboidratosTotais;
        acc.gorduras += i.gordurasTotais;
      });
      return acc;
    },
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );

  const metas = perfil ? calcularMetasCalorias(perfil) : null;

  const [modal, setModal] = useState(false);
  const [tipoRefeicao, setTipoRefeicao] = useState<RefeicaoTipo>("almoco");
  const [busca, setBusca] = useState("");
  const [itens, setItens] = useState<RefeicaoItem[]>([]);
  const [qtdSelecionada, setQtdSelecionada] = useState(100);

  const [modalAlimento, setModalAlimento] = useState(false);
  const [novoAlimento, setNovoAlimento] = useState({
    nome: "", calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, porcao: 100,
  });

  const alimentosFiltrados = alimentos.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function handleAdicionarItem(alimentoId: string) {
    const alimento = alimentos.find((a) => a.id === alimentoId);
    if (!alimento) return;
    const fator = qtdSelecionada / alimento.porcao;
    const item: RefeicaoItem = {
      alimentoId,
      quantidade: qtdSelecionada,
      nomeAlimento: alimento.nome,
      caloriasTotais: alimento.calorias * fator,
      proteinasTotais: alimento.proteinas * fator,
      carboidratosTotais: alimento.carboidratos * fator,
      gordurasTotais: alimento.gorduras * fator,
    };
    setItens((i) => [...i, item]);
    setBusca("");
  }

  function handleRemoverItem(idx: number) {
    setItens((i) => i.filter((_, j) => j !== idx));
  }

  function handleSalvarRefeicao() {
    if (itens.length === 0) return;
    const refeicao: Refeicao = {
      id: crypto.randomUUID(),
      tipo: tipoRefeicao,
      itens,
      data: new Date().toISOString(),
    };
    adicionarRefeicao(refeicao);
    setModal(false);
    setItens([]);
    setBusca("");
  }

  function handleSalvarAlimento(e: React.FormEvent) {
    e.preventDefault();
    adicionarAlimento({
      id: crypto.randomUUID(),
      ...novoAlimento,
      unidade: "g",
    });
    setModalAlimento(false);
    setNovoAlimento({ nome: "", calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, porcao: 100 });
  }

  const totaisItens = itens.reduce(
    (acc, i) => ({
      calorias: acc.calorias + i.caloriasTotais,
      proteinas: acc.proteinas + i.proteinasTotais,
      carboidratos: acc.carboidratos + i.carboidratosTotais,
      gorduras: acc.gorduras + i.gordurasTotais,
    }),
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );

  return (
    <div className="px-4 py-4 space-y-4">

      {/* Header */}
      <div className="text-center py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div style={{ color: "var(--muted)", fontSize: "0.6rem", ...vh, letterSpacing: "0.2em" }}>
          ◆ NUTRITION PROTOCOL ◆
        </div>
        <h1 style={{ ...vh, fontSize: "2rem", fontWeight: 700, color: "var(--gold-light)", letterSpacing: "0.2em", lineHeight: 1.1, marginTop: "0.25rem" }}>
          DIETA
        </h1>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-between">
        <div className="divider-gold" style={{ flex: 1 }}>
          <span>★ HOJE ★</span>
        </div>
        <button
          onClick={() => setModal(true)}
          className="ml-3 px-4 py-2 font-bold text-xs"
          style={{
            background: "var(--gold)",
            color: "#0A0600",
            ...vh,
            letterSpacing: "0.15em",
            flexShrink: 0,
          }}
        >
          + REFEIÇÃO
        </button>
      </div>

      {/* Daily summary */}
      <Card title="RESUMO DO DIA" accent>
        <div className="flex justify-between items-start mb-4">
          <div>
            <span
              style={{ color: "var(--gold-light)", ...vh, fontSize: "3rem", fontWeight: 700, lineHeight: 1 }}
            >
              {Math.round(totaisHoje.calorias)}
            </span>
            <span style={{ color: "var(--muted)", ...vh, fontSize: "0.9rem", marginLeft: "0.5rem" }}>
              / {metas?.calorias ?? "—"} KCAL
            </span>
          </div>
        </div>
        {metas ? (
          <div className="space-y-2.5">
            <MacroBar label="PROTEÍNAS" atual={Math.round(totaisHoje.proteinas)} meta={metas.proteinas} cor="bg-blue-400" />
            <MacroBar label="CARBOIDRATOS" atual={Math.round(totaisHoje.carboidratos)} meta={metas.carboidratos} cor="bg-yellow-400" />
            <MacroBar label="GORDURAS" atual={Math.round(totaisHoje.gorduras)} meta={metas.gorduras} cor="bg-orange-400" />
          </div>
        ) : (
          <p style={{ color: "var(--muted)", ...vh, fontSize: "0.7rem", letterSpacing: "0.12em" }}>
            CONFIGURE SEU PERFIL PARA VER AS METAS
          </p>
        )}
      </Card>

      {/* Meals */}
      {refeicoesHoje.length === 0 ? (
        <div
          className="text-center py-10"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <p style={{ color: "var(--muted)", ...vh, fontSize: "0.85rem", letterSpacing: "0.15em", marginBottom: "0.75rem" }}>
            NENHUMA REFEIÇÃO REGISTRADA HOJE
          </p>
          <button
            onClick={() => setModal(true)}
            style={{ color: "var(--gold)", ...vh, fontSize: "0.75rem", letterSpacing: "0.12em" }}
          >
            + ADICIONAR PRIMEIRA REFEIÇÃO
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {refeicaoOpcoes.map(({ value, label }) => {
            const ref = refeicoesHoje.find((r) => r.tipo === value);
            if (!ref) return null;
            const totalRef = ref.itens.reduce((a, i) => a + i.caloriasTotais, 0);
            return (
              <div
                key={ref.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--gold)",
                }}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p style={{ color: "var(--gold)", ...vh, fontSize: "0.7rem", letterSpacing: "0.18em", fontWeight: 700 }}>
                        {label}
                      </p>
                      <p style={{ color: "var(--cream)", ...vh, fontSize: "1rem", fontWeight: 700 }}>
                        {Math.round(totalRef)} <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>KCAL</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removerRefeicao(ref.id)}
                      style={{ color: "var(--muted)", padding: "4px" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {ref.itens.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span style={{ color: "var(--muted)", fontSize: "0.7rem" }}>
                          {item.nomeAlimento} ({item.quantidade}g)
                        </span>
                        <span style={{ color: "var(--cream)", fontSize: "0.7rem" }}>
                          {Math.round(item.caloriasTotais)} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="flex gap-3 mt-2 pt-2"
                    style={{ borderTop: "1px solid var(--border)", ...vh, fontSize: "0.6rem", letterSpacing: "0.12em", color: "var(--muted)" }}
                  >
                    <span>P: {Math.round(ref.itens.reduce((a, i) => a + i.proteinasTotais, 0))}g</span>
                    <span>C: {Math.round(ref.itens.reduce((a, i) => a + i.carboidratosTotais, 0))}g</span>
                    <span>G: {Math.round(ref.itens.reduce((a, i) => a + i.gordurasTotais, 0))}g</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add meal modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{ background: "rgba(0,0,0,0.85)" }}
        >
          <div
            className="w-full max-w-md mx-auto max-h-[92vh] overflow-y-auto"
            style={{
              background: "var(--card)",
              borderTop: "2px solid var(--gold)",
              borderLeft: "1px solid var(--border)",
              borderRight: "1px solid var(--border)",
            }}
          >
            {/* Modal header */}
            <div
              className="p-4 sticky top-0"
              style={{ background: "var(--card)", borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <h2 style={{ color: "var(--gold-light)", ...vh, fontSize: "1rem", fontWeight: 700, letterSpacing: "0.2em" }}>
                  ADICIONAR REFEIÇÃO
                </h2>
                <button
                  onClick={() => { setModal(false); setItens([]); setBusca(""); }}
                  style={{ color: "var(--muted)", ...vh, fontSize: "1rem" }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Meal type selector */}
              <div>
                <label style={labelStyle}>Tipo de Refeição</label>
                <div className="grid grid-cols-3 gap-2">
                  {refeicaoOpcoes.map((o) => {
                    const selected = tipoRefeicao === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setTipoRefeicao(o.value)}
                        className="py-2 px-1 text-center transition-opacity"
                        style={{
                          background: selected ? "var(--gold)" : "var(--input)",
                          border: `1px solid ${selected ? "var(--gold)" : "var(--border)"}`,
                          color: selected ? "#0A0600" : "var(--muted)",
                          ...vh,
                          fontSize: "0.55rem",
                          letterSpacing: "0.1em",
                          fontWeight: 700,
                        }}
                      >
                        {o.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search */}
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="vintage-input flex-1"
                    placeholder="Buscar alimento..."
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setModalAlimento(true)}
                    className="px-3 py-2 font-bold text-xs"
                    style={{
                      background: "var(--card-2)",
                      border: "1px solid var(--border)",
                      color: "var(--gold)",
                      ...vh,
                      letterSpacing: "0.12em",
                      flexShrink: 0,
                    }}
                  >
                    + NOVO
                  </button>
                </div>

                <div>
                  <label style={labelStyle}>Quantidade (g/ml)</label>
                  <input
                    type="number"
                    min={1}
                    value={qtdSelecionada}
                    onChange={(e) => setQtdSelecionada(parseInt(e.target.value))}
                    className="vintage-input"
                  />
                </div>

                {busca && (
                  <div
                    className="mt-2 overflow-hidden max-h-44 overflow-y-auto"
                    style={{ border: "1px solid var(--border)", background: "var(--input)" }}
                  >
                    {alimentosFiltrados.length === 0 ? (
                      <p style={{ color: "var(--muted)", ...vh, fontSize: "0.75rem", letterSpacing: "0.12em", padding: "0.75rem", textAlign: "center" }}>
                        NENHUM RESULTADO
                      </p>
                    ) : (
                      alimentosFiltrados.map((a) => {
                        const fator = qtdSelecionada / a.porcao;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => handleAdicionarItem(a.id)}
                            className="w-full flex justify-between items-center px-3 py-2.5 text-left"
                            style={{ borderBottom: "1px solid var(--border)" }}
                          >
                            <div>
                              <p style={{ color: "var(--cream)", ...vh, fontSize: "0.8rem" }}>{a.nome}</p>
                              <p style={{ color: "var(--muted)", fontSize: "0.65rem" }}>
                                {Math.round(a.calorias * fator)} kcal · {qtdSelecionada}{a.unidade}
                              </p>
                            </div>
                            <span style={{ color: "var(--gold)", fontSize: "1.2rem" }}>+</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Items added */}
              {itens.length > 0 && (
                <div>
                  <div className="divider-gold mb-2">
                    <span>ITENS ({Math.round(totaisItens.calorias)} KCAL)</span>
                  </div>
                  <div className="space-y-1">
                    {itens.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center px-3 py-2"
                        style={{ background: "var(--card-2)", border: "1px solid var(--border)" }}
                      >
                        <div>
                          <p style={{ color: "var(--cream)", ...vh, fontSize: "0.8rem" }}>{item.nomeAlimento}</p>
                          <p style={{ color: "var(--muted)", fontSize: "0.65rem" }}>
                            {item.quantidade}g · {Math.round(item.caloriasTotais)} kcal
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoverItem(idx)}
                          style={{ color: "var(--muted)", marginLeft: "0.5rem" }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSalvarRefeicao}
                disabled={itens.length === 0}
                className="w-full py-3 font-bold text-sm"
                style={{
                  background: itens.length === 0 ? "var(--border)" : "var(--gold)",
                  color: itens.length === 0 ? "var(--muted)" : "#0A0600",
                  ...vh,
                  letterSpacing: "0.2em",
                  cursor: itens.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                ★ SALVAR REFEIÇÃO ★
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add food modal */}
      {modalAlimento && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.9)" }}
        >
          <div
            className="w-full max-w-sm p-5"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderTop: "2px solid var(--gold)",
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ color: "var(--gold-light)", ...vh, fontSize: "1rem", fontWeight: 700, letterSpacing: "0.18em" }}>
                NOVO ALIMENTO
              </h3>
              <button
                onClick={() => setModalAlimento(false)}
                style={{ color: "var(--muted)", ...vh }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSalvarAlimento} className="space-y-3">
              <input
                required
                type="text"
                value={novoAlimento.nome}
                onChange={(e) => setNovoAlimento({ ...novoAlimento, nome: e.target.value })}
                className="vintage-input"
                placeholder="Nome do alimento"
              />
              <div className="grid grid-cols-2 gap-2">
                {(["calorias", "proteinas", "carboidratos", "gorduras"] as const).map((field) => {
                  const fieldLabels = {
                    calorias: "Calorias (kcal)",
                    proteinas: "Proteínas (g)",
                    carboidratos: "Carboidratos (g)",
                    gorduras: "Gorduras (g)",
                  };
                  return (
                    <div key={field}>
                      <label style={labelStyle}>{fieldLabels[field]}</label>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={novoAlimento[field]}
                        onChange={(e) => setNovoAlimento({ ...novoAlimento, [field]: parseFloat(e.target.value) })}
                        className="vintage-input"
                      />
                    </div>
                  );
                })}
              </div>
              <div>
                <label style={labelStyle}>Porção (g)</label>
                <input
                  type="number"
                  min={1}
                  value={novoAlimento.porcao}
                  onChange={(e) => setNovoAlimento({ ...novoAlimento, porcao: parseInt(e.target.value) })}
                  className="vintage-input"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 font-bold text-sm"
                style={{
                  background: "var(--gold)",
                  color: "#0A0600",
                  ...vh,
                  letterSpacing: "0.2em",
                  fontSize: "0.8rem",
                }}
              >
                + ADICIONAR ALIMENTO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
