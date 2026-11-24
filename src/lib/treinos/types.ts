export type GrupoMuscular =
  | "Peito"
  | "Costas"
  | "Ombros"
  | "Bíceps"
  | "Tríceps"
  | "Pernas"
  | "Glúteos"
  | "Panturrilha"
  | "Abdômen"
  | "Outro";

export interface ExercicioCatalogo {
  id: string;
  nome: string;
  grupo: GrupoMuscular;
  personalizado?: boolean;
}

/**
 * Uma série do treino. Toda série criada é "planejada"; ela só conta como
 * realizada quando `feita` é true. Assim o registro guarda a diferença entre
 * o que foi planejado e o que foi realmente feito.
 */
export interface Serie {
  id: string;
  carga: string; // kg, texto para aceitar vírgula ("22,5")
  reps: string;
  feita: boolean;
}

export interface ExercicioDoTreino {
  id: string; // id da instância dentro do treino
  exercicioId: string; // id no catálogo
  nome: string;
  grupo: GrupoMuscular;
  series: Serie[];
  observacoes: string;
}

export type StatusTreino = "em_andamento" | "concluido";

export interface TreinoDoDia {
  data: string; // YYYY-MM-DD (data local)
  status: StatusTreino;
  exercicios: ExercicioDoTreino[];
  criadoEm: string;
  atualizadoEm: string;
  concluidoEm?: string;
  copiadoDe?: string; // data de origem, quando foi copiado
}

export interface DadosTreinos {
  versao: 1;
  catalogo: ExercicioCatalogo[];
  treinos: Record<string, TreinoDoDia>;
}
