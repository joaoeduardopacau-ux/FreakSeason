import type { TecnicaId, TipoExercicio } from "./types";

export interface Tecnica {
  id: TecnicaId;
  nome: string;
  tipo: TipoExercicio;
  resumo: string; // uma linha, aparece na lista
  comoFazer: string; // explicação curta mostrada no cartão do exercício
  descanso?: string;
  /** Séries sugeridas ao escolher a técnica. Força: reps. Cardio: [minutos, intensidade]. */
  modelo: { carga?: string; reps: string }[];
}

export const TECNICAS: Tecnica[] = [
  {
    id: "tradicional",
    nome: "Séries tradicionais",
    tipo: "forca",
    resumo: "Mesma carga e repetições em todas as séries.",
    comoFazer: "Faça todas as séries com a mesma carga e o mesmo número de repetições.",
    descanso: "60–90 s",
    modelo: [{ reps: "10" }, { reps: "10" }, { reps: "10" }],
  },
  {
    id: "piramide_crescente",
    nome: "Pirâmide crescente",
    tipo: "forca",
    resumo: "Carga sobe e repetições caem a cada série.",
    comoFazer: "Comece mais leve com mais repetições e aumente a carga a cada série, reduzindo as repetições (12 → 10 → 8 → 6).",
    descanso: "60–90 s",
    modelo: [{ reps: "12" }, { reps: "10" }, { reps: "8" }, { reps: "6" }],
  },
  {
    id: "piramide_decrescente",
    nome: "Pirâmide decrescente",
    tipo: "forca",
    resumo: "Começa pesado; carga cai e repetições sobem.",
    comoFazer: "Depois do aquecimento, comece com a carga mais alta e vá reduzindo, aumentando as repetições (6 → 8 → 10 → 12).",
    descanso: "60–90 s",
    modelo: [{ reps: "6" }, { reps: "8" }, { reps: "10" }, { reps: "12" }],
  },
  {
    id: "progressao_carga",
    nome: "Progressão de carga",
    tipo: "forca",
    resumo: "Mesmas repetições; aumente a carga de um treino para o outro.",
    comoFazer: "Mantenha as repetições. Quando completar todas as séries com boa execução, aumente a carga no próximo treino (ex.: +2 kg).",
    descanso: "90–120 s",
    modelo: [{ reps: "8" }, { reps: "8" }, { reps: "8" }, { reps: "8" }],
  },
  {
    id: "fst7",
    nome: "FST-7",
    tipo: "forca",
    resumo: "7 séries de 8–12 repetições com pouco descanso.",
    comoFazer: "7 séries de 8–12 repetições com 30–45 s de descanso. Costuma ser o último exercício do grupo muscular.",
    descanso: "30–45 s",
    modelo: Array.from({ length: 7 }, () => ({ reps: "10" })),
  },
  {
    id: "drop_set",
    nome: "Drop-set",
    tipo: "forca",
    resumo: "Na última série, reduza a carga e continue sem descanso.",
    comoFazer: "Ao chegar na falha da última série, reduza 20–30% da carga e continue sem descansar. Repita 1 a 2 vezes.",
    descanso: "60–90 s",
    modelo: [{ reps: "10" }, { reps: "10" }, { reps: "10" }],
  },
  {
    id: "rest_pause",
    nome: "Rest-pause",
    tipo: "forca",
    resumo: "Vá até a falha, pause 10–20 s e faça mais repetições.",
    comoFazer: "Faça a série até a falha, descanse 10–20 s com a mesma carga e faça mais repetições. Repita 2 a 3 pausas.",
    descanso: "90–120 s",
    modelo: [{ reps: "8" }, { reps: "8" }, { reps: "8" }],
  },
  {
    id: "bi_set",
    nome: "Bi-set",
    tipo: "forca",
    resumo: "Junto com o próximo exercício, sem descanso entre eles.",
    comoFazer: "Faça uma série deste exercício e, sem descanso, uma série do próximo exercício da lista. Descanse só depois do par.",
    descanso: "60–90 s após o par",
    modelo: [{ reps: "12" }, { reps: "12" }, { reps: "12" }],
  },
  {
    id: "gvt",
    nome: "GVT (10×10)",
    tipo: "forca",
    resumo: "10 séries de 10 repetições com a mesma carga.",
    comoFazer: "10 séries de 10 repetições com cerca de 60% da sua carga máxima e 60 s de descanso.",
    descanso: "60 s",
    modelo: Array.from({ length: 10 }, () => ({ reps: "10" })),
  },
  {
    id: "cardio_continuo",
    nome: "Contínuo",
    tipo: "cardio",
    resumo: "Ritmo constante do início ao fim.",
    comoFazer: "Mantenha o mesmo ritmo durante todo o tempo, numa intensidade em que ainda dá para conversar.",
    modelo: [{ carga: "30", reps: "" }],
  },
  {
    id: "cardio_hiit",
    nome: "Intervalado (HIIT)",
    tipo: "cardio",
    resumo: "Alterna tiros fortes com recuperação leve.",
    comoFazer: "Alterne tiros fortes com períodos de recuperação leve (ex.: 30 s forte / 90 s leve). Cada linha é um bloco.",
    modelo: [
      { carga: "5", reps: "Aquecimento" },
      { carga: "15", reps: "30s forte / 90s leve" },
      { carga: "5", reps: "Desaquecimento" },
    ],
  },
];

export function tecnicaPorId(id: TecnicaId | undefined): Tecnica | undefined {
  return TECNICAS.find((t) => t.id === id);
}

export function tecnicaPadrao(tipo: TipoExercicio): TecnicaId {
  return tipo === "cardio" ? "cardio_continuo" : "tradicional";
}
