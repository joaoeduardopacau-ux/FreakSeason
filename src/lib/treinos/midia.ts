"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Onde estão os GIFs e as miniaturas.
 *
 * - "arquivos" (padrão, app Next e arquivo único do repositório): um arquivo por
 *   exercício em <base><id>.gif e <base>thumbs/<id>.jpg.
 * - "pacotes" (página publicada, que aceita poucos arquivos): os GIFs ficam
 *   agrupados em pacotes de ~1 MB (arquivos .gif concatenados) e as miniaturas em arquivos JSON;
 *   um índice diz onde está cada um. Só o pacote necessário é baixado.
 */
const MODO = process.env.NEXT_PUBLIC_GIF_MODE === "pacotes" ? "pacotes" : "arquivos";
export const BASE_MIDIA = process.env.NEXT_PUBLIC_GIF_BASE || "/gifs/";

export type TipoMidia = "gif" | "thumb";

interface Indice {
  gifs: Record<string, [number, number, number]>; // id -> [pacote, início, tamanho]
  thumbs: Record<string, number>; // id -> arquivo de miniaturas
}

const cache = new Map<string, string | null>(); // chave "tipo:id" -> URL (null = falhou)
const ouvintes = new Set<() => void>();
const emAndamento = new Map<string, Promise<void>>();

let indice: Promise<Indice> | null = null;
const pacotesThumb = new Map<number, Promise<Record<string, string>>>();
const pacotesGif = new Map<number, Promise<ArrayBuffer>>();

function emitir() {
  ouvintes.forEach((f) => f());
}

function lerIndice() {
  if (!indice) indice = fetch(`${BASE_MIDIA}indice.json`).then((r) => r.json());
  return indice;
}

function paraDataUrl(blob: Blob): Promise<string> {
  return new Promise((ok, erro) => {
    const r = new FileReader();
    r.onload = () => ok(r.result as string);
    r.onerror = () => erro(r.error);
    r.readAsDataURL(blob);
  });
}

async function carregarPacote(tipo: TipoMidia, id: string): Promise<string> {
  const ind = await lerIndice();
  if (tipo === "thumb") {
    const n = ind.thumbs[id];
    if (n === undefined) throw new Error("sem miniatura");
    if (!pacotesThumb.has(n)) pacotesThumb.set(n, fetch(`${BASE_MIDIA}thumbs-${n}.json`).then((r) => r.json()));
    const mapa = await pacotesThumb.get(n)!;
    return mapa[id];
  }
  const pos = ind.gifs[id];
  if (!pos) throw new Error("sem gif");
  const [n, ini, tam] = pos;
  if (!pacotesGif.has(n)) pacotesGif.set(n, fetch(`${BASE_MIDIA}pacote-${n}.gif`).then((r) => r.arrayBuffer()));
  const buf = await pacotesGif.get(n)!;
  return paraDataUrl(new Blob([buf.slice(ini, ini + tam)], { type: "image/gif" }));
}

function urlDireta(tipo: TipoMidia, id: string) {
  return tipo === "gif" ? `${BASE_MIDIA}${id}.gif` : `${BASE_MIDIA}thumbs/${id}.jpg`;
}

function pedir(tipo: TipoMidia, id: string) {
  const chave = `${tipo}:${id}`;
  if (cache.has(chave) || emAndamento.has(chave)) return;
  const p = carregarPacote(tipo, id)
    .then((url) => {
      cache.set(chave, url);
    })
    .catch(() => {
      cache.set(chave, null);
    })
    .finally(() => {
      emAndamento.delete(chave);
      emitir();
    });
  emAndamento.set(chave, p);
}

function subscribe(f: () => void) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

/**
 * URL da mídia do exercício. Retorna undefined enquanto carrega e null se não existir.
 * Com `ativo = false` não baixa nada (usado para adiar miniaturas fora da tela).
 */
export function useMidia(tipo: TipoMidia, gifId: string | null, ativo = true): string | null | undefined {
  const chave = gifId ? `${tipo}:${gifId}` : "";
  const valor = useSyncExternalStore(
    subscribe,
    () => (chave ? cache.get(chave) : null),
    () => undefined
  );
  useEffect(() => {
    if (MODO === "pacotes" && gifId && ativo) pedir(tipo, gifId);
  }, [tipo, gifId, ativo]);
  if (!gifId) return null;
  if (MODO === "arquivos") return urlDireta(tipo, gifId);
  return valor;
}

// Descrições (passo a passo) dos exercícios, em um JSON único baixado na primeira vez.
let descricoes: Promise<Record<string, string[]>> | null = null;
let descricoesProntas: Record<string, string[]> | null = null;

function lerDescricoes() {
  if (!descricoes)
    descricoes = fetch(`${BASE_MIDIA}descricoes.json`)
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => {
        descricoes = null;
        return {};
      })
      .then((d) => {
        descricoesProntas = d;
        emitir();
        return d;
      });
  return descricoes;
}

/** Passos de execução do exercício (undefined = carregando, null = sem descrição). */
export function useDescricao(gifId: string | null): string[] | null | undefined {
  const pronto = useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => descricoesProntas,
    () => null
  );
  useEffect(() => {
    if (gifId) lerDescricoes();
  }, [gifId]);
  if (!gifId) return null;
  if (!pronto) return undefined;
  return pronto[gifId] ?? null;
}
