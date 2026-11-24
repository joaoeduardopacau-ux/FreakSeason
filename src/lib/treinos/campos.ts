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
