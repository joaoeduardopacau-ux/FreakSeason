"use client";

import { useState } from "react";
import Link from "next/link";
import { contarSeries, useTreinos } from "@/lib/treinos/store";
import { dataCurta, dataPorExtenso, diaDaSemana, nomeMes, paraData, rotuloRelativo } from "@/lib/treinos/datas";
import type { TreinoDoDia } from "@/lib/treinos/types";
import { tecnicaPorId } from "@/lib/treinos/tecnicas";
import { rotulos } from "@/lib/treinos/campos";
import { Sheet } from "@/components/treinos/Sheet";
import { BotaoGif } from "@/components/treinos/Gif";
import { IconeCelular, IconeCheck, IconeDireita, IconeRelogio } from "@/components/treinos/Icones";

function Status({ t }: { t: TreinoDoDia }) {
  return t.status === "concluido" ? (
    <span className="tr-pill tr-pill-green">
      <IconeCheck size={13} /> Concluído
    </span>
  ) : (
    <span className="tr-pill">
      <IconeRelogio size={13} /> Em andamento
    </span>
  );
}

export default function HistoricoPage() {
  const estado = useTreinos();
  const [aberto, setAberto] = useState<string | null>(null);

  if (!estado) {
    return (
      <div className="tr-page" style={{ paddingTop: 40, textAlign: "center", color: "var(--text2)" }}>
        Carregando histórico…
      </div>
    );
  }

  const { treinos } = estado.dados;
  const lista = Object.values(treinos).sort((a, b) => b.data.localeCompare(a.data));

  const mesDe = (data: string) => {
    const d = paraData(data);
    return `${nomeMes(d.getMonth())} ${d.getFullYear()}`;
  };

  return (
    <div className="tr-page">
      <header style={{ padding: "20px 0 4px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>Histórico</h1>
        <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>
          {lista.length === 0
            ? "Nenhum treino registrado ainda."
            : `${lista.length} ${lista.length === 1 ? "treino registrado" : "treinos registrados"}`}
        </p>
      </header>

      {lista.length === 0 && (
        <div style={{ textAlign: "center", padding: "36px 0" }}>
          <Link href="/treinos" className="tr-btn tr-btn-primary tr-btn-lg" style={{ textDecoration: "none" }}>
            Começar o treino de hoje
          </Link>
        </div>
      )}

      {lista.map((t, i) => {
        const d = paraData(t.data);
        const chaveMes = mesDe(t.data);
        const cabecalho = i === 0 || mesDe(lista[i - 1].data) !== chaveMes ? chaveMes : null;
        const c = contarSeries(t);
        const rel = rotuloRelativo(t.data);
        return (
          <div key={t.data}>
            {cabecalho && <div className="tr-hist-month">{cabecalho}</div>}
            <button className="tr-hist-item" onClick={() => setAberto(t.data)}>
              <div
                style={{
                  width: 52,
                  flexShrink: 0,
                  textAlign: "center",
                  background: "var(--s2)",
                  borderRadius: 12,
                  padding: "6px 0",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>{d.getDate()}</div>
                <div style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600, textTransform: "uppercase" }}>
                  {diaDaSemana(t.data).slice(0, 3)}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {rel ? `${rel} · ` : ""}
                  {dataCurta(t.data)}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "6px 0 4px" }}>
                  <Status t={t} />
                  <span className="tr-pill tr-pill-muted">
                    {c.feitas} {c.feitas === 1 ? "série feita" : "séries feitas"}
                    {c.total !== c.feitas ? ` de ${c.total}` : ""}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text2)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.titulo ? `${t.titulo}: ` : ""}
                  {t.exercicios.map((e) => e.nome).join(" · ")}
                </div>
              </div>
              <span style={{ color: "var(--text3)" }}>
                <IconeDireita />
              </span>
            </button>
          </div>
        );
      })}

      <p className="tr-note" style={{ marginTop: 28, justifyContent: "center", textAlign: "center" }}>
        <IconeCelular size={16} />
        <span>Os treinos ficam salvos apenas neste aparelho e navegador. Limpar os dados do navegador apaga o histórico.</span>
      </p>

      {aberto && treinos[aberto] && <Detalhe t={treinos[aberto]} onFechar={() => setAberto(null)} />}
    </div>
  );
}

function numero(v: string) {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function Detalhe({ t, onFechar }: { t: TreinoDoDia; onFechar: () => void }) {
  const c = contarSeries(t);
  const volume = t.exercicios
    .filter((e) => e.tipo !== "cardio")
    .reduce((acc, e) => acc + e.series.filter((s) => s.feita).reduce((a, s) => a + numero(s.carga) * numero(s.reps), 0), 0);

  return (
    <Sheet
      titulo={`${diaDaSemana(t.data)}`}
      onFechar={onFechar}
      cheia
      rodape={
        <Link
          href={`/treinos?data=${t.data}`}
          className="tr-btn tr-btn-primary tr-btn-block tr-btn-lg"
          style={{ textDecoration: "none" }}
        >
          Abrir em Treinos para editar ou copiar
        </Link>
      }
    >
      <p style={{ fontSize: 15, color: "var(--text2)", marginTop: -4 }}>{dataPorExtenso(t.data)}</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "10px 0 6px" }}>
        <Status t={t} />
        <span className="tr-pill tr-pill-muted">
          {c.feitas} de {c.total} séries feitas
        </span>
        {volume > 0 && (
          <span className="tr-pill tr-pill-muted">Volume {Math.round(volume).toLocaleString("pt-BR")} kg</span>
        )}
      </div>
      {t.titulo && <p style={{ fontSize: 17, fontWeight: 800, marginTop: 4 }}>{t.titulo}</p>}
      {t.copiadoDe && <p className="tr-note">Copiado de {dataCurta(t.copiadoDe)}.</p>}

      {t.exercicios.map((e) => {
        const r = rotulos(e.tipo);
        const tec = tecnicaPorId(e.tecnica);
        return (
        <div key={e.id} className="tr-card" style={{ padding: 14, marginTop: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <BotaoGif exercicioId={e.exercicioId} nome={e.nome} grupo={e.grupo} tecnica={e.tecnica} />
            <div style={{ fontSize: 16, fontWeight: 700, flex: 1, minWidth: 0 }}>{e.nome}</div>
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 2, marginBottom: 8 }}>
            {e.grupo} · {e.series.filter((s) => s.feita).length}/{e.series.length} {e.tipo === "cardio" ? "blocos feitos" : "séries feitas"}
            {tec && tec.id !== "tradicional" && <> · <span style={{ color: "var(--accent)", fontWeight: 600 }}>{tec.nome}</span></>}
          </div>
          <table className="tr-table">
            <thead>
              <tr>
                <th style={{ width: "18%" }}>{r.linha}</th>
                <th>{e.tipo === "cardio" ? "Tempo" : "Carga"}</th>
                <th>{r.b}</th>
                <th style={{ textAlign: "right" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {e.series.map((s, i) => (
                <tr key={s.id} className={s.feita ? "" : "nao-feita"}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 700 }}>{s.carga ? `${s.carga}${r.unidadeA}` : "—"}</td>
                  <td style={{ fontWeight: 700 }}>{s.reps || "—"}</td>
                  <td style={{ textAlign: "right", fontSize: 13, color: s.feita ? "var(--green)" : "var(--text3)" }}>
                    {s.feita ? "Feita" : "Não feita"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {e.observacoes.trim() && (
            <p style={{ fontSize: 14, marginTop: 10, background: "var(--s2)", borderRadius: 10, padding: "10px 12px", whiteSpace: "pre-wrap" }}>
              <span style={{ color: "var(--text2)", fontWeight: 600 }}>Observações: </span>
              {e.observacoes}
            </p>
          )}
        </div>
        );
      })}
    </Sheet>
  );
}
