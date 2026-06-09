"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  calcularTMB, calcularTDEE, calcularMetasCalorias,
  calcularIMC, activityLabels,
} from "@/lib/calculations";
import type { UserProfile, ActivityLevel } from "@/types";

const gothic = { fontFamily: "var(--font-gothic), Georgia, serif" };
const cinzel = { fontFamily: "var(--font-cinzel), Georgia, serif" };
const oswald = { fontFamily: "var(--font-oswald), Arial Narrow, sans-serif" };

const objetivos = [
  { value: "emagrecer",    label: "CUT",          sub: "Definição" },
  { value: "manter",       label: "MAINTAIN",     sub: "Manutenção" },
  { value: "ganhar_massa", label: "BULK",          sub: "Massa" },
] as const;

const atividadeOpcoes: { value: ActivityLevel; label: string }[] = [
  { value: "sedentario",  label: activityLabels.sedentario },
  { value: "leve",        label: activityLabels.leve },
  { value: "moderado",    label: activityLabels.moderado },
  { value: "ativo",       label: activityLabels.ativo },
  { value: "muito_ativo", label: activityLabels.muito_ativo },
];

const labelSt = {
  ...{ fontFamily: "var(--font-oswald), Arial Narrow, sans-serif" },
  fontSize: "0.6rem", letterSpacing: "0.2em",
  color: "var(--muted)", textTransform: "uppercase" as const,
  display: "block", marginBottom: "0.35rem", fontWeight: 600,
};

export default function PerfilPage() {
  const { data, salvarPerfil } = useApp();
  const perfil = data.perfil;

  const [editando, setEditando] = useState(!perfil);
  const [form, setForm] = useState<Partial<UserProfile>>(
    perfil ?? { nome: "", peso: 80, altura: 175, idade: 25,
      sexo: "masculino", nivelAtividade: "moderado", objetivo: "ganhar_massa" }
  );
  const [salvo, setSalvo] = useState(false);

  useEffect(() => { if (perfil) setForm(perfil); }, [perfil]);

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.peso || !form.altura || !form.idade) return;
    salvarPerfil(form as UserProfile);
    setEditando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  }

  const fp = form as UserProfile;
  const tmb   = perfil ? Math.round(calcularTMB(fp))   : null;
  const tdee  = perfil ? Math.round(calcularTDEE(fp))  : null;
  const metas = perfil ? calcularMetasCalorias(fp)     : null;
  const imc   = perfil ? calcularIMC(perfil.peso, perfil.altura) : null;

  /* ── EDIT FORM ── */
  if (editando) return (
    <div className="px-4 py-4 space-y-4" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="text-center pt-2 pb-3" style={{ borderBottom: "2px solid var(--gold)" }}>
        <p style={{ ...oswald, fontSize: "0.6rem", letterSpacing: "0.3em", color: "var(--muted)" }}>
          ATHLETE REGISTRATION
        </p>
        <h1 style={{ ...gothic, fontSize: "2.4rem", color: "var(--gold-light)", lineHeight: 1 }}>
          Flex Season
        </h1>
        <p style={{ ...cinzel, fontSize: "0.65rem", letterSpacing: "0.25em", color: "var(--muted)" }}>
          ◆ FICHA DO ATLETA ◆
        </p>
      </div>

      {salvo && (
        <div style={{ background: "#0A1A00", border: "1px solid var(--gold)", padding: "0.75rem",
          textAlign: "center", ...oswald, fontSize: "0.8rem", letterSpacing: "0.15em", color: "var(--gold)" }}>
          ★ PERFIL ATUALIZADO COM SUCESSO ★
        </div>
      )}

      <form onSubmit={handleSalvar} className="space-y-4">
        {/* Nome */}
        <div>
          <label style={labelSt}>Nome do atleta *</label>
          <input type="text" required value={form.nome ?? ""}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="vintage-input" style={{ ...cinzel, fontSize: "1rem", letterSpacing: "0.08em" }}
            placeholder="Seu nome completo" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { field: "peso", label: "Peso (kg)", min: 30, max: 300, step: 0.1, type: "number" },
            { field: "altura", label: "Altura (cm)", min: 100, max: 250, step: 1, type: "number" },
            { field: "idade", label: "Idade", min: 10, max: 100, step: 1, type: "number" },
          ].map(({ field, label, min, max, step }) => (
            <div key={field}>
              <label style={labelSt}>{label}</label>
              <input type="number" required min={min} max={max} step={step}
                value={(form as Record<string, unknown>)[field] as number ?? ""}
                onChange={(e) => setForm({ ...form, [field]: parseFloat(e.target.value) })}
                className="vintage-input" style={{ ...oswald, fontSize: "1.1rem", textAlign: "center" }} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelSt}>Sexo</label>
            <select value={form.sexo ?? "masculino"}
              onChange={(e) => setForm({ ...form, sexo: e.target.value as "masculino" | "feminino" })}
              className="vintage-input vintage-select" style={oswald}>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>
          </div>
          <div>
            <label style={labelSt}>Nível de atividade</label>
            <select value={form.nivelAtividade ?? "moderado"}
              onChange={(e) => setForm({ ...form, nivelAtividade: e.target.value as ActivityLevel })}
              className="vintage-input vintage-select" style={oswald}>
              {atividadeOpcoes.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Objetivo */}
        <div>
          <label style={labelSt}>Objetivo</label>
          <div className="grid grid-cols-3 gap-2">
            {objetivos.map((o) => {
              const active = form.objetivo === o.value;
              return (
                <button key={o.value} type="button"
                  onClick={() => setForm({ ...form, objetivo: o.value })}
                  style={{
                    padding: "0.6rem 0.25rem",
                    border: active ? "2px solid var(--gold)" : "1px solid var(--border)",
                    background: active ? "rgba(200,134,10,0.12)" : "var(--card)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "0.15rem",
                  }}>
                  <span style={{ ...oswald, fontSize: "0.95rem", fontWeight: 700,
                    color: active ? "var(--gold-light)" : "var(--cream)", letterSpacing: "0.1em" }}>
                    {o.label}
                  </span>
                  <span style={{ ...oswald, fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.08em" }}>
                    {o.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" style={{
          width: "100%", padding: "0.9rem",
          background: "linear-gradient(180deg, var(--gold-light), var(--gold))",
          color: "#060400", ...oswald, fontSize: "0.9rem", fontWeight: 700,
          letterSpacing: "0.25em", textTransform: "uppercase" as const,
          border: "none", cursor: "pointer",
        }}>
          ★ SALVAR FICHA ★
        </button>
      </form>
    </div>
  );

  /* ── MAGAZINE POSTER VIEW ── */
  return (
    <div style={{ background: "var(--bg)", minHeight: "100%" }}>

      {/* ── MASTHEAD ── */}
      <div style={{ background: "#0A0700", borderBottom: "3px solid var(--gold)", padding: "0.6rem 1rem 0.5rem" }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ ...oswald, fontSize: "0.5rem", letterSpacing: "0.35em", color: "var(--muted)" }}>
              THE IRON BIBLE · VOL. I
            </p>
            <h1 style={{ ...gothic, fontSize: "2rem", color: "var(--gold-light)", lineHeight: 0.9 }}>
              Flex Season
            </h1>
          </div>
          <button onClick={() => setEditando(true)} style={{
            ...oswald, fontSize: "0.6rem", letterSpacing: "0.18em",
            color: "var(--gold)", border: "1px solid var(--gold)",
            padding: "0.3rem 0.6rem", background: "transparent",
          }}>
            EDITAR
          </button>
        </div>
      </div>

      {/* ── COVER SECTION ── */}
      <div style={{ position: "relative", background: "#08050000" }}>
        {/* Muscle silhouette illustration */}
        <div style={{ display: "flex", justifyContent: "center", padding: "1.2rem 0 0.5rem",
          borderBottom: "1px solid var(--border)" }}>
          <svg width="160" height="180" viewBox="0 0 160 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#C8860A" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#7A5004" stopOpacity="0.4"/>
              </linearGradient>
            </defs>
            {/* Head */}
            <ellipse cx="80" cy="18" rx="14" ry="16" fill="url(#bodyGrad)"/>
            {/* Neck */}
            <rect x="73" y="32" width="14" height="10" fill="url(#bodyGrad)"/>
            {/* Shoulders */}
            <ellipse cx="42" cy="52" rx="22" ry="14" fill="url(#bodyGrad)"/>
            <ellipse cx="118" cy="52" rx="22" ry="14" fill="url(#bodyGrad)"/>
            {/* Chest */}
            <path d="M52,44 Q80,38 108,44 L112,80 Q80,88 48,80 Z" fill="url(#bodyGrad)"/>
            {/* Abs */}
            <path d="M56,80 Q80,85 104,80 L100,130 Q80,136 60,130 Z" fill="url(#bodyGrad)" opacity="0.85"/>
            {/* Upper arms */}
            <ellipse cx="30" cy="72" rx="12" ry="22" fill="url(#bodyGrad)"/>
            <ellipse cx="130" cy="72" rx="12" ry="22" fill="url(#bodyGrad)"/>
            {/* Forearms */}
            <path d="M22,90 Q18,120 22,135 L38,135 Q34,120 38,90 Z" fill="url(#bodyGrad)" opacity="0.7"/>
            <path d="M122,90 Q118,120 122,135 L138,135 Q142,120 138,90 Z" fill="url(#bodyGrad)" opacity="0.7"/>
            {/* Legs */}
            <path d="M60,130 Q54,155 52,178 L72,178 Q74,155 80,140 Q86,155 88,178 L108,178 Q106,155 100,130 Z"
              fill="url(#bodyGrad)" opacity="0.75"/>
            {/* Muscle definition lines */}
            <line x1="80" y1="46" x2="80" y2="82" stroke="#060400" strokeWidth="1.5" opacity="0.6"/>
            <line x1="62" y1="90" x2="75" y2="90" stroke="#060400" strokeWidth="1" opacity="0.4"/>
            <line x1="85" y1="90" x2="98" y2="90" stroke="#060400" strokeWidth="1" opacity="0.4"/>
            <line x1="62" y1="103" x2="75" y2="103" stroke="#060400" strokeWidth="1" opacity="0.4"/>
            <line x1="85" y1="103" x2="98" y2="103" stroke="#060400" strokeWidth="1" opacity="0.4"/>
            <line x1="62" y1="116" x2="75" y2="116" stroke="#060400" strokeWidth="1" opacity="0.4"/>
            <line x1="85" y1="116" x2="98" y2="116" stroke="#060400" strokeWidth="1" opacity="0.4"/>
          </svg>
        </div>

        {/* Athlete name banner */}
        <div style={{ background: "linear-gradient(135deg, #0A0700, #1A1000)",
          borderTop: "2px solid var(--gold)", borderBottom: "2px solid var(--gold)",
          padding: "0.6rem 1rem", textAlign: "center" }}>
          <p style={{ ...oswald, fontSize: "0.55rem", letterSpacing: "0.4em", color: "var(--muted)", marginBottom: "0.1rem" }}>
            ATHLETE OF THE ISSUE
          </p>
          <h2 style={{ ...cinzel, fontSize: "1.8rem", fontWeight: 900, color: "var(--cream)",
            letterSpacing: "0.12em", lineHeight: 1, textTransform: "uppercase" }}>
            {perfil!.nome}
          </h2>
          <p style={{ ...oswald, fontSize: "0.6rem", letterSpacing: "0.2em", color: "var(--gold)", marginTop: "0.2rem" }}>
            {objetivos.find((o) => o.value === perfil!.objetivo)?.sub.toUpperCase()} PHASE
          </p>
        </div>
      </div>

      {/* ── VITAL STATS BAR ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
        borderBottom: "1px solid var(--border)", background: "#0A0700" }}>
        {[
          { label: "PESO",    value: `${perfil!.peso}`, unit: "KG" },
          { label: "ALTURA",  value: `${perfil!.altura}`, unit: "CM" },
          { label: "IDADE",   value: `${perfil!.idade}`, unit: "ANOS" },
          { label: "IMC",     value: `${imc?.imc}`, unit: imc?.classificacao.split(" ").slice(-1)[0] ?? "" },
        ].map((s) => (
          <div key={s.label} style={{ padding: "0.6rem 0.3rem", textAlign: "center",
            borderRight: "1px solid var(--border)" }}>
            <p style={{ ...oswald, fontSize: "0.5rem", letterSpacing: "0.2em", color: "var(--muted)" }}>{s.label}</p>
            <p style={{ ...oswald, fontSize: "1.3rem", fontWeight: 700, color: "var(--gold-light)", lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ ...oswald, fontSize: "0.45rem", color: "var(--muted)", letterSpacing: "0.1em" }}>{s.unit}</p>
          </div>
        ))}
      </div>

      {/* ── METABOLISM SPREAD ── */}
      <div style={{ padding: "0.9rem 1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, var(--gold))" }}/>
          <span style={{ ...cinzel, fontSize: "0.6rem", letterSpacing: "0.25em", color: "var(--gold)" }}>
            ◆ METABOLISMO ◆
          </span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, var(--gold))" }}/>
        </div>

        <div className="space-y-2">
          {[
            { label: "TMB — Taxa Metabólica Basal", sub: "Calorias em repouso", value: tmb, unit: "kcal" },
            { label: "TDEE — Gasto Total Diário",   sub: "Com fator de atividade", value: tdee, unit: "kcal" },
            { label: "META DIÁRIA",                 sub: objetivos.find(o=>o.value===perfil!.objetivo)?.sub,
              value: metas?.calorias, unit: "kcal", highlight: true },
          ].map((row) => (
            <div key={row.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.55rem 0.75rem",
              background: row.highlight ? "rgba(200,134,10,0.08)" : "var(--card)",
              border: row.highlight ? "1px solid var(--gold)" : "1px solid var(--border)",
              borderLeft: `3px solid ${row.highlight ? "var(--gold-light)" : "var(--gold)"}`,
            }}>
              <div>
                <p style={{ ...oswald, fontSize: "0.7rem", fontWeight: 700,
                  color: row.highlight ? "var(--gold-light)" : "var(--cream)", letterSpacing: "0.1em" }}>
                  {row.label}
                </p>
                <p style={{ ...oswald, fontSize: "0.55rem", color: "var(--muted)", letterSpacing: "0.08em" }}>
                  {row.sub}
                </p>
              </div>
              <span style={{ ...oswald, fontSize: row.highlight ? "1.4rem" : "1.2rem", fontWeight: 700,
                color: row.highlight ? "var(--gold-light)" : "var(--cream)" }}>
                {row.value} <span style={{ fontSize: "0.6rem", color: "var(--muted)" }}>{row.unit}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Macros */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem",
          margin: "0.9rem 0 0.65rem" }}>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, var(--border))" }}/>
          <span style={{ ...cinzel, fontSize: "0.55rem", letterSpacing: "0.2em", color: "var(--muted)" }}>
            ◆ MACROS / DIA ◆
          </span>
          <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, var(--border))" }}/>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
          {[
            { label: "PROTEÍNA", value: metas?.proteinas, color: "#1A3A6A" },
            { label: "CARBOIDR.", value: metas?.carboidratos, color: "#4A3A00" },
            { label: "GORDURA",  value: metas?.gorduras, color: "#3A1A00" },
          ].map((m) => (
            <div key={m.label} style={{
              background: m.color, border: "1px solid var(--border)",
              borderTop: "2px solid var(--gold)", padding: "0.6rem 0.4rem", textAlign: "center",
            }}>
              <p style={{ ...oswald, fontSize: "0.5rem", letterSpacing: "0.15em", color: "var(--muted)" }}>
                {m.label}
              </p>
              <p style={{ ...oswald, fontSize: "1.5rem", fontWeight: 700, color: "var(--gold-light)", lineHeight: 1.1 }}>
                {m.value}<span style={{ fontSize: "0.65rem", color: "var(--muted)" }}>g</span>
              </p>
            </div>
          ))}
        </div>

        {/* Activity level tag */}
        <div style={{ marginTop: "0.9rem", padding: "0.5rem 0.75rem",
          background: "var(--card)", border: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ ...oswald, fontSize: "0.55rem", letterSpacing: "0.15em", color: "var(--muted)" }}>
            NÍVEL DE ATIVIDADE
          </span>
          <span style={{ ...oswald, fontSize: "0.75rem", fontWeight: 700,
            color: "var(--cream)", letterSpacing: "0.08em" }}>
            {activityLabels[perfil!.nivelAtividade].toUpperCase()}
          </span>
        </div>

        {/* Bottom ornament */}
        <div style={{ textAlign: "center", marginTop: "1rem", paddingTop: "0.75rem",
          borderTop: "1px solid var(--border)" }}>
          <p style={{ ...gothic, fontSize: "0.9rem", color: "var(--muted)", letterSpacing: "0.05em" }}>
            No Pain · No Gain
          </p>
          <p style={{ ...oswald, fontSize: "0.5rem", letterSpacing: "0.3em",
            color: "var(--border)", marginTop: "0.2rem" }}>
            EST. VENICE BEACH · MCMLXXVII
          </p>
        </div>
      </div>
    </div>
  );
}
