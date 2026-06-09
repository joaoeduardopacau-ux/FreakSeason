import type { AppData } from "@/types";

const STORAGE_KEY = "freakseason_data";

const defaultData: AppData = {
  perfil: null,
  treinos: [],
  treinosLog: [],
  alimentos: [
    {
      id: "1",
      nome: "Frango grelhado",
      calorias: 165,
      proteinas: 31,
      carboidratos: 0,
      gorduras: 3.6,
      porcao: 100,
      unidade: "g",
    },
    {
      id: "2",
      nome: "Arroz branco cozido",
      calorias: 130,
      proteinas: 2.7,
      carboidratos: 28,
      gorduras: 0.3,
      porcao: 100,
      unidade: "g",
    },
    {
      id: "3",
      nome: "Ovo inteiro",
      calorias: 70,
      proteinas: 6,
      carboidratos: 0.5,
      gorduras: 5,
      porcao: 50,
      unidade: "g",
    },
    {
      id: "4",
      nome: "Batata doce cozida",
      calorias: 86,
      proteinas: 1.6,
      carboidratos: 20,
      gorduras: 0.1,
      porcao: 100,
      unidade: "g",
    },
    {
      id: "5",
      nome: "Feijão preto cozido",
      calorias: 132,
      proteinas: 8.9,
      carboidratos: 23,
      gorduras: 0.5,
      porcao: 100,
      unidade: "g",
    },
    {
      id: "6",
      nome: "Banana",
      calorias: 89,
      proteinas: 1.1,
      carboidratos: 23,
      gorduras: 0.3,
      porcao: 100,
      unidade: "g",
    },
    {
      id: "7",
      nome: "Whey Protein (dose)",
      calorias: 120,
      proteinas: 24,
      carboidratos: 3,
      gorduras: 1.5,
      porcao: 30,
      unidade: "g",
    },
    {
      id: "8",
      nome: "Aveia",
      calorias: 389,
      proteinas: 17,
      carboidratos: 66,
      gorduras: 7,
      porcao: 100,
      unidade: "g",
    },
    {
      id: "9",
      nome: "Leite desnatado",
      calorias: 34,
      proteinas: 3.4,
      carboidratos: 5,
      gorduras: 0.1,
      porcao: 100,
      unidade: "ml",
    },
    {
      id: "10",
      nome: "Azeite de oliva",
      calorias: 884,
      proteinas: 0,
      carboidratos: 0,
      gorduras: 100,
      porcao: 100,
      unidade: "ml",
    },
  ],
  refeicoes: [],
};

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      perfil: parsed.perfil ?? null,
      treinos: parsed.treinos ?? [],
      treinosLog: parsed.treinosLog ?? [],
      alimentos: parsed.alimentos ?? defaultData.alimentos,
      refeicoes: parsed.refeicoes ?? [],
    };
  } catch {
    return { ...defaultData };
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
