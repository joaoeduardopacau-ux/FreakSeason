"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import type { WorkoutLog } from "@/types";
import Card from "@/components/Card";

const vh = { fontFamily: "var(--font-oswald), Arial Narrow, sans-serif" };

export default function TreinoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, adicionarLogTreino } = useApp();

  const treino = data.treinos.find((t) => t.id === id);
  if (!treino) {
    return (
      <div className="px-4 py-8 text-center">
        <p style={{ color: "var(--muted)", ...vh, fontSize: "0.85rem", letterSpacing: "0.15em" }}>
          TREINO NÃO ENCONTRADO
        </p>
        <Link
          href="/treinos"
          style={{ color: "var(--gold)", ...vh, fontSize: "0.75rem", letterSpacing: "0.12em", display: "block", marginTop: "0.75rem" }}
        >
          ← VOLTAR PARA TREINOS
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
    <div className="px-4 py-4 space-y-4">

      {/* Nav row */}
      <div className="flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem" }}>
        <button
          onClick={() => router.back()}
          style={{ color: "var(--gold)", ...vh, fontSize: "0.75rem", letterSpacing: "0.12em" }}
        >
          ← VOLTAR
        </button>
        <Link
          href={`/treinos/${id}/editar`}
          style={{ color: "var(--muted)", ...vh, fontSize: "0.7rem", letterSpacing: "0.12em" }}
        >
          ✏ EDITAR
        </Link>
      </div>

      {/* Workout header card — poster style */}
      <div
        className="p-4"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderTop: "3px solid var(--gold)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
        }}
      >
        <div className="text-center mb-3">
          <div style={{ color: "var(--muted)", fontSize: "0.55rem", ...vh, letterSpacing: "0.2em" }}>
            ◆ PROGRAMA DE TREINAMENTO ◆
          </div>
          <h1
            style={{
              ...vh,
              fontSize: "1.6rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              lineHeight: 1.1,
              marginTop: "0.25rem",
              background: "linear-gradient(180deg, var(--gold-light) 0%, var(--gold) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {treino.nome.toUpperCase()}
          </h1>
          {treino.descricao && (
            <p style={{ color: "var(--muted)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
              {treino.descricao}
            </p>
          )}
        </div>
        <div className="divider-gold" style={{ margin: "0.5rem 0" }}></div>
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <p style={{ color: "var(--gold)", ...vh, fontSize: "1.5rem", fontWeight: 700, lineHeight: 1 }}>
              {treino.exercicios.length}
            </p>
            <p style={{ color: "var(--muted)", ...vh, fontSize: "0.55rem", letterSpacing: "0.15em" }}>EXERCÍCIOS</p>
          </div>
          <div style={{ width: "1px", background: "var(--border)" }} />
          <div className="text-center">
            <p style={{ color: "var(--gold)", ...vh, fontSize: "1.5rem", fontWeight: 700, lineHeight: 1 }}>
              {totalVezes}
            </p>
            <p style={{ color: "var(--muted)", ...vh, fontSize: "0.55rem", letterSpacing: "0.15em" }}>REALIZAÇÕES</p>
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="divider-gold">◆ LISTA DE EXERCÍCIOS ◆</div>

      <div className="space-y-3">
        {treino.exercicios.map((ex, idx) => (
          <div
            key={ex.id}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderLeft: "3px solid var(--gold)",
            }}
          >
            <div className="p-3 flex items-start gap-3">
              <div
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center font-bold"
                style={{
                  background: "var(--card-2)",
                  border: "1px solid var(--border)",
                  color: "var(--gold)",
                  ...vh,
                  fontSize: "0.85rem",
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </div>
              <div className="flex-1">
                <h3 style={{ color: "var(--cream)", ...vh, fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.08em" }}>
                  {ex.nome.toUpperCase()}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { label: `${ex.series} SÉR.`, color: "var(--card-2)" },
                    { label: `${ex.repeticoes} REPS`, color: "var(--card-2)" },
                    ...(ex.carga ? [{ label: ex.carga.toUpperCase(), color: "rgba(212,144,10,0.15)" }] : []),
                    ...(ex.descanso ? [{ label: `⏱ ${ex.descanso}`, color: "rgba(139,26,26,0.2)" }] : []),
                  ].map((badge) => (
                    <span
                      key={badge.label}
                      className="px-2 py-0.5"
                      style={{
                        background: badge.color,
                        border: "1px solid var(--border)",
                        color: "var(--cream)",
                        ...vh,
                        fontSize: "0.6rem",
                        letterSpacing: "0.12em",
                      }}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
                {ex.observacoes && (
                  <p style={{ color: "var(--muted)", fontSize: "0.65rem", marginTop: "0.375rem", fontStyle: "italic" }}>
                    {ex.observacoes}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Complete button */}
      {treinadoHoje ? (
        <div
          className="p-4 text-center"
          style={{
            background: "var(--card-2)",
            border: "1px solid var(--gold)",
          }}
        >
          <p style={{ color: "var(--gold)", ...vh, fontSize: "1rem", fontWeight: 700, letterSpacing: "0.2em" }}>
            ★ TREINO CONCLUÍDO HOJE ★
          </p>
        </div>
      ) : (
        <button
          onClick={handleConcluir}
          className="w-full py-4 font-bold text-base"
          style={{
            background: "var(--gold)",
            color: "#0A0600",
            ...vh,
            letterSpacing: "0.2em",
            fontSize: "0.95rem",
            boxShadow: "0 2px 12px rgba(212,144,10,0.3)",
          }}
        >
          ★ MARCAR COMO CONCLUÍDO HOJE ★
        </button>
      )}
    </div>
  );
}
