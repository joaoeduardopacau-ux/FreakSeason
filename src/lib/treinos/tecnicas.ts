import type { TecnicaId, TipoExercicio } from "./types";

/**
 * Catálogo de técnicas (metodologias) de treino.
 * Conteúdo baseado no guia "Metodologias de Treino Físico — Guia Completo".
 */

export type CategoriaTecnica =
  | "Básicas"
  | "Intensificação"
  | "Programas de hipertrofia"
  | "Força"
  | "Tempo sob tensão"
  | "Especiais"
  | "Cardio contínuo"
  | "Cardio intervalado";

export interface Tecnica {
  id: TecnicaId;
  nome: string;
  tipo: TipoExercicio;
  categoria: CategoriaTecnica;
  resumo: string; // uma linha, aparece na lista
  comoFazer: string; // explicação mostrada no cartão do exercício
  progressao?: string; // como evoluir
  origem?: string; // criador / escola
  descanso?: string; // texto exibido (ex.: "60–90 s")
  /** Séries sugeridas ao escolher a técnica. Força: reps. Cardio: [minutos, intensidade]. */
  modelo: { carga?: string; reps: string }[];
}

const repetir = (n: number, reps: string) => Array.from({ length: n }, () => ({ reps }));

export const CATEGORIAS_FORCA: CategoriaTecnica[] = [
  "Básicas",
  "Intensificação",
  "Programas de hipertrofia",
  "Força",
  "Tempo sob tensão",
  "Especiais",
];
export const CATEGORIAS_CARDIO: CategoriaTecnica[] = ["Cardio contínuo", "Cardio intervalado"];

export const TECNICAS: Tecnica[] = [
  // ───────── Básicas ─────────
  {
    id: "tradicional",
    nome: "Séries tradicionais",
    tipo: "forca",
    categoria: "Básicas",
    resumo: "Mesma carga em todas as séries, numa faixa de repetições.",
    comoFazer: "Faça todas as séries com a mesma carga, parando com 1–3 repetições sobrando (RIR 1–3).",
    progressao: "Dupla progressão: ao fazer o topo da faixa (ex.: 12 reps) em todas as séries, aumente a carga.",
    descanso: "60–90 s (2 min nos multiarticulares)",
    modelo: repetir(3, "10"),
  },
  {
    id: "piramide_crescente",
    nome: "Pirâmide crescente",
    tipo: "forca",
    categoria: "Básicas",
    resumo: "Carga sobe e repetições caem a cada série.",
    comoFazer: "Comece mais leve com mais repetições e aumente a carga a cada série, reduzindo as repetições (12 → 10 → 8 → 6).",
    progressao: "Quando a última série sair com folga, suba a carga de todas as séries.",
    origem: "Princípios Weider",
    descanso: "60–90 s",
    modelo: [{ reps: "12" }, { reps: "10" }, { reps: "8" }, { reps: "6" }],
  },
  {
    id: "piramide_decrescente",
    nome: "Pirâmide decrescente",
    tipo: "forca",
    categoria: "Básicas",
    resumo: "Começa pesado; carga cai e repetições sobem.",
    comoFazer: "Depois do aquecimento, comece com a carga mais alta e vá reduzindo, aumentando as repetições (6 → 8 → 10 → 12).",
    progressao: "Suba a carga da primeira série quando passar de 6 repetições.",
    origem: "Princípios Weider",
    descanso: "60–90 s",
    modelo: [{ reps: "6" }, { reps: "8" }, { reps: "10" }, { reps: "12" }],
  },
  {
    id: "progressao_carga",
    nome: "Progressão de carga",
    tipo: "forca",
    categoria: "Básicas",
    resumo: "Mesmas repetições; aumente a carga de um treino para o outro.",
    comoFazer: "Mantenha as repetições. Quando completar todas as séries com boa execução, aumente a carga no próximo treino.",
    progressao: "Sobrecarga progressiva: +1–2,5 kg nos exercícios de braço e +2,5–5 kg nos de perna.",
    descanso: "90–120 s",
    modelo: repetir(4, "8"),
  },

  // ───────── Intensificação ─────────
  {
    id: "drop_set",
    nome: "Drop-set",
    tipo: "forca",
    categoria: "Intensificação",
    resumo: "Na última série, reduza a carga e continue sem descanso.",
    comoFazer: "Ao chegar na falha da última série, reduza 20–30% da carga e continue sem descansar. Repita 1 a 2 vezes.",
    progressao: "Use só na última série de cada exercício para não acumular fadiga demais.",
    origem: "Princípios Weider",
    descanso: "60–90 s",
    modelo: repetir(3, "10"),
  },
  {
    id: "rest_pause",
    nome: "Rest-pause",
    tipo: "forca",
    categoria: "Intensificação",
    resumo: "Vá até a falha, pause 10–20 s e faça mais repetições.",
    comoFazer: "Faça a série até a falha, descanse 10–20 s (10–15 respirações) com a mesma carga e faça mais repetições. Repita 2 vezes. Total de 11–15 reps.",
    progressao: "Estilo DC Training: anote as cargas e tente bater o caderno a cada sessão.",
    origem: "Popularizado por Dante Trudel (DC Training)",
    descanso: "90–120 s entre exercícios",
    modelo: [{ reps: "8" }, { reps: "4" }, { reps: "3" }],
  },
  {
    id: "myo_reps",
    nome: "Myo-reps",
    tipo: "forca",
    categoria: "Intensificação",
    resumo: "Série de ativação perto da falha + mini-séries de 3–5 reps.",
    comoFazer: "Faça uma série de ativação de 12–20 reps perto da falha. Depois, pausas de 3–5 respirações e mini-séries de 3–5 reps, até não conseguir manter.",
    progressao: "Quando passar de 5 mini-séries, aumente a carga.",
    descanso: "15 s entre mini-séries",
    modelo: [{ reps: "15" }, { reps: "5" }, { reps: "5" }, { reps: "5" }],
  },
  {
    id: "cluster",
    nome: "Cluster set",
    tipo: "forca",
    categoria: "Intensificação",
    resumo: "Série quebrada em mini-blocos com 10–30 s de pausa.",
    comoFazer: "Use carga alta (perto de 85%) e divida a série em blocos de 2–3 reps com 10–30 s de pausa entre eles. Cada linha é um bloco.",
    progressao: "Aumente a carga quando fizer todos os blocos com boa velocidade.",
    descanso: "20 s entre blocos",
    modelo: repetir(4, "3"),
  },
  {
    id: "bi_set",
    nome: "Bi-set / super-série",
    tipo: "forca",
    categoria: "Intensificação",
    resumo: "Dois exercícios seguidos sem pausa entre eles.",
    comoFazer: "Faça uma série deste exercício e, sem descanso, uma série do próximo da lista. Mesmo músculo = bi-set; antagonistas (ex.: peito e costas) = super-série. Descanse só depois do par.",
    origem: "Princípios Weider (muito usado por Arnold)",
    descanso: "60–90 s após o par",
    modelo: repetir(3, "12"),
  },
  {
    id: "tri_set",
    nome: "Tri-set / série gigante",
    tipo: "forca",
    categoria: "Intensificação",
    resumo: "Três ou mais exercícios encadeados sem pausa.",
    comoFazer: "Faça este exercício e os próximos 2 ou 3 da lista em sequência, sem descanso. Descanse só ao fim da volta.",
    descanso: "90–120 s após a volta",
    modelo: repetir(3, "12"),
  },
  {
    id: "pre_exaustao",
    nome: "Pré-exaustão",
    tipo: "forca",
    categoria: "Intensificação",
    resumo: "Isolador antes do multiarticular do mesmo músculo.",
    comoFazer: "Faça este exercício isolador (ex.: crucifixo) e passe direto para o multiarticular (ex.: supino) sem pausa. Deixe o isolador antes na lista.",
    origem: "Usado no HIT de Mike Mentzer",
    descanso: "90 s após o par",
    modelo: repetir(3, "10"),
  },
  {
    id: "forcadas",
    nome: "Repetições forçadas",
    tipo: "forca",
    categoria: "Intensificação",
    resumo: "Parceiro ajuda nas últimas reps depois da falha.",
    comoFazer: "Vá até a falha e peça ajuda do parceiro para fazer mais 1–3 repetições, só com a ajuda necessária.",
    origem: "Dorian Yates (Blood and Guts)",
    descanso: "2 min",
    modelo: repetir(2, "8"),
  },
  {
    id: "parciais",
    nome: "Parciais alongadas",
    tipo: "forca",
    categoria: "Intensificação",
    resumo: "Reps em amplitude parcial na posição alongada.",
    comoFazer: "Após a falha na amplitude completa, continue com repetições parciais na parte em que o músculo está mais alongado.",
    descanso: "60–90 s",
    modelo: repetir(3, "10"),
  },

  // ───────── Programas de hipertrofia ─────────
  {
    id: "volume_evidencia",
    nome: "Volume baseado em evidência",
    tipo: "forca",
    categoria: "Programas de hipertrofia",
    resumo: "10–20 séries semanais por músculo, 0–3 RIR, 2× por semana.",
    comoFazer: "Pare cada série com 0–3 repetições sobrando. Some 10 a 20 séries por músculo na semana, divididas em 2 treinos.",
    progressao: "Aumente o volume ao longo do mesociclo (4–6 semanas) e faça uma semana de descarga.",
    origem: "Schoenfeld, Krieger, Israetel (RP)",
    descanso: "1–3 min",
    modelo: repetir(3, "10"),
  },
  {
    id: "gvt",
    nome: "GVT (10×10)",
    tipo: "forca",
    categoria: "Programas de hipertrofia",
    resumo: "10 séries de 10 repetições com ~60% de 1RM.",
    comoFazer: "10 séries de 10 repetições com cerca de 60% da sua carga máxima. Cadência 4-0-2-0 (4 s descendo, 2 s subindo).",
    progressao: "Quando completar as 10 séries de 10, aumente 4–5% da carga na sessão seguinte.",
    origem: "Escola alemã; popularizado por Charles Poliquin",
    descanso: "60–90 s",
    modelo: repetir(10, "10"),
  },
  {
    id: "fst7",
    nome: "FST-7",
    tipo: "forca",
    categoria: "Programas de hipertrofia",
    resumo: "7 séries de 10–12 com pouco descanso no fim do treino.",
    comoFazer: "7 séries de 10–12 repetições num exercício isolador, com 30–45 s de pausa, alongando o músculo entre as séries. Costuma ser o último exercício do grupo.",
    origem: "Hany Rambod",
    descanso: "30–45 s",
    modelo: repetir(7, "12"),
  },
  {
    id: "hit",
    nome: "HIT / Heavy Duty",
    tipo: "forca",
    categoria: "Programas de hipertrofia",
    resumo: "1 série de trabalho de 6–10 reps até a falha.",
    comoFazer: "Faça 2–3 séries de aquecimento e uma única série de trabalho de 6–10 repetições até a falha, com cadência lenta (4 s descendo).",
    progressao: "Descanse 4–7 dias entre treinos do mesmo músculo e tente subir reps ou carga a cada sessão.",
    origem: "Arthur Jones; Mike Mentzer (Heavy Duty)",
    descanso: "2–3 min",
    modelo: [{ reps: "12" }, { reps: "8" }, { reps: "8" }],
  },
  {
    id: "y3t",
    nome: "Y3T",
    tipo: "forca",
    categoria: "Programas de hipertrofia",
    resumo: "Ciclo de 3 semanas: pesada, moderada e “inferno”.",
    comoFazer: "Semana 1 pesada (6–10 reps), semana 2 moderada (8–12) e semana 3 de alto volume (15–30+). Ajuste as repetições conforme a semana.",
    origem: "Neil Hill",
    descanso: "60–120 s",
    modelo: repetir(3, "8"),
  },

  // ───────── Força ─────────
  {
    id: "forca_5x5",
    nome: "5×5 / 3×5",
    tipo: "forca",
    categoria: "Força",
    resumo: "Poucas reps pesadas nos básicos, subindo carga todo treino.",
    comoFazer: "Séries de 5 repetições com a mesma carga nos exercícios básicos (agachamento, supino, terra, desenvolvimento).",
    progressao: "+2,5–5 kg no agachamento e terra e +1–2,5 kg nos de braço a cada sessão. Ao falhar duas vezes a mesma carga, reduza 10% e suba de novo.",
    origem: "Starting Strength (Rippetoe) e StrongLifts 5×5",
    descanso: "3–5 min",
    modelo: repetir(5, "5"),
  },
  {
    id: "531",
    nome: "5/3/1",
    tipo: "forca",
    categoria: "Força",
    resumo: "Ciclo de 4 semanas com última série no máximo de reps.",
    comoFazer: "Use um “máximo de treino” de 90% do seu 1RM. Semana 1: 65%×5, 75%×5, 85%×5+. Semana 2: 70/80/90%×3. Semana 3: 75%×5, 85%×3, 95%×1+. Semana 4: descarga. A última série é AMRAP.",
    progressao: "A cada ciclo, suba o máximo de treino em 2,5 kg (braços) e 5 kg (pernas).",
    origem: "Jim Wendler",
    descanso: "3–5 min",
    modelo: [{ reps: "5" }, { reps: "5" }, { reps: "5" }],
  },
  {
    id: "rpe",
    nome: "Autorregulado (RPE/RIR)",
    tipo: "forca",
    categoria: "Força",
    resumo: "A carga do dia é ajustada pelo esforço percebido.",
    comoFazer: "Faça a série principal num esforço alvo (ex.: 3 reps @ RPE 8 = sobrariam 2 reps). Depois reduza 5–10% da carga e faça as séries extras.",
    progressao: "Se a série @ RPE 8 sair fácil, suba 2,5–5 kg; se sair pesada, reduza.",
    origem: "Mike Tuchscherer (RTS)",
    descanso: "3 min",
    modelo: repetir(4, "3"),
  },

  // ───────── Tempo sob tensão ─────────
  {
    id: "excentrico",
    nome: "Excêntrico enfatizado",
    tipo: "forca",
    categoria: "Tempo sob tensão",
    resumo: "Descida lenta de 3–6 s em cada repetição.",
    comoFazer: "Controle a fase de descida em 3–6 segundos e suba normalmente. Bom para hipertrofia, tendões e prevenção de lesões.",
    descanso: "90 s",
    modelo: repetir(3, "8"),
  },
  {
    id: "superlento",
    nome: "Superlento (SuperSlow)",
    tipo: "forca",
    categoria: "Tempo sob tensão",
    resumo: "10 s subindo e 10 s descendo, uma série à falha.",
    comoFazer: "Cada repetição dura cerca de 20 s (10 s subindo e 10 s descendo). Faça uma série até a falha. Baixo impacto articular.",
    origem: "Ken Hutchins",
    descanso: "2 min",
    modelo: [{ reps: "6" }],
  },

  // ───────── Especiais ─────────
  {
    id: "bfr",
    nome: "Oclusão vascular (BFR)",
    tipo: "forca",
    categoria: "Especiais",
    resumo: "Carga leve (20–40%) com manguito: 30-15-15-15 reps.",
    comoFazer: "Com o manguito inflado (40–80% da oclusão arterial), faça 30 – 15 – 15 – 15 repetições com 20–40% de 1RM e 30–60 s de pausa. Use orientação profissional, principalmente com histórico vascular.",
    origem: "Yoshiaki Sato (KAATSU)",
    descanso: "30–60 s",
    modelo: [{ reps: "30" }, { reps: "15" }, { reps: "15" }, { reps: "15" }],
  },

  // ───────── Cardio contínuo ─────────
  {
    id: "cardio_continuo",
    nome: "Contínuo leve (Z1/Z2)",
    tipo: "cardio",
    categoria: "Cardio contínuo",
    resumo: "Ritmo constante em que dá para conversar.",
    comoFazer: "Mantenha o mesmo ritmo durante todo o tempo, numa intensidade em que ainda dá para conversar (abaixo do 1º limiar). É a base da resistência.",
    progressao: "Aumente o tempo total aos poucos (até ~10% por semana).",
    modelo: [{ carga: "30", reps: "Z1 / conversa fácil" }],
  },
  {
    id: "cardio_limiar",
    nome: "Contínuo intensivo (limiar)",
    tipo: "cardio",
    categoria: "Cardio contínuo",
    resumo: "20–60 min “confortavelmente difícil”.",
    comoFazer: "Ritmo perto do limiar de lactato: dá para falar só frases curtas. Faça 20 a 60 minutos.",
    modelo: [{ carga: "10", reps: "Aquecimento" }, { carga: "25", reps: "Limiar (Z2)" }, { carga: "5", reps: "Desaquecimento" }],
  },
  {
    id: "maf",
    nome: "MAF (180 − idade)",
    tipo: "cardio",
    categoria: "Cardio contínuo",
    resumo: "Base aeróbia com FC ≤ 180 − idade.",
    comoFazer: "Treine com a frequência cardíaca até 180 − sua idade (ex.: 30 anos → 150 bpm). Uma vez por mês, faça o teste MAF: 5 km na FC-alvo anotando o ritmo.",
    progressao: "Se o ritmo no teste MAF melhora mês a mês, a base aeróbia está crescendo.",
    origem: "Phil Maffetone",
    modelo: [{ carga: "45", reps: "FC ≤ 180 − idade" }],
  },
  {
    id: "fartlek",
    nome: "Fartlek",
    tipo: "cardio",
    categoria: "Cardio contínuo",
    resumo: "Acelerações livres sem parar, alternando rápido e lento.",
    comoFazer: "“Jogo de velocidade”: alterne trechos rápidos e lentos como quiser, sem parar. Ex.: 13 × 3 min rápido com 1 min trotando.",
    origem: "Gösta Holmer (Suécia)",
    modelo: [{ carga: "10", reps: "Leve" }, { carga: "20", reps: "Rápido/lento livre" }, { carga: "5", reps: "Leve" }],
  },
  {
    id: "corrida_caminhada",
    nome: "Corrida-caminhada",
    tipo: "cardio",
    categoria: "Cardio contínuo",
    resumo: "Alterna corrida e caminhada (ótimo para iniciantes).",
    comoFazer: "Alterne corrida e caminhada em proporções fixas. Semana 1: 8 × (1 min correndo + 2 min andando). Vá aumentando a corrida até 25–30 min contínuos em 8 semanas.",
    origem: "Jeff Galloway",
    modelo: [{ carga: "5", reps: "Caminhada" }, { carga: "24", reps: "8 × (1 min corre + 2 min anda)" }],
  },

  // ───────── Cardio intervalado ─────────
  {
    id: "cardio_hiit",
    nome: "HIIT",
    tipo: "cardio",
    categoria: "Cardio intervalado",
    resumo: "Esforços de 85–95% da FC máx com recuperação.",
    comoFazer: "Alterne esforços fortes (85–95% da FC máxima) com recuperação leve, numa razão de 2:1 ou 1:1. Ex.: 30 s forte / 30 s leve.",
    modelo: [{ carga: "5", reps: "Aquecimento" }, { carga: "10", reps: "30s forte / 30s leve" }, { carga: "5", reps: "Desaquecimento" }],
  },
  {
    id: "tabata",
    nome: "Tabata",
    tipo: "cardio",
    categoria: "Cardio intervalado",
    resumo: "8 × (20 s máximos + 10 s parado) = 4 min.",
    comoFazer: "8 rodadas de 20 s no esforço máximo com 10 s de pausa. O original exige intensidade muito alta (bike ergométrica). Aqueça antes.",
    origem: "Izumi Tabata, 1996",
    modelo: [{ carga: "5", reps: "Aquecimento" }, { carga: "4", reps: "8 × 20s / 10s" }, { carga: "3", reps: "Desaquecimento" }],
  },
  {
    id: "noruegues_4x4",
    nome: "4×4 norueguês",
    tipo: "cardio",
    categoria: "Cardio intervalado",
    resumo: "4 × 4 min a 90–95% da FC máx com 3 min leves.",
    comoFazer: "10 min leve, depois 4 blocos de 4 min a 90–95% da FC máxima com 3 min de recuperação ativa (~70%). Termine com 5 min leve.",
    origem: "Helgerud e Wisløff (NTNU), 2007",
    modelo: [{ carga: "10", reps: "Aquecimento" }, { carga: "28", reps: "4 × 4 min forte / 3 min leve" }, { carga: "5", reps: "Leve" }],
  },
  {
    id: "little_gibala",
    nome: "Little–Gibala",
    tipo: "cardio",
    categoria: "Cardio intervalado",
    resumo: "10 × (60 s forte + 75 s leve).",
    comoFazer: "8–12 esforços de 60 s a ~90% da FC máxima com 75 s leves entre eles. Na bike ou esteira.",
    origem: "Universidade McMaster",
    modelo: [{ carga: "5", reps: "Aquecimento" }, { carga: "23", reps: "10 × 60s forte / 75s leve" }],
  },
  {
    id: "sit",
    nome: "Sprint intervalado (SIT)",
    tipo: "cardio",
    categoria: "Cardio intervalado",
    resumo: "4–6 × 30 s máximos com 4 min de pausa.",
    comoFazer: "4 a 6 sprints de 30 s no esforço máximo, com 4 min de pausa leve entre eles.",
    origem: "Baseado no teste de Wingate",
    modelo: [{ carga: "5", reps: "Aquecimento" }, { carga: "23", reps: "5 × 30s máx / 4 min leve" }],
  },
  {
    id: "emom",
    nome: "EMOM",
    tipo: "cardio",
    categoria: "Cardio intervalado",
    resumo: "Tarefa no início de cada minuto; descansa o que sobrar.",
    comoFazer: "Every minute on the minute: a cada minuto, faça a tarefa (ex.: 12 swings) e descanse o resto do minuto. Ex.: EMOM 20 min.",
    modelo: [{ carga: "20", reps: "1 tarefa por minuto" }],
  },
];

export function tecnicaPorId(id: TecnicaId | undefined): Tecnica | undefined {
  return TECNICAS.find((t) => t.id === id);
}

export function tecnicaPadrao(tipo: TipoExercicio): TecnicaId {
  return tipo === "cardio" ? "cardio_continuo" : "tradicional";
}
