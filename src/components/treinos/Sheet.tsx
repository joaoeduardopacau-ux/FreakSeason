"use client";

import { useEffect } from "react";
import { IconeX } from "./Icones";

function useTravarRolagem() {
  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = antes;
    };
  }, []);
}

export function Sheet({
  titulo,
  onFechar,
  children,
  rodape,
  cheia,
}: {
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
  rodape?: React.ReactNode;
  cheia?: boolean;
}) {
  useTravarRolagem();
  return (
    <div className="tr-overlay" onClick={onFechar} role="presentation">
      <div
        className={"tr-sheet" + (cheia ? " tr-sheet-full" : "")}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tr-sheet-head">
          <div className="tr-sheet-title">{titulo}</div>
          <button className="tr-icon-btn" onClick={onFechar} aria-label="Fechar">
            <IconeX />
          </button>
        </div>
        <div className="tr-sheet-body">{children}</div>
        {rodape && <div className="tr-sheet-foot">{rodape}</div>}
      </div>
    </div>
  );
}

export function Confirmacao({
  titulo,
  texto,
  confirmar,
  perigo,
  onConfirmar,
  onCancelar,
}: {
  titulo: string;
  texto: React.ReactNode;
  confirmar: string;
  perigo?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  useTravarRolagem();
  return (
    <div className="tr-overlay" style={{ alignItems: "center", zIndex: 110 }} onClick={onCancelar} role="presentation">
      <div className="tr-dialog" role="alertdialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 8 }}>{titulo}</div>
        <div style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.45, marginBottom: 20 }}>{texto}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="tr-btn" style={{ flex: 1 }} onClick={onCancelar}>
            Cancelar
          </button>
          <button
            className={"tr-btn " + (perigo ? "tr-btn-danger" : "tr-btn-primary")}
            style={{ flex: 1 }}
            onClick={onConfirmar}
          >
            {confirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
