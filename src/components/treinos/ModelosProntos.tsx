"use client";

import { useState } from "react";
import { MODELOS, type ModeloTreino } from "@/lib/treinos/modelos";
import { criarFichasDeModelo } from "@/lib/treinos/store";
import { Confirmacao, Sheet } from "./Sheet";
import { IconeDireita } from "./Icones";

const FAMILIAS: ModeloTreino["familia"][] = ["Hipertrofia", "Força", "Peso corporal", "Cardio"];

/** Lista de fichas prontas por metodologia; cria as fichas do modelo escolhido. */
export function ModelosProntos({ onFechar, onCriadas }: { onFechar: () => void; onCriadas: (qtd: number, nome: string) => void }) {
  const [escolhido, setEscolhido] = useState<ModeloTreino | null>(null);

  return (
    <>
      <Sheet titulo="Modelos prontos" onFechar={onFechar} cheia>
        <p className="tr-note" style={{ marginBottom: 4 }}>
          <span>
            Fichas montadas a partir de metodologias conhecidas. Elas entram em Meus treinos e você pode editar tudo. As cargas ficam em branco: são pontos de partida.
          </span>
        </p>
        {FAMILIAS.map((fam) => (
          <div key={fam} role="group" aria-label={fam}>
            <div className="tr-tec-grupo">{fam}</div>
            {MODELOS.filter((m) => m.familia === fam).map((m) => (
              <button key={m.id} className="tr-ex-item" onClick={() => setEscolhido(m)} aria-label={`Modelo ${m.nome}`}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 16, fontWeight: 700 }}>{m.nome}</span>
                  <span style={{ display: "block", fontSize: 13, color: "var(--text2)", marginTop: 2, lineHeight: 1.35 }}>{m.resumo}</span>
                  <span className="tr-tec-extra">
                    {m.nivel} · {m.fichas.length} {m.fichas.length === 1 ? "ficha" : "fichas"} · {m.frequencia}
                  </span>
                </span>
                <IconeDireita size={18} />
              </button>
            ))}
          </div>
        ))}
      </Sheet>

      {escolhido && (
        <Confirmacao
          titulo={escolhido.nome}
          texto={
            <>
              Serão criadas {escolhido.fichas.length === 1 ? "a ficha" : `${escolhido.fichas.length} fichas`}:{" "}
              <strong style={{ color: "var(--text)" }}>{escolhido.fichas.map((f) => f.nome).join(", ")}</strong>.
              <br />
              {escolhido.frequencia}.
            </>
          }
          confirmar="Criar fichas"
          onCancelar={() => setEscolhido(null)}
          onConfirmar={() => {
            const ids = criarFichasDeModelo(escolhido.id);
            onCriadas(ids.length, escolhido.nome);
          }}
        />
      )}
    </>
  );
}
