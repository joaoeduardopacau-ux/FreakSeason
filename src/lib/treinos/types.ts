export type GrupoMuscular =
  | "Peito"
  | "Costas"
  | "Ombros"
  | "Bíceps"
  | "Tríceps"
  | "Antebraço"
  | "Pernas"
  | "Glúteos"
  | "Panturrilha"
  | "Abdômen"
  | "Cardio"
  | "Alongamento"
  | "Outro";

export type Equipamento =
  | "Halteres"
  | "Barra"
  | "Cabo"
  | "Máquina"
  | "Smith"
  | "Peso corporal"
  | "Kettlebell"
  | "Elástico"
  | "Outros";

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
  principal?: boolean; // exercícios mais comuns, aparecem primeiro na lista
  equipamento?: Equipamento;
  gif?: string; // id do GIF (arquivo public/gifs/<gif>.gif)
  nomeEn?: string; // nome original em inglês, usado na busca
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
  planoDe?: number; // (antigo) dia da semana do plano usado
  fichaId?: string; // ficha usada para montar o treino
  titulo?: string; // nome da ficha usada, ex.: "Treino A · Peito e tríceps"
}

/** Meta de uma série na ficha. Em cardio: carga = minutos, reps = intensidade. */
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

/** Ficha de treino com nome livre (Treino A, B, C…), sem dia fixo da semana. */
export interface Ficha {
  id: string;
  nome: string; // "Treino A"
  descricao: string; // "Peito e tríceps"
  itens: ItemPlano[];
  criadoEm: string;
}

export interface DadosTreinos {
  versao: 1;
  catalogo: ExercicioCatalogo[];
  treinos: Record<string, TreinoDoDia>;
  fichas: Ficha[];
}
