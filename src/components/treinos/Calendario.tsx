"use client";

import { useState } from "react";
import type { TreinoDoDia } from "@/lib/treinos/types";
import { DIAS_CURTOS, chaveData, hojeChave, nomeMes, paraData } from "@/lib/treinos/datas";
import { IconeDireita, IconeEsquerda } from "./Icones";
import { Sheet } from "./Sheet";

export function Calendario({
  titulo,
  selecionada,
  treinos,
  desabilitada,
  aviso,
  onEscolher,
  onFechar,
}: {
  titulo: string;
  selecionada: string;
  treinos: Record<string, TreinoDoDia>;
  desabilitada?: string;
  aviso?: React.ReactNode;
  onEscolher: (data: string) => void;
  onFechar: () => void;
}) {
  const inicial = paraData(selecionada);
  const [ano, setAno] = useState(inicial.getFullYear());
  const [mes, setMes] = useState(inicial.getMonth());
  const hoje = hojeChave();

  function mudarMes(delta: number) {
    const d = new Date(ano, mes + delta, 1);
    setAno(d.getFullYear());
    setMes(d.getMonth());
  }

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas: (string | null)[] = [
    ...Array.from({ length: primeiroDia }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => chaveData(new Date(ano, mes, i + 1))),
  ];

  const treinosNoMes = celulas.filter((c) => c && treinos[c]).length;

  return (
    <Sheet titulo={titulo} onFechar={onFechar}>
      {aviso}
      <div className="tr-cal-head">
        <button className="tr-icon-btn" onClick={() => mudarMes(-1)} aria-label="Mês anterior">
          <IconeEsquerda />
        </button>
        <div className="tr-cal-month">
          {nomeMes(mes)} {ano}
          <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, textTransform: "none" }}>
            {treinosNoMes === 0 ? "Nenhum treino" : treinosNoMes === 1 ? "1 treino" : `${treinosNoMes} treinos`}
          </div>
        </div>
        <button className="tr-icon-btn" onClick={() => mudarMes(1)} aria-label="Próximo mês">
          <IconeDireita />
        </button>
      </div>

      <div className="tr-cal-grid">
        {DIAS_CURTOS.map((d, i) => (
          <div key={i} className="tr-cal-wd">
            {d}
          </div>
        ))}
        {celulas.map((c, i) => {
          if (!c) return <div key={"v" + i} className="tr-cal-day fora" />;
          const t = treinos[c];
          const cls = ["tr-cal-day"];
          if (c === hoje) cls.push("hoje");
          if (c === selecionada) cls.push("sel");
          if (c === desabilitada) cls.push("origem");
          return (
            <button
              key={c}
              className={cls.join(" ")}
              disabled={c === desabilitada}
              onClick={() => onEscolher(c)}
              aria-label={`${paraData(c).getDate()} de ${nomeMes(mes)}${t ? (t.status === "concluido" ? ", treino concluído" : ", treino em andamento") : ""}`}
            >
              {paraData(c).getDate()}
              {t && <span className={"tr-cal-dot" + (t.status === "concluido" ? " ok" : "")} />}
            </button>
          );
        })}
      </div>

      <div className="tr-legend">
        <span>
          <span className="tr-cal-dot ok" style={{ position: "static" }} /> Concluído
        </span>
        <span>
          <span className="tr-cal-dot" style={{ position: "static" }} /> Em andamento
        </span>
      </div>

      {selecionada !== hoje && !desabilitada && (
        <button className="tr-btn tr-btn-block" style={{ marginTop: 16 }} onClick={() => onEscolher(hoje)}>
          Ir para hoje
        </button>
      )}
    </Sheet>
  );
}
