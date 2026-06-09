export type Sex = "masculino" | "feminino";

export type ActivityLevel =
  | "sedentario"
  | "leve"
  | "moderado"
  | "ativo"
  | "muito_ativo";

export interface UserProfile {
  nome: string;
  peso: number; // kg
  altura: number; // cm
  idade: number;
  sexo: Sex;
  nivelAtividade: ActivityLevel;
  objetivo: "emagrecer" | "manter" | "ganhar_massa";
}

export interface Exercise {
  id: string;
  nome: string;
  series: number;
  repeticoes: string; // ex: "8-12" ou "10"
  carga?: string; // ex: "20kg" ou "peso corporal"
  descanso?: string; // ex: "60s"
  observacoes?: string;
}

export interface Workout {
  id: string;
  nome: string; // ex: "Treino A - Peito/Tríceps"
  descricao?: string;
  exercicios: Exercise[];
  criadoEm: string;
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  data: string; // ISO date string
  concluido: boolean;
  observacoes?: string;
}

export interface Alimento {
  id: string;
  nome: string;
  calorias: number; // por 100g ou por unidade
  proteinas: number; // gramas
  carboidratos: number; // gramas
  gorduras: number; // gramas
  porcao: number; // gramas ou unidade
  unidade: "g" | "ml" | "unidade";
}

export interface RefeicaoItem {
  alimentoId: string;
  quantidade: number;
  nomeAlimento: string;
  caloriasTotais: number;
  proteinasTotais: number;
  carboidratosTotais: number;
  gordurasTotais: number;
}

export interface Refeicao {
  id: string;
  tipo: "cafe_manha" | "lanche_manha" | "almoco" | "lanche_tarde" | "jantar" | "ceia";
  itens: RefeicaoItem[];
  data: string; // ISO date string
}

export interface AppData {
  perfil: UserProfile | null;
  treinos: Workout[];
  treinosLog: WorkoutLog[];
  alimentos: Alimento[];
  refeicoes: Refeicao[];
}
