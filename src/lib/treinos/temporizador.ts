"use client";

import { useSyncExternalStore } from "react";

/**
 * Temporizador global (descanso entre séries e intervalos de cardio).
 * Guarda horários absolutos, então continua certo mesmo se o app for para
 * segundo plano; o estado fica salvo no aparelho para sobreviver a recargas.
 */

export type EstadoTemporizador =
  | null
  | { tipo: "descanso"; rotulo: string; total: number; fim: number; criadoEm: number; terminouEm?: number }
  | {
      tipo: "intervalo";
      rotulo: string;
      trabalho: number;
      pausa: number;
      rodadas: number;
      inicio: number; // horário em que começou (ajustado ao retomar)
      criadoEm: number; // última ação do usuário (referência mínima de "agora")
      pausadoEm?: number; // pausado pelo usuário
      terminouEm?: number;
    };

const CHAVE = "freak_temporizador";
const CHAVE_SOM = "freak_temporizador_som";

let estado: EstadoTemporizador = null;
let carregado = false;
let som = true;
const ouvintes = new Set<() => void>();

function carregar() {
  if (carregado || typeof window === "undefined") return;
  carregado = true;
  try {
    const raw = localStorage.getItem(CHAVE);
    if (raw) estado = JSON.parse(raw);
    som = localStorage.getItem(CHAVE_SOM) !== "0";
  } catch {}
}

function salvar() {
  try {
    if (estado) localStorage.setItem(CHAVE, JSON.stringify(estado));
    else localStorage.removeItem(CHAVE);
  } catch {}
}

function mudar(novo: EstadoTemporizador) {
  estado = novo;
  salvar();
  ouvintes.forEach((f) => f());
}

function subscribe(f: () => void) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

export function useTemporizador(): EstadoTemporizador {
  return useSyncExternalStore(
    subscribe,
    () => {
      carregar();
      return estado;
    },
    () => null
  );
}

export function useSomLigado(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => {
      carregar();
      return som;
    },
    () => true
  );
}

export function alternarSom() {
  som = !som;
  try {
    localStorage.setItem(CHAVE_SOM, som ? "1" : "0");
  } catch {}
  ouvintes.forEach((f) => f());
  if (som) desbloquearAudio();
}

// ───────── som ─────────

let audio: AudioContext | null = null;

/** Precisa ser chamado dentro de um toque do usuário (exigência do iPhone). */
export function desbloquearAudio() {
  try {
    if (!audio) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      audio = new AC();
    }
    if (audio.state === "suspended") void audio.resume();
    // toque mudo para liberar o áudio no iOS
    const o = audio.createOscillator();
    const g = audio.createGain();
    g.gain.value = 0;
    o.connect(g).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.01);
  } catch {}
}

export function bipe(freq = 880, duracao = 0.12, volume = 0.25) {
  carregar();
  if (!som || !audio) return;
  try {
    const t = audio.currentTime;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(volume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duracao);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t + duracao + 0.02);
  } catch {}
}

export function vibrar(padrao: number | number[]) {
  try {
    navigator.vibrate?.(padrao);
  } catch {}
}

// ───────── ações ─────────

export function iniciarDescanso(segundos: number, rotulo: string) {
  desbloquearAudio();
  const agora = Date.now();
  mudar({ tipo: "descanso", rotulo, total: segundos, fim: agora + segundos * 1000, criadoEm: agora });
}

export function ajustarDescanso(delta: number) {
  if (!estado || estado.tipo !== "descanso" || estado.terminouEm) return;
  const fim = Math.max(Date.now() + 1000, estado.fim + delta * 1000);
  mudar({ ...estado, fim, total: Math.max(1, estado.total + delta), criadoEm: Date.now() });
}

export function iniciarIntervalos(trabalho: number, pausa: number, rodadas: number, rotulo: string) {
  desbloquearAudio();
  // 5 s de preparação antes da primeira rodada
  const agora = Date.now();
  mudar({ tipo: "intervalo", rotulo, trabalho, pausa, rodadas, inicio: agora + 5000, criadoEm: agora });
}

export function pausarOuContinuar() {
  if (!estado || estado.tipo !== "intervalo" || estado.terminouEm) return;
  desbloquearAudio();
  if (estado.pausadoEm) {
    const { pausadoEm, ...resto } = estado;
    mudar({ ...resto, inicio: estado.inicio + (Date.now() - pausadoEm), criadoEm: Date.now() });
  } else {
    mudar({ ...estado, pausadoEm: Date.now(), criadoEm: Date.now() });
  }
}

export function marcarTermino() {
  if (estado && !estado.terminouEm) mudar({ ...estado, terminouEm: Date.now() });
}

export function pararTemporizador() {
  mudar(null);
}

// ───────── cálculo da fase ─────────

export type Fase = "preparar" | "trabalho" | "pausa" | "fim";

export interface Situacao {
  fase: Fase;
  restante: number; // segundos até o fim da fase
  duracaoFase: number;
  rodada: number; // 1..rodadas
}

/** Situação atual de um temporizador de intervalos. */
export function situacaoIntervalo(e: Extract<NonNullable<EstadoTemporizador>, { tipo: "intervalo" }>, agora: number): Situacao {
  const t = ((e.pausadoEm ?? agora) - e.inicio) / 1000;
  if (t < 0) return { fase: "preparar", restante: -t, duracaoFase: 5, rodada: 1 };
  const ciclo = e.trabalho + e.pausa;
  const total = e.rodadas * ciclo - e.pausa; // sem pausa depois da última rodada
  if (t >= total) return { fase: "fim", restante: 0, duracaoFase: 1, rodada: e.rodadas };
  const rodada = Math.floor(t / ciclo) + 1;
  const dentro = t - (rodada - 1) * ciclo;
  if (dentro < e.trabalho) return { fase: "trabalho", restante: e.trabalho - dentro, duracaoFase: e.trabalho, rodada };
  return { fase: "pausa", restante: ciclo - dentro, duracaoFase: e.pausa, rodada };
}
