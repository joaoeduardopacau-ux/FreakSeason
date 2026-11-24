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
  | "Cardio"
  | "Outro";

/** Força: linhas de carga (kg) × repetições. Cardio: linhas de minutos × intensidade. */
export type TipoExercicio = "forca" | "cardio";

export type TecnicaId =
  | "tradicional"
  | "piramide_crescente"
  | "piramide_decrescente"
  | "progressao_carga"
  | "fst7"
  | "drop_set"
  | "rest_pause"
  | "bi_set"
  | "gvt"
  | "cardio_continuo"
  | "cardio_hiit";

export interface ExercicioCatalogo {
  id: string;
  nome: string;
  grupo: GrupoMuscular;
  personalizado?: boolean;
}

/**
 * Uma série do treino. Em exercícios de cardio, `carga` guarda os minutos e
 * `reps` a intensidade (velocidade, nível ou inclinação).
 * Toda série criada é "planejada"; ela só conta como
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
  tipo?: TipoExercicio; // ausente = força (registros antigos)
  tecnica?: TecnicaId;
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
  planoDe?: number; // dia da semana (0 = domingo) do plano usado para montar o treino
  titulo?: string; // título do plano usado, ex.: "Peito e tríceps"
}

/** Meta de uma série no plano semanal. Em cardio: carga = minutos, reps = intensidade. */
export interface SeriePlano {
  id: string;
  carga: string;
  reps: string;
}

export interface ItemPlano {
  id: string;
  exercicioId: string;
  nome: string;
  grupo: GrupoMuscular;
  tipo: TipoExercicio;
  tecnica: TecnicaId;
  series: SeriePlano[];
  observacoes: string;
}

export interface DiaPlano {
  titulo: string;
  itens: ItemPlano[];
}

/** Chave = dia da semana como em Date.getDay(): "0" domingo … "6" sábado. */
export type PlanoSemanal = Record<string, DiaPlano>;

export interface DadosTreinos {
  versao: 1;
  catalogo: ExercicioCatalogo[];
  treinos: Record<string, TreinoDoDia>;
  plano: PlanoSemanal;
}
