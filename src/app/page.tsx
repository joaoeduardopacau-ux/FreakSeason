"use client";

import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import { calcularMetasCalorias } from "@/lib/calculations";
import Card from "@/components/Card";
import MacroBar from "@/components/MacroBar";

const hoje = new Date().toISOString().split("T")[0];

const refeicaoLabels: Record<string, string> = {
  cafe_manha: "Café da manhã",
  lanche_manha: "Lanche da manhã",
  almoco: "Almoço",
  lanche_tarde: "Lanche da tarde",
  jantar: "Jantar",
  ceia: "Ceia",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {perfil ? `Olá, ${perfil.nome.split(" ")[0]}! 👋` : "FreakSeason 💪"}
          </h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {!perfil && (
        <Card className="bg-green-50 border-green-200">
          <p className="text-sm text-green-800 font-medium mb-2">
            Configure seu perfil para começar!
          </p>
          <Link
            href="/perfil"
            className="inline-block bg-green-600 text-white text-sm px-4 py-2 rounded-xl font-medium"
          >
            Configurar perfil →
          </Link>
        </Card>
      )}

      {/* Calorias do dia */}
      <Card>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-900">Calorias hoje</h2>
          <Link href="/dieta" className="text-green-600 text-sm font-medium">
            + Adicionar
          </Link>
        </div>

        <div className="flex items-end gap-2 mb-4">
          <span className="text-4xl font-bold text-gray-900">
            {Math.round(totaisHoje.calorias)}
          </span>
          <span className="text-gray-400 text-lg mb-1">
            / {metas?.calorias ?? "—"} kcal
          </span>
        </div>

        {metas && (
          <div className="space-y-2">
            <MacroBar
              label="Proteínas"
              atual={Math.round(totaisHoje.proteinas)}
              meta={metas.proteinas}
              cor="bg-blue-400"
            />
            <MacroBar
              label="Carboidratos"
              atual={Math.round(totaisHoje.carboidratos)}
              meta={metas.carboidratos}
              cor="bg-yellow-400"
            />
            <MacroBar
              label="Gorduras"
              atual={Math.round(totaisHoje.gorduras)}
              meta={metas.gorduras}
              cor="bg-orange-400"
            />
          </div>
        )}

        {refeicoesHoje.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
            {refeicoesHoje.map((r) => {
              const cal = r.itens.reduce((a, i) => a + i.caloriasTotais, 0);
              return (
                <div key={r.id} className="flex justify-between text-sm text-gray-600">
                  <span>{refeicaoLabels[r.tipo]}</span>
                  <span>{Math.round(cal)} kcal</span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Treino do dia */}
      <Card>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-900">Treino de hoje</h2>
          <Link href="/treinos" className="text-green-600 text-sm font-medium">
            Ver todos
          </Link>
        </div>

        {treinoHoje ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="font-medium text-gray-900">Treino concluído!</p>
              <p className="text-sm text-gray-500">
                {treinos.find((t) => t.id === treinoHoje.workoutId)?.nome}
              </p>
            </div>
          </div>
        ) : treinos.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-2">Escolha um treino para hoje:</p>
            {treinos.slice(0, 3).map((t) => (
              <Link
                key={t.id}
                href={`/treinos/${t.id}`}
                className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 hover:bg-green-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-800">{t.nome}</span>
                <span className="text-gray-400">→</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm mb-2">Nenhum treino cadastrado ainda</p>
            <Link
              href="/treinos/novo"
              className="text-green-600 text-sm font-medium"
            >
              Criar primeiro treino →
            </Link>
          </div>
        )}
      </Card>

      {/* Resumo geral */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-gray-500 text-xs mb-1">Total de treinos</p>
          <p className="text-3xl font-bold text-gray-900">{diasTreino}</p>
          <p className="text-xs text-gray-400">dias treinados</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-xs mb-1">Treinos criados</p>
          <p className="text-3xl font-bold text-gray-900">{treinos.length}</p>
          <p className="text-xs text-gray-400">programas</p>
        </Card>
      </div>
    </div>
  );
}
