type P = { size?: number };

function Svg({ size = 22, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconeEsquerda = (p: P) => <Svg {...p}><polyline points="15 18 9 12 15 6" /></Svg>;
export const IconeDireita = (p: P) => <Svg {...p}><polyline points="9 18 15 12 9 6" /></Svg>;
export const IconeCima = (p: P) => <Svg {...p}><polyline points="18 15 12 9 6 15" /></Svg>;
export const IconeBaixo = (p: P) => <Svg {...p}><polyline points="6 9 12 15 18 9" /></Svg>;
export const IconeCheck = (p: P) => <Svg {...p}><polyline points="20 6 9 17 4 12" /></Svg>;
export const IconeX = (p: P) => <Svg {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Svg>;
export const IconeMais = (p: P) => <Svg {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Svg>;
export const IconeMenos = (p: P) => <Svg {...p}><line x1="5" y1="12" x2="19" y2="12" /></Svg>;
export const IconeLixo = (p: P) => (
  <Svg {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </Svg>
);
export const IconeCalendario = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
);
export const IconeCopiar = (p: P) => (
  <Svg {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Svg>
);
export const IconeBusca = (p: P) => <Svg {...p}><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Svg>;
export const IconeCelular = (p: P) => (
  <Svg {...p}><rect x="6" y="2" width="12" height="20" rx="2" /><line x1="11" y1="18" x2="13" y2="18" /></Svg>
);
export const IconeHalter = (p: P) => (
  <Svg {...p}>
    <path d="M6 4v16M18 4v16M3 8h3M18 8h3M3 16h3M18 16h3" />
    <line x1="6" y1="12" x2="18" y2="12" />
  </Svg>
);
export const IconeRelogio = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></Svg>;
