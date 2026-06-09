"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { calcularMetasCalorias } from "@/lib/calculations";
import type { Refeicao, RefeicaoItem } from "@/types";
import MacroBar from "@/components/MacroBar";

const hoje = new Date().toISOString().split("T")[0];

const refeicaoOpcoes = [
  { value: "cafe_manha",    label: "Café da manhã",   short: "Café" },
  { value: "lanche_manha",  label: "Lanche da manhã", short: "Lanche M." },
  { value: "almoco",        label: "Almoço",          short: "Almoço" },
  { value: "lanche_tarde",  label: "Lanche da tarde", short: "Lanche T." },
  { value: "jantar",        label: "Jantar",          short: "Jantar" },
  { value: "ceia",          label: "Ceia",            short: "Ceia" },
] as const;

type RefeicaoTipo = typeof refeicaoOpcoes[number]["value"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "0.08em",
        color: "var(--text2)",
        textTransform: "uppercase" as const,
        marginBottom: "6px",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      {children}
    </label>
  );
}

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
    <div style={{ background: "var(--bg)", padding: "0 16px 16px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 0 16px",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text)" }}>
          Dieta
        </h1>
        <button
          onClick={() => setModal(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "8px 14px",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Refeição
        </button>
      </div>

      {/* Daily summary */}
      <div
        style={{
          background: "var(--s1)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "12px",
        }}
      >
        <div className="stat-label" style={{ marginBottom: "10px" }}>Resumo do dia</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", marginBottom: "16px" }}>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "var(--accent)",
              lineHeight: 1,
            }}
          >
            {Math.round(totaisHoje.calorias)}
          </span>
          <div style={{ paddingBottom: "6px" }}>
            <div style={{ fontSize: "12px", color: "var(--text2)" }}>
              / {metas?.calorias ?? "—"} kcal
            </div>
          </div>
        </div>
        {metas ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <MacroBar label="Proteína" atual={Math.round(totaisHoje.proteinas)} meta={metas.proteinas} cor="protein" />
            <MacroBar label="Carboidrato" atual={Math.round(totaisHoje.carboidratos)} meta={metas.carboidratos} cor="carbs" />
            <MacroBar label="Gordura" atual={Math.round(totaisHoje.gorduras)} meta={metas.gorduras} cor="fat" />
          </div>
        ) : (
          <p style={{ fontSize: "12px", color: "var(--text2)" }}>
            Configure seu perfil para ver as metas
          </p>
        )}
      </div>

      {/* Meals */}
      {refeicoesHoje.length === 0 ? (
        <div
          style={{
            background: "var(--s1)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "14px", color: "var(--text2)", marginBottom: "12px" }}>
            Nenhuma refeição registrada hoje
          </p>
          <button
            onClick={() => setModal(true)}
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            + Adicionar primeira refeição
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {refeicaoOpcoes.map(({ value, label }) => {
            const ref = refeicoesHoje.find((r) => r.tipo === value);
            if (!ref) return null;
            const totalRef = ref.itens.reduce((a, i) => a + i.caloriasTotais, 0);
            return (
              <div
                key={ref.id}
                style={{
                  background: "var(--s1)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "12px 14px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <p className="stat-label" style={{ marginBottom: "4px" }}>{label}</p>
                      <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
                        {Math.round(totalRef)}
                        <span style={{ fontSize: "12px", color: "var(--text2)", marginLeft: "4px", fontWeight: 400 }}>kcal</span>
                      </p>
                    </div>
                    <button
                      onClick={() => removerRefeicao(ref.id)}
                      style={{
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "6px",
                        background: "var(--s2)",
                        border: "1px solid var(--border)",
                        color: "var(--text2)",
                        cursor: "pointer",
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {ref.itens.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "var(--text2)" }}>
                          {item.nomeAlimento}
                          <span style={{ color: "var(--text3)", marginLeft: "4px" }}>
                            {item.quantidade}g
                          </span>
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--text)", fontWeight: 500 }}>
                          {Math.round(item.caloriasTotais)} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      marginTop: "8px",
                      paddingTop: "8px",
                      borderTop: "1px solid var(--border)",
                      fontSize: "11px",
                      color: "var(--text2)",
                    }}
                  >
                    <span style={{ color: "var(--blue)" }}>P: {Math.round(ref.itens.reduce((a, i) => a + i.proteinasTotais, 0))}g</span>
                    <span style={{ color: "var(--green)" }}>C: {Math.round(ref.itens.reduce((a, i) => a + i.carboidratosTotais, 0))}g</span>
                    <span style={{ color: "var(--accent)" }}>G: {Math.round(ref.itens.reduce((a, i) => a + i.gordurasTotais, 0))}g</span>
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
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            background: "rgba(0,0,0,0.8)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "448px",
              margin: "0 auto",
              maxHeight: "92vh",
              overflowY: "auto",
              background: "var(--s1)",
              borderTop: "1px solid var(--border)",
              borderRadius: "20px 20px 0 0",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                padding: "16px 16px 12px",
                position: "sticky",
                top: 0,
                background: "var(--s1)",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
                Adicionar refeição
              </h2>
              <button
                onClick={() => { setModal(false); setItens([]); setBusca(""); }}
                style={{
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "999px",
                  background: "var(--s2)",
                  border: "1px solid var(--border)",
                  color: "var(--text2)",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Meal type selector */}
              <div>
                <FieldLabel>Tipo de refeição</FieldLabel>
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  {refeicaoOpcoes.map((o) => {
                    const selected = tipoRefeicao === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setTipoRefeicao(o.value)}
                        style={{
                          padding: "6px 12px",
                          background: selected ? "var(--accent-dim)" : "var(--s2)",
                          border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                          borderRadius: "999px",
                          color: selected ? "var(--accent)" : "var(--text2)",
                          fontSize: "12px",
                          fontWeight: selected ? 600 : 400,
                          cursor: "pointer",
                          fontFamily: "var(--font-inter), sans-serif",
                          whiteSpace: "nowrap",
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
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="field-input"
                    placeholder="Buscar alimento..."
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setModalAlimento(true)}
                    style={{
                      padding: "10px 12px",
                      background: "var(--s2)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--text2)",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-inter), sans-serif",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    + Novo
                  </button>
                </div>

                <div>
                  <FieldLabel>Quantidade (g/ml)</FieldLabel>
                  <input
                    type="number"
                    min={1}
                    value={qtdSelecionada}
                    onChange={(e) => setQtdSelecionada(parseInt(e.target.value))}
                    className="field-input"
                  />
                </div>

                {busca && (
                  <div
                    style={{
                      marginTop: "8px",
                      maxHeight: "180px",
                      overflowY: "auto",
                      background: "var(--s2)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {alimentosFiltrados.length === 0 ? (
                      <p style={{ fontSize: "13px", color: "var(--text2)", padding: "12px", textAlign: "center" }}>
                        Nenhum resultado
                      </p>
                    ) : (
                      alimentosFiltrados.map((a) => {
                        const fator = qtdSelecionada / a.porcao;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => handleAdicionarItem(a.id)}
                            style={{
                              width: "100%",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 14px",
                              borderBottom: "1px solid var(--border)",
                              background: "transparent",
                              cursor: "pointer",
                              textAlign: "left",
                              fontFamily: "var(--font-inter), sans-serif",
                            }}
                          >
                            <div>
                              <p style={{ fontSize: "13px", color: "var(--text)", fontWeight: 500 }}>{a.nome}</p>
                              <p style={{ fontSize: "11px", color: "var(--text2)" }}>
                                {Math.round(a.calorias * fator)} kcal · {qtdSelecionada}{a.unidade}
                              </p>
                            </div>
                            <span style={{ color: "var(--accent)", fontSize: "18px", fontWeight: 300 }}>+</span>
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span className="stat-label">Itens adicionados</span>
                    <span style={{ fontSize: "12px", color: "var(--accent)", fontWeight: 600 }}>
                      {Math.round(totaisItens.calorias)} kcal
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {itens.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 12px",
                          background: "var(--s2)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      >
                        <div>
                          <p style={{ fontSize: "13px", color: "var(--text)", fontWeight: 500 }}>{item.nomeAlimento}</p>
                          <p style={{ fontSize: "11px", color: "var(--text2)" }}>
                            {item.quantidade}g · {Math.round(item.caloriasTotais)} kcal
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoverItem(idx)}
                          style={{
                            color: "var(--text2)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            marginLeft: "8px",
                          }}
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
                style={{
                  width: "100%",
                  padding: "14px",
                  background: itens.length === 0 ? "var(--s3)" : "var(--accent)",
                  color: itens.length === 0 ? "var(--text3)" : "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: itens.length === 0 ? "not-allowed" : "pointer",
                  fontFamily: "var(--font-inter), sans-serif",
                  transition: "background 0.15s",
                }}
              >
                Salvar refeição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add food modal */}
      {modalAlimento && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            background: "rgba(0,0,0,0.85)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "380px",
              background: "var(--s1)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>
                Novo alimento
              </h3>
              <button
                onClick={() => setModalAlimento(false)}
                style={{
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "999px",
                  background: "var(--s2)",
                  border: "1px solid var(--border)",
                  color: "var(--text2)",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleSalvarAlimento}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <input
                required
                type="text"
                value={novoAlimento.nome}
                onChange={(e) => setNovoAlimento({ ...novoAlimento, nome: e.target.value })}
                className="field-input"
                placeholder="Nome do alimento"
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {(["calorias", "proteinas", "carboidratos", "gorduras"] as const).map((field) => {
                  const fieldLabels = {
                    calorias: "Calorias (kcal)",
                    proteinas: "Proteínas (g)",
                    carboidratos: "Carboidratos (g)",
                    gorduras: "Gorduras (g)",
                  };
                  return (
                    <div key={field}>
                      <FieldLabel>{fieldLabels[field]}</FieldLabel>
                      <input
                        type="number"
                        min={0}
                        step={0.1}
                        value={novoAlimento[field]}
                        onChange={(e) => setNovoAlimento({ ...novoAlimento, [field]: parseFloat(e.target.value) })}
                        className="field-input"
                      />
                    </div>
                  );
                })}
              </div>
              <div>
                <FieldLabel>Porção (g)</FieldLabel>
                <input
                  type="number"
                  min={1}
                  value={novoAlimento.porcao}
                  onChange={(e) => setNovoAlimento({ ...novoAlimento, porcao: parseInt(e.target.value) })}
                  className="field-input"
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%", padding: "12px", fontSize: "14px", marginTop: "4px" }}
              >
                Adicionar alimento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
