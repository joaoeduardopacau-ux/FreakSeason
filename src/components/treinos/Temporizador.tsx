"use client";

import { useEffect, useRef, useState } from "react";
import {
  ajustarDescanso,
  alternarSom,
  bipe,
  marcarTermino,
  pararTemporizador,
  pausarOuContinuar,
  situacaoIntervalo,
  useSomLigado,
  useTemporizador,
  vibrar,
} from "@/lib/treinos/temporizador";
import { formatarRelogio } from "@/lib/treinos/tecnicas";
import { IconeX } from "./Icones";

function IconeSom({ ligado }: { ligado: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
      {ligado ? (
        <>
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </>
      ) : (
        <>
          <line x1="16" y1="9" x2="22" y2="15" />
          <line x1="22" y1="9" x2="16" y2="15" />
        </>
      )}
    </svg>
  );
}

/** Barra flutuante do temporizador (descanso entre séries e intervalos de cardio). */
export default function Temporizador() {
  const estado = useTemporizador();
  const somLigado = useSomLigado();
  const [relogio, setRelogio] = useState(() => Date.now());
  const ultimoAviso = useRef<string>("");

  useEffect(() => {
    if (!estado) return;
    const tique = () => setRelogio(Date.now());
    const primeiro = setTimeout(tique, 0);
    const id = setInterval(tique, 200);
    return () => {
      clearTimeout(primeiro);
      clearInterval(id);
    };
  }, [estado]);

  // o relógio nunca fica atrás da última ação (evita mostrar segundos a mais no primeiro quadro)
  const agora = estado ? Math.max(relogio, estado.criadoEm ?? 0) : relogio;

  // avisos sonoros e fim do temporizador
  useEffect(() => {
    if (!estado) return;
    const aviso = (chave: string, f: () => void) => {
      if (ultimoAviso.current === chave) return;
      ultimoAviso.current = chave;
      f();
    };
    if (estado.tipo === "descanso") {
      if (estado.terminouEm) {
        if (agora - estado.terminouEm > 5000) pararTemporizador();
        return;
      }
      const r = Math.ceil((estado.fim - agora) / 1000);
      if (r <= 0) {
        aviso("fim", () => {
          bipe(880, 0.35, 0.35);
          setTimeout(() => bipe(1175, 0.5, 0.35), 380);
          vibrar([300, 120, 300]);
          marcarTermino();
        });
      } else if (r <= 3) {
        aviso(`r${r}`, () => bipe(660, 0.12));
      }
      return;
    }
    // intervalos
    if (estado.terminouEm) {
      if (agora - estado.terminouEm > 6000) pararTemporizador();
      return;
    }
    if (estado.pausadoEm) return;
    const s = situacaoIntervalo(estado, agora);
    if (s.fase === "fim") {
      aviso("fim", () => {
        bipe(880, 0.3, 0.35);
        setTimeout(() => bipe(1175, 0.6, 0.35), 350);
        vibrar([300, 120, 300]);
        marcarTermino();
      });
      return;
    }
    const r = Math.ceil(s.restante);
    if (r === Math.ceil(s.duracaoFase) && s.fase !== "preparar") {
      aviso(`${s.fase}${s.rodada}-inicio`, () => {
        if (s.fase === "trabalho") {
          bipe(1046, 0.4, 0.35);
          vibrar(250);
        } else {
          bipe(523, 0.4, 0.3);
          vibrar([80, 60, 80]);
        }
      });
    } else if (r <= 3 && r >= 1) {
      aviso(`${s.fase}${s.rodada}-${r}`, () => bipe(660, 0.1));
    }
  }, [estado, agora]);

  if (!estado) return null;

  const fechar = (
    <button className="tr-timer-fechar" onClick={pararTemporizador} aria-label="Fechar temporizador">
      <IconeX size={18} />
    </button>
  );
  const botaoSom = (
    <button className="tr-timer-fechar" onClick={alternarSom} aria-label={somLigado ? "Desligar som" : "Ligar som"} aria-pressed={somLigado}>
      <IconeSom ligado={somLigado} />
    </button>
  );

  if (estado.tipo === "descanso") {
    const restante = Math.max(0, (estado.fim - agora) / 1000);
    const terminou = !!estado.terminouEm || restante <= 0;
    const progresso = terminou ? 1 : 1 - restante / estado.total;
    return (
      <div className={"tr-timer" + (terminou ? " fim" : "")} role="timer" aria-live="polite" aria-label="Temporizador de descanso">
        <div className="tr-timer-topo">
          <span className="tr-timer-rotulo">{estado.rotulo}</span>
          {botaoSom}
          {fechar}
        </div>
        <div className="tr-timer-linha">
          <div className="tr-timer-tempo">{terminou ? "Bora!" : formatarRelogio(restante)}</div>
          {terminou ? (
            <span className="tr-timer-msg">Descanso terminado. Próxima série!</span>
          ) : (
            <div className="tr-timer-botoes">
              <button className="tr-timer-btn" onClick={() => ajustarDescanso(-15)} aria-label="Menos 15 segundos">
                −15
              </button>
              <button className="tr-timer-btn" onClick={() => ajustarDescanso(15)} aria-label="Mais 15 segundos">
                +15
              </button>
              <button className="tr-timer-btn forte" onClick={pararTemporizador}>
                Pular
              </button>
            </div>
          )}
        </div>
        <div className="tr-timer-barra">
          <span style={{ width: `${Math.min(100, progresso * 100)}%` }} />
        </div>
      </div>
    );
  }

  const s = situacaoIntervalo(estado, agora);
  const terminou = !!estado.terminouEm || s.fase === "fim";
  const rotuloFase = terminou ? "Concluído" : s.fase === "preparar" ? "Prepare-se" : s.fase === "trabalho" ? "Forte" : "Recupera";
  const progresso = terminou ? 1 : 1 - s.restante / s.duracaoFase;
  return (
    <div className={`tr-timer intervalo ${terminou ? "fim" : s.fase}`} role="timer" aria-live="polite" aria-label="Temporizador de intervalos">
      <div className="tr-timer-topo">
        <span className="tr-timer-rotulo">{estado.rotulo}</span>
        {botaoSom}
        {fechar}
      </div>
      <div className="tr-timer-linha">
        <div>
          <div className="tr-timer-fase">
            {rotuloFase} · rodada {s.rodada}/{estado.rodadas}
          </div>
          <div className="tr-timer-tempo">{terminou ? "Feito!" : formatarRelogio(s.restante)}</div>
        </div>
        {!terminou && (
          <div className="tr-timer-botoes">
            <button className="tr-timer-btn forte" onClick={pausarOuContinuar}>
              {estado.pausadoEm ? "Continuar" : "Pausar"}
            </button>
            <button className="tr-timer-btn" onClick={pararTemporizador}>
              Parar
            </button>
          </div>
        )}
      </div>
      <div className="tr-timer-barra">
        <span style={{ width: `${Math.min(100, progresso * 100)}%` }} />
      </div>
    </div>
  );
}
