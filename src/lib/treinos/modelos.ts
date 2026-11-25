/**
 * Fichas prontas por metodologia, adaptadas do guia
 * "Metodologias de Treino Físico — Guia Completo" (seção "Fichas por metodologia"
 * e "Treinos de atletas"). As cargas ficam em branco: são pontos de partida.
 */

export interface ItemModelo {
  ex: string; // id do exercício no catálogo
  tecnica?: string; // id da técnica; padrão = tradicional
  reps?: string[]; // repetições por série (padrão = modelo da técnica)
  descanso?: number; // segundos
  obs?: string;
}

export interface FichaModelo {
  nome: string;
  descricao: string;
  itens: ItemModelo[];
}

export interface ModeloTreino {
  id: string;
  nome: string;
  familia: "Hipertrofia" | "Força" | "Peso corporal" | "Cardio";
  resumo: string;
  frequencia: string;
  nivel: string;
  fichas: FichaModelo[];
}

const s = (n: number, reps: string) => Array.from({ length: n }, () => reps);
const FAIXA = (a: number, b: number) => `Faixa ${a}–${b} reps; ao fazer ${b} em todas as séries, aumente a carga.`;

export const MODELOS: ModeloTreino[] = [
  {
    id: "full-body",
    nome: "Full body para iniciantes (A/B)",
    familia: "Hipertrofia",
    resumo: "Corpo inteiro em cada treino, alternando A e B. RIR 2–3.",
    frequencia: "3×/semana: semana 1 A-B-A, semana 2 B-A-B",
    nivel: "Iniciante",
    fichas: [
      {
        nome: "Full body A",
        descricao: "Corpo inteiro",
        itens: [
          { ex: "agachamento-livre", reps: s(3, "10"), descanso: 120, obs: FAIXA(8, 12) },
          { ex: "supino-reto-com-halteres", reps: s(3, "10"), descanso: 120, obs: FAIXA(8, 12) },
          { ex: "puxada-frontal", reps: s(3, "10"), descanso: 120, obs: FAIXA(8, 12) },
          { ex: "leg-press-45", reps: s(2, "13"), descanso: 90, obs: FAIXA(12, 15) },
          { ex: "rosca-direta-com-barra", reps: s(2, "12"), descanso: 75, obs: FAIXA(10, 15) },
          { ex: "prancha", reps: s(3, "40"), descanso: 60, obs: "Segure 30–45 s em cada série (anote os segundos em reps)." },
        ],
      },
      {
        nome: "Full body B",
        descricao: "Corpo inteiro",
        itens: [
          { ex: "exdb-0085", reps: s(3, "10"), descanso: 120, obs: FAIXA(8, 12) },
          { ex: "desenvolvimento-com-halteres", reps: s(3, "10"), descanso: 120, obs: FAIXA(8, 12) },
          { ex: "remada-baixa", reps: s(3, "10"), descanso: 120, obs: FAIXA(8, 12) },
          { ex: "afundo", reps: s(2, "10"), descanso: 90, obs: "10 reps em cada perna." },
          { ex: "triceps-pulley-barra", reps: s(2, "12"), descanso: 75, obs: FAIXA(10, 15) },
          { ex: "panturrilha-em-pe", reps: s(3, "13"), descanso: 60, obs: FAIXA(12, 15) },
        ],
      },
    ],
  },
  {
    id: "ppl",
    nome: "Push / Pull / Legs",
    familia: "Hipertrofia",
    resumo: "Empurrar, puxar e pernas; cada músculo 2× por semana (12–16 séries).",
    frequencia: "6×/semana: Push – Pull – Legs – Push – Pull – Legs – descanso",
    nivel: "Intermediário",
    fichas: [
      {
        nome: "Push",
        descricao: "Peito, ombros e tríceps",
        itens: [
          { ex: "supino-reto-com-barra", reps: s(4, "7"), descanso: 150, obs: FAIXA(6, 8) },
          { ex: "supino-inclinado-com-halteres", reps: s(3, "10"), obs: FAIXA(8, 12) },
          { ex: "desenvolvimento-com-halteres", reps: s(3, "9"), obs: FAIXA(8, 10) },
          { ex: "elevacao-lateral", reps: s(4, "15"), descanso: 60, obs: FAIXA(12, 20) },
          { ex: "crossover", reps: s(3, "13"), descanso: 60, obs: FAIXA(12, 15) },
          { ex: "triceps-frances", reps: s(3, "11"), descanso: 75, obs: FAIXA(10, 12) },
        ],
      },
      {
        nome: "Pull",
        descricao: "Costas e bíceps",
        itens: [
          { ex: "barra-fixa", reps: s(4, "8"), descanso: 150, obs: "Faixa 6–10 reps (ou puxada frontal)." },
          { ex: "remada-curvada-com-barra", reps: s(3, "9"), descanso: 120, obs: FAIXA(8, 10) },
          { ex: "remada-unilateral-com-halter-serrote", reps: s(3, "11"), obs: FAIXA(10, 12) },
          { ex: "face-pull", reps: s(3, "15"), descanso: 60 },
          { ex: "rosca-direta-com-barra", reps: s(3, "10"), descanso: 75, obs: FAIXA(8, 12) },
          { ex: "rosca-martelo", reps: s(3, "11"), descanso: 75, obs: FAIXA(10, 12) },
        ],
      },
      {
        nome: "Legs",
        descricao: "Pernas e panturrilhas",
        itens: [
          { ex: "agachamento-livre", reps: s(4, "7"), descanso: 180, obs: FAIXA(6, 8) },
          { ex: "stiff", reps: s(3, "9"), descanso: 120, obs: FAIXA(8, 10) },
          { ex: "leg-press-45", reps: s(3, "12"), obs: FAIXA(10, 15) },
          { ex: "cadeira-extensora", reps: s(3, "13"), descanso: 60, obs: FAIXA(12, 15) },
          { ex: "mesa-flexora", reps: s(3, "12"), descanso: 60, obs: FAIXA(10, 15) },
          { ex: "panturrilha-sentado", reps: s(4, "13"), descanso: 60, obs: FAIXA(12, 15) },
        ],
      },
    ],
  },
  {
    id: "arnold",
    nome: "Arnold — peito e costas",
    familia: "Hipertrofia",
    resumo: "Alto volume com pirâmide e super-séries de antagonistas.",
    frequencia: "Arnold split: peito/costas → ombros/braços → pernas, 2× na semana",
    nivel: "Avançado",
    fichas: [
      {
        nome: "Arnold · Peito e costas",
        descricao: "Volume alto e super-séries",
        itens: [
          { ex: "supino-reto-com-barra", tecnica: "piramide_crescente", reps: ["30", "20", "12", "10", "8", "6"], descanso: 90 },
          { ex: "supino-inclinado-com-barra", tecnica: "bi_set", reps: s(5, "8"), obs: "Super-série com a barra fixa (próximo)." },
          { ex: "barra-fixa", tecnica: "bi_set", reps: s(5, "10"), obs: "Máximo de repetições." },
          { ex: "crucifixo-com-halteres", tecnica: "bi_set", reps: s(5, "9"), obs: "Super-série com a remada curvada (próximo)." },
          { ex: "remada-curvada-com-barra", tecnica: "bi_set", reps: s(5, "9") },
          { ex: "mergulho-paralelas", tecnica: "bi_set", reps: s(5, "11"), obs: "Super-série com a remada baixa (próximo)." },
          { ex: "remada-baixa", tecnica: "bi_set", reps: s(5, "11") },
          { ex: "exdb-0375", reps: s(5, "12"), descanso: 75 },
          { ex: "stiff", reps: s(5, "11"), descanso: 90 },
        ],
      },
    ],
  },
  {
    id: "hit",
    nome: "HIT / Heavy Duty (Mentzer)",
    familia: "Hipertrofia",
    resumo: "1 série de trabalho até a falha, com pré-exaustão. Pouco tempo de academia.",
    frequencia: "3 treinos; 4–7 dias entre treinos do mesmo músculo",
    nivel: "Intermediário",
    fichas: [
      {
        nome: "HIT 1",
        descricao: "Peito e costas",
        itens: [
          { ex: "crucifixo-com-halteres", tecnica: "pre_exaustao", reps: ["12", "8"], obs: "1ª série é aquecimento. Vá direto para o supino." },
          { ex: "supino-inclinado-com-halteres", tecnica: "hit", reps: ["8"], obs: "Série única até a falha, 4 s descendo." },
          { ex: "exdb-2285", tecnica: "pre_exaustao", reps: ["12", "8"], obs: "Pullover na máquina; vá direto para a puxada." },
          { ex: "puxada-frontal", tecnica: "hit", reps: ["8"], obs: "Série única até a falha." },
          { ex: "levantamento-terra", tecnica: "hit", reps: ["10", "6"], obs: "1 aquecimento + 1 × 5–8 até a falha técnica." },
        ],
      },
      {
        nome: "HIT 2",
        descricao: "Pernas",
        itens: [
          { ex: "cadeira-extensora", tecnica: "pre_exaustao", reps: ["12", "10"], obs: "Vá direto para o leg press." },
          { ex: "leg-press-45", tecnica: "hit", reps: ["15", "8"], obs: "1 aquecimento + série até a falha." },
          { ex: "mesa-flexora", tecnica: "hit", reps: ["12", "8"] },
          { ex: "panturrilha-em-pe", tecnica: "hit", reps: ["15"], obs: "1 × 12–20 até a falha." },
        ],
      },
      {
        nome: "HIT 3",
        descricao: "Ombros e braços",
        itens: [
          { ex: "elevacao-lateral", tecnica: "hit", reps: ["12", "8"] },
          { ex: "desenvolvimento-com-halteres", tecnica: "hit", reps: ["12", "8"] },
          { ex: "rosca-direta-com-barra", tecnica: "hit", reps: ["12", "8"] },
          { ex: "mergulho-paralelas", tecnica: "hit", reps: ["8"] },
        ],
      },
    ],
  },
  {
    id: "gvt",
    nome: "German Volume Training (GVT)",
    familia: "Hipertrofia",
    resumo: "10 × 10 a ~60% de 1RM em pares A1/A2; fase de 4–6 semanas.",
    frequencia: "5 dias: Peito/costas – Pernas – descanso – Braços/ombros – descanso",
    nivel: "Intermediário",
    fichas: [
      {
        nome: "GVT 1",
        descricao: "Peito e costas",
        itens: [
          { ex: "supino-inclinado-com-barra", tecnica: "gvt", obs: "A1: alterne com a barra fixa (A2)." },
          { ex: "barra-fixa", tecnica: "gvt", obs: "A2: pegada pronada." },
          { ex: "crucifixo-com-halteres", reps: s(3, "11"), descanso: 75 },
          { ex: "remada-unilateral-com-halter-serrote", reps: s(3, "11"), descanso: 75 },
        ],
      },
      {
        nome: "GVT 2",
        descricao: "Pernas e abdômen",
        itens: [
          { ex: "agachamento-livre", tecnica: "gvt" },
          { ex: "mesa-flexora", reps: s(3, "11"), descanso: 75 },
          { ex: "panturrilha-em-pe", reps: s(3, "11"), descanso: 60 },
          { ex: "abdominal-supra", reps: s(3, "15"), descanso: 45 },
        ],
      },
      {
        nome: "GVT 3",
        descricao: "Braços e ombros",
        itens: [
          { ex: "mergulho-paralelas", tecnica: "gvt", obs: "A1: alterne com a rosca direta (A2)." },
          { ex: "rosca-direta-com-barra", tecnica: "gvt", obs: "A2." },
          { ex: "elevacao-lateral", reps: s(3, "11"), descanso: 60 },
          { ex: "crucifixo-invertido", reps: s(3, "11"), descanso: 60 },
        ],
      },
    ],
  },
  {
    id: "fst7",
    nome: "FST-7 (dia de peito)",
    familia: "Hipertrofia",
    resumo: "Treino normal + 7 séries finais de isolador com 30–45 s de pausa.",
    frequencia: "Use o FST-7 no último exercício de cada grupo muscular",
    nivel: "Intermediário",
    fichas: [
      {
        nome: "FST-7 · Peito",
        descricao: "Peito com finalização FST-7",
        itens: [
          { ex: "supino-inclinado-com-halteres", reps: s(4, "10"), obs: FAIXA(8, 12) },
          { ex: "supino-reto-com-barra", reps: s(3, "10"), descanso: 120, obs: FAIXA(8, 12) },
          { ex: "mergulho-paralelas", reps: s(3, "10"), obs: "Inclinado à frente, até a falha." },
          { ex: "crossover", tecnica: "fst7", obs: "Alongue o peito entre as séries." },
        ],
      },
    ],
  },
  {
    id: "dc",
    nome: "DC Training (A/B)",
    familia: "Hipertrofia",
    resumo: "Rest-pause, alongamento extremo e caderno de cargas.",
    frequencia: "3×/semana alternando A e B",
    nivel: "Avançado",
    fichas: [
      {
        nome: "DC A",
        descricao: "Peito, ombro, tríceps e costas",
        itens: [
          { ex: "exdb-1299", tecnica: "rest_pause", obs: "Alongue com carga 60–90 s depois." },
          { ex: "desenvolvimento-com-halteres", tecnica: "rest_pause" },
          { ex: "triceps-testa", tecnica: "rest_pause" },
          { ex: "barra-fixa", tecnica: "rest_pause", obs: "Largura das costas." },
          { ex: "remada-curvada-com-barra", reps: ["10"], descanso: 120, obs: "Espessura: 1 série pesada." },
        ],
      },
      {
        nome: "DC B",
        descricao: "Bíceps, antebraço, panturrilha, posteriores e quadríceps",
        itens: [
          { ex: "rosca-direta-com-barra", tecnica: "rest_pause" },
          { ex: "rosca-martelo", tecnica: "rest_pause" },
          { ex: "panturrilha-no-leg-press", tecnica: "rest_pause", obs: "Alongue 60–90 s embaixo depois." },
          { ex: "mesa-flexora", tecnica: "rest_pause" },
          { ex: "hack-squat", reps: ["6", "20"], descanso: 180, obs: "1 série pesada de 4–8 + uma “widowmaker” de 20 reps." },
        ],
      },
    ],
  },
  {
    id: "starting-strength",
    nome: "Starting Strength (A/B)",
    familia: "Força",
    resumo: "3 × 5 nos básicos, subindo carga em todo treino.",
    frequencia: "3×/semana alternando A e B",
    nivel: "Iniciante",
    fichas: [
      {
        nome: "Força A",
        descricao: "Agachamento, desenvolvimento e terra",
        itens: [
          { ex: "agachamento-livre", tecnica: "forca_5x5", reps: s(3, "5") },
          { ex: "desenvolvimento-com-barra", tecnica: "forca_5x5", reps: s(3, "5") },
          { ex: "levantamento-terra", tecnica: "forca_5x5", reps: ["5"] },
        ],
      },
      {
        nome: "Força B",
        descricao: "Agachamento, supino e power clean",
        itens: [
          { ex: "agachamento-livre", tecnica: "forca_5x5", reps: s(3, "5") },
          { ex: "supino-reto-com-barra", tecnica: "forca_5x5", reps: s(3, "5") },
          { ex: "exdb-0648", tecnica: "forca_5x5", reps: s(5, "3"), obs: "Ou levantamento terra 1 × 5." },
        ],
      },
    ],
  },
  {
    id: "531",
    nome: "5/3/1 com Boring But Big",
    familia: "Força",
    resumo: "Um levantamento principal por dia + 5 × 10 a 50–60%.",
    frequencia: "4×/semana; ciclo de 4 semanas (5s, 3s, 5/3/1, descarga)",
    nivel: "Intermediário",
    fichas: [
      ["Desenvolvimento", "desenvolvimento-com-barra"],
      ["Terra", "levantamento-terra"],
      ["Supino", "supino-reto-com-barra"],
      ["Agachamento", "agachamento-livre"],
    ].map(([nome, ex]) => ({
      nome: `5/3/1 · ${nome}`,
      descricao: "Principal + BBB",
      itens: [
        { ex, tecnica: "531", obs: "Última série AMRAP (máximo de reps)." },
        { ex, reps: s(5, "10"), descanso: 90, obs: "Boring But Big: 5 × 10 a 50–60% do máximo de treino." },
      ],
    })),
  },
  {
    id: "calistenia",
    nome: "Calistenia progressiva",
    familia: "Peso corporal",
    resumo: "Corpo inteiro com o peso do corpo; suba de nível ao fazer o topo das reps.",
    frequencia: "3×/semana",
    nivel: "Todos",
    fichas: [
      {
        nome: "Calistenia",
        descricao: "Corpo inteiro",
        itens: [
          { ex: "flexao-de-braco", reps: s(3, "12"), descanso: 90, obs: "Nível 1: inclinada; nível 3: pés elevados ou arqueiro. Faixa 8–15." },
          { ex: "barra-fixa", reps: s(3, "8"), descanso: 120, obs: "Nível 1: australiana/negativa; nível 3: com carga. Faixa 5–10." },
          { ex: "agachamento-bulgaro", reps: s(3, "10"), descanso: 90, obs: "Nível 1: agachamento livre; nível 3: pistol. Faixa 8–12." },
          { ex: "mergulho-paralelas", reps: s(3, "9"), descanso: 90, obs: "Nível 1: no banco; nível 3: com carga. Faixa 6–12." },
          { ex: "prancha", reps: s(3, "30"), descanso: 60, obs: "Segundos. Nível 2: hollow hold; nível 3: L-sit." },
        ],
      },
    ],
  },
  {
    id: "cardio-intervalado",
    nome: "Cardio intervalado (HIIT)",
    familia: "Cardio",
    resumo: "Tabata, 4×4 norueguês e Little–Gibala com temporizador de intervalos.",
    frequencia: "1–2 sessões fortes por semana",
    nivel: "Intermediário",
    fichas: [
      { nome: "Tabata", descricao: "Bike, 4 min", itens: [{ ex: "bicicleta-ergometrica", tecnica: "tabata" }] },
      { nome: "4×4 norueguês", descricao: "Esteira, ~40 min", itens: [{ ex: "esteira-corrida", tecnica: "noruegues_4x4" }] },
      { nome: "Little–Gibala", descricao: "Bike, ~25 min", itens: [{ ex: "bike-spinning", tecnica: "little_gibala" }] },
    ],
  },
  {
    id: "corrida-caminhada",
    nome: "Corrida-caminhada (8 semanas)",
    familia: "Cardio",
    resumo: "Do zero aos 25–30 min de corrida contínua.",
    frequencia: "3×/semana",
    nivel: "Iniciante",
    fichas: [
      {
        nome: "Corrida-caminhada",
        descricao: "Semana 1: 8 × (1 min + 2 min)",
        itens: [
          {
            ex: "corrida-ao-ar-livre",
            tecnica: "corrida_caminhada",
            obs: "S2: 7×(1,5+2) · S3: 6×(2+1,5) · S4: 5×(3+1,5) · S5: 4×(5+1) · S6: 3×(8+1) · S7: 2×(12+1) · S8: 25–30 min contínuos.",
          },
        ],
      },
    ],
  },
];
