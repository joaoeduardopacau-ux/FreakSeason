import type { ExercicioCatalogo, GrupoMuscular } from "./types";

export const GRUPOS: GrupoMuscular[] = [
  "Peito",
  "Costas",
  "Ombros",
  "Bíceps",
  "Tríceps",
  "Pernas",
  "Glúteos",
  "Panturrilha",
  "Abdômen",
  "Cardio",
  "Outro",
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

export const CATALOGO_PADRAO: ExercicioCatalogo[] = base.map(([nome, grupo]) => ({
  id: slug(nome),
  nome,
  grupo,
}));

/** Exercícios do catálogo que têm GIF em public/gifs/<id>.gif. */
const COM_GIF = new Set<string>([
  "abdominal-infra",
  "abdominal-na-polia",
  "abdominal-supra",
  "afundo",
  "agachamento-bulgaro",
  "agachamento-livre",
  "agachamento-no-smith",
  "barra-fixa",
  "bicicleta-ergometrica",
  "bike-spinning",
  "burpee",
  "cadeira-abdutora",
  "cadeira-adutora",
  "cadeira-extensora",
  "cadeira-flexora",
  "caminhada-inclinada-na-esteira",
  "chest-press-maquina",
  "corrida-ao-ar-livre",
  "crossover",
  "crucifixo-com-halteres",
  "crucifixo-invertido",
  "crucifixo-na-maquina-peck-deck",
  "desenvolvimento-com-barra",
  "desenvolvimento-com-halteres",
  "desenvolvimento-na-maquina",
  "elevacao-frontal",
  "elevacao-lateral",
  "elevacao-pelvica-hip-thrust",
  "eliptico-transport",
  "encolhimento",
  "escada-simulador",
  "esteira-caminhada",
  "esteira-corrida",
  "face-pull",
  "flexao-de-braco",
  "gluteo-no-cabo-coice",
  "hack-squat",
  "hiperextensao-lombar",
  "leg-press-45",
  "levantamento-terra",
  "mergulho-paralelas",
  "mesa-flexora",
  "panturrilha-em-pe",
  "panturrilha-no-leg-press",
  "panturrilha-sentado",
  "polichinelo",
  "prancha",
  "pular-corda",
  "pulldown-com-corda",
  "puxada-com-triangulo",
  "puxada-frontal",
  "remada-baixa",
  "remada-cavalinho",
  "remada-curvada-com-barra",
  "remada-unilateral-com-halter-serrote",
  "rosca-alternada-com-halteres",
  "rosca-concentrada",
  "rosca-direta-com-barra",
  "rosca-martelo",
  "rosca-no-cabo",
  "rosca-scott",
  "stiff",
  "supino-declinado",
  "supino-fechado",
  "supino-inclinado-com-barra",
  "supino-inclinado-com-halteres",
  "supino-reto-com-barra",
  "supino-reto-com-halteres",
  "triceps-corda",
  "triceps-frances",
  "triceps-pulley-barra",
  "triceps-testa",
]);

// No app Next os GIFs ficam em /gifs/; a versão em arquivo único define outro caminho.
const BASE_GIF = process.env.NEXT_PUBLIC_GIF_BASE || "/gifs/";

/** URL do GIF demonstrativo do exercício, ou null se não houver. */
export function gifDoExercicio(exercicioId: string): string | null {
  return COM_GIF.has(exercicioId) ? `${BASE_GIF}${exercicioId}.gif` : null;
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
