import type { Equipamento, ExercicioCatalogo, GrupoMuscular } from "./types";
import { BIBLIOTECA, EXTRA_PRINCIPAIS } from "./biblioteca";

export const GRUPOS: GrupoMuscular[] = [
  "Peito",
  "Costas",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Antebraço",
  "Pernas",
  "Glúteos",
  "Panturrilha",
  "Abdômen",
  "Cardio",
  "Alongamento",
  "Outro",
];

export const EQUIPAMENTOS: Equipamento[] = [
  "Halteres",
  "Barra",
  "Cabo",
  "Máquina",
  "Smith",
  "Peso corporal",
  "Kettlebell",
  "Elástico",
  "Outros",
];

const base: [string, GrupoMuscular][] = [
  // Peito
  ["Supino reto com barra", "Peito"],
  ["Supino reto com halteres", "Peito"],
  ["Supino inclinado com barra", "Peito"],
  ["Supino inclinado com halteres", "Peito"],
  ["Supino declinado", "Peito"],
  ["Crucifixo com halteres", "Peito"],
  ["Crucifixo na máquina (peck deck)", "Peito"],
  ["Crossover", "Peito"],
  ["Chest press (máquina)", "Peito"],
  ["Flexão de braço", "Peito"],
  // Costas
  ["Puxada frontal", "Costas"],
  ["Puxada com triângulo", "Costas"],
  ["Barra fixa", "Costas"],
  ["Remada baixa", "Costas"],
  ["Remada curvada com barra", "Costas"],
  ["Remada unilateral com halter (serrote)", "Costas"],
  ["Remada cavalinho", "Costas"],
  ["Pulldown com corda", "Costas"],
  ["Levantamento terra", "Costas"],
  ["Hiperextensão lombar", "Costas"],
  // Ombros
  ["Elevação lateral", "Ombros"],
  ["Elevação frontal", "Ombros"],
  ["Desenvolvimento com halteres", "Ombros"],
  ["Desenvolvimento com barra", "Ombros"],
  ["Desenvolvimento na máquina", "Ombros"],
  ["Crucifixo invertido", "Ombros"],
  ["Face pull", "Ombros"],
  ["Encolhimento", "Ombros"],
  // Bíceps
  ["Rosca direta com barra", "Bíceps"],
  ["Rosca alternada com halteres", "Bíceps"],
  ["Rosca martelo", "Bíceps"],
  ["Rosca Scott", "Bíceps"],
  ["Rosca concentrada", "Bíceps"],
  ["Rosca no cabo", "Bíceps"],
  // Tríceps
  ["Tríceps pulley (barra)", "Tríceps"],
  ["Tríceps corda", "Tríceps"],
  ["Tríceps testa", "Tríceps"],
  ["Tríceps francês", "Tríceps"],
  ["Mergulho (paralelas)", "Tríceps"],
  ["Supino fechado", "Tríceps"],
  // Pernas
  ["Agachamento livre", "Pernas"],
  ["Agachamento no Smith", "Pernas"],
  ["Agachamento búlgaro", "Pernas"],
  ["Hack squat", "Pernas"],
  ["Leg press 45°", "Pernas"],
  ["Cadeira extensora", "Pernas"],
  ["Mesa flexora", "Pernas"],
  ["Cadeira flexora", "Pernas"],
  ["Stiff", "Pernas"],
  ["Afundo", "Pernas"],
  ["Cadeira adutora", "Pernas"],
  // Glúteos
  ["Elevação pélvica (hip thrust)", "Glúteos"],
  ["Cadeira abdutora", "Glúteos"],
  ["Glúteo no cabo (coice)", "Glúteos"],
  // Panturrilha
  ["Panturrilha em pé", "Panturrilha"],
  ["Panturrilha sentado", "Panturrilha"],
  ["Panturrilha no leg press", "Panturrilha"],
  // Abdômen
  ["Abdominal supra", "Abdômen"],
  ["Abdominal infra", "Abdômen"],
  ["Prancha", "Abdômen"],
  ["Abdominal na polia", "Abdômen"],
  // Cardio
  ["Esteira (caminhada)", "Cardio"],
  ["Esteira (corrida)", "Cardio"],
  ["Caminhada inclinada na esteira", "Cardio"],
  ["Bicicleta ergométrica", "Cardio"],
  ["Bike spinning", "Cardio"],
  ["Elíptico (transport)", "Cardio"],
  ["Escada (simulador)", "Cardio"],
  ["Remo ergômetro", "Cardio"],
  ["Pular corda", "Cardio"],
  ["Burpee", "Cardio"],
  ["Polichinelo", "Cardio"],
  ["Corrida ao ar livre", "Cardio"],
];

function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Exercícios principais (ids estáveis, usados nos registros já salvos). */
const PRINCIPAIS: ExercicioCatalogo[] = base.map(([nome, grupo]) => {
  const id = slug(nome);
  const extra = EXTRA_PRINCIPAIS[id];
  return {
    id,
    nome,
    grupo,
    principal: true,
    ...(extra ? { gif: extra[0], equipamento: extra[1], nomeEn: extra[2] } : {}),
  };
});

/** Biblioteca completa de exercícios com GIF (ids "exdb-<gif>"). */
const BIBLIOTECA_CATALOGO: ExercicioCatalogo[] = BIBLIOTECA.map(([gif, nome, grupo, equipamento, nomeEn]) => ({
  id: `exdb-${gif}`,
  nome,
  grupo,
  equipamento,
  gif,
  nomeEn,
}));

export const CATALOGO_PADRAO: ExercicioCatalogo[] = [...PRINCIPAIS, ...BIBLIOTECA_CATALOGO];

const GIF_POR_EXERCICIO = new Map(CATALOGO_PADRAO.filter((e) => e.gif).map((e) => [e.id, e.gif as string]));

/** Id do GIF do exercício (ou null para exercícios sem GIF, como os cadastrados por você). */
export function gifIdDoExercicio(exercicioId: string): string | null {
  return GIF_POR_EXERCICIO.get(exercicioId) ?? null;
}

export function tipoDoGrupo(grupo: GrupoMuscular) {
  return grupo === "Cardio" ? ("cardio" as const) : ("forca" as const);
}

/** Normaliza para busca sem acentos e sem maiúsculas. */
export function normalizar(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
