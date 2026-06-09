"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import type { Exercise, Workout } from "@/types";

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

function novoExercicio(): Exercise {
  return {
    id: crypto.randomUUID(),
    nome: "",
    series: 3,
    repeticoes: "10",
    carga: "",
    descanso: "60s",
    observacoes: "",
  };
}

export default function NovoTreinoPage() {
  const router = useRouter();
  const { adicionarTreino } = useApp();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [exercicios, setExercicios] = useState<Exercise[]>([novoExercicio()]);

  function handleAddExercicio() {
    setExercicios((e) => [...e, novoExercicio()]);
  }

  function handleRemoveExercicio(id: string) {
    setExercicios((e) => e.filter((ex) => ex.id !== id));
  }

  function handleExercicioChange(id: string, field: keyof Exercise, value: string | number) {
    setExercicios((e) =>
      e.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  }

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    const treino: Workout = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      descricao: descricao.trim(),
      exercicios: exercicios.filter((ex) => ex.nome.trim()),
      criadoEm: new Date().toISOString(),
    };
    adicionarTreino(treino);
    router.push("/treinos");
  }

  return (
    <div style={{ background: "var(--bg)", padding: "0 16px 32px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "20px 0 16px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            color: "var(--text2)",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "13px",
            padding: 0,
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </button>
        <h1 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)" }}>
          Novo treino
        </h1>
      </div>

      <form onSubmit={handleSalvar} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Workout data */}
        <div
          style={{
            background: "var(--s1)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <div className="stat-label" style={{ marginBottom: "12px" }}>Dados do treino</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <FieldLabel>Nome do treino *</FieldLabel>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="field-input"
                placeholder="Ex: Treino A — Peito e Tríceps"
              />
            </div>
            <div>
              <FieldLabel>Descrição (opcional)</FieldLabel>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="field-input"
                placeholder="Ex: Foco em hipertrofia"
              />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {exercicios.map((ex, idx) => (
            <div
              key={ex.id}
              style={{
                background: "var(--s1)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "8px",
                      background: "var(--accent-dim)",
                      border: "1px solid var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--accent)",
                      flexShrink: 0,
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
                    Exercício {idx + 1}
                  </span>
                </div>
                {exercicios.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveExercicio(ex.id)}
                    style={{
                      fontSize: "12px",
                      color: "var(--red)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-inter), sans-serif",
                    }}
                  >
                    Remover
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  type="text"
                  value={ex.nome}
                  onChange={(e) => handleExercicioChange(ex.id, "nome", e.target.value)}
                  className="field-input"
                  placeholder="Nome do exercício"
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <div>
                    <FieldLabel>Séries</FieldLabel>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={ex.series}
                      onChange={(e) => handleExercicioChange(ex.id, "series", parseInt(e.target.value))}
                      className="field-input"
                      style={{ textAlign: "center" }}
                    />
                  </div>
                  <div>
                    <FieldLabel>Repetições</FieldLabel>
                    <input
                      type="text"
                      value={ex.repeticoes}
                      onChange={(e) => handleExercicioChange(ex.id, "repeticoes", e.target.value)}
                      className="field-input"
                      placeholder="10"
                      style={{ textAlign: "center" }}
                    />
                  </div>
                  <div>
                    <FieldLabel>Descanso</FieldLabel>
                    <input
                      type="text"
                      value={ex.descanso}
                      onChange={(e) => handleExercicioChange(ex.id, "descanso", e.target.value)}
                      className="field-input"
                      placeholder="60s"
                      style={{ textAlign: "center" }}
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={ex.carga}
                  onChange={(e) => handleExercicioChange(ex.id, "carga", e.target.value)}
                  className="field-input"
                  placeholder="Carga (ex: 20kg, peso corporal)"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add exercise button */}
        <button
          type="button"
          onClick={handleAddExercicio}
          style={{
            width: "100%",
            padding: "12px",
            background: "transparent",
            border: "1px dashed var(--border)",
            borderRadius: "12px",
            color: "var(--text2)",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--font-inter), sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Adicionar exercício
        </button>

        <button
          type="submit"
          className="btn-primary"
          style={{ width: "100%", padding: "14px", fontSize: "15px" }}
        >
          Salvar treino
        </button>
      </form>
    </div>
  );
}
