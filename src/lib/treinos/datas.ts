// Datas sempre em horário local, no formato YYYY-MM-DD.
// (toISOString usa UTC e muda de dia à noite no Brasil.)

export function chaveData(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

export function hojeChave(): string {
  return chaveData(new Date());
}

export function paraData(chave: string): Date {
  const [y, m, d] = chave.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function somarDias(chave: string, dias: number): string {
  const d = paraData(chave);
  d.setDate(d.getDate() + dias);
  return chaveData(d);
}

export function chaveValida(chave: string | null | undefined): chave is string {
  if (!chave || !/^\d{4}-\d{2}-\d{2}$/.test(chave)) return false;
  return chaveData(paraData(chave)) === chave;
}

const DIAS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export const DIAS_CURTOS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function diaDaSemana(chave: string): string {
  return DIAS[paraData(chave).getDay()];
}

export function nomeMes(mes: number): string {
  return MESES[mes];
}

/** "24 de novembro de 2026" */
export function dataPorExtenso(chave: string, comAno = true): string {
  const d = paraData(chave);
  const base = `${d.getDate()} de ${MESES[d.getMonth()]}`;
  return comAno ? `${base} de ${d.getFullYear()}` : base;
}

/** "24/11/2026" */
export function dataCurta(chave: string): string {
  const [y, m, d] = chave.split("-");
  return `${d}/${m}/${y}`;
}

/** "Hoje", "Ontem", "Amanhã" ou null */
export function rotuloRelativo(chave: string): string | null {
  const hoje = hojeChave();
  if (chave === hoje) return "Hoje";
  if (chave === somarDias(hoje, -1)) return "Ontem";
  if (chave === somarDias(hoje, 1)) return "Amanhã";
  return null;
}
