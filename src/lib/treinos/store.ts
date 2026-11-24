"use client";

import { useSyncExternalStore } from "react";
import { CATALOGO_PADRAO, normalizar, tipoDoGrupo } from "./catalogo";
import { tecnicaPadrao, tecnicaPorId } from "./tecnicas";
import type {
  DadosTreinos,
  DiaPlano,
  ItemPlano,
  SeriePlano,
  TecnicaId,
  ExercicioCatalogo,
  ExercicioDoTreino,
  GrupoMuscular,
  Serie,
  TreinoDoDia,
} from "./types";

const CHAVE = "freakseason_treinos_v1";
const SERIES_INICIAIS = 3;

type Estado = { dados: DadosTreinos; erroAoSalvar: boolean };

let estado: Estado | null = null;
const ouvintes = new Set<() => void>();

function novoId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function agora() {
  return new Date().toISOString();
}

function vazio(): DadosTreinos {
  return { versao: 1, catalogo: [], treinos: {}, plano: {} };
}

function ler(): DadosTreinos {
  try {
    const raw = localStorage.getItem(CHAVE);
    if (!raw) return vazio();
    const p = JSON.parse(raw) as Partial<DadosTreinos>;
    return {
      versao: 1,
      catalogo: Array.isArray(p.catalogo) ? p.catalogo : [],
      treinos: p.treinos && typeof p.treinos === "object" ? p.treinos : {},
      plano: p.plano && typeof p.plano === "object" ? p.plano : {},
    };
  } catch {
    return vazio();
  }
}

function garantirEstado(): Estado {
  if (!estado) estado = { dados: ler(), erroAoSalvar: false };
  return estado;
}

function emitir() {
  ouvintes.forEach((f) => f());
}

function gravar(dados: DadosTreinos) {
  let erroAoSalvar = false;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
  } catch {
    erroAoSalvar = true;
  }
  estado = { dados, erroAoSalvar };
  emitir();
}

function subscribe(f: () => void) {
  ouvintes.add(f);
  const aoMudarEmOutraAba = (e: StorageEvent) => {
    if (e.key === CHAVE) {
      estado = { dados: ler(), erroAoSalvar: false };
      emitir();
    }
  };
  window.addEventListener("storage", aoMudarEmOutraAba);
  return () => {
    ouvintes.delete(f);
    window.removeEventListener("storage", aoMudarEmOutraAba);
  };
}

/** Retorna null durante a renderização no servidor / antes da hidratação. */
export function useTreinos(): Estado | null {
  return useSyncExternalStore(subscribe, garantirEstado, () => null);
}

// ───────── helpers ─────────

function serieVazia(base?: Partial<Serie>): Serie {
  return { id: novoId(), carga: base?.carga ?? "", reps: base?.reps ?? "", feita: false };
}

function alterarTreino(data: string, fn: (t: TreinoDoDia) => TreinoDoDia | null) {
  const { dados } = garantirEstado();
  const atual = dados.treinos[data];
  if (!atual) return;
  const novo = fn(atual);
  const treinos = { ...dados.treinos };
  if (!novo || novo.exercicios.length === 0) {
    // Dia sem exercícios volta a ficar vazio (some do calendário e do histórico).
    delete treinos[data];
  } else {
    treinos[data] = { ...novo, atualizadoEm: agora() };
  }
  gravar({ ...dados, treinos });
}

function alterarExercicio(
  data: string,
  itemId: string,
  fn: (e: ExercicioDoTreino) => ExercicioDoTreino
) {
  alterarTreino(data, (t) => ({
    ...t,
    exercicios: t.exercicios.map((e) => (e.id === itemId ? fn(e) : e)),
  }));
}

// ───────── catálogo ─────────

export function catalogoCompleto(dados: DadosTreinos): ExercicioCatalogo[] {
  return [...CATALOGO_PADRAO, ...dados.catalogo].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function cadastrarExercicio(nome: string, grupo: GrupoMuscular): ExercicioCatalogo {
  const { dados } = garantirEstado();
  const limpo = nome.trim().replace(/\s+/g, " ");
  const existente = catalogoCompleto(dados).find((e) => normalizar(e.nome) === normalizar(limpo));
  if (existente) return existente;
  const novo: ExercicioCatalogo = { id: "custom-" + novoId(), nome: limpo, grupo, personalizado: true };
  gravar({ ...dados, catalogo: [...dados.catalogo, novo] });
  return novo;
}

export function excluirExercicioPersonalizado(id: string) {
  const { dados } = garantirEstado();
  gravar({ ...dados, catalogo: dados.catalogo.filter((e) => e.id !== id) });
}

// ───────── consultas ─────────

/** Séries do registro mais recente desse exercício antes da data (para sugestão). */
export function ultimoRegistro(
  dados: DadosTreinos,
  exercicioId: string,
  antesDe: string
): { data: string; series: Serie[] } | null {
  const datas = Object.keys(dados.treinos)
    .filter((d) => d < antesDe)
    .sort()
    .reverse();
  for (const d of datas) {
    const ex = dados.treinos[d].exercicios.find((e) => e.exercicioId === exercicioId);
    if (ex && ex.series.some((s) => s.carga || s.reps)) return { data: d, series: ex.series };
  }
  return null;
}

export function contarSeries(t: TreinoDoDia) {
  let feitas = 0;
  let total = 0;
  t.exercicios.forEach((e) =>
    e.series.forEach((s) => {
      total++;
      if (s.feita) feitas++;
    })
  );
  return { feitas, total };
}

// ───────── edição do dia ─────────

export function adicionarExercicios(data: string, itens: ExercicioCatalogo[]) {
  if (itens.length === 0) return;
  const { dados } = garantirEstado();
  const existente = dados.treinos[data];
  const novos: ExercicioDoTreino[] = itens.map((c) => {
    const tipo = tipoDoGrupo(c.grupo);
    return {
      id: novoId(),
      exercicioId: c.id,
      nome: c.nome,
      grupo: c.grupo,
      tipo,
      tecnica: tecnicaPadrao(tipo),
      observacoes: "",
      series: Array.from({ length: tipo === "cardio" ? 1 : SERIES_INICIAIS }, () => serieVazia()),
    };
  });
  const ts = agora();
  const treino: TreinoDoDia = existente
    ? { ...existente, exercicios: [...existente.exercicios, ...novos], atualizadoEm: ts }
    : { data, status: "em_andamento", exercicios: novos, criadoEm: ts, atualizadoEm: ts };
  gravar({ ...dados, treinos: { ...dados.treinos, [data]: treino } });
}

export function removerExercicio(data: string, itemId: string) {
  alterarTreino(data, (t) => ({ ...t, exercicios: t.exercicios.filter((e) => e.id !== itemId) }));
}

export function moverExercicio(data: string, itemId: string, direcao: -1 | 1) {
  alterarTreino(data, (t) => {
    const lista = [...t.exercicios];
    const i = lista.findIndex((e) => e.id === itemId);
    const j = i + direcao;
    if (i < 0 || j < 0 || j >= lista.length) return t;
    [lista[i], lista[j]] = [lista[j], lista[i]];
    return { ...t, exercicios: lista };
  });
}

export function atualizarSerie(data: string, itemId: string, serieId: string, patch: Partial<Omit<Serie, "id">>) {
  alterarExercicio(data, itemId, (e) => ({
    ...e,
    series: e.series.map((s) => (s.id === serieId ? { ...s, ...patch } : s)),
  }));
}

export function adicionarSerie(data: string, itemId: string) {
  alterarExercicio(data, itemId, (e) => {
    const ultima = e.series[e.series.length - 1];
    return { ...e, series: [...e.series, serieVazia(ultima && { carga: ultima.carga, reps: ultima.reps })] };
  });
}

export function removerSerie(data: string, itemId: string, serieId: string) {
  alterarExercicio(data, itemId, (e) => ({ ...e, series: e.series.filter((s) => s.id !== serieId) }));
}

export function atualizarObservacoes(data: string, itemId: string, observacoes: string) {
  alterarExercicio(data, itemId, (e) => ({ ...e, observacoes }));
}

export function concluirTreino(data: string) {
  alterarTreino(data, (t) => ({ ...t, status: "concluido", concluidoEm: agora() }));
}

export function reabrirTreino(data: string) {
  alterarTreino(data, (t) => ({ ...t, status: "em_andamento", concluidoEm: undefined }));
}

export function excluirTreino(data: string) {
  alterarTreino(data, () => null);
}

/**
 * Copia exercícios, séries e cargas de uma data para outra.
 * Gera ids novos e desmarca todas as séries, então a cópia é independente.
 */
export function copiarTreino(origem: string, destino: string) {
  const { dados } = garantirEstado();
  const fonte = dados.treinos[origem];
  if (!fonte || origem === destino) return;
  const ts = agora();
  const copia: TreinoDoDia = {
    data: destino,
    status: "em_andamento",
    criadoEm: ts,
    atualizadoEm: ts,
    copiadoDe: origem,
    titulo: fonte.titulo,
    exercicios: fonte.exercicios.map((e) => ({
      id: novoId(),
      exercicioId: e.exercicioId,
      nome: e.nome,
      grupo: e.grupo,
      tipo: e.tipo,
      tecnica: e.tecnica,
      observacoes: "",
      series: e.series.map((s) => serieVazia({ carga: s.carga, reps: s.reps })),
    })),
  };
  gravar({ ...dados, treinos: { ...dados.treinos, [destino]: copia } });
}

export function definirTecnicaTreino(data: string, itemId: string, tecnica: TecnicaId) {
  alterarExercicio(data, itemId, (e) => ({ ...e, tecnica }));
}

// ───────── plano semanal ─────────

function alterarDiaPlano(dia: number, fn: (d: DiaPlano) => DiaPlano) {
  const { dados } = garantirEstado();
  const atual = dados.plano[dia] ?? { titulo: "", itens: [] };
  gravar({ ...dados, plano: { ...dados.plano, [dia]: fn(atual) } });
}

function alterarItemPlano(dia: number, itemId: string, fn: (i: ItemPlano) => ItemPlano) {
  alterarDiaPlano(dia, (d) => ({ ...d, itens: d.itens.map((i) => (i.id === itemId ? fn(i) : i)) }));
}

function seriesDoModelo(tecnica: TecnicaId, atuais: SeriePlano[] = []): SeriePlano[] {
  const t = tecnicaPorId(tecnica);
  if (!t) return atuais;
  return t.modelo.map((m, i) => ({
    id: novoId(),
    // em força mantém a carga que já estava planejada naquela posição
    carga: m.carga ?? atuais[i]?.carga ?? atuais[atuais.length - 1]?.carga ?? "",
    reps: m.reps,
  }));
}

export function definirTituloPlano(dia: number, titulo: string) {
  alterarDiaPlano(dia, (d) => ({ ...d, titulo }));
}

export function adicionarItensPlano(dia: number, itens: ExercicioCatalogo[]) {
  if (itens.length === 0) return;
  alterarDiaPlano(dia, (d) => ({
    ...d,
    itens: [
      ...d.itens,
      ...itens.map((c) => {
        const tipo = tipoDoGrupo(c.grupo);
        const tecnica = tecnicaPadrao(tipo);
        return {
          id: novoId(),
          exercicioId: c.id,
          nome: c.nome,
          grupo: c.grupo,
          tipo,
          tecnica,
          observacoes: "",
          series: seriesDoModelo(tecnica),
        };
      }),
    ],
  }));
}

export function removerItemPlano(dia: number, itemId: string) {
  alterarDiaPlano(dia, (d) => ({ ...d, itens: d.itens.filter((i) => i.id !== itemId) }));
}

export function moverItemPlano(dia: number, itemId: string, direcao: -1 | 1) {
  alterarDiaPlano(dia, (d) => {
    const lista = [...d.itens];
    const i = lista.findIndex((e) => e.id === itemId);
    const j = i + direcao;
    if (i < 0 || j < 0 || j >= lista.length) return d;
    [lista[i], lista[j]] = [lista[j], lista[i]];
    return { ...d, itens: lista };
  });
}

/** Troca a técnica e ajusta as séries para o modelo dela (mantendo as cargas). */
export function definirTecnicaPlano(dia: number, itemId: string, tecnica: TecnicaId) {
  alterarItemPlano(dia, itemId, (i) => ({ ...i, tecnica, series: seriesDoModelo(tecnica, i.series) }));
}

export function atualizarSeriePlano(dia: number, itemId: string, serieId: string, patch: Partial<Omit<SeriePlano, "id">>) {
  alterarItemPlano(dia, itemId, (i) => ({
    ...i,
    series: i.series.map((s) => (s.id === serieId ? { ...s, ...patch } : s)),
  }));
}

export function adicionarSeriePlano(dia: number, itemId: string) {
  alterarItemPlano(dia, itemId, (i) => {
    const u = i.series[i.series.length - 1];
    return { ...i, series: [...i.series, { id: novoId(), carga: u?.carga ?? "", reps: u?.reps ?? "" }] };
  });
}

export function removerSeriePlano(dia: number, itemId: string) {
  alterarItemPlano(dia, itemId, (i) => (i.series.length <= 1 ? i : { ...i, series: i.series.slice(0, -1) }));
}

export function atualizarObservacoesPlano(dia: number, itemId: string, observacoes: string) {
  alterarItemPlano(dia, itemId, (i) => ({ ...i, observacoes }));
}

export function limparDiaPlano(dia: number) {
  const { dados } = garantirEstado();
  const plano = { ...dados.plano };
  delete plano[dia];
  gravar({ ...dados, plano });
}

/** Copia o plano de um dia da semana para outro (substitui o destino). */
export function copiarDiaPlano(origem: number, destino: number) {
  const { dados } = garantirEstado();
  const fonte = dados.plano[origem];
  if (!fonte || origem === destino) return;
  const copia: DiaPlano = {
    titulo: fonte.titulo,
    itens: fonte.itens.map((i) => ({ ...i, id: novoId(), series: i.series.map((s) => ({ ...s, id: novoId() })) })),
  };
  gravar({ ...dados, plano: { ...dados.plano, [destino]: copia } });
}

/** Monta o treino de uma data a partir do plano do dia da semana. Séries vêm desmarcadas. */
export function aplicarPlanoNoDia(data: string, dia: number) {
  const { dados } = garantirEstado();
  const plano = dados.plano[dia];
  if (!plano || plano.itens.length === 0) return;
  const ts = agora();
  const treino: TreinoDoDia = {
    data,
    status: "em_andamento",
    criadoEm: ts,
    atualizadoEm: ts,
    planoDe: dia,
    titulo: plano.titulo.trim() || undefined,
    exercicios: plano.itens.map((i) => ({
      id: novoId(),
      exercicioId: i.exercicioId,
      nome: i.nome,
      grupo: i.grupo,
      tipo: i.tipo,
      tecnica: i.tecnica,
      observacoes: i.observacoes,
      series: i.series.map((s) => serieVazia({ carga: s.carga, reps: s.reps })),
    })),
  };
  gravar({ ...dados, treinos: { ...dados.treinos, [data]: treino } });
}
