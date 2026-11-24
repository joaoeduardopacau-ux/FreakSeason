/** Aceita "22,5" ou "22.5"; mantém só um separador decimal (vírgula). */
export function limparDecimal(v: string) {
  let s = v.replace(/[^\d.,]/g, "").replace(".", ",");
  const i = s.indexOf(",");
  if (i >= 0) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/,/g, "");
  return s.slice(0, 6);
}

export function limparInteiro(v: string) {
  return v.replace(/\D/g, "").slice(0, 3);
}

export function limparTexto(v: string) {
  return v.slice(0, 40);
}

/** Rótulos das colunas conforme o tipo do exercício. */
export function rotulos(tipo: "forca" | "cardio" | undefined) {
  return tipo === "cardio"
    ? { linha: "Bloco", a: "Minutos", b: "Intensidade", phA: "min", phB: "ex.: 6 km/h", unidadeA: " min" }
    : { linha: "Série", a: "Carga (kg)", b: "Reps", phA: "kg", phB: "reps", unidadeA: " kg" };
}

/** "Treino A" → "A"; outros nomes → iniciais. */
export function siglaFicha(nome: string) {
  const m = nome.trim().match(/^treino\s+(\S{1,3})$/i);
  if (m) return m[1].toUpperCase();
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return (partes.length > 1 ? partes[0][0] + partes[1][0] : (partes[0] ?? "T").slice(0, 2)).toUpperCase();
}
