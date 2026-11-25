"use client";

import type { TecnicaId } from "@/lib/treinos/types";
import { tecnicaPorId } from "@/lib/treinos/tecnicas";
import { IconeBaixo } from "./Icones";

/** Botão que mostra a técnica escolhida e abre o seletor; logo abaixo, como executar e progredir. */
export function ChipTecnica({ tecnica, nome, onClick }: { tecnica?: TecnicaId; nome: string; onClick: () => void }) {
  const t = tecnicaPorId(tecnica);
  return (
    <div style={{ padding: "0 14px 10px" }}>
      <button className="tr-tecnica" onClick={onClick} aria-label={`Técnica de ${nome}: ${t?.nome ?? "nenhuma"}. Trocar`}>
        <span className="tr-tecnica-rot">{t?.tipo === "cardio" ? "Tipo" : "Técnica"}</span>
        <span style={{ flex: 1, textAlign: "left" }}>{t?.nome ?? "Escolher técnica"}</span>
        <IconeBaixo size={18} />
      </button>
      {t && (
        <p className="tr-note" style={{ marginTop: 6, fontSize: 13, display: "block" }}>
          {t.comoFazer}
          {t.progressao && (
            <>
              {" "}
              <strong style={{ color: "var(--text)" }}>Progressão:</strong> {t.progressao}
            </>
          )}
        </p>
      )}
    </div>
  );
}
