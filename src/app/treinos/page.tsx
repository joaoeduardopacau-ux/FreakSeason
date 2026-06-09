"use client";

import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import Card from "@/components/Card";

const hoje = new Date().toISOString().split("T")[0];
const vh = { fontFamily: "var(--font-oswald), Arial Narrow, sans-serif" };

export default function TreinosPage() {
  const { data, removerTreino } = useApp();
  const { treinos, treinosLog } = data;

  function handleRemover(id: string) {
    if (confirm("Remover este treino?")) removerTreino(id);
  }

  return (
    <div className="px-4 py-4 space-y-4">

      {/* Header */}
      <div className="text-center py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div style={{ color: "var(--muted)", fontSize: "0.6rem", ...vh, letterSpacing: "0.2em" }}>
          ◆ MUSCLE & FITNESS · VENICE BEACH ◆
        </div>
        <h1 style={{ ...vh, fontSize: "2rem", fontWeight: 700, color: "var(--gold-light)", letterSpacing: "0.2em", lineHeight: 1.1, marginTop: "0.25rem" }}>
          TREINOS
        </h1>
      </div>

      <div className="flex items-center justify-between">
        <div className="divider-gold" style={{ flex: 1 }}>
          <span>★ PROGRAMAS ★</span>
        </div>
        <Link
          href="/treinos/novo"
          className="ml-3 px-4 py-2 font-bold text-xs"
          style={{
            background: "var(--gold)",
            color: "#0A0600",
            ...vh,
            letterSpacing: "0.15em",
            flexShrink: 0,
          }}
        >
          + NOVO
        </Link>
      </div>

      {treinos.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <div
              style={{
                fontSize: "2.5rem",
                color: "var(--gold)",
                marginBottom: "1rem",
              }}
            >
              ◆
            </div>
            <p
              style={{ color: "var(--muted)", ...vh, fontSize: "0.85rem", letterSpacing: "0.15em", marginBottom: "1rem" }}
            >
              NENHUM TREINO CRIADO
            </p>
            <Link
              href="/treinos/novo"
              className="inline-block px-6 py-2.5 font-bold text-sm"
              style={{
                background: "var(--gold)",
                color: "#0A0600",
                ...vh,
                letterSpacing: "0.15em",
              }}
            >
              CRIAR MEU PRIMEIRO TREINO
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {treinos.map((treino, idx) => {
            const logs = treinosLog.filter((l) => l.workoutId === treino.id);
            const treinadoHoje = logs.some((l) => l.data.startsWith(hoje));
            return (
              <div
                key={treino.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--gold)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                <div className="p-4 flex items-start justify-between">
                  <Link href={`/treinos/${treino.id}`} className="flex-1">
                    <div className="flex items-start gap-3">
                      <span
                        style={{ color: "var(--gold)", ...vh, fontSize: "1.4rem", fontWeight: 700, lineHeight: 1, minWidth: "2rem" }}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div>
                        {treinadoHoje && (
                          <span
                            className="inline-block px-2 py-0.5 mb-1"
                            style={{
                              background: "var(--gold)",
                              color: "#0A0600",
                              ...vh,
                              fontSize: "0.55rem",
                              letterSpacing: "0.15em",
                              fontWeight: 700,
                            }}
                          >
                            ★ CONCLUÍDO HOJE
                          </span>
                        )}
                        <h3
                          style={{ color: "var(--cream)", ...vh, fontSize: "1rem", fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.2 }}
                        >
                          {treino.nome.toUpperCase()}
                        </h3>
                        {treino.descricao && (
                          <p style={{ color: "var(--muted)", fontSize: "0.7rem", marginTop: "2px" }}>
                            {treino.descricao}
                          </p>
                        )}
                        <div
                          className="flex gap-3 mt-2"
                          style={{ color: "var(--muted)", ...vh, fontSize: "0.6rem", letterSpacing: "0.12em" }}
                        >
                          <span>{treino.exercicios.length} EXERCÍCIOS</span>
                          <span>·</span>
                          <span>{logs.length}× REALIZADO</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="flex gap-2 ml-2 shrink-0">
                    <Link
                      href={`/treinos/${treino.id}/editar`}
                      className="p-1.5"
                      style={{ color: "var(--muted)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleRemover(treino.id)}
                      className="p-1.5"
                      style={{ color: "var(--muted)" }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
