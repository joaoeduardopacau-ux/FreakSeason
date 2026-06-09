"use client";

import Link from "next/link";
import { useApp } from "@/contexts/AppContext";

const hoje = new Date().toISOString().split("T")[0];

export default function TreinosPage() {
  const { data, removerTreino } = useApp();
  const { treinos, treinosLog } = data;

  function handleRemover(id: string) {
    if (confirm("Remover este treino?")) removerTreino(id);
  }

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
          Treinos
        </h1>
        <Link
          href="/treinos/novo"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "8px 14px",
            background: "var(--accent)",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Novo
        </Link>
      </div>

      {treinos.length === 0 ? (
        <div
          style={{
            background: "var(--s1)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "var(--s2)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3" />
              <line x1="6" y1="12" x2="18" y2="12" />
            </svg>
          </div>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
            Nenhum treino criado
          </p>
          <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "20px" }}>
            Crie seu primeiro programa de treino
          </p>
          <Link
            href="/treinos/novo"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Criar primeiro treino
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {treinos.map((treino) => {
            const logs = treinosLog.filter((l) => l.workoutId === treino.id);
            const treinadoHoje = logs.some((l) => l.data.startsWith(hoje));

            return (
              <div
                key={treino.id}
                style={{
                  background: "var(--s1)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    padding: "14px 16px",
                    gap: "12px",
                  }}
                >
                  <Link
                    href={`/treinos/${treino.id}`}
                    style={{ flex: 1, textDecoration: "none" }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text)" }}>
                            {treino.nome}
                          </h3>
                          {treinadoHoje && (
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: 600,
                                color: "var(--green)",
                                background: "var(--green-dim)",
                                border: "1px solid var(--green)",
                                borderRadius: "999px",
                                padding: "1px 7px",
                              }}
                            >
                              Feito hoje
                            </span>
                          )}
                        </div>
                        {treino.descricao && (
                          <p style={{ fontSize: "12px", color: "var(--text2)", marginBottom: "8px" }}>
                            {treino.descricao}
                          </p>
                        )}
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          <span className="badge">{treino.exercicios.length} exercícios</span>
                          <span className="badge">{logs.length}× realizado</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    <Link
                      href={`/treinos/${treino.id}/editar`}
                      style={{
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        background: "var(--s2)",
                        border: "1px solid var(--border)",
                        color: "var(--text2)",
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleRemover(treino.id)}
                      style={{
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",
                        background: "var(--s2)",
                        border: "1px solid var(--border)",
                        color: "var(--text2)",
                        cursor: "pointer",
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
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
