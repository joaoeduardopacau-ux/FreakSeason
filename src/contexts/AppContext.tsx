"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AppData, UserProfile, Workout, WorkoutLog, Alimento, Refeicao } from "@/types";
import { loadData, saveData } from "@/lib/storage";

interface AppContextType {
  data: AppData;
  salvarPerfil: (perfil: UserProfile) => void;
  adicionarTreino: (treino: Workout) => void;
  atualizarTreino: (treino: Workout) => void;
  removerTreino: (id: string) => void;
  adicionarLogTreino: (log: WorkoutLog) => void;
  adicionarAlimento: (alimento: Alimento) => void;
  adicionarRefeicao: (refeicao: Refeicao) => void;
  removerRefeicao: (id: string) => void;
  getRefeicoesDia: (data: string) => Refeicao[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const salvarPerfil = useCallback((perfil: UserProfile) => {
    setData((d) => ({ ...d, perfil }));
  }, []);

  const adicionarTreino = useCallback((treino: Workout) => {
    setData((d) => ({ ...d, treinos: [...d.treinos, treino] }));
  }, []);

  const atualizarTreino = useCallback((treino: Workout) => {
    setData((d) => ({
      ...d,
      treinos: d.treinos.map((t) => (t.id === treino.id ? treino : t)),
    }));
  }, []);

  const removerTreino = useCallback((id: string) => {
    setData((d) => ({ ...d, treinos: d.treinos.filter((t) => t.id !== id) }));
  }, []);

  const adicionarLogTreino = useCallback((log: WorkoutLog) => {
    setData((d) => ({ ...d, treinosLog: [...d.treinosLog, log] }));
  }, []);

  const adicionarAlimento = useCallback((alimento: Alimento) => {
    setData((d) => ({ ...d, alimentos: [...d.alimentos, alimento] }));
  }, []);

  const adicionarRefeicao = useCallback((refeicao: Refeicao) => {
    setData((d) => ({ ...d, refeicoes: [...d.refeicoes, refeicao] }));
  }, []);

  const removerRefeicao = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      refeicoes: d.refeicoes.filter((r) => r.id !== id),
    }));
  }, []);

  const getRefeicoesDia = useCallback(
    (dataStr: string) => {
      return data.refeicoes.filter((r) => r.data.startsWith(dataStr));
    },
    [data.refeicoes]
  );

  return (
    <AppContext.Provider
      value={{
        data,
        salvarPerfil,
        adicionarTreino,
        atualizarTreino,
        removerTreino,
        adicionarLogTreino,
        adicionarAlimento,
        adicionarRefeicao,
        removerRefeicao,
        getRefeicoesDia,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
