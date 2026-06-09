"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import {
  calcularTMB, calcularTDEE, calcularMetasCalorias, calcularIMC, activityLabels,
} from "@/lib/calculations";
import type { UserProfile, ActivityLevel } from "@/types";

const bb  = { fontFamily: "var(--font-bebas), Impact, Arial Narrow, sans-serif" };
const bar = { fontFamily: "var(--font-barlow), Arial Narrow, sans-serif" };
const goth = { fontFamily: "var(--font-gothic), Georgia, serif" };

const objetivos = [
  { value: "emagrecer",    label: "CUT",   sub: "Definição",  color: "#1E6FCC" },
  { value: "manter",       label: "MAINT", sub: "Manutenção", color: "#444" },
  { value: "ganhar_massa", label: "BULK",  sub: "Massa",      color: "var(--red)" },
] as const;

const atividadeOpcoes: { value: ActivityLevel; label: string }[] = [
  { value: "sedentario",  label: activityLabels.sedentario },
  { value: "leve",        label: activityLabels.leve },
  { value: "moderado",    label: activityLabels.moderado },
  { value: "ativo",       label: activityLabels.ativo },
  { value: "muito_ativo", label: activityLabels.muito_ativo },
];

const lbl = {
  ...bar, fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.2em",
  color: "var(--grey)", textTransform: "uppercase" as const,
  display: "block", marginBottom: "0.3rem",
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
  const tmb   = perfil ? Math.round(calcularTMB(fp))  : null;
  const tdee  = perfil ? Math.round(calcularTDEE(fp)) : null;
  const metas = perfil ? calcularMetasCalorias(fp)    : null;
  const imc   = perfil ? calcularIMC(perfil.peso, perfil.altura) : null;

  /* ──────────────── EDIT FORM ──────────────── */
  if (editando) return (
    <div style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ background: "#000", borderBottom: "3px solid var(--yellow)", padding: "0" }}>
        <div style={{ background: "var(--red)", padding: "0.2rem 0.75rem" }}>
          <span style={{ ...bar, fontSize: "0.55rem", fontWeight: 900, color: "#fff", letterSpacing: "0.25em" }}>
            ATHLETE REGISTRATION FORM
          </span>
        </div>
        <div style={{ padding: "0.3rem 0.75rem 0.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ ...bb, fontSize: "2.8rem", color: "var(--yellow)", lineHeight: 0.85 }}>
            FREAK<span style={{ color: "#fff" }}>SEASON</span>
          </div>
          <div style={{ ...bar, fontSize: "0.6rem", fontWeight: 700, color: "var(--grey)", letterSpacing: "0.15em" }}>
            PERFIL DO ATLETA
          </div>
        </div>
      </div>

      {salvo && (
        <div style={{ background: "var(--yellow)", padding: "0.6rem 0.75rem",
          ...bar, fontSize: "0.75rem", fontWeight: 900, color: "#000", letterSpacing: "0.15em", textAlign: "center" }}>
          ★ FICHA SALVA COM SUCESSO! ★
        </div>
      )}

      <form onSubmit={handleSalvar} style={{ padding: "0.75rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>

          <div>
            <label style={lbl}>Nome do atleta *</label>
            <input type="text" required value={form.nome ?? ""}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="vintage-input" placeholder="Seu nome completo" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
            {[
              { f: "peso",   label: "Peso (kg)",  min: 30,  max: 300, step: 0.1 },
              { f: "altura", label: "Altura (cm)", min: 100, max: 250, step: 1 },
              { f: "idade",  label: "Idade",       min: 10,  max: 100, step: 1 },
            ].map(({ f, label, min, max, step }) => (
              <div key={f}>
                <label style={lbl}>{label}</label>
                <input type="number" required min={min} max={max} step={step}
                  value={(form as Record<string,unknown>)[f] as number ?? ""}
                  onChange={(e) => setForm({ ...form, [f]: parseFloat(e.target.value) })}
                  className="vintage-input"
                  style={{ textAlign: "center", ...bb, fontSize: "1.2rem" }} />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <div>
              <label style={lbl}>Sexo</label>
              <select value={form.sexo ?? "masculino"}
                onChange={(e) => setForm({ ...form, sexo: e.target.value as "masculino" | "feminino" })}
                className="vintage-input">
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Atividade</label>
              <select value={form.nivelAtividade ?? "moderado"}
                onChange={(e) => setForm({ ...form, nivelAtividade: e.target.value as ActivityLevel })}
                className="vintage-input">
                {atividadeOpcoes.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>Objetivo</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem" }}>
              {objetivos.map((o) => {
                const on = form.objetivo === o.value;
                return (
                  <button key={o.value} type="button"
                    onClick={() => setForm({ ...form, objetivo: o.value })}
                    style={{ padding: "0.6rem 0.3rem", border: on ? `2px solid ${o.color}` : "1px solid var(--border)",
                      background: on ? `${o.color}22` : "var(--card)", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "0.1rem" }}>
                    <span style={{ ...bb, fontSize: "1.1rem", color: on ? o.color : "#fff", letterSpacing: "0.05em" }}>
                      {o.label}
                    </span>
                    <span style={{ ...bar, fontSize: "0.55rem", color: on ? o.color : "var(--grey)", letterSpacing: "0.08em" }}>
                      {o.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" style={{ width: "100%", padding: "0.85rem",
            background: "var(--yellow)", color: "#000", border: "none", cursor: "pointer",
            ...bb, fontSize: "1.2rem", letterSpacing: "0.15em" }}>
            SALVAR FICHA DO ATLETA
          </button>
        </div>
      </form>
    </div>
  );

  /* ──────────────── MAGAZINE COVER ──────────────── */
  const obj = objetivos.find((o) => o.value === perfil!.objetivo)!;

  return (
    <div style={{ background: "#000", minHeight: "100%" }}>

      {/* ── TOP BANNER "417 TIPS" style ── */}
      <div style={{ background: "var(--yellow)", padding: "0.25rem 0.75rem",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...bar, fontSize: "0.65rem", fontWeight: 900, color: "#000", letterSpacing: "0.1em" }}>
          ▶ {metas?.calorias ?? "—"}KCAL META DIÁRIA
        </span>
        <button onClick={() => setEditando(true)}
          style={{ ...bar, fontSize: "0.6rem", fontWeight: 900, color: "#000",
            background: "transparent", border: "1px solid #000", padding: "0.1rem 0.4rem",
            cursor: "pointer", letterSpacing: "0.1em" }}>
          EDITAR
        </button>
      </div>

      {/* ── FLEX MASTHEAD ── */}
      <div style={{ padding: "0.4rem 0.75rem 0.3rem", borderBottom: "2px solid var(--border)" }}>
        <div style={{ ...bar, fontSize: "0.5rem", fontWeight: 700,
          color: "var(--grey)", letterSpacing: "0.35em" }}>JOE WEIDER'S</div>
        <div style={{ ...bb, fontSize: "4rem", color: "var(--yellow)",
          lineHeight: 0.8, letterSpacing: "0.02em" }}>
          FREAK<span style={{ color: "#fff" }}>SEASON</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
          <span style={{ background: "var(--red)", color: "#fff", ...bar,
            fontSize: "0.5rem", fontWeight: 900, padding: "0.1rem 0.4rem", letterSpacing: "0.15em" }}>
            EDIÇÃO ESPECIAL
          </span>
          <span style={{ ...bar, fontSize: "0.5rem", color: "var(--grey)", letterSpacing: "0.2em" }}>
            VOL.I · 2025
          </span>
        </div>
      </div>

      {/* ── COVER IMAGE AREA ── */}
      <div style={{ position: "relative", background: "#050505",
        display: "flex", justifyContent: "center", padding: "0.5rem 0 0" }}>

        {/* Left callouts */}
        <div style={{ position: "absolute", left: "0.5rem", top: "0.75rem",
          display: "flex", flexDirection: "column", gap: "0.4rem", maxWidth: "38%" }}>
          <div style={{ background: "var(--red)", padding: "0.3rem 0.4rem" }}>
            <div style={{ ...bb, fontSize: "0.65rem", color: "#fff", lineHeight: 1, letterSpacing: "0.05em" }}>
              O SEGREDO DO
            </div>
            <div style={{ ...bb, fontSize: "1.4rem", color: "#fff", lineHeight: 0.9 }}>
              CORPO<br/>PERFEITO
            </div>
          </div>
          <div style={{ background: "var(--yellow)", padding: "0.3rem 0.4rem" }}>
            <div style={{ ...bb, fontSize: "0.7rem", color: "#000", letterSpacing: "0.05em" }}>
              IMC:
            </div>
            <div style={{ ...bb, fontSize: "1.6rem", color: "#000", lineHeight: 0.9 }}>
              {imc?.imc}
            </div>
            <div style={{ ...bar, fontSize: "0.5rem", fontWeight: 800, color: "#000", letterSpacing: "0.08em" }}>
              {imc?.classificacao.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Athlete silhouette */}
        <svg width="155" height="200" viewBox="0 0 160 210" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E0E0E0"/>
              <stop offset="100%" stopColor="#666"/>
            </linearGradient>
          </defs>
          <ellipse cx="80" cy="18" rx="14" ry="16" fill="url(#sg)"/>
          <rect x="73" y="32" width="14" height="10" fill="url(#sg)"/>
          <ellipse cx="42" cy="52" rx="22" ry="13" fill="url(#sg)"/>
          <ellipse cx="118" cy="52" rx="22" ry="13" fill="url(#sg)"/>
          <path d="M52,44 Q80,38 108,44 L112,80 Q80,88 48,80 Z" fill="url(#sg)"/>
          <path d="M56,80 Q80,85 104,80 L100,130 Q80,136 60,130 Z" fill="url(#sg)" opacity="0.9"/>
          <ellipse cx="30" cy="72" rx="13" ry="23" fill="url(#sg)"/>
          <ellipse cx="130" cy="72" rx="13" ry="23" fill="url(#sg)"/>
          <path d="M22,92 Q18,118 20,138 L38,138 Q36,118 40,92 Z" fill="url(#sg)" opacity="0.75"/>
          <path d="M122,92 Q118,118 120,138 L138,138 Q142,118 140,92 Z" fill="url(#sg)" opacity="0.75"/>
          <path d="M60,130 Q55,158 53,200 L73,200 Q75,162 80,145 Q85,162 87,200 L107,200 Q105,158 100,130 Z"
            fill="url(#sg)" opacity="0.8"/>
          <line x1="80" y1="46" x2="80" y2="80" stroke="#000" strokeWidth="2" opacity="0.4"/>
          <line x1="63" y1="95" x2="76" y2="95" stroke="#000" strokeWidth="1.5" opacity="0.3"/>
          <line x1="84" y1="95" x2="97" y2="95" stroke="#000" strokeWidth="1.5" opacity="0.3"/>
          <line x1="63" y1="108" x2="76" y2="108" stroke="#000" strokeWidth="1.5" opacity="0.3"/>
          <line x1="84" y1="108" x2="97" y2="108" stroke="#000" strokeWidth="1.5" opacity="0.3"/>
          <line x1="63" y1="121" x2="76" y2="121" stroke="#000" strokeWidth="1.5" opacity="0.3"/>
          <line x1="84" y1="121" x2="97" y2="121" stroke="#000" strokeWidth="1.5" opacity="0.3"/>
        </svg>

        {/* Right callouts */}
        <div style={{ position: "absolute", right: "0.5rem", top: "0.75rem",
          display: "flex", flexDirection: "column", gap: "0.4rem", maxWidth: "38%", alignItems: "flex-end" }}>
          <div style={{ background: "#111", border: "1px solid var(--border)",
            padding: "0.3rem 0.4rem", textAlign: "right" }}>
            <div style={{ ...bb, fontSize: "0.65rem", color: "var(--grey)", letterSpacing: "0.05em" }}>
              PROGRAMA
            </div>
            <div style={{ ...bb, fontSize: "1.1rem", color: "var(--yellow)", lineHeight: 0.95,
              textTransform: "uppercase" }}>
              CORPO<br/>IDEAL
            </div>
            <div style={{ ...bar, fontSize: "0.5rem", fontWeight: 800, color: "var(--grey)",
              letterSpacing: "0.08em" }}>P.01</div>
          </div>
          <div style={{ background: obj.color, padding: "0.3rem 0.4rem", textAlign: "right" }}>
            <div style={{ ...bb, fontSize: "0.6rem", color: "#fff" }}>FASE ATUAL</div>
            <div style={{ ...bb, fontSize: "1.5rem", color: "#fff", lineHeight: 0.9 }}>{obj.label}</div>
            <div style={{ ...bar, fontSize: "0.5rem", fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>
              {obj.sub.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* ── ATHLETE NAME BANNER ── */}
      <div style={{ background: "#fff", padding: "0.4rem 0.75rem",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ ...bar, fontSize: "0.5rem", fontWeight: 700,
            color: "#333", letterSpacing: "0.25em" }}>ATHLETE OF THE ISSUE</div>
          <div style={{ ...bb, fontSize: "1.8rem", color: "#000", lineHeight: 0.9,
            letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {perfil!.nome}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...bar, fontSize: "0.55rem", fontWeight: 700, color: "#333", letterSpacing: "0.15em" }}>
            {perfil!.idade} ANOS
          </div>
          <div style={{ ...bb, fontSize: "1.4rem", color: "#000" }}>
            {perfil!.peso}KG
          </div>
        </div>
      </div>

      {/* ── VITAL STATS ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        borderBottom: "1px solid var(--border)" }}>
        {[
          { l: "PESO",   v: `${perfil!.peso}`,   u: "KG" },
          { l: "ALTURA", v: `${perfil!.altura}`,  u: "CM" },
          { l: "IDADE",  v: `${perfil!.idade}`,   u: "ANOS" },
          { l: "IMC",    v: `${imc?.imc}`,         u: imc?.imc && imc.imc < 25 ? "NORMAL" : "ATT." },
        ].map((s, i) => (
          <div key={s.l} style={{ padding: "0.5rem 0.3rem", textAlign: "center",
            background: i === 0 ? "var(--red)" : "var(--card)",
            borderRight: "1px solid var(--border)" }}>
            <div style={{ ...bar, fontSize: "0.45rem", fontWeight: 800, letterSpacing: "0.15em",
              color: i === 0 ? "rgba(255,255,255,0.6)" : "var(--grey)" }}>{s.l}</div>
            <div style={{ ...bb, fontSize: "1.3rem", lineHeight: 1,
              color: i === 0 ? "#fff" : "var(--yellow)" }}>{s.v}</div>
            <div style={{ ...bar, fontSize: "0.4rem", letterSpacing: "0.1em",
              color: i === 0 ? "rgba(255,255,255,0.5)" : "var(--grey-dark)" }}>{s.u}</div>
          </div>
        ))}
      </div>

      {/* ── METABOLISM SPREAD ── */}
      <div style={{ padding: "0.75rem" }}>
        <div className="mag-divider" style={{ marginBottom: "0.6rem" }}>METABOLISMO</div>

        {[
          { l: "TMB — TAXA METABÓLICA BASAL", sub: "Calorias em repouso total", v: tmb,  hl: false },
          { l: "TDEE — GASTO TOTAL DIÁRIO",   sub: "Com fator de atividade",    v: tdee, hl: false },
          { l: "META DIÁRIA — " + obj.label,  sub: obj.sub,                     v: metas?.calorias, hl: true },
        ].map((row) => (
          <div key={row.l} style={{ display: "flex", justifyContent: "space-between",
            alignItems: "center", padding: "0.5rem 0.6rem",
            marginBottom: "0.4rem",
            background: row.hl ? "var(--yellow)" : "var(--card)",
            border: row.hl ? "none" : "1px solid var(--border)",
            borderLeft: row.hl ? "none" : "3px solid var(--grey-dark)" }}>
            <div>
              <div style={{ ...bar, fontSize: "0.65rem", fontWeight: 800,
                color: row.hl ? "#000" : "#fff", letterSpacing: "0.06em" }}>
                {row.l}
              </div>
              <div style={{ ...bar, fontSize: "0.5rem", color: row.hl ? "#333" : "var(--grey)",
                letterSpacing: "0.08em" }}>{row.sub}</div>
            </div>
            <div>
              <span style={{ ...bb, fontSize: row.hl ? "1.8rem" : "1.4rem",
                color: row.hl ? "#000" : "var(--yellow)", lineHeight: 1 }}>
                {row.v}
              </span>
              <span style={{ ...bar, fontSize: "0.55rem", fontWeight: 700,
                color: row.hl ? "#333" : "var(--grey)", marginLeft: "0.2rem" }}>
                KCAL
              </span>
            </div>
          </div>
        ))}

        {/* MACROS */}
        <div className="mag-divider" style={{ margin: "0.75rem 0 0.5rem" }}>MACROS / DIA</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem" }}>
          {[
            { l: "PROTEÍNA",  v: metas?.proteinas,    bg: "#0A1A3A" },
            { l: "CARBOIDR.", v: metas?.carboidratos,  bg: "#1A1A00" },
            { l: "GORDURA",   v: metas?.gorduras,      bg: "#1A0A00" },
          ].map((m) => (
            <div key={m.l} style={{ background: m.bg, border: "1px solid var(--border)",
              borderTop: "2px solid var(--yellow)", padding: "0.5rem 0.3rem", textAlign: "center" }}>
              <div style={{ ...bar, fontSize: "0.45rem", fontWeight: 800, letterSpacing: "0.15em",
                color: "var(--grey)" }}>{m.l}</div>
              <div style={{ ...bb, fontSize: "1.6rem", color: "var(--yellow)", lineHeight: 1 }}>
                {m.v}<span style={{ ...bar, fontSize: "0.6rem", color: "var(--grey)" }}>g</span>
              </div>
            </div>
          ))}
        </div>

        {/* ACTIVITY */}
        <div style={{ marginTop: "0.6rem", background: "var(--card)",
          border: "1px solid var(--border)", padding: "0.45rem 0.75rem",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ ...bar, fontSize: "0.5rem", fontWeight: 800,
            color: "var(--grey)", letterSpacing: "0.2em" }}>NÍVEL DE ATIVIDADE</span>
          <span style={{ ...bar, fontSize: "0.7rem", fontWeight: 900, color: "#fff",
            letterSpacing: "0.06em" }}>
            {activityLabels[perfil!.nivelAtividade].toUpperCase()}
          </span>
        </div>

        {/* Bottom gothic signature */}
        <div style={{ textAlign: "center", paddingTop: "1rem",
          borderTop: "1px solid var(--border)", marginTop: "0.75rem" }}>
          <div style={{ ...goth, fontSize: "1.1rem", color: "var(--grey-dark)" }}>
            No Pain · No Gain
          </div>
          <div style={{ ...bar, fontSize: "0.45rem", fontWeight: 700,
            color: "var(--border)", letterSpacing: "0.3em", marginTop: "0.2rem" }}>
            FREAKSEASON · EST. VENICE BEACH · MCMLXXVII
          </div>
        </div>
      </div>
    </div>
  );
}
