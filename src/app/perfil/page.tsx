"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { calcularTMB, calcularTDEE, calcularMetasCalorias, calcularIMC, activityLabels } from "@/lib/calculations";
import type { UserProfile, ActivityLevel } from "@/types";
import Card from "@/components/Card";

const objetivos = [
  { value: "emagrecer", label: "REDUZIR", sub: "Déficit calórico" },
  { value: "manter", label: "MANTER", sub: "Equilíbrio" },
  { value: "ganhar_massa", label: "MASSA", sub: "Superávit" },
] as const;

const atividadeOpcoes: { value: ActivityLevel; label: string }[] = [
  { value: "sedentario", label: activityLabels.sedentario },
  { value: "leve", label: activityLabels.leve },
  { value: "moderado", label: activityLabels.moderado },
  { value: "ativo", label: activityLabels.ativo },
  { value: "muito_ativo", label: activityLabels.muito_ativo },
];

const vh = { fontFamily: "var(--font-oswald), Arial Narrow, sans-serif" };

const labelStyle = {
  ...vh,
  fontSize: "0.65rem",
  letterSpacing: "0.18em",
  color: "var(--muted)",
  textTransform: "uppercase" as const,
  display: "block",
  marginBottom: "0.375rem",
  fontWeight: 600,
};

export default function PerfilPage() {
  const { data, salvarPerfil } = useApp();
  const perfil = data.perfil;

  const [editando, setEditando] = useState(!perfil);
  const [form, setForm] = useState<Partial<UserProfile>>(
    perfil ?? {
      nome: "",
      peso: 70,
      altura: 170,
      idade: 25,
      sexo: "masculino",
      nivelAtividade: "moderado",
      objetivo: "manter",
    }
  );
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    if (perfil) setForm(perfil);
  }, [perfil]);

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.peso || !form.altura || !form.idade) return;
    salvarPerfil(form as UserProfile);
    setEditando(false);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  const perfilCompleto = form as UserProfile;
  const tmb = perfil ? Math.round(calcularTMB(perfilCompleto)) : null;
  const tdee = perfil ? Math.round(calcularTDEE(perfilCompleto)) : null;
  const metas = perfil ? calcularMetasCalorias(perfilCompleto) : null;
  const imc = perfil ? calcularIMC(perfil.peso, perfil.altura) : null;

  return (
    <div className="px-4 py-4 space-y-4">

      {/* Page header */}
      <div className="text-center py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div style={{ color: "var(--muted)", fontSize: "0.6rem", ...vh, letterSpacing: "0.2em" }}>
          ◆ GOLD&apos;S GYM VENICE BEACH ◆
        </div>
        <h1 style={{ ...vh, fontSize: "2rem", fontWeight: 700, color: "var(--gold-light)", letterSpacing: "0.2em", lineHeight: 1.1, marginTop: "0.25rem" }}>
          MEU PERFIL
        </h1>
        <div className="divider-gold mt-3">★ ATHLETE RECORD ★</div>
      </div>

      {/* Save feedback */}
      {salvo && (
        <div
          className="p-3 text-center"
          style={{ background: "var(--card-2)", border: "1px solid var(--gold)", ...vh, fontSize: "0.75rem", letterSpacing: "0.15em", color: "var(--gold-light)" }}
        >
          ★ PERFIL SALVO COM SUCESSO ★
        </div>
      )}

      {/* Edit button row */}
      {perfil && !editando && (
        <div className="flex justify-end">
          <button
            onClick={() => setEditando(true)}
            style={{ color: "var(--gold)", ...vh, fontSize: "0.7rem", letterSpacing: "0.15em" }}
          >
            ✏ EDITAR PERFIL
          </button>
        </div>
      )}

      {/* Form */}
      {editando ? (
        <Card title="DADOS DO ATLETA" accent>
          <form onSubmit={handleSalvar} className="space-y-4">
            <div>
              <label style={labelStyle}>Nome do Atleta</label>
              <input
                type="text"
                required
                value={form.nome ?? ""}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="vintage-input"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Peso (kg)</label>
                <input
                  type="number"
                  required
                  min={30}
                  max={300}
                  step={0.1}
                  value={form.peso ?? ""}
                  onChange={(e) => setForm({ ...form, peso: parseFloat(e.target.value) })}
                  className="vintage-input"
                />
              </div>
              <div>
                <label style={labelStyle}>Altura (cm)</label>
                <input
                  type="number"
                  required
                  min={100}
                  max={250}
                  value={form.altura ?? ""}
                  onChange={(e) => setForm({ ...form, altura: parseInt(e.target.value) })}
                  className="vintage-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Idade</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={100}
                  value={form.idade ?? ""}
                  onChange={(e) => setForm({ ...form, idade: parseInt(e.target.value) })}
                  className="vintage-input"
                />
              </div>
              <div>
                <label style={labelStyle}>Sexo</label>
                <select
                  value={form.sexo ?? "masculino"}
                  onChange={(e) => setForm({ ...form, sexo: e.target.value as "masculino" | "feminino" })}
                  className="vintage-input"
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Nível de Atividade</label>
              <select
                value={form.nivelAtividade ?? "moderado"}
                onChange={(e) => setForm({ ...form, nivelAtividade: e.target.value as ActivityLevel })}
                className="vintage-input"
              >
                {atividadeOpcoes.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Objetivo Principal</label>
              <div className="grid grid-cols-3 gap-2">
                {objetivos.map((o) => {
                  const selected = form.objetivo === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setForm({ ...form, objetivo: o.value })}
                      className="py-3 px-2 text-center transition-opacity"
                      style={{
                        background: selected ? "var(--gold)" : "var(--input)",
                        border: `1px solid ${selected ? "var(--gold)" : "var(--border)"}`,
                        color: selected ? "#0A0600" : "var(--muted)",
                        ...vh,
                        fontWeight: 700,
                      }}
                    >
                      <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em" }}>{o.label}</div>
                      <div style={{ fontSize: "0.55rem", letterSpacing: "0.1em", marginTop: "2px", opacity: 0.7 }}>{o.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 font-bold text-sm"
              style={{
                background: "var(--gold)",
                color: "#0A0600",
                ...vh,
                letterSpacing: "0.2em",
                fontSize: "0.85rem",
              }}
            >
              ★ SALVAR PERFIL ★
            </button>
          </form>
        </Card>
      ) : perfil && (
        <Card title="FICHA DO ATLETA" accent>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 flex items-center justify-center font-bold"
              style={{
                background: "var(--card-2)",
                border: "2px solid var(--gold)",
                color: "var(--gold)",
                fontFamily: "var(--font-oswald), sans-serif",
                fontSize: "1.5rem",
              }}
            >
              {perfil.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ color: "var(--gold-light)", ...vh, fontSize: "1.25rem", fontWeight: 700, letterSpacing: "0.1em" }}>
                {perfil.nome.toUpperCase()}
              </p>
              <p style={{ color: "var(--muted)", ...vh, fontSize: "0.7rem", letterSpacing: "0.12em" }}>
                {perfil.idade} ANOS · {perfil.peso}KG · {perfil.altura}CM
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div style={{ background: "var(--card-2)", border: "1px solid var(--border)", padding: "0.5rem" }}>
              <p style={{ color: "var(--muted)", ...vh, fontSize: "0.55rem", letterSpacing: "0.15em" }}>ATIVIDADE</p>
              <p style={{ color: "var(--cream)", ...vh, fontSize: "0.7rem", marginTop: "2px" }}>{activityLabels[perfil.nivelAtividade]}</p>
            </div>
            <div style={{ background: "var(--card-2)", border: "1px solid var(--border)", padding: "0.5rem" }}>
              <p style={{ color: "var(--muted)", ...vh, fontSize: "0.55rem", letterSpacing: "0.15em" }}>OBJETIVO</p>
              <p style={{ color: "var(--cream)", ...vh, fontSize: "0.7rem", marginTop: "2px" }}>
                {objetivos.find((o) => o.value === perfil.objetivo)?.label}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* IMC */}
      {imc && (
        <Card title="ÍNDICE DE MASSA CORPORAL" accent>
          <div className="flex items-end gap-3">
            <span
              style={{ color: "var(--gold-light)", ...vh, fontSize: "3rem", fontWeight: 700, lineHeight: 1 }}
            >
              {imc.imc}
            </span>
            <span
              style={{
                ...vh,
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                color: imc.imc < 18.5 || imc.imc >= 25 ? "var(--red)" : "var(--gold)",
                marginBottom: "0.25rem",
              }}
            >
              {imc.classificacao.toUpperCase()}
            </span>
          </div>
        </Card>
      )}

      {/* Metabolism */}
      {tmb && tdee && metas && (
        <Card title="ANÁLISE METABÓLICA" accent>
          <div className="space-y-2 mb-4">
            {[
              { label: "TMB — TAXA METABÓLICA BASAL", sub: "Calorias em repouso total", val: `${tmb} KCAL` },
              { label: "TDEE — GASTO TOTAL DIÁRIO", sub: "Com fator de atividade", val: `${tdee} KCAL` },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center py-2"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div>
                  <p style={{ color: "var(--cream)", ...vh, fontSize: "0.7rem", letterSpacing: "0.1em" }}>{row.label}</p>
                  <p style={{ color: "var(--muted)", fontSize: "0.6rem", marginTop: "1px" }}>{row.sub}</p>
                </div>
                <span style={{ color: "var(--gold)", ...vh, fontSize: "0.9rem", fontWeight: 700 }}>{row.val}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2">
              <div>
                <p style={{ color: "var(--gold-light)", ...vh, fontSize: "0.7rem", letterSpacing: "0.1em" }}>META DIÁRIA</p>
                <p style={{ color: "var(--muted)", fontSize: "0.6rem", marginTop: "1px" }}>
                  {perfil?.objetivo === "emagrecer" ? "TDEE − 500 KCAL" :
                   perfil?.objetivo === "ganhar_massa" ? "TDEE + 300 KCAL" : "= TDEE"}
                </p>
              </div>
              <span style={{ color: "var(--gold-light)", ...vh, fontSize: "1.1rem", fontWeight: 700 }}>{metas.calorias} KCAL</span>
            </div>
          </div>

          <div className="divider-gold" style={{ marginBottom: "0.75rem" }}>MACROS / DIA</div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "PROTEÍNA", val: metas.proteinas, color: "var(--gold-light)" },
              { label: "CARBOIDRATO", val: metas.carboidratos, color: "var(--gold)" },
              { label: "GORDURA", val: metas.gorduras, color: "#C87020" },
            ].map((m) => (
              <div key={m.label} className="stat-plate text-center">
                <p style={{ color: m.color, ...vh, fontSize: "1.4rem", fontWeight: 700, lineHeight: 1 }}>{m.val}g</p>
                <p style={{ color: "var(--muted)", fontSize: "0.55rem", letterSpacing: "0.12em", marginTop: "3px", ...vh }}>{m.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
