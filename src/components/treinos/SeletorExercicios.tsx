"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DadosTreinos, Equipamento, ExercicioCatalogo, GrupoMuscular } from "@/lib/treinos/types";
import { EQUIPAMENTOS, GRUPOS, normalizar } from "@/lib/treinos/catalogo";
import { cadastrarExercicio, catalogoCompleto } from "@/lib/treinos/store";
import { IconeBusca, IconeCheck, IconeMais } from "./Icones";
import { Sheet } from "./Sheet";
import { MiniGif } from "./Gif";

export function SeletorExercicios({
  dados,
  jaNoTreino,
  onAdicionar,
  onFechar,
}: {
  dados: DadosTreinos;
  jaNoTreino: Set<string>;
  onAdicionar: (itens: ExercicioCatalogo[]) => void;
  onFechar: () => void;
}) {
  const [busca, setBusca] = useState("");
  const [grupo, setGrupo] = useState<GrupoMuscular | "Todos">("Todos");
  const [equip, setEquip] = useState<Equipamento | "Todos">("Todos");
  const [selecionados, setSelecionados] = useState<ExercicioCatalogo[]>([]);
  const [cadastrando, setCadastrando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoGrupo, setNovoGrupo] = useState<GrupoMuscular>("Peito");

  const catalogo = useMemo(() => catalogoCompleto(dados), [dados]);
  const filtrados = useMemo(() => {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    return catalogo.filter((e) => {
      if (grupo !== "Todos" && e.grupo !== grupo) return false;
      if (equip !== "Todos" && e.equipamento !== equip) return false;
      if (termos.length === 0) return true;
      const texto = normalizar(e.nome + " " + (e.nomeEn ?? ""));
      return termos.every((t) => texto.includes(t));
    });
  }, [catalogo, busca, grupo, equip]);

  // Renderiza aos poucos: a biblioteca tem mais de 1.300 exercícios.
  const POR_VEZ = 80; // cobre todos os exercícios principais na primeira tela
  const assinatura = `${busca}|${grupo}|${equip}`;
  const [limite, setLimite] = useState({ chave: assinatura, n: POR_VEZ });
  const visiveis = limite.chave === assinatura ? limite.n : POR_VEZ;
  const mostrarMais = () => setLimite({ chave: assinatura, n: visiveis + POR_VEZ });
  const sentinela = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinela.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (es) => {
        if (es.some((x) => x.isIntersecting)) setLimite((l) => ({ chave: assinatura, n: (l.chave === assinatura ? l.n : POR_VEZ) + POR_VEZ }));
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [assinatura, visiveis]);

  const idsSel = new Set(selecionados.map((s) => s.id));

  function alternar(e: ExercicioCatalogo) {
    setSelecionados((s) => (idsSel.has(e.id) ? s.filter((x) => x.id !== e.id) : [...s, e]));
  }

  function abrirCadastro() {
    setNovoNome(busca.trim());
    setNovoGrupo(grupo === "Todos" ? "Peito" : grupo);
    setCadastrando(true);
  }

  function salvarCadastro() {
    if (!novoNome.trim()) return;
    const ex = cadastrarExercicio(novoNome, novoGrupo);
    setSelecionados((s) => (s.some((x) => x.id === ex.id) ? s : [...s, ex]));
    setBusca("");
    setGrupo("Todos");
    setCadastrando(false);
  }

  if (cadastrando) {
    return (
      <Sheet
        titulo="Cadastrar exercício"
        onFechar={() => setCadastrando(false)}
        rodape={
          <div style={{ display: "flex", gap: 10 }}>
            <button className="tr-btn" style={{ flex: 1 }} onClick={() => setCadastrando(false)}>
              Voltar
            </button>
            <button className="tr-btn tr-btn-primary" style={{ flex: 2 }} disabled={!novoNome.trim()} onClick={salvarCadastro}>
              Salvar e selecionar
            </button>
          </div>
        }
      >
        <p className="tr-note">O exercício fica salvo na sua lista para usar nos próximos treinos.</p>
        <label className="tr-field-label" htmlFor="novo-nome">
          Nome do exercício
        </label>
        <input
          id="novo-nome"
          className="tr-input"
          value={novoNome}
          autoFocus
          enterKeyHint="done"
          placeholder="Ex.: Remada articulada"
          onChange={(e) => setNovoNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && salvarCadastro()}
        />
        <span className="tr-field-label">Grupo muscular</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {GRUPOS.map((g) => (
            <button key={g} className="tr-chip" aria-pressed={novoGrupo === g} onClick={() => setNovoGrupo(g)}>
              {g}
            </button>
          ))}
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      titulo="Adicionar exercícios"
      cheia
      onFechar={onFechar}
      rodape={
        <button
          className="tr-btn tr-btn-primary tr-btn-block tr-btn-lg"
          disabled={selecionados.length === 0}
          onClick={() => onAdicionar(selecionados)}
        >
          {selecionados.length === 0
            ? "Selecione os exercícios"
            : `Adicionar ${selecionados.length} ${selecionados.length === 1 ? "exercício" : "exercícios"}`}
        </button>
      }
    >
      <div style={{ position: "sticky", top: 0, background: "var(--s1)", zIndex: 2, paddingBottom: 4 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 13, top: 14, color: "var(--text2)" }}>
            <IconeBusca size={20} />
          </span>
          <input
            className="tr-search"
            type="search"
            placeholder="Buscar por nome"
            value={busca}
            enterKeyHint="search"
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar exercício por nome"
          />
        </div>
        <div className="tr-chips" role="group" aria-label="Filtrar por grupo muscular">
          {(["Todos", ...GRUPOS] as const).map((g) => (
            <button key={g} className="tr-chip" aria-pressed={grupo === g} onClick={() => setGrupo(g)}>
              {g}
            </button>
          ))}
        </div>
        <div className="tr-chips" role="group" aria-label="Filtrar por equipamento">
          {(["Todos", ...EQUIPAMENTOS] as const).map((q) => (
            <button key={q} className="tr-chip equip" aria-pressed={equip === q} onClick={() => setEquip(q)}>
              {q === "Todos" ? "Todo equipamento" : q}
            </button>
          ))}
        </div>
        <div className="tr-lista-info" role="status">
          {filtrados.length === 1 ? "1 exercício" : `${filtrados.length.toLocaleString("pt-BR")} exercícios`}
          {selecionados.length > 0 && ` · ${selecionados.length} selecionado${selecionados.length === 1 ? "" : "s"}`}
        </div>
      </div>

      {filtrados.slice(0, visiveis).map((e) => (
        <button key={e.id} className="tr-ex-item" aria-pressed={idsSel.has(e.id)} onClick={() => alternar(e)}>
          <span className="tr-box">
            <IconeCheck size={18} />
          </span>
          <MiniGif exercicioId={e.id} tamanho={48} />
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 16, fontWeight: 600 }}>{e.nome}</span>
            <span style={{ display: "block", fontSize: 13, color: "var(--text2)", marginTop: 2 }}>
              {e.grupo}
              {e.equipamento ? ` · ${e.equipamento}` : ""}
              {e.personalizado ? " · cadastrado por você" : ""}
              {jaNoTreino.has(e.id) ? " · já está no treino" : ""}
            </span>
          </span>
        </button>
      ))}

      {visiveis < filtrados.length && (
        <div ref={sentinela}>
          <button className="tr-btn tr-btn-block" style={{ marginTop: 12 }} onClick={mostrarMais}>
            Mostrar mais ({(filtrados.length - visiveis).toLocaleString("pt-BR")} restantes)
          </button>
        </div>
      )}

      {filtrados.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--text2)", padding: "28px 0 8px", fontSize: 15 }}>
          Nenhum exercício encontrado{busca ? ` para “${busca}”` : ""}.
        </p>
      )}

      <button className="tr-btn tr-btn-ghost tr-btn-block" style={{ marginTop: 16, borderStyle: "dashed" }} onClick={abrirCadastro}>
        <IconeMais size={20} />
        {busca.trim() ? `Cadastrar “${busca.trim()}”` : "Cadastrar novo exercício"}
      </button>
    </Sheet>
  );
}
