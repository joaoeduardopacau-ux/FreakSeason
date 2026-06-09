"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import type { WorkoutLog } from "@/types";
import Card from "@/components/Card";

export default function TreinoDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, adicionarLogTreino } = useApp();

  const treino = data.treinos.find((t) => t.id === id);
  if (!treino) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500">Treino não encontrado</p>
        <Link href="/treinos" className="text-green-600 text-sm mt-2 block">
          ← Voltar para treinos
        </Link>
      </div>
    );
  }

  const hoje = new Date().toISOString().split("T")[0];
  const treinadoHoje = data.treinosLog.some(
    (l) => l.workoutId === id && l.data.startsWith(hoje)
  );
  const totalVezes = data.treinosLog.filter((l) => l.workoutId === id).length;

  function handleConcluir() {
    const log: WorkoutLog = {
      id: crypto.randomUUID(),
      workoutId: id,
      data: new Date().toISOString(),
      concluido: true,
    };
    adicionarLogTreino(log);
    router.push("/");
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          ← Voltar
        </button>
        <Link
          href={`/treinos/${id}/editar`}
          className="text-green-600 text-sm font-medium"
        >
          Editar
        </Link>
      </div>

      <Card>
        <h1 className="text-xl font-bold text-gray-900">{treino.nome}</h1>
        {treino.descricao && (
          <p className="text-sm text-gray-500 mt-1">{treino.descricao}</p>
        )}
        <div className="flex gap-4 mt-3 text-sm text-gray-400">
          <span>{treino.exercicios.length} exercícios</span>
          <span>{totalVezes}x realizado</span>
        </div>
      </Card>

      <div className="space-y-3">
        {treino.exercicios.map((ex, idx) => (
          <Card key={ex.id}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{ex.nome}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg">
                    {ex.series} séries
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-lg">
                    {ex.repeticoes} reps
                  </span>
                  {ex.carga && (
                    <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-lg">
                      {ex.carga}
                    </span>
                  )}
                  {ex.descanso && (
                    <span className="bg-orange-50 text-orange-600 text-xs px-2 py-1 rounded-lg">
                      ⏱ {ex.descanso}
                    </span>
                  )}
                </div>
                {ex.observacoes && (
                  <p className="text-xs text-gray-400 mt-1">{ex.observacoes}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {treinadoHoje ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-1">✅</p>
          <p className="text-green-700 font-semibold">Treino concluído hoje!</p>
        </div>
      ) : (
        <button
          onClick={handleConcluir}
          className="w-full bg-green-600 text-white rounded-2xl py-4 font-bold text-base hover:bg-green-700 transition-colors"
        >
          ✅ Marcar como concluído hoje
        </button>
      )}
    </div>
  );
}
