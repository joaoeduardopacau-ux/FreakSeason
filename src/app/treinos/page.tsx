"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  adicionarExercicios,
  concluirTreino,
  contarSeries,
  definirTecnicaTreino,
  excluirTreino,
  fichaSugerida,
  iniciarTreino,
  reabrirTreino,
  removerExercicio,
  sessaoEmAndamento,
  ultimaVezFicha,
  ultimoRegistro,
  useTreinos,
} from "@/lib/treinos/store";
import { dataCurta, dataPorExtenso, diaDaSemana, hojeChave, rotuloRelativo } from "@/lib/treinos/datas";
import { siglaFicha } from "@/lib/treinos/campos";
import type { DadosTreinos, ExercicioDoTreino } from "@/lib/treinos/types";
import { SeletorExercicios } from "@/components/treinos/SeletorExercicios";
import { ListaCompacta } from "@/components/treinos/ListaCompacta";
import { TreinoGuiado } from "@/components/treinos/TreinoGuiado";
import { Comemoracao } from "@/components/treinos/Comemoracao";
import { Confirmacao } from "@/components/treinos/Sheet";
import { SeletorTecnica } from "@/components/treinos/SeletorTecnica";
import { IconeCelular, IconeCheck, IconeDireita, IconeEsquerda, IconeHalter, IconeMais } from "@/components/treinos/Icones";

export default function Page() {
  return (
    <Suspense fallback={<Carregando />}>
      <Treinos />
    </Suspense>
  );
}

function Carregando() {
  return (
    <div className="tr-page" style={{ paddingTop: 40, textAlign: "center", color: "var(--text2)" }}>
      Carregando treinos…
    </div>
  );
}

function Treinos() {
  const estado = useTreinos();
  const pathname = usePathname();
  const params = useSearchParams();
  const sessao = params.get("sessao");

  if (!estado) return <Carregando />;

  const abrir = (chave: string | null) => {
    // só muda o parâmetro da URL: o History API nativo integra com useSearchParams
    // e funciona mesmo quando a página foi aberta direto com ?sessao= (recarga)
    window.history.replaceState(null, "", chave ? `${pathname}?sessao=${encodeURIComponent(chave)}` : pathname);
    window.scrollTo({ top: 0 });
  };

  if (sessao && estado.dados.treinos[sessao]) {
    return <ExecucaoTreino key={sessao} chave={sessao} dados={estado.dados} erroAoSalvar={estado.erroAoSalvar} onVoltar={() => abrir(null)} />;
  }
  return <ListaTreinos dados={estado.dados} onAbrir={abrir} />;
}

// ───────── lista dos treinos montados ─────────

function ListaTreinos({ dados, onAbrir }: { dados: DadosTreinos; onAbrir: (chave: string) => void }) {
  const hoje = hojeChave();
  const sugerida = fichaSugerida(dados);
  const fichas = dados.fichas;
  const prontas = fichas.filter((f) => f.itens.length > 0);
  const vazias = fichas.filter((f) => f.itens.length === 0);

  return (
    <div className="tr-page">
      <header style={{ padding: "20px 0 16px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>Treinos</h1>
        <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 4 }}>
          {diaDaSemana(hoje)}, {dataPorExtenso(hoje, false)}
        </p>
      </header>

      {prontas.length === 0 ? (
        <div style={{ textAlign: "center", padding: "36px 8px 24px" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "var(--s1)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              color: "var(--text2)",
            }}
          >
            <IconeHalter size={32} />
          </div>
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Nenhum treino montado</p>
          <p style={{ fontSize: 15, color: "var(--text2)", marginBottom: 24, lineHeight: 1.45 }}>
            Monte seus treinos (Treino A, B, C…) na aba Fichas. Eles aparecem aqui prontos para fazer.
          </p>
          <Link href="/fichas" className="tr-btn tr-btn-primary tr-btn-lg tr-btn-block" style={{ textDecoration: "none" }}>
            <IconeMais /> Montar treino
          </Link>
        </div>
      ) : (
        <div role="list" aria-label="Treinos montados">
          {prontas.map((f) => {
            const andamento = sessaoEmAndamento(dados, f.id, hoje);
            const ultima = ultimaVezFicha(dados, f.id);
            const cardio = f.itens.filter((i) => i.tipo === "cardio").length;
            const forca = f.itens.length - cardio;
            const destaque = andamento || f.id === sugerida;
            return (
              <button
                key={f.id}
                role="listitem"
                className={"tr-semana-dia" + (destaque ? " hoje" : "")}
                onClick={() => {
                  const chave = iniciarTreino(f.id, hoje);
                  if (chave) onAbrir(chave);
                }}
                aria-label={`${andamento ? "Continuar" : "Fazer"} ${f.nome}${f.descricao ? ", " + f.descricao : ""}`}
              >
                <span className="tr-semana-sigla">{siglaFicha(f.nome)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 17, fontWeight: 800 }}>{f.nome.trim() || "Treino"}</span>
                    {andamento ? (
                      <span className="tr-pill">Em andamento</span>
                    ) : (
                      f.id === sugerida && <span className="tr-pill">Próximo</span>
                    )}
                  </span>
                  {f.descricao.trim() && (
                    <span style={{ display: "block", fontSize: 14, fontWeight: 600, marginTop: 2 }}>{f.descricao}</span>
                  )}
                  <span style={{ display: "block", fontSize: 13, color: "var(--text2)", marginTop: 3 }}>
                    {[forca > 0 && `${forca} ${forca === 1 ? "exercício" : "exercícios"}`, cardio > 0 && `${cardio} cardio`]
                      .filter(Boolean)
                      .join(" + ")}
                    {ultima ? ` · feito ${rotuloRelativo(ultima)?.toLowerCase() ?? `em ${dataCurta(ultima)}`}` : " · ainda não feito"}
                  </span>
                </span>
                <span style={{ color: destaque ? "var(--accent)" : "var(--text3)" }}>
                  <IconeDireita />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {vazias.length > 0 && (
        <p className="tr-note" style={{ marginTop: 16 }}>
          <span>
            {vazias.length === 1 ? `${vazias[0].nome} ainda não tem exercícios.` : `${vazias.length} fichas ainda não têm exercícios.`}{" "}
            <Link href="/fichas" style={{ color: "var(--accent)", fontWeight: 700 }}>
              Montar em Fichas
            </Link>
          </span>
        </p>
      )}

      {prontas.length > 0 && (
        <Link
          href="/fichas"
          className="tr-btn tr-btn-ghost tr-btn-block"
          style={{ textDecoration: "none", marginTop: 16, borderColor: "transparent", color: "var(--text2)" }}
        >
          Editar ou criar treinos em Fichas
        </Link>
      )}

      <p className="tr-note" style={{ marginTop: 24, justifyContent: "center", textAlign: "center" }}>
        <IconeCelular size={16} />
        <span>Cada treino feito fica salvo no Histórico, com a data, neste aparelho e navegador.</span>
      </p>
    </div>
  );
}

// ───────── execução de um treino ─────────

type Dialogo =
  | { tipo: "seletor" }
  | { tipo: "confirmar-conclusao"; faltam: number }
  | { tipo: "remover-exercicio"; item: ExercicioDoTreino }
  | { tipo: "descartar" }
  | { tipo: "tecnica"; item: ExercicioDoTreino }
  | null;

function ExecucaoTreino({
  chave,
  dados,
  erroAoSalvar,
  onVoltar,
}: {
  chave: string;
  dados: DadosTreinos;
  erroAoSalvar: boolean;
  onVoltar: () => void;
}) {
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const treino = dados.treinos[chave];

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  const anteriores = useMemo(() => {
    const m = new Map<string, ReturnType<typeof ultimoRegistro>>();
    treino.exercicios.forEach((e) => {
      if (!m.has(e.exercicioId)) m.set(e.exercicioId, ultimoRegistro(dados, e.exercicioId, chave));
    });
    return m;
  }, [dados, treino, chave]);

  const contagem = contarSeries(treino);
  const concluido = treino.status === "concluido";
  const relativo = rotuloRelativo(treino.data);
  const [nomeTreino, ...resto] = (treino.titulo ?? "Treino").split(" · ");
  const descricao = resto.join(" · ");
  const progresso = contagem.total > 0 ? contagem.feitas / contagem.total : 0;

  // modo de execução: guiado (um exercício por vez) ou lista; o app lembra a escolha
  const [modo, setModoEstado] = useState<"guiado" | "lista">(() => {
    try {
      return localStorage.getItem("freak_modo_treino") === "lista" ? "lista" : "guiado";
    } catch {
      return "guiado";
    }
  });
  const setModo = (m: "guiado" | "lista") => {
    setModoEstado(m);
    try {
      localStorage.setItem("freak_modo_treino", m);
    } catch {}
    window.scrollTo({ top: 0 });
  };
  const [resumo, setResumo] = useState(false);

  return (
    <div className="tr-page">
      <header className="tg-header">
        <div className="tg-header-linha">
          <button className="tr-icon-btn tr-icon-btn-sm" onClick={onVoltar} aria-label="Voltar para os treinos">
            <IconeEsquerda size={20} />
          </button>
          <div className="tg-header-titulo">
            <div className="tg-header-nome">{nomeTreino}</div>
            <div className="tg-header-sub">
              {descricao ? `${descricao} · ` : ""}
              {concluido ? "concluído" : `${contagem.feitas}/${contagem.total} séries`}
              {relativo ? "" : ` · ${dataCurta(treino.data)}`}
            </div>
          </div>
          <div className="tg-modo mini" role="group" aria-label="Modo do treino">
            <button aria-pressed={modo === "guiado"} onClick={() => setModo("guiado")}>
              Guiado
            </button>
            <button aria-pressed={modo === "lista"} onClick={() => setModo("lista")}>
              Lista
            </button>
          </div>
        </div>
        <div className="tg-progresso" role="progressbar" aria-label="Progresso do treino" aria-valuemin={0} aria-valuemax={contagem.total} aria-valuenow={contagem.feitas}>
          <span style={{ width: `${progresso * 100}%` }} />
        </div>
      </header>

      {erroAoSalvar && (
        <div className="tr-note" style={{ color: "var(--red)", marginTop: 12 }}>
          Não foi possível salvar no aparelho (armazenamento cheio ou bloqueado). Suas últimas alterações podem se perder.
        </div>
      )}

      {modo === "guiado" ? (
        <div style={{ paddingTop: 10 }}>
          {resumo || concluido ? (
            <Comemoracao
              treino={treino}
              onConcluir={() => {
                concluirTreino(chave);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onContinuar={() => setResumo(false)}
              onVoltar={onVoltar}
              onVerLista={() => setModo("lista")}
            />
          ) : (
            <TreinoGuiado
              chave={chave}
              treino={treino}
              anteriores={anteriores}
              onTecnica={(item) => setDialogo({ tipo: "tecnica", item })}
              onAdicionarExercicio={() => setDialogo({ tipo: "seletor" })}
              onDescartar={() => setDialogo({ tipo: "descartar" })}
              onFinalizar={() => {
                setResumo(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          )}
        </div>
      ) : (
      <div style={{ paddingTop: 10 }}>
        {concluido && (
          <div className="lc-banner" role="status">
            <IconeCheck size={16} /> Treino concluído · {contagem.feitas} de {contagem.total} séries
          </div>
        )}

        <ListaCompacta
          chave={chave}
          treino={treino}
          anteriores={anteriores}
          onTecnica={(item) => setDialogo({ tipo: "tecnica", item })}
          onRemover={(item) => {
            const temDados = item.series.some((s) => s.feita) || item.observacoes;
            if (temDados) setDialogo({ tipo: "remover-exercicio", item });
            else removerExercicio(chave, item.id);
          }}
        />

        <button className="tr-btn tr-btn-block" style={{ marginTop: 10, borderStyle: "dashed", minHeight: 44, fontSize: 15 }} onClick={() => setDialogo({ tipo: "seletor" })}>
          <IconeMais size={20} /> Adicionar exercício só hoje
        </button>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {concluido ? (
            <>
              <button className="tr-btn tr-btn-primary tr-btn-lg tr-btn-block" onClick={onVoltar}>
                Voltar para os treinos
              </button>
              <button className="tr-btn tr-btn-block" onClick={() => reabrirTreino(chave)}>
                Reabrir treino
              </button>
            </>
          ) : (
            <button
              className="tr-btn tr-btn-success tr-btn-lg tr-btn-block"
              onClick={() => {
                const faltam = contagem.total - contagem.feitas;
                if (faltam > 0) setDialogo({ tipo: "confirmar-conclusao", faltam });
                else {
                  concluirTreino(chave);
                  setAviso("Treino concluído e salvo no Histórico.");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <IconeCheck /> Concluir treino
            </button>
          )}
          <button
            className="tr-btn tr-btn-ghost tr-btn-block"
            style={{ color: "var(--red)", borderColor: "transparent" }}
            onClick={() => setDialogo({ tipo: "descartar" })}
          >
            Descartar este treino
          </button>
        </div>
      </div>
      )}



      {dialogo?.tipo === "seletor" && (
        <SeletorExercicios
          dados={dados}
          jaNoTreino={new Set(treino.exercicios.map((e) => e.exercicioId))}
          onFechar={() => setDialogo(null)}
          onAdicionar={(itens) => {
            adicionarExercicios(chave, itens);
            setDialogo(null);
          }}
        />
      )}

      {dialogo?.tipo === "tecnica" && (
        <SeletorTecnica
          nome={dialogo.item.nome}
          tipo={dialogo.item.tipo ?? "forca"}
          atual={dialogo.item.tecnica}
          onFechar={() => setDialogo(null)}
          onEscolher={(t) => {
            definirTecnicaTreino(chave, dialogo.item.id, t);
            setDialogo(null);
          }}
        />
      )}

      {dialogo?.tipo === "confirmar-conclusao" && (
        <Confirmacao
          titulo="Concluir treino?"
          texto={`${dialogo.faltam} ${dialogo.faltam === 1 ? "série não foi marcada" : "séries não foram marcadas"} como feita. ${dialogo.faltam === 1 ? "Ela fica registrada" : "Elas ficam registradas"} como planejada, mas não feita.`}
          confirmar="Concluir"
          onCancelar={() => setDialogo(null)}
          onConfirmar={() => {
            concluirTreino(chave);
            setDialogo(null);
            setAviso("Treino concluído e salvo no Histórico.");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {dialogo?.tipo === "remover-exercicio" && (
        <Confirmacao
          titulo="Remover exercício?"
          texto={`${dialogo.item.nome} e as séries registradas nele saem deste treino. A ficha não muda.`}
          confirmar="Remover"
          perigo
          onCancelar={() => setDialogo(null)}
          onConfirmar={() => {
            removerExercicio(chave, dialogo.item.id);
            setDialogo(null);
          }}
        />
      )}

      {dialogo?.tipo === "descartar" && (
        <Confirmacao
          titulo="Descartar treino?"
          texto="Tudo o que você registrou neste treino será apagado e ele sai do Histórico. A ficha continua igual."
          confirmar="Descartar"
          perigo
          onCancelar={() => setDialogo(null)}
          onConfirmar={() => {
            excluirTreino(chave);
            setDialogo(null);
            onVoltar();
          }}
        />
      )}

      {aviso && (
        <div className="tr-toast" role="status">
          <IconeCheck size={20} />
          <span style={{ flex: 1 }}>{aviso}</span>
        </div>
      )}
    </div>
  );
}
