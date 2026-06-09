"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import type { Exercise, Workout } from "@/types";
import Card from "@/components/Card";

function novoExercicio(): Exercise {
  return {
    id: crypto.randomUUID(),
    nome: "",
    series: 3,
    repeticoes: "10",
    carga: "",
    descanso: "60s",
    observacoes: "",
  };
}

export default function EditarTreinoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, atualizarTreino } = useApp();

  const treinoOriginal = data.treinos.find((t) => t.id === id);

  const [nome, setNome] = useState(treinoOriginal?.nome ?? "");
  const [descricao, setDescricao] = useState(treinoOriginal?.descricao ?? "");
  const [exercicios, setExercicios] = useState<Exercise[]>(
    treinoOriginal?.exercicios ?? [novoExercicio()]
  );

  useEffect(() => {
    if (treinoOriginal) {
      setNome(treinoOriginal.nome);
      setDescricao(treinoOriginal.descricao ?? "");
      setExercicios(treinoOriginal.exercicios);
    }
  }, [treinoOriginal]);

  if (!treinoOriginal) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500">Treino não encontrado</p>
      </div>
    );
  }

  function handleAddExercicio() {
    setExercicios((e) => [...e, novoExercicio()]);
  }

  function handleRemoveExercicio(exId: string) {
    setExercicios((e) => e.filter((ex) => ex.id !== exId));
  }

  function handleExercicioChange(exId: string, field: keyof Exercise, value: string | number) {
    setExercicios((e) =>
      e.map((ex) => (ex.id === exId ? { ...ex, [field]: value } : ex))
    );
  }

  function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !treinoOriginal) return;
    const treino: Workout = {
      id: treinoOriginal.id,
      criadoEm: treinoOriginal.criadoEm,
      nome: nome.trim(),
      descricao: descricao.trim(),
      exercicios: exercicios.filter((ex) => ex.nome.trim()),
    };
    atualizarTreino(treino);
    router.push(`/treinos/${id}`);
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          ← Voltar
        </button>
        <h1 className="text-xl font-bold text-gray-900">Editar Treino</h1>
      </div>

      <form onSubmit={handleSalvar} className="space-y-4">
        <Card>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Exercícios</h2>
          <button type="button" onClick={handleAddExercicio} className="text-green-600 text-sm font-medium">
            + Adicionar
          </button>
        </div>

        {exercicios.map((ex, idx) => (
          <Card key={ex.id}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Exercício {idx + 1}</span>
              {exercicios.length > 1 && (
                <button type="button" onClick={() => handleRemoveExercicio(ex.id)} className="text-red-400 text-sm">
                  Remover
                </button>
              )}
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={ex.nome}
                onChange={(e) => handleExercicioChange(ex.id, "nome", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Nome do exercício"
              />
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Séries</label>
                  <input
                    type="number"
                    min={1}
                    value={ex.series}
                    onChange={(e) => handleExercicioChange(ex.id, "series", parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Reps</label>
                  <input
                    type="text"
                    value={ex.repeticoes}
                    onChange={(e) => handleExercicioChange(ex.id, "repeticoes", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Descanso</label>
                  <input
                    type="text"
                    value={ex.descanso}
                    onChange={(e) => handleExercicioChange(ex.id, "descanso", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
              <input
                type="text"
                value={ex.carga}
                onChange={(e) => handleExercicioChange(ex.id, "carga", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Carga"
              />
              <input
                type="text"
                value={ex.observacoes}
                onChange={(e) => handleExercicioChange(ex.id, "observacoes", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Observações"
              />
            </div>
          </Card>
        ))}

        <button
          type="submit"
          className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-700 transition-colors"
        >
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}
