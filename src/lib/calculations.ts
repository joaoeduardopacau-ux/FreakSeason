import type { UserProfile, ActivityLevel } from "@/types";

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  leve: 1.375,
  moderado: 1.55,
  ativo: 1.725,
  muito_ativo: 1.9,
};

// Mifflin-St Jeor
export function calcularTMB(perfil: UserProfile): number {
  const { peso, altura, idade, sexo } = perfil;
  if (sexo === "masculino") {
    return 10 * peso + 6.25 * altura - 5 * idade + 5;
  }
  return 10 * peso + 6.25 * altura - 5 * idade - 161;
}

export function calcularTDEE(perfil: UserProfile): number {
  return calcularTMB(perfil) * activityMultipliers[perfil.nivelAtividade];
}

export function calcularMetasCalorias(perfil: UserProfile): {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
} {
  const tdee = calcularTDEE(perfil);
  let calorias = tdee;

  if (perfil.objetivo === "emagrecer") calorias = tdee - 500;
  if (perfil.objetivo === "ganhar_massa") calorias = tdee + 300;

  // Distribuição macro: 30% proteína, 40% carbo, 30% gordura
  const proteinas = Math.round((calorias * 0.3) / 4);
  const carboidratos = Math.round((calorias * 0.4) / 4);
  const gorduras = Math.round((calorias * 0.3) / 9);

  return {
    calorias: Math.round(calorias),
    proteinas,
    carboidratos,
    gorduras,
  };
}

export function calcularIMC(peso: number, altura: number): {
  imc: number;
  classificacao: string;
} {
  const alturaM = altura / 100;
  const imc = peso / (alturaM * alturaM);
  let classificacao = "";

  if (imc < 18.5) classificacao = "Abaixo do peso";
  else if (imc < 25) classificacao = "Peso normal";
  else if (imc < 30) classificacao = "Sobrepeso";
  else if (imc < 35) classificacao = "Obesidade grau I";
  else if (imc < 40) classificacao = "Obesidade grau II";
  else classificacao = "Obesidade grau III";

  return { imc: Math.round(imc * 10) / 10, classificacao };
}

export const activityLabels: Record<ActivityLevel, string> = {
  sedentario: "Sedentário (sem exercícios)",
  leve: "Leve (1-3x/semana)",
  moderado: "Moderado (3-5x/semana)",
  ativo: "Ativo (6-7x/semana)",
  muito_ativo: "Muito ativo (2x/dia)",
};
