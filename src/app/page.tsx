"use client";

import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import { calcularMetasCalorias } from "@/lib/calculations";
import MacroBar from "@/components/MacroBar";

const hoje = new Date().toISOString().split("T")[0];

function DonutRing({
  value,
  max,
  size = 120,
}: {
  value: number;
  max: number;
  size?: number;
}) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="var(--s3)"
        strokeWidth="8"
      />
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

export default function Dashboard() {
  const { data } = useApp();
  const { perfil, refeicoes, treinos, treinosLog } = data;

  const refeicoesHoje = refeicoes.filter((r) => r.data.startsWith(hoje));
  const totais = refeicoesHoje.reduce(
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
  const treinoHoje = treinosLog.find((l) => l.data.startsWith(hoje));
  const diasTreino = new Set(treinosLog.map((l) => l.data.split("T")[0])).size;

  const dateLabel = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div style={{ background: "var(--bg)", minHeight: "100%", padding: "0 16px 16px" }}>

      {/* ── HEADER ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 0 16px",
        }}
      >
        <div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
            FreakSeason
          </div>
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text2)",
            fontWeight: 500,
            textTransform: "capitalize",
          }}
        >
          {dateLabel}
        </div>
      </div>

      {/* ── NO PROFILE BANNER ── */}
      {!perfil && (
        <div
          style={{
            background: "var(--accent-dim)",
            border: "1px solid var(--accent)",
            borderRadius: "12px",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "13px", color: "var(--text)", fontWeight: 500 }}>
            Configure seu perfil para começar
          </span>
          <Link
            href="/perfil"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#fff",
              background: "var(--accent)",
              padding: "6px 12px",
              borderRadius: "8px",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Ir agora
          </Link>
        </div>
      )}

      {/* ── CALORIES CARD ── */}
      <div
        style={{
          background: "var(--s1)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "20px 16px 16px",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <span className="stat-label">Calorias</span>
          <Link
            href="/dieta"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--accent)",
              textDecoration: "none",
            }}
          >
            + Adicionar
          </Link>
        </div>

        {/* Donut + number */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <DonutRing value={Math.round(totais.calorias)} max={metas?.calorias ?? 2000} />
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transform: "none",
              }}
            >
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--accent)",
                  lineHeight: 1,
                }}
              >
                {Math.round(totais.calorias)}
              </span>
              <span style={{ fontSize: "9px", color: "var(--text2)", marginTop: "2px" }}>
                / {metas?.calorias ?? "—"} kcal
              </span>
            </div>
          </div>

          {/* Macros in column */}
          {metas ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
              <MacroBar label="Proteína" atual={Math.round(totais.proteinas)} meta={metas.proteinas} cor="protein" />
              <MacroBar label="Carboidrato" atual={Math.round(totais.carboidratos)} meta={metas.carboidratos} cor="carbs" />
              <MacroBar label="Gordura" atual={Math.round(totais.gorduras)} meta={metas.gorduras} cor="fat" />
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "12px", color: "var(--text2)" }}>
                Configure seu perfil para ver as metas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── WORKOUT CARD ── */}
      <div
        style={{
          background: "var(--s1)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <span className="stat-label">Treino de hoje</span>
          <Link
            href="/treinos"
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--text2)",
              textDecoration: "none",
            }}
          >
            Ver todos
          </Link>
        </div>

        {treinoHoje ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: "var(--green-dim)",
                border: "1px solid var(--green)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--green)" }}>
                Treino concluído!
              </div>
              <div style={{ fontSize: "12px", color: "var(--text2)", marginTop: "2px" }}>
                {treinos.find((t) => t.id === treinoHoje.workoutId)?.nome}
              </div>
            </div>
          </div>
        ) : treinos.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {treinos.slice(0, 3).map((t) => (
              <Link
                key={t.id}
                href={`/treinos/${t.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  background: "var(--s2)",
                  borderRadius: "8px",
                  textDecoration: "none",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)" }}>
                    {t.nome}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text2)", marginTop: "2px" }}>
                    {t.exercicios.length} exercícios
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <p style={{ fontSize: "13px", color: "var(--text2)", marginBottom: "12px" }}>
              Nenhum treino cadastrado
            </p>
            <Link
              href="/treinos/novo"
              style={{
                display: "inline-block",
                padding: "8px 20px",
                background: "var(--accent)",
                color: "#fff",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Criar treino
            </Link>
          </div>
        )}
      </div>

      {/* ── STATS GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {[
          {
            label: "Dias treinados",
            value: diasTreino,
            sub: "sessões totais",
          },
          {
            label: "Programas",
            value: treinos.length,
            sub: "treinos criados",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--s1)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "16px",
            }}
          >
            <div className="stat-label" style={{ marginBottom: "8px" }}>{s.label}</div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1,
                marginBottom: "4px",
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text2)" }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
