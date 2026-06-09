"use client";

import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import Card from "@/components/Card";

const hoje = new Date().toISOString().split("T")[0];

export default function TreinosPage() {
  const { data, removerTreino } = useApp();
  const { treinos, treinosLog } = data;

  function handleRemover(id: string) {
    if (confirm("Remover este treino?")) removerTreino(id);
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Treinos</h1>
        <Link
          href="/treinos/novo"
          className="bg-green-600 text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors"
        >
          + Novo
        </Link>
      </div>

      {treinos.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-4xl mb-3">🏋️</p>
            <p className="text-gray-500 mb-4">Nenhum treino criado ainda</p>
            <Link
              href="/treinos/novo"
              className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-medium"
            >
              Criar meu primeiro treino
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {treinos.map((treino) => {
            const logs = treinosLog.filter((l) => l.workoutId === treino.id);
            const treinadoHoje = logs.some((l) => l.data.startsWith(hoje));
            return (
              <Card key={treino.id}>
                <div className="flex items-start justify-between">
                  <Link href={`/treinos/${treino.id}`} className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {treinadoHoje && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          ✅ Hoje
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{treino.nome}</h3>
                    {treino.descricao && (
                      <p className="text-sm text-gray-500 mt-0.5">{treino.descricao}</p>
                    )}
                    <div className="flex gap-3 mt-2 text-xs text-gray-400">
                      <span>{treino.exercicios.length} exercícios</span>
                      <span>{logs.length}x realizado</span>
                    </div>
                  </Link>
                  <div className="flex gap-2 ml-2">
                    <Link
                      href={`/treinos/${treino.id}/editar`}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleRemover(treino.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
