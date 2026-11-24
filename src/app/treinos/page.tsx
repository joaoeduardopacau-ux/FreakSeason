"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  adicionarExercicios,
  concluirTreino,
  contarSeries,
  copiarTreino,
  excluirTreino,
  reabrirTreino,
  removerExercicio,
  ultimoRegistro,
  useTreinos,
} from "@/lib/treinos/store";
import {
  chaveValida,
  dataCurta,
  dataPorExtenso,
  diaDaSemana,
  hojeChave,
  rotuloRelativo,
  somarDias,
} from "@/lib/treinos/datas";
import type { ExercicioDoTreino } from "@/lib/treinos/types";
import { Calendario } from "@/components/treinos/Calendario";
import { SeletorExercicios } from "@/components/treinos/SeletorExercicios";
import { CartaoExercicio } from "@/components/treinos/CartaoExercicio";
import { Confirmacao } from "@/components/treinos/Sheet";
import {
  IconeCalendario,
  IconeCelular,
  IconeCheck,
  IconeCopiar,
  IconeDireita,
  IconeEsquerda,
  IconeHalter,
  IconeMais,
} from "@/components/treinos/Icones";

type Dialogo =
  | { tipo: "calendario" }
  | { tipo: "seletor" }
  | { tipo: "copiar" }
  | { tipo: "confirmar-copia"; destino: string }
  | { tipo: "confirmar-conclusao"; faltam: number }
  | { tipo: "remover-exercicio"; item: ExercicioDoTreino }
  | { tipo: "excluir-treino" }
  | null;

export default function Page() {
  return (
    <Suspense fallback={<Carregando />}>
      <TreinosDoDia />
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

function TreinosDoDia() {
  const estado = useTreinos();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [aviso, setAviso] = useState<{ texto: string; data?: string } | null>(null);

  const paramData = params.get("data");
  // Sem ?data= na URL, mostra hoje (fuso local do aparelho). A tela só é
  // desenhada depois de ler o armazenamento, então isso roda no navegador.
  const data = chaveValida(paramData) ? paramData : hojeChave();

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 5000);
    return () => clearTimeout(t);
  }, [aviso]);

  const dados = estado?.dados;
  const treino = data && dados ? dados.treinos[data] : undefined;

  const anteriores = useMemo(() => {
    const m = new Map<string, ReturnType<typeof ultimoRegistro>>();
    if (!dados || !treino) return m;
    treino.exercicios.forEach((e) => {
      if (!m.has(e.exercicioId)) m.set(e.exercicioId, ultimoRegistro(dados, e.exercicioId, data));
    });
    return m;
  }, [dados, treino, data]);

  if (!estado || !dados) return <Carregando />;

  function irPara(nova: string) {
    setDialogo(null);
    router.replace(nova === hojeChave() ? pathname : `${pathname}?data=${nova}`, { scroll: false });
    window.scrollTo({ top: 0 });
  }

  function fazerCopia(destino: string) {
    copiarTreino(data, destino);
    setDialogo(null);
    setAviso({ texto: `Treino copiado para ${diaDaSemana(destino).split("-")[0].toLowerCase()}, ${dataCurta(destino)}.`, data: destino });
  }

  const relativo = rotuloRelativo(data);
  const contagem = treino ? contarSeries(treino) : { feitas: 0, total: 0 };
  const concluido = treino?.status === "concluido";

  return (
    <div className="tr-page">
      {/* ── Dia ── */}
      <header className="tr-day">
        <div className="tr-day-row">
          <button className="tr-icon-btn" onClick={() => irPara(somarDias(data, -1))} aria-label="Dia anterior">
            <IconeEsquerda />
          </button>
          <button className="tr-day-center" onClick={() => setDialogo({ tipo: "calendario" })} aria-label="Abrir calendário">
            <div className="tr-day-weekday">{diaDaSemana(data)}</div>
            <div className="tr-day-date">
              <IconeCalendario size={15} />
              {dataPorExtenso(data)}
            </div>
          </button>
          <button className="tr-icon-btn" onClick={() => irPara(somarDias(data, 1))} aria-label="Próximo dia">
            <IconeDireita />
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8, minHeight: 24 }}>
          {relativo && <span className="tr-pill tr-pill-muted">{relativo}</span>}
          {treino &&
            (concluido ? (
              <span className="tr-pill tr-pill-green">
                <IconeCheck size={13} /> Concluído
              </span>
            ) : (
              <span className="tr-pill">Em andamento</span>
            ))}
          {treino && (
            <span className="tr-pill tr-pill-muted">
              {contagem.feitas}/{contagem.total} séries
            </span>
          )}
          {!relativo && (
            <button className="tr-pill tr-pill-muted" style={{ cursor: "pointer" }} onClick={() => irPara(hojeChave())}>
              Voltar para hoje
            </button>
          )}
        </div>
      </header>

      {estado.erroAoSalvar && (
        <div className="tr-note" style={{ color: "var(--red)", marginTop: 12 }}>
          Não foi possível salvar no aparelho (armazenamento cheio ou bloqueado). Suas últimas alterações podem se perder.
        </div>
      )}

      {/* ── Conteúdo ── */}
      {!treino ? (
        <div style={{ textAlign: "center", padding: "44px 8px 24px" }}>
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
          <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Nenhum treino neste dia</p>
          <p style={{ fontSize: 15, color: "var(--text2)", marginBottom: 24 }}>
            Escolha os exercícios que você vai fazer.
          </p>
          <button className="tr-btn tr-btn-primary tr-btn-lg tr-btn-block" onClick={() => setDialogo({ tipo: "seletor" })}>
            <IconeMais /> Adicionar exercícios
          </button>
        </div>
      ) : (
        <div style={{ paddingTop: 14 }}>
          {concluido && (
            <div
              className="tr-note"
              style={{
                background: "var(--green-dim)",
                color: "var(--green)",
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 12,
                fontWeight: 600,
              }}
            >
              <IconeCheck size={18} />
              <span>
                Treino concluído: {contagem.feitas} de {contagem.total} séries feitas. Você ainda pode ajustar os valores.
              </span>
            </div>
          )}

          {treino.copiadoDe && (
            <p className="tr-note" style={{ marginBottom: 12 }}>
              <IconeCopiar size={16} />
              <span>
                Copiado de {dataCurta(treino.copiadoDe)}. As alterações aqui não mudam o treino original.
              </span>
            </p>
          )}

          {treino.exercicios.map((item, i) => (
            <CartaoExercicio
              key={item.id}
              data={data}
              item={item}
              indice={i}
              total={treino.exercicios.length}
              anterior={anteriores.get(item.exercicioId) ?? null}
              onRemover={() => {
                const temDados = item.series.some((s) => s.feita || s.carga || s.reps) || item.observacoes;
                if (temDados) setDialogo({ tipo: "remover-exercicio", item });
                else removerExercicio(data, item.id);
              }}
            />
          ))}

          <button
            className="tr-btn tr-btn-block"
            style={{ marginTop: 12, borderStyle: "dashed" }}
            onClick={() => setDialogo({ tipo: "seletor" })}
          >
            <IconeMais size={20} /> Adicionar exercícios
          </button>

          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            {concluido ? (
              <button className="tr-btn tr-btn-block" onClick={() => reabrirTreino(data)}>
                Reabrir treino
              </button>
            ) : (
              <button
                className="tr-btn tr-btn-success tr-btn-lg tr-btn-block"
                onClick={() => {
                  const faltam = contagem.total - contagem.feitas;
                  if (faltam > 0) setDialogo({ tipo: "confirmar-conclusao", faltam });
                  else concluirTreino(data);
                }}
              >
                <IconeCheck /> Concluir treino
              </button>
            )}
            <button className="tr-btn tr-btn-block" onClick={() => setDialogo({ tipo: "copiar" })}>
              <IconeCopiar size={20} /> Copiar treino para outra data
            </button>
            <button
              className="tr-btn tr-btn-ghost tr-btn-block"
              style={{ color: "var(--red)", borderColor: "transparent" }}
              onClick={() => setDialogo({ tipo: "excluir-treino" })}
            >
              Excluir treino deste dia
            </button>
          </div>
        </div>
      )}

      <p className="tr-note" style={{ marginTop: 28, justifyContent: "center", textAlign: "center" }}>
        <IconeCelular size={16} />
        <span>Salvo automaticamente. Seus treinos ficam guardados apenas neste aparelho e navegador.</span>
      </p>

      {/* ── Diálogos ── */}
      {dialogo?.tipo === "calendario" && (
        <Calendario
          titulo="Escolher dia"
          selecionada={data}
          treinos={dados.treinos}
          onEscolher={irPara}
          onFechar={() => setDialogo(null)}
        />
      )}

      {dialogo?.tipo === "seletor" && (
        <SeletorExercicios
          dados={dados}
          jaNoTreino={new Set(treino?.exercicios.map((e) => e.exercicioId) ?? [])}
          onFechar={() => setDialogo(null)}
          onAdicionar={(itens) => {
            adicionarExercicios(data, itens);
            setDialogo(null);
          }}
        />
      )}

      {dialogo?.tipo === "copiar" && (
        <Calendario
          titulo="Copiar para qual data?"
          selecionada={data}
          desabilitada={data}
          treinos={dados.treinos}
          aviso={
            <p className="tr-note" style={{ marginBottom: 14 }}>
              Copia exercícios, séries e cargas de {dataCurta(data)} com todas as séries desmarcadas.
            </p>
          }
          onEscolher={(destino) => {
            if (dados.treinos[destino]) setDialogo({ tipo: "confirmar-copia", destino });
            else fazerCopia(destino);
          }}
          onFechar={() => setDialogo(null)}
        />
      )}

      {dialogo?.tipo === "confirmar-copia" && (() => {
        const alvo = dados.treinos[dialogo.destino];
        const c = contarSeries(alvo);
        return (
          <Confirmacao
            titulo="Substituir treino?"
            texto={
              <>
                {diaDaSemana(dialogo.destino)}, {dataCurta(dialogo.destino)} já tem um treino{" "}
                {alvo.status === "concluido" ? "concluído" : "em andamento"} com {alvo.exercicios.length}{" "}
                {alvo.exercicios.length === 1 ? "exercício" : "exercícios"} e {c.feitas} de {c.total} séries feitas.
                Ele será substituído pela cópia.
              </>
            }
            confirmar="Substituir"
            perigo
            onCancelar={() => setDialogo({ tipo: "copiar" })}
            onConfirmar={() => fazerCopia(dialogo.destino)}
          />
        );
      })()}

      {dialogo?.tipo === "confirmar-conclusao" && (
        <Confirmacao
          titulo="Concluir treino?"
          texto={`${dialogo.faltam} ${dialogo.faltam === 1 ? "série não foi marcada" : "séries não foram marcadas"} como feita. ${dialogo.faltam === 1 ? "Ela fica registrada" : "Elas ficam registradas"} como planejada, mas não feita.`}
          confirmar="Concluir"
          onCancelar={() => setDialogo(null)}
          onConfirmar={() => {
            concluirTreino(data);
            setDialogo(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {dialogo?.tipo === "remover-exercicio" && (
        <Confirmacao
          titulo="Remover exercício?"
          texto={`${dialogo.item.nome} e as séries registradas nele serão removidos deste dia.`}
          confirmar="Remover"
          perigo
          onCancelar={() => setDialogo(null)}
          onConfirmar={() => {
            removerExercicio(data, dialogo.item.id);
            setDialogo(null);
          }}
        />
      )}

      {dialogo?.tipo === "excluir-treino" && (
        <Confirmacao
          titulo="Excluir treino?"
          texto={`Todos os exercícios e séries de ${dataCurta(data)} serão apagados. Os outros dias não são afetados.`}
          confirmar="Excluir"
          perigo
          onCancelar={() => setDialogo(null)}
          onConfirmar={() => {
            excluirTreino(data);
            setDialogo(null);
          }}
        />
      )}

      {aviso && (
        <div className="tr-toast" role="status">
          <IconeCheck size={20} />
          <span style={{ flex: 1 }}>{aviso.texto}</span>
          {aviso.data && (
            <button
              className="tr-btn tr-btn-primary"
              style={{ minHeight: 40, padding: "0 14px", fontSize: 15 }}
              onClick={() => {
                irPara(aviso.data!);
                setAviso(null);
              }}
            >
              Ver
            </button>
          )}
        </div>
      )}
    </div>
  );
}
