"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  calcularTMB, calcularTDEE, calcularMetasCalorias, calcularIMC, activityLabels,
} from "@/lib/calculations";
import MacroBar from "@/components/MacroBar";
import type { UserProfile, ActivityLevel } from "@/types";

const objetivos = [
  {
    value: "emagrecer",
    label: "Emagrecer",
    sub: "Déficit calórico — perda de gordura",
  },
  {
    value: "manter",
    label: "Manter",
    sub: "Manutenção do peso atual",
  },
  {
    value: "ganhar_massa",
    label: "Ganhar massa",
    sub: "Superávit calórico — hipertrofia",
  },
] as const;

const atividadeOpcoes: { value: ActivityLevel; label: string }[] = [
  { value: "sedentario",  label: activityLabels.sedentario },
  { value: "leve",        label: activityLabels.leve },
  { value: "moderado",    label: activityLabels.moderado },
  { value: "ativo",       label: activityLabels.ativo },
  { value: "muito_ativo", label: activityLabels.muito_ativo },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "0.08em",
        color: "var(--text2)",
        textTransform: "uppercase",
        marginBottom: "6px",
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      {children}
    </label>
  );
}

export default function PerfilPage() {
  const { data, salvarPerfil } = useApp();
  const perfil = data.perfil;

  const [editando, setEditando] = useState(!perfil);
  const [form, setForm] = useState<Partial<UserProfile>>(
    perfil ?? {
      nome: "",
      peso: 80,
      altura: 175,
      idade: 25,
      sexo: "masculino",
      nivelAtividade: "moderado",
      objetivo: "ganhar_massa",
    }
  );

  useEffect(() => {
    if (perfil) setForm(perfil);
  }, [perfil]);

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.peso || !form.altura || !form.idade) return;
    salvarPerfil(form as UserProfile);
    setEditando(false);
  }

  const fp = form as UserProfile;
  const tmb = (perfil || !editando) ? Math.round(calcularTMB(fp)) : null;
  const tdee = (perfil || !editando) ? Math.round(calcularTDEE(fp)) : null;
  const metas = perfil ? calcularMetasCalorias(fp) : null;
  const imc = perfil ? calcularIMC(perfil.peso, perfil.altura) : null;

  const imcColor =
    !imc ? "var(--text2)"
    : imc.imc < 18.5 ? "var(--blue)"
    : imc.imc < 25 ? "var(--green)"
    : imc.imc < 30 ? "#FACC15"
    : "var(--red)";

  /* ── EDIT FORM ── */
  if (editando) {
    return (
      <div style={{ background: "var(--bg)", padding: "0 16px 24px" }}>
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
          {perfil && (
            <button
              onClick={() => setEditando(false)}
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
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Voltar
            </button>
          )}
          <h1 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text)" }}>
            Meu Perfil
          </h1>
        </div>

        <form onSubmit={handleSalvar} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Name */}
          <div>
            <FieldLabel>Nome *</FieldLabel>
            <input
              type="text"
              required
              value={form.nome ?? ""}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="field-input"
              placeholder="Seu nome"
            />
          </div>

          {/* Body stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
            {[
              { f: "peso", label: "Peso (kg)", min: 30, max: 300, step: 0.1 },
              { f: "altura", label: "Altura (cm)", min: 100, max: 250, step: 1 },
              { f: "idade", label: "Idade", min: 10, max: 100, step: 1 },
            ].map(({ f, label, min, max, step }) => (
              <div key={f}>
                <FieldLabel>{label}</FieldLabel>
                <input
                  type="number"
                  required
                  min={min}
                  max={max}
                  step={step}
                  value={(form as Record<string, unknown>)[f] as number ?? ""}
                  onChange={(e) => setForm({ ...form, [f]: parseFloat(e.target.value) })}
                  className="field-input"
                  style={{ textAlign: "center" }}
                />
              </div>
            ))}
          </div>

          {/* Sex + Activity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <FieldLabel>Sexo</FieldLabel>
              <select
                value={form.sexo ?? "masculino"}
                onChange={(e) => setForm({ ...form, sexo: e.target.value as "masculino" | "feminino" })}
                className="field-input"
              >
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>
            <div>
              <FieldLabel>Nível de atividade</FieldLabel>
              <select
                value={form.nivelAtividade ?? "moderado"}
                onChange={(e) => setForm({ ...form, nivelAtividade: e.target.value as ActivityLevel })}
                className="field-input"
              >
                {atividadeOpcoes.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Objective */}
          <div>
            <FieldLabel>Objetivo</FieldLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {objetivos.map((o) => {
                const on = form.objetivo === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setForm({ ...form, objetivo: o.value })}
                    style={{
                      padding: "12px 14px",
                      border: on ? "1px solid var(--accent)" : "1px solid var(--border)",
                      background: on ? "var(--accent-dim)" : "var(--s2)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "left",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: on ? "var(--accent)" : "var(--text)" }}>
                        {o.label}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text2)", marginTop: "2px" }}>
                        {o.sub}
                      </div>
                    </div>
                    {on && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="9 12 11 14 15 10" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: "15px", marginTop: "4px" }}
          >
            Salvar perfil
          </button>
        </form>
      </div>
    );
  }

  /* ── VIEW MODE ── */
  const obj = objetivos.find((o) => o.value === perfil!.objetivo)!;

  return (
    <div style={{ background: "var(--bg)", padding: "0 16px 24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "20px 0 16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1.2,
              marginBottom: "4px",
            }}
          >
            {perfil!.nome}
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text2)" }}>
            {obj.label} · {activityLabels[perfil!.nivelAtividade]}
          </p>
        </div>
        <button
          onClick={() => setEditando(true)}
          style={{
            background: "var(--s2)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--text2)",
            cursor: "pointer",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          Editar
        </button>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        {[
          { label: "Peso", value: perfil!.peso, unit: "kg" },
          { label: "Altura", value: perfil!.altura, unit: "cm" },
          { label: "Idade", value: perfil!.idade, unit: "anos" },
          { label: "IMC", value: imc?.imc ?? "—", unit: "" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "var(--s1)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
              padding: "12px 8px",
              textAlign: "center",
            }}
          >
            <div className="stat-label" style={{ marginBottom: "6px" }}>{s.label}</div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: s.label === "IMC" ? imcColor : "var(--text)",
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            {s.unit && (
              <div style={{ fontSize: "10px", color: "var(--text2)", marginTop: "2px" }}>{s.unit}</div>
            )}
          </div>
        ))}
      </div>

      {/* IMC card */}
      <div
        style={{
          background: "var(--s1)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span className="stat-label">IMC</span>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              color: imcColor,
              background: `${imcColor}18`,
              border: `1px solid ${imcColor}40`,
              borderRadius: "999px",
              padding: "2px 8px",
            }}
          >
            {imc?.classificacao}
          </span>
        </div>
        <div style={{ fontSize: "48px", fontWeight: 700, color: imcColor, lineHeight: 1, marginBottom: "12px" }}>
          {imc?.imc}
        </div>
        {/* IMC bar */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              height: "6px",
              borderRadius: "999px",
              background: "linear-gradient(to right, var(--blue) 0%, var(--green) 30%, #FACC15 55%, var(--red) 80%)",
            }}
          />
          {imc && (
            <div
              style={{
                position: "absolute",
                top: "-3px",
                left: `${Math.min(Math.max(((imc.imc - 10) / 40) * 100, 0), 100)}%`,
                width: "12px",
                height: "12px",
                borderRadius: "999px",
                background: "var(--text)",
                border: "2px solid var(--bg)",
                transform: "translateX(-50%)",
              }}
            />
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "6px",
            fontSize: "9px",
            color: "var(--text3)",
          }}
        >
          <span>10</span>
          <span>18.5</span>
          <span>25</span>
          <span>30</span>
          <span>40+</span>
        </div>
      </div>

      {/* Metabolism */}
      <div
        style={{
          background: "var(--s1)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "12px",
        }}
      >
        <div className="stat-label" style={{ marginBottom: "12px" }}>Metabolismo</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { label: "TMB — Taxa metabólica basal", value: tmb, sub: "Em repouso total" },
            { label: "TDEE — Gasto total diário", value: tdee, sub: "Com fator de atividade" },
            { label: "Meta calórica", value: metas?.calorias, sub: obj.label, highlight: true },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: row.highlight ? "var(--accent-dim)" : "var(--s2)",
                border: `1px solid ${row.highlight ? "var(--accent)" : "var(--border)"}`,
                borderRadius: "8px",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 500, color: row.highlight ? "var(--accent)" : "var(--text)" }}>
                  {row.label}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text2)", marginTop: "2px" }}>
                  {row.sub}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: row.highlight ? "22px" : "18px",
                    fontWeight: 700,
                    color: row.highlight ? "var(--accent)" : "var(--text)",
                  }}
                >
                  {row.value}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text2)", marginLeft: "3px" }}>kcal</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Macros */}
      <div
        style={{
          background: "var(--s1)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          padding: "16px",
        }}
      >
        <div className="stat-label" style={{ marginBottom: "12px" }}>Macros diários</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <MacroBar
            label="Proteína"
            atual={metas?.proteinas ?? 0}
            meta={metas?.proteinas ?? 1}
            cor="protein"
          />
          <MacroBar
            label="Carboidrato"
            atual={metas?.carboidratos ?? 0}
            meta={metas?.carboidratos ?? 1}
            cor="carbs"
          />
          <MacroBar
            label="Gordura"
            atual={metas?.gorduras ?? 0}
            meta={metas?.gorduras ?? 1}
            cor="fat"
          />
        </div>
        {metas && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            {[
              { label: "Proteína", value: metas.proteinas, color: "var(--blue)" },
              { label: "Carboidrato", value: metas.carboidratos, color: "var(--green)" },
              { label: "Gordura", value: metas.gorduras, color: "var(--accent)" },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  background: "var(--s2)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "10px 8px",
                  textAlign: "center",
                }}
              >
                <div className="stat-label" style={{ marginBottom: "4px" }}>{m.label}</div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: m.color, lineHeight: 1 }}>
                  {m.value}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text2)" }}>g / dia</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
