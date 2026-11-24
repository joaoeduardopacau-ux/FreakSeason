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

/** Normaliza para busca sem acentos e sem maiúsculas. */
export function normalizar(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
