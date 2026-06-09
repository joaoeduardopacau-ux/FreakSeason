"use client";

import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import { calcularMetasCalorias } from "@/lib/calculations";
import Card from "@/components/Card";
import MacroBar from "@/components/MacroBar";

const hoje = new Date().toISOString().split("T")[0];

const refeicaoLabels: Record<string, string> = {
  cafe_manha: "CAFÉ DA MANHÃ",
  lanche_manha: "LANCHE MANHÃ",
  almoco: "ALMOÇO",
  lanche_tarde: "LANCHE TARDE",
  jantar: "JANTAR",
  ceia: "CEIA",
};

const vintageHeading = {
  fontFamily: "var(--font-oswald), Arial Narrow, sans-serif",
  letterSpacing: "0.15em",
  textTransform: "uppercase" as const,
};

export default function Dashboard() {
  const { data } = useApp();
  const { perfil, refeicoes, treinos, treinosLog } = data;

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
  const treinoHoje = treinosLog.find((l) => l.data.startsWith(hoje));
  const diasTreino = new Set(treinosLog.map((l) => l.data.split("T")[0])).size;

  return (
    <div className="px-4 py-4 space-y-4">

      {/* Header — vintage poster style */}
      <div
        className="text-center py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="text-xs tracking-widest mb-1"
          style={{ color: "var(--muted)", fontFamily: "var(--font-oswald), sans-serif" }}
        >
          ◆ EST. VENICE BEACH · 1977 ◆
        </div>
        <h1
          className="text-4xl font-bold"
          style={{
            ...vintageHeading,
            background: "linear-gradient(180deg, var(--gold-light) 0%, var(--gold) 55%, #8A5C06 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1.1,
          }}
        >
          {perfil ? perfil.nome.split(" ")[0].toUpperCase() : "FREAK"}
        </h1>
        <div
          className="text-sm mt-0.5"
          style={{ color: "var(--cream)", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.1em" }}
        >
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }).toUpperCase()}
        </div>
        <div className="divider-gold mt-3">★ HOJE ★</div>
      </div>

      {/* No profile warning */}
      {!perfil && (
        <div
          className="border p-4 text-center"
          style={{ borderColor: "var(--gold)", background: "var(--card-2)" }}
        >
          <p
            className="text-sm mb-3"
            style={{ color: "var(--cream)", ...vintageHeading, fontSize: "0.75rem" }}
          >
            ★ Configure seu perfil para começar ★
          </p>
          <Link
            href="/perfil"
            className="inline-block px-5 py-2 font-bold text-sm"
            style={{
              background: "var(--gold)",
              color: "#0A0600",
              ...vintageHeading,
              fontSize: "0.75rem",
            }}
          >
            CONFIGURAR PERFIL →
          </Link>
        </div>
      )}

      {/* Calories card */}
      <Card title="CALORIAS DO DIA" accent>
        <div className="flex justify-between items-start mb-4">
          <div>
            <span
              className="font-bold"
              style={{
                fontSize: "3rem",
                lineHeight: 1,
                color: "var(--gold-light)",
                fontFamily: "var(--font-oswald), sans-serif",
              }}
            >
              {Math.round(totaisHoje.calorias)}
            </span>
            <span
              className="ml-2 text-base"
              style={{ color: "var(--muted)", fontFamily: "var(--font-oswald), sans-serif" }}
            >
              / {metas?.calorias ?? "—"} kcal
            </span>
          </div>
          <Link
            href="/dieta"
            className="px-3 py-1.5 text-xs font-bold"
            style={{
              background: "var(--gold)",
              color: "#0A0600",
              ...vintageHeading,
              fontSize: "0.6rem",
            }}
          >
            + ADICIONAR
          </Link>
        </div>

        {metas && (
          <div className="space-y-2.5">
            <MacroBar
              label="PROTEÍNAS"
              atual={Math.round(totaisHoje.proteinas)}
              meta={metas.proteinas}
              cor="bg-blue-400"
            />
            <MacroBar
              label="CARBOIDRATOS"
              atual={Math.round(totaisHoje.carboidratos)}
              meta={metas.carboidratos}
              cor="bg-yellow-400"
            />
            <MacroBar
              label="GORDURAS"
              atual={Math.round(totaisHoje.gorduras)}
              meta={metas.gorduras}
              cor="bg-orange-400"
            />
          </div>
        )}

        {refeicoesHoje.length > 0 && (
          <div
            className="mt-3 pt-3 space-y-1"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {refeicoesHoje.map((r) => {
              const cal = r.itens.reduce((a, i) => a + i.caloriasTotais, 0);
              return (
                <div
                  key={r.id}
                  className="flex justify-between"
                  style={{ fontFamily: "var(--font-oswald), sans-serif", fontSize: "0.7rem" }}
                >
                  <span style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>
                    {refeicaoLabels[r.tipo]}
                  </span>
                  <span style={{ color: "var(--cream)" }}>{Math.round(cal)} KCAL</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Workout card */}
      <Card title="TREINO DE HOJE" accent>
        <div className="flex justify-between items-center mb-3">
          <span style={{ color: "var(--muted)", fontSize: "0.65rem", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.15em" }}>
            {treinoHoje ? "◆ CONCLUÍDO" : "◆ PENDENTE"}
          </span>
          <Link
            href="/treinos"
            style={{ color: "var(--gold)", fontSize: "0.65rem", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.12em" }}
          >
            VER TODOS →
          </Link>
        </div>

        {treinoHoje ? (
          <div
            className="flex items-center gap-3 p-3"
            style={{ background: "var(--card-2)", border: "1px solid var(--border)" }}
          >
            <span style={{ color: "var(--gold)", fontSize: "1.5rem" }}>★</span>
            <div>
              <p
                className="font-bold"
                style={{ color: "var(--gold-light)", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.1em" }}
              >
                TREINO CONCLUÍDO!
              </p>
              <p
                style={{ color: "var(--muted)", fontSize: "0.75rem", fontFamily: "var(--font-oswald), sans-serif" }}
              >
                {treinos.find((t) => t.id === treinoHoje.workoutId)?.nome.toUpperCase()}
              </p>
            </div>
          </div>
        ) : treinos.length > 0 ? (
          <div className="space-y-2">
            <p
              style={{ color: "var(--muted)", fontSize: "0.65rem", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.12em" }}
            >
              ESCOLHA UM TREINO:
            </p>
            {treinos.slice(0, 3).map((t, idx) => (
              <Link
                key={t.id}
                href={`/treinos/${t.id}`}
                className="flex items-center justify-between px-3 py-2.5 transition-opacity hover:opacity-80"
                style={{ background: "var(--card-2)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-bold"
                    style={{ color: "var(--gold)", fontFamily: "var(--font-oswald), sans-serif", fontSize: "0.9rem", minWidth: "20px" }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: "var(--cream)", fontFamily: "var(--font-oswald), sans-serif", fontSize: "0.85rem", letterSpacing: "0.05em" }}
                  >
                    {t.nome.toUpperCase()}
                  </span>
                </div>
                <span style={{ color: "var(--gold)" }}>›</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p
              style={{ color: "var(--muted)", fontSize: "0.75rem", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.1em", marginBottom: "0.75rem" }}
            >
              NENHUM TREINO CADASTRADO
            </p>
            <Link
              href="/treinos/novo"
              style={{ color: "var(--gold)", fontSize: "0.75rem", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.12em" }}
            >
              CRIAR PRIMEIRO TREINO →
            </Link>
          </div>
        )}
      </Card>

      {/* Stats grid */}
      <div className="divider-gold">◆ ESTATÍSTICAS ◆</div>

      <div className="grid grid-cols-2 gap-3">
        <div className="stat-plate">
          <p
            style={{ color: "var(--muted)", fontSize: "0.6rem", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.15em", marginBottom: "0.25rem" }}
          >
            DIAS TREINADOS
          </p>
          <p
            className="font-bold"
            style={{ color: "var(--gold-light)", fontFamily: "var(--font-oswald), sans-serif", fontSize: "2.5rem", lineHeight: 1 }}
          >
            {diasTreino}
          </p>
          <p
            style={{ color: "var(--muted)", fontSize: "0.6rem", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.12em", marginTop: "0.25rem" }}
          >
            SESSÕES TOTAIS
          </p>
        </div>
        <div className="stat-plate">
          <p
            style={{ color: "var(--muted)", fontSize: "0.6rem", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.15em", marginBottom: "0.25rem" }}
          >
            PROGRAMAS
          </p>
          <p
            className="font-bold"
            style={{ color: "var(--gold-light)", fontFamily: "var(--font-oswald), sans-serif", fontSize: "2.5rem", lineHeight: 1 }}
          >
            {treinos.length}
          </p>
          <p
            style={{ color: "var(--muted)", fontSize: "0.6rem", fontFamily: "var(--font-oswald), sans-serif", letterSpacing: "0.12em", marginTop: "0.25rem" }}
          >
            TREINOS CRIADOS
          </p>
        </div>
      </div>
    </div>
  );
}
