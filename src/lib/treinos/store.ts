"use client";

import { useSyncExternalStore } from "react";
import { CATALOGO_PADRAO, normalizar } from "./catalogo";
import type {
  DadosTreinos,
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
  return { versao: 1, catalogo: [], treinos: {} };
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
  const novos: ExercicioDoTreino[] = itens.map((c) => ({
    id: novoId(),
    exercicioId: c.id,
    nome: c.nome,
    grupo: c.grupo,
    observacoes: "",
    series: Array.from({ length: SERIES_INICIAIS }, () => serieVazia()),
  }));
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
    exercicios: fonte.exercicios.map((e) => ({
      id: novoId(),
      exercicioId: e.exercicioId,
      nome: e.nome,
      grupo: e.grupo,
      observacoes: "",
      series: e.series.map((s) => serieVazia({ carga: s.carga, reps: s.reps })),
    })),
  };
  gravar({ ...dados, treinos: { ...dados.treinos, [destino]: copia } });
}
