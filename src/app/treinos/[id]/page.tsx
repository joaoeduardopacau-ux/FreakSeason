"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import type { WorkoutLog } from "@/types";

export default function TreinoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, adicionarLogTreino } = useApp();

  const treino = data.treinos.find((t) => t.id === id);

  if (!treino) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center" }}>
        <p style={{ fontSize: "14px", color: "var(--text2)", marginBottom: "12px" }}>
          Treino não encontrado
        </p>
        <Link
          href="/treinos"
          style={{ fontSize: "13px", color: "var(--accent)", textDecoration: "none" }}
        >
          Voltar para treinos
        </Link>
      </div>
    );
  }

  const hoje = new Date().toISOString().split("T")[0];
  const treinadoHoje = data.treinosLog.some(
    (l) => l.workoutId === id && l.data.startsWith(hoje)
  );
  const totalVezes = data.treinosLog.filter((l) => l.workoutId === id).length;

  function handleConcluir() {
    const log: WorkoutLog = {
      id: crypto.randomUUID(),
      workoutId: id,
      data: new Date().toISOString(),
      concluido: true,
    };
    adicionarLogTreino(log);
    router.push("/");
  }

  return (
    <div style={{ background: "var(--bg)", padding: "0 16px 32px" }}>
      {/* Nav row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 0 16px",
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
        <Link
          href={`/treinos/${id}/editar`}
          style={{
            fontSize: "13px",
            color: "var(--text2)",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Editar
        </Link>
      </div>

      {/* Workout header */}
      <div
        style={{
          background: "var(--s1)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "20px 16px",
          marginBottom: "12px",
        }}
      >
        <h1
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "6px",
            lineHeight: 1.2,
          }}
        >
          {treino.nome}
        </h1>
        {treino.descricao && (
          <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "16px" }}>
            {treino.descricao}
          </p>
        )}
        <div style={{ display: "flex", gap: "8px" }}>
          <span className="badge">{treino.exercicios.length} exercícios</span>
          <span className="badge">{totalVezes}× realizado</span>
          {treinadoHoje && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "10px",
                fontWeight: 600,
                color: "var(--green)",
                background: "var(--green-dim)",
                border: "1px solid var(--green)",
                borderRadius: "999px",
                padding: "2px 8px",
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Feito hoje
            </span>
          )}
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
        {treino.exercicios.map((ex, idx) => (
          <div
            key={ex.id}
            style={{
              background: "var(--s1)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "14px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--s2)",
                border: "1px solid var(--border)",
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
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)", marginBottom: "8px" }}>
                {ex.nome}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                <span className="badge">{ex.series} séries</span>
                <span className="badge">{ex.repeticoes} reps</span>
                {ex.carga && <span className="badge">{ex.carga}</span>}
                {ex.descanso && <span className="badge">⏱ {ex.descanso}</span>}
              </div>
              {ex.observacoes && (
                <p style={{ fontSize: "12px", color: "var(--text2)", marginTop: "6px", fontStyle: "italic" }}>
                  {ex.observacoes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Complete button */}
      {treinadoHoje ? (
        <div
          style={{
            background: "var(--green-dim)",
            border: "1px solid var(--green)",
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--green)" }}>
            Concluído hoje
          </span>
        </div>
      ) : (
        <button
          onClick={handleConcluir}
          className="btn-primary"
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "15px",
            boxShadow: "0 0 24px var(--accent-glow)",
          }}
        >
          Marcar como concluído
        </button>
      )}
    </div>
  );
}
