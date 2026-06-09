"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import type { Exercise, Workout } from "@/types";
import Card from "@/components/Card";

const vh = { fontFamily: "var(--font-oswald), Arial Narrow, sans-serif" };

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
    <div className="px-4 py-4 space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
        <button
          onClick={() => router.back()}
          style={{ color: "var(--gold)", ...vh, fontSize: "0.75rem", letterSpacing: "0.12em" }}
        >
          ← VOLTAR
        </button>
        <span style={{ color: "var(--border)" }}>|</span>
        <h1 style={{ ...vh, fontSize: "1.25rem", fontWeight: 700, color: "var(--gold-light)", letterSpacing: "0.15em" }}>
          NOVO TREINO
        </h1>
      </div>

      <form onSubmit={handleSalvar} className="space-y-4">
        <Card title="DADOS DO TREINO" accent>
          <div className="space-y-3">
            <div>
              <label style={labelStyle}>Nome do Treino *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="vintage-input"
                placeholder="ex: TREINO A — PEITO E TRÍCEPS"
              />
            </div>
            <div>
              <label style={labelStyle}>Descrição (opcional)</label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="vintage-input"
                placeholder="ex: Foco em hipertrofia"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <div className="divider-gold" style={{ flex: 1 }}>
            <span>★ EXERCÍCIOS ★</span>
          </div>
          <button
            type="button"
            onClick={handleAddExercicio}
            className="ml-3 px-3 py-1.5 font-bold text-xs"
            style={{
              color: "var(--gold)",
              border: "1px solid var(--gold)",
              background: "transparent",
              ...vh,
              letterSpacing: "0.15em",
              flexShrink: 0,
            }}
          >
            + ADICIONAR
          </button>
        </div>

        {exercicios.map((ex, idx) => (
          <div
            key={ex.id}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderLeft: "3px solid var(--gold)",
              padding: "1rem",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: "var(--gold)", ...vh, fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.15em" }}>
                EXERCÍCIO {String(idx + 1).padStart(2, "0")}
              </span>
              {exercicios.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveExercicio(ex.id)}
                  style={{ color: "var(--red)", ...vh, fontSize: "0.65rem", letterSpacing: "0.12em" }}
                >
                  ✕ REMOVER
                </button>
              )}
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={ex.nome}
                onChange={(e) => handleExercicioChange(ex.id, "nome", e.target.value)}
                className="vintage-input"
                placeholder="Nome do exercício"
              />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label style={labelStyle}>Séries</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={ex.series}
                    onChange={(e) => handleExercicioChange(ex.id, "series", parseInt(e.target.value))}
                    className="vintage-input"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Repetições</label>
                  <input
                    type="text"
                    value={ex.repeticoes}
                    onChange={(e) => handleExercicioChange(ex.id, "repeticoes", e.target.value)}
                    className="vintage-input"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Descanso</label>
                  <input
                    type="text"
                    value={ex.descanso}
                    onChange={(e) => handleExercicioChange(ex.id, "descanso", e.target.value)}
                    className="vintage-input"
                    placeholder="60s"
                  />
                </div>
              </div>

              <input
                type="text"
                value={ex.carga}
                onChange={(e) => handleExercicioChange(ex.id, "carga", e.target.value)}
                className="vintage-input"
                placeholder="Carga (ex: 20kg, peso corporal)"
              />

              <input
                type="text"
                value={ex.observacoes}
                onChange={(e) => handleExercicioChange(ex.id, "observacoes", e.target.value)}
                className="vintage-input"
                placeholder="Observações (opcional)"
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddExercicio}
          className="w-full py-3 font-bold text-sm"
          style={{
            background: "transparent",
            border: "1px dashed var(--border)",
            color: "var(--muted)",
            ...vh,
            letterSpacing: "0.15em",
          }}
        >
          + ADICIONAR EXERCÍCIO
        </button>

        <button
          type="submit"
          className="w-full py-3 font-bold text-sm"
          style={{
            background: "var(--gold)",
            color: "#0A0600",
            ...vh,
            letterSpacing: "0.2em",
            fontSize: "0.9rem",
          }}
        >
          ★ SALVAR TREINO ★
        </button>
      </form>
    </div>
  );
}
