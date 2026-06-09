"use client";

import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { calcularMetasCalorias } from "@/lib/calculations";
import type { Refeicao, RefeicaoItem } from "@/types";
import Card from "@/components/Card";
import MacroBar from "@/components/MacroBar";

const hoje = new Date().toISOString().split("T")[0];

const refeicaoOpcoes = [
  { value: "cafe_manha", label: "Café da manhã", emoji: "☕" },
  { value: "lanche_manha", label: "Lanche da manhã", emoji: "🍎" },
  { value: "almoco", label: "Almoço", emoji: "🍽️" },
  { value: "lanche_tarde", label: "Lanche da tarde", emoji: "🥪" },
  { value: "jantar", label: "Jantar", emoji: "🌙" },
  { value: "ceia", label: "Ceia", emoji: "🥛" },
] as const;

type RefeicaoTipo = typeof refeicaoOpcoes[number]["value"];

export default function DietaPage() {
  const { data, adicionarRefeicao, removerRefeicao, adicionarAlimento } = useApp();
  const { perfil, alimentos, refeicoes } = data;

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

  // Modal de adicionar refeição
  const [modal, setModal] = useState(false);
  const [tipoRefeicao, setTipoRefeicao] = useState<RefeicaoTipo>("almoco");
  const [busca, setBusca] = useState("");
  const [itens, setItens] = useState<RefeicaoItem[]>([]);
  const [qtdSelecionada, setQtdSelecionada] = useState(100);

  // Adicionar alimento personalizado
  const [modalAlimento, setModalAlimento] = useState(false);
  const [novoAlimento, setNovoAlimento] = useState({
    nome: "", calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, porcao: 100,
  });

  const alimentosFiltrados = alimentos.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function handleAdicionarItem(alimentoId: string) {
    const alimento = alimentos.find((a) => a.id === alimentoId);
    if (!alimento) return;

    const fator = qtdSelecionada / alimento.porcao;
    const item: RefeicaoItem = {
      alimentoId,
      quantidade: qtdSelecionada,
      nomeAlimento: alimento.nome,
      caloriasTotais: alimento.calorias * fator,
      proteinasTotais: alimento.proteinas * fator,
      carboidratosTotais: alimento.carboidratos * fator,
      gordurasTotais: alimento.gorduras * fator,
    };
    setItens((i) => [...i, item]);
    setBusca("");
  }

  function handleRemoverItem(idx: number) {
    setItens((i) => i.filter((_, j) => j !== idx));
  }

  function handleSalvarRefeicao() {
    if (itens.length === 0) return;
    const refeicao: Refeicao = {
      id: crypto.randomUUID(),
      tipo: tipoRefeicao,
      itens,
      data: new Date().toISOString(),
    };
    adicionarRefeicao(refeicao);
    setModal(false);
    setItens([]);
    setBusca("");
  }

  function handleSalvarAlimento(e: React.FormEvent) {
    e.preventDefault();
    adicionarAlimento({
      id: crypto.randomUUID(),
      ...novoAlimento,
      unidade: "g",
    });
    setModalAlimento(false);
    setNovoAlimento({ nome: "", calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, porcao: 100 });
  }

  const totaisItens = itens.reduce(
    (acc, i) => ({
      calorias: acc.calorias + i.caloriasTotais,
      proteinas: acc.proteinas + i.proteinasTotais,
      carboidratos: acc.carboidratos + i.carboidratosTotais,
      gorduras: acc.gorduras + i.gordurasTotais,
    }),
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dieta</h1>
        <button
          onClick={() => setModal(true)}
          className="bg-green-600 text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors"
        >
          + Refeição
        </button>
      </div>

      {/* Resumo do dia */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">Resumo de hoje</h2>
        <div className="flex items-end gap-2 mb-4">
          <span className="text-4xl font-bold text-gray-900">
            {Math.round(totaisHoje.calorias)}
          </span>
          <span className="text-gray-400 text-lg mb-1">/ {metas?.calorias ?? "—"} kcal</span>
        </div>
        {metas ? (
          <div className="space-y-2">
            <MacroBar label="Proteínas" atual={Math.round(totaisHoje.proteinas)} meta={metas.proteinas} cor="bg-blue-400" />
            <MacroBar label="Carboidratos" atual={Math.round(totaisHoje.carboidratos)} meta={metas.carboidratos} cor="bg-yellow-400" />
            <MacroBar label="Gorduras" atual={Math.round(totaisHoje.gorduras)} meta={metas.gorduras} cor="bg-orange-400" />
          </div>
        ) : (
          <p className="text-sm text-gray-400">Configure seu perfil para ver as metas</p>
        )}
      </Card>

      {/* Refeições do dia */}
      {refeicoesHoje.length === 0 ? (
        <Card>
          <div className="text-center py-6">
            <p className="text-3xl mb-2">🥗</p>
            <p className="text-gray-400 text-sm">Nenhuma refeição registrada hoje</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {refeicaoOpcoes.map(({ value, label, emoji }) => {
            const ref = refeicoesHoje.find((r) => r.tipo === value);
            if (!ref) return null;
            const totalRef = ref.itens.reduce((a, i) => a + i.caloriasTotais, 0);
            return (
              <Card key={ref.id}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-400">{Math.round(totalRef)} kcal</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removerRefeicao(ref.id)}
                    className="text-gray-300 hover:text-red-400 text-sm p-1"
                  >
                    🗑️
                  </button>
                </div>
                <div className="space-y-1">
                  {ref.itens.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-gray-500">
                      <span>{item.nomeAlimento} ({item.quantidade}g)</span>
                      <span>{Math.round(item.caloriasTotais)} kcal</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-2 pt-2 border-t border-gray-50 text-xs text-gray-400">
                  <span>P: {Math.round(ref.itens.reduce((a, i) => a + i.proteinasTotais, 0))}g</span>
                  <span>C: {Math.round(ref.itens.reduce((a, i) => a + i.carboidratosTotais, 0))}g</span>
                  <span>G: {Math.round(ref.itens.reduce((a, i) => a + i.gordurasTotais, 0))}g</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal adicionar refeição */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Adicionar refeição</h2>
                <button onClick={() => { setModal(false); setItens([]); setBusca(""); }} className="text-gray-400 text-xl">✕</button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Tipo de refeição */}
              <div className="grid grid-cols-3 gap-2">
                {refeicaoOpcoes.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setTipoRefeicao(o.value)}
                    className={`flex flex-col items-center py-2 rounded-xl border text-xs transition-colors ${
                      tipoRefeicao === o.value
                        ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                        : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <span className="text-lg mb-0.5">{o.emoji}</span>
                    <span className="text-center leading-tight">{o.label}</span>
                  </button>
                ))}
              </div>

              {/* Buscar alimento */}
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Buscar alimento..."
                  />
                  <button
                    type="button"
                    onClick={() => setModalAlimento(true)}
                    className="bg-gray-100 text-gray-600 text-xs px-3 rounded-xl hover:bg-gray-200"
                  >
                    + Novo
                  </button>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Quantidade (g/ml)</label>
                  <input
                    type="number"
                    min={1}
                    value={qtdSelecionada}
                    onChange={(e) => setQtdSelecionada(parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                {busca && (
                  <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden max-h-40 overflow-y-auto">
                    {alimentosFiltrados.length === 0 ? (
                      <p className="text-sm text-gray-400 p-3 text-center">Nenhum resultado</p>
                    ) : (
                      alimentosFiltrados.map((a) => {
                        const fator = qtdSelecionada / a.porcao;
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => handleAdicionarItem(a.id)}
                            className="w-full flex justify-between items-center px-3 py-2 hover:bg-green-50 border-b border-gray-50 last:border-b-0 text-left"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-800">{a.nome}</p>
                              <p className="text-xs text-gray-400">
                                {Math.round(a.calorias * fator)} kcal · {qtdSelecionada}{a.unidade}
                              </p>
                            </div>
                            <span className="text-green-600 text-lg">+</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Itens adicionados */}
              {itens.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Itens ({Math.round(totaisItens.calorias)} kcal)
                  </p>
                  <div className="space-y-1">
                    {itens.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 rounded-xl px-3 py-2">
                        <div>
                          <p className="text-sm text-gray-800">{item.nomeAlimento}</p>
                          <p className="text-xs text-gray-400">
                            {item.quantidade}g · {Math.round(item.caloriasTotais)} kcal
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoverItem(idx)}
                          className="text-gray-300 hover:text-red-400 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSalvarRefeicao}
                disabled={itens.length === 0}
                className="w-full bg-green-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar Refeição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal adicionar alimento */}
      {modalAlimento && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Novo alimento</h3>
              <button onClick={() => setModalAlimento(false)} className="text-gray-400">✕</button>
            </div>
            <form onSubmit={handleSalvarAlimento} className="space-y-3">
              <input
                required
                type="text"
                value={novoAlimento.nome}
                onChange={(e) => setNovoAlimento({ ...novoAlimento, nome: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Nome do alimento"
              />
              <div className="grid grid-cols-2 gap-2">
                {(["calorias", "proteinas", "carboidratos", "gorduras"] as const).map((field) => (
                  <div key={field}>
                    <label className="text-xs text-gray-500 block mb-1 capitalize">{field} (por porção)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={novoAlimento[field]}
                      onChange={(e) => setNovoAlimento({ ...novoAlimento, [field]: parseFloat(e.target.value) })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Porção (g)</label>
                <input
                  type="number"
                  min={1}
                  value={novoAlimento.porcao}
                  onChange={(e) => setNovoAlimento({ ...novoAlimento, porcao: parseInt(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white rounded-xl py-2.5 font-semibold text-sm"
              >
                Adicionar alimento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
