"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { calcularTMB, calcularTDEE, calcularMetasCalorias, calcularIMC, activityLabels } from "@/lib/calculations";
import type { UserProfile, ActivityLevel } from "@/types";
import Card from "@/components/Card";

const objetivos = [
  { value: "emagrecer", label: "Emagrecer", emoji: "📉" },
  { value: "manter", label: "Manter peso", emoji: "⚖️" },
  { value: "ganhar_massa", label: "Ganhar massa", emoji: "📈" },
] as const;

const atividadeOpcoes: { value: ActivityLevel; label: string }[] = [
  { value: "sedentario", label: activityLabels.sedentario },
  { value: "leve", label: activityLabels.leve },
  { value: "moderado", label: activityLabels.moderado },
  { value: "ativo", label: activityLabels.ativo },
  { value: "muito_ativo", label: activityLabels.muito_ativo },
];

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        {perfil && !editando && (
          <button
            onClick={() => setEditando(true)}
            className="text-green-600 text-sm font-medium"
          >
            Editar
          </button>
        )}
      </div>

      {salvo && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-800 text-sm font-medium text-center">
          ✅ Perfil salvo com sucesso!
        </div>
      )}

      {/* Formulário */}
      {editando ? (
        <Card>
          <form onSubmit={handleSalvar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                required
                value={form.nome ?? ""}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Seu nome"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                <input
                  type="number"
                  required
                  min={30}
                  max={300}
                  step={0.1}
                  value={form.peso ?? ""}
                  onChange={(e) => setForm({ ...form, peso: parseFloat(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                <input
                  type="number"
                  required
                  min={100}
                  max={250}
                  value={form.altura ?? ""}
                  onChange={(e) => setForm({ ...form, altura: parseInt(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={100}
                  value={form.idade ?? ""}
                  onChange={(e) => setForm({ ...form, idade: parseInt(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <select
                  value={form.sexo ?? "masculino"}
                  onChange={(e) => setForm({ ...form, sexo: e.target.value as "masculino" | "feminino" })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nível de atividade</label>
              <select
                value={form.nivelAtividade ?? "moderado"}
                onChange={(e) => setForm({ ...form, nivelAtividade: e.target.value as ActivityLevel })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                {atividadeOpcoes.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo</label>
              <div className="grid grid-cols-3 gap-2">
                {objetivos.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setForm({ ...form, objetivo: o.value })}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl border text-sm transition-colors ${
                      form.objetivo === o.value
                        ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-xl mb-1">{o.emoji}</span>
                    <span className="text-xs text-center">{o.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-700 transition-colors"
            >
              Salvar Perfil
            </button>
          </form>
        </Card>
      ) : perfil && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              {perfil.sexo === "masculino" ? "🧔" : "👩"}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{perfil.nome}</p>
              <p className="text-sm text-gray-500">
                {perfil.idade} anos · {perfil.peso}kg · {perfil.altura}cm
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">Atividade:</span>
              <br />
              <span className="text-xs">{activityLabels[perfil.nivelAtividade]}</span>
            </div>
            <div>
              <span className="font-medium">Objetivo:</span>
              <br />
              <span className="text-xs">
                {objetivos.find((o) => o.value === perfil.objetivo)?.label}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* IMC */}
      {imc && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">IMC</h2>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-gray-900">{imc.imc}</span>
            <span className={`text-sm font-medium mb-1 ${
              imc.imc < 18.5 || imc.imc >= 25
                ? "text-orange-500"
                : "text-green-600"
            }`}>
              {imc.classificacao}
            </span>
          </div>
        </Card>
      )}

      {/* Metabolismo */}
      {tmb && tdee && metas && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">Metabolismo</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-800">TMB (Taxa Metabólica Basal)</p>
                <p className="text-xs text-gray-400">Calorias em repouso total</p>
              </div>
              <span className="text-lg font-bold text-gray-900">{tmb} kcal</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-800">TDEE (Gasto total diário)</p>
                <p className="text-xs text-gray-400">Com fator de atividade</p>
              </div>
              <span className="text-lg font-bold text-gray-900">{tdee} kcal</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium text-green-700">Meta diária</p>
                <p className="text-xs text-gray-400">
                  {perfil?.objetivo === "emagrecer" ? "TDEE - 500 kcal" :
                   perfil?.objetivo === "ganhar_massa" ? "TDEE + 300 kcal" : "= TDEE"}
                </p>
              </div>
              <span className="text-xl font-bold text-green-600">{metas.calorias} kcal</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-2">Macros recomendados/dia</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-blue-50 rounded-xl p-2">
                <p className="text-lg font-bold text-blue-600">{metas.proteinas}g</p>
                <p className="text-xs text-gray-500">Proteína</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-2">
                <p className="text-lg font-bold text-yellow-600">{metas.carboidratos}g</p>
                <p className="text-xs text-gray-500">Carboidrato</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-2">
                <p className="text-lg font-bold text-orange-500">{metas.gorduras}g</p>
                <p className="text-xs text-gray-500">Gordura</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
