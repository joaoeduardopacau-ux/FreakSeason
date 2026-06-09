"use client";

import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import { calcularMetasCalorias } from "@/lib/calculations";
import MacroBar from "@/components/MacroBar";

const bb  = { fontFamily: "var(--font-bebas), Impact, Arial Narrow, sans-serif" };
const bar = { fontFamily: "var(--font-barlow), Arial Narrow, sans-serif" };
const hoje = new Date().toISOString().split("T")[0];

const refeicaoLabels: Record<string, string> = {
  cafe_manha: "CAFÉ DA MANHÃ", lanche_manha: "LANCHE MANHÃ",
  almoco: "ALMOÇO", lanche_tarde: "LANCHE TARDE", jantar: "JANTAR", ceia: "CEIA",
};

export default function Dashboard() {
  const { data } = useApp();
  const { perfil, refeicoes, treinos, treinosLog } = data;

  const refeicoesHoje = refeicoes.filter((r) => r.data.startsWith(hoje));
  const totais = refeicoesHoje.reduce(
    (acc, r) => { r.itens.forEach((i) => {
      acc.calorias += i.caloriasTotais; acc.proteinas += i.proteinasTotais;
      acc.carboidratos += i.carboidratosTotais; acc.gorduras += i.gordurasTotais;
    }); return acc; },
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );

  const metas = perfil ? calcularMetasCalorias(perfil) : null;
  const treinoHoje = treinosLog.find((l) => l.data.startsWith(hoje));
  const diasTreino = new Set(treinosLog.map((l) => l.data.split("T")[0])).size;

  return (
    <div style={{ background: "var(--bg)" }}>

      {/* ── MASTHEAD BAR ── */}
      <div style={{ background: "#000", borderBottom: "3px solid var(--yellow)", padding: "0" }}>
        {/* Top ticker */}
        <div style={{ background: var_red, padding: "0.2rem 0.75rem",
          display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ ...bar, fontSize: "0.55rem", fontWeight: 900,
            color: "#fff", letterSpacing: "0.2em" }}>
            ▶ {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
          </span>
        </div>
        {/* FREAKSEASON title */}
        <div style={{ padding: "0.3rem 0.75rem 0.4rem", display: "flex",
          alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ ...bar, fontSize: "0.5rem", fontWeight: 700,
              color: "var(--grey)", letterSpacing: "0.3em" }}>JOE WEIDER'S</div>
            <div style={{ ...bb, fontSize: "3.2rem", color: "var(--yellow)",
              lineHeight: 0.85, letterSpacing: "0.02em" }}>
              FREAK<span style={{ color: "#fff" }}>SEASON</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...bar, fontSize: "0.5rem", fontWeight: 700,
              color: "var(--grey)", letterSpacing: "0.2em" }}>VOL.I</div>
            <div style={{ ...bb, fontSize: "0.9rem", color: "var(--yellow)" }}>2025</div>
          </div>
        </div>
      </div>

      {/* ── NO PROFILE BANNER ── */}
      {!perfil && (
        <div style={{ background: "var(--red)", padding: "0.75rem 1rem",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ ...bar, fontSize: "0.75rem", fontWeight: 900,
            color: "#fff", letterSpacing: "0.1em" }}>
            CONFIGURE SEU PERFIL PARA COMEÇAR!
          </span>
          <Link href="/perfil" style={{ ...bb, fontSize: "0.85rem",
            background: "#fff", color: "var(--red)", padding: "0.2rem 0.6rem",
            letterSpacing: "0.08em", whiteSpace: "nowrap" as const }}>
            IR AGORA
          </Link>
        </div>
      )}

      {/* ── CALORIES FEATURE ── */}
      <div style={{ padding: "0 0.75rem", marginTop: "0.75rem" }}>
        <div style={{ background: "#000", border: "1px solid var(--border)",
          borderTop: "3px solid var(--yellow)" }}>
          {/* Header */}
          <div style={{ background: "var(--yellow)", padding: "0.3rem 0.75rem",
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...bb, fontSize: "0.9rem", color: "#000", letterSpacing: "0.1em" }}>
              CALORIAS DO DIA
            </span>
            <Link href="/dieta" style={{ ...bar, fontSize: "0.6rem", fontWeight: 900,
              color: "#000", letterSpacing: "0.15em" }}>
              + ADICIONAR →
            </Link>
          </div>
          {/* Big number */}
          <div style={{ padding: "0.75rem 0.75rem 0.5rem",
            display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
            <span style={{ ...bb, fontSize: "4.5rem", color: "var(--yellow)", lineHeight: 0.9 }}>
              {Math.round(totais.calorias)}
            </span>
            <div style={{ marginBottom: "0.4rem" }}>
              <div style={{ ...bar, fontSize: "0.6rem", color: "var(--grey)", letterSpacing: "0.15em" }}>
                / {metas?.calorias ?? "—"}
              </div>
              <div style={{ ...bar, fontSize: "0.65rem", fontWeight: 800, color: "#fff" }}>KCAL</div>
            </div>
          </div>
          {/* Macros */}
          {metas ? (
            <div style={{ padding: "0 0.75rem 0.75rem" }}>
              <div className="mag-divider" style={{ marginBottom: "0.6rem", fontSize: "0.5rem" }}>MACROS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <MacroBar label="PROTEÍNAS"   atual={Math.round(totais.proteinas)}   meta={metas.proteinas}   cor="bg-blue-400" />
                <MacroBar label="CARBOIDRATOS" atual={Math.round(totais.carboidratos)} meta={metas.carboidratos} cor="bg-yellow-400" />
                <MacroBar label="GORDURAS"    atual={Math.round(totais.gorduras)}    meta={metas.gorduras}    cor="bg-orange-400" />
              </div>
            </div>
          ) : (
            <div style={{ padding: "0 0.75rem 0.75rem",
              ...bar, fontSize: "0.65rem", color: "var(--grey)", letterSpacing: "0.1em" }}>
              CONFIGURE SEU PERFIL PARA VER AS METAS
            </div>
          )}
          {/* Meal list */}
          {refeicoesHoje.length > 0 && (
            <div style={{ borderTop: "1px solid var(--border)" }}>
              {refeicoesHoje.map((r) => {
                const cal = r.itens.reduce((a, i) => a + i.caloriasTotais, 0);
                return (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between",
                    padding: "0.3rem 0.75rem", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ ...bar, fontSize: "0.65rem", color: "var(--grey)", letterSpacing: "0.08em" }}>
                      {refeicaoLabels[r.tipo]}
                    </span>
                    <span style={{ ...bar, fontSize: "0.65rem", fontWeight: 700, color: "#fff" }}>
                      {Math.round(cal)} KCAL
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── WORKOUT SECTION ── */}
      <div style={{ padding: "0.75rem 0.75rem 0" }}>
        <div style={{ background: "#000", border: "1px solid var(--border)",
          borderTop: "3px solid #fff" }}>
          <div style={{ background: "#fff", padding: "0.3rem 0.75rem",
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ ...bb, fontSize: "0.9rem", color: "#000", letterSpacing: "0.1em" }}>
              TREINO DE HOJE
            </span>
            <Link href="/treinos" style={{ ...bar, fontSize: "0.6rem", fontWeight: 900,
              color: "#000", letterSpacing: "0.15em" }}>VER TODOS →</Link>
          </div>

          {treinoHoje ? (
            <div style={{ padding: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "var(--yellow)", padding: "0.4rem 0.6rem" }}>
                <span style={{ ...bb, fontSize: "1.4rem", color: "#000" }}>✓</span>
              </div>
              <div>
                <div style={{ ...bb, fontSize: "1rem", color: "var(--yellow)", letterSpacing: "0.08em" }}>
                  TREINO CONCLUÍDO!
                </div>
                <div style={{ ...bar, fontSize: "0.7rem", color: "var(--grey)", letterSpacing: "0.08em" }}>
                  {treinos.find((t) => t.id === treinoHoje.workoutId)?.nome.toUpperCase()}
                </div>
              </div>
            </div>
          ) : treinos.length > 0 ? (
            <div style={{ padding: "0.5rem 0.75rem" }}>
              <div style={{ ...bar, fontSize: "0.55rem", fontWeight: 700, color: "var(--grey)",
                letterSpacing: "0.2em", marginBottom: "0.5rem" }}>ESCOLHA O TREINO DE HOJE:</div>
              {treinos.slice(0, 3).map((t, i) => (
                <Link key={t.id} href={`/treinos/${t.id}`}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.5rem 0.6rem", borderBottom: "1px solid var(--border)",
                    textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <span style={{ ...bb, fontSize: "1rem", color: "var(--yellow)", minWidth: "1.4rem" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ ...bar, fontSize: "0.8rem", fontWeight: 700, color: "#fff",
                      letterSpacing: "0.05em" }}>
                      {t.nome.toUpperCase()}
                    </span>
                  </div>
                  <span style={{ color: "var(--yellow)", fontSize: "1rem" }}>›</span>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: "1rem 0.75rem", textAlign: "center" }}>
              <div style={{ ...bar, fontSize: "0.7rem", fontWeight: 700, color: "var(--grey)",
                letterSpacing: "0.12em", marginBottom: "0.5rem" }}>
                NENHUM TREINO CADASTRADO
              </div>
              <Link href="/treinos/novo" style={{ ...bb, fontSize: "0.9rem",
                background: "var(--yellow)", color: "#000", padding: "0.3rem 0.9rem",
                letterSpacing: "0.1em" }}>
                CRIAR TREINO →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── STATS CALLOUTS ── */}
      <div style={{ padding: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
        {[
          { label: "DIAS TREINADOS", value: diasTreino, sub: "TOTAL DE SESSÕES", bg: "var(--red)" },
          { label: "PROGRAMAS ATIVOS", value: treinos.length, sub: "TREINOS CRIADOS", bg: "#111" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, border: "1px solid var(--border)", padding: "0.6rem 0.75rem" }}>
            <div style={{ ...bar, fontSize: "0.5rem", fontWeight: 800, letterSpacing: "0.2em",
              color: s.bg === "var(--red)" ? "rgba(255,255,255,0.7)" : "var(--grey)" }}>
              {s.label}
            </div>
            <div style={{ ...bb, fontSize: "3rem", lineHeight: 1,
              color: s.bg === "var(--red)" ? "#fff" : "var(--yellow)" }}>
              {s.value}
            </div>
            <div style={{ ...bar, fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.15em",
              color: s.bg === "var(--red)" ? "rgba(255,255,255,0.5)" : "var(--grey-dark)" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// CSS variable helper to avoid TS issues in JSX
const var_red = "var(--red)";
