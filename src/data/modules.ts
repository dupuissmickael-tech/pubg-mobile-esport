export interface ModuleMeta {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  /** Whether this module counts toward the progress bar / prev-next flow. */
  trackProgress: boolean;
}

/**
 * Single source of truth for navigation, the home page grid, the progress
 * bar and the prev/next footer. Add a module here and it appears everywhere
 * consistently.
 */
export const modules: ModuleMeta[] = [
  {
    id: 'priority',
    slug: '/priorite',
    title: 'La priorité',
    shortTitle: 'Priorité',
    summary:
      "Le concept central du jeu compétitif : la hiérarchie de décisions qui change selon la phase de partie.",
    trackProgress: true
  },
  {
    id: 'roles',
    slug: '/roles',
    title: 'Les rôles dans une squad',
    shortTitle: 'Rôles',
    summary: 'IGL, Fragger, Support, Sniper : qui fait quoi, et où, dans un compound.',
    trackProgress: true
  },
  {
    id: 'split',
    slug: '/split',
    title: 'Le split',
    shortTitle: 'Split',
    summary: "Pourquoi et comment une équipe se divise volontairement pour prendre l'information.",
    trackProgress: true
  },
  {
    id: 'rotations',
    slug: '/rotations',
    title: 'Les rotations',
    shortTitle: 'Rotations',
    summary: 'Anticiper la zone, choisir un axe, gérer les véhicules et le timing.',
    trackProgress: true
  },
  {
    id: 'compound',
    slug: '/compound',
    title: 'Les positions dans un compound',
    shortTitle: 'Compound',
    summary: 'Position haute vs basse, angles morts, contrôle des entrées/sorties.',
    trackProgress: true
  },
  {
    id: 'micro-macro',
    slug: '/micro-macro',
    title: 'Micro vs Macro',
    shortTitle: 'Micro/Macro',
    summary: "Le duel dans l'instant, et la lecture de la partie dans son ensemble.",
    trackProgress: true
  },
  {
    id: 'plane-line',
    slug: '/ligne-avion',
    title: "La ligne d'avion",
    shortTitle: "Ligne d'avion",
    summary: 'Lire la trajectoire pour choisir un point de drop early ou safe.',
    trackProgress: true
  },
  {
    id: 'maps',
    slug: '/cartes',
    title: 'Les cartes',
    shortTitle: 'Cartes',
    summary: 'Erangel, Rondo, Miramar : les spécificités propres à chaque carte.',
    trackProgress: true
  }
];

export const comingSoon = {
  slug: '/a-venir',
  title: 'Prochains modules',
  summary: "D'autres modules arriveront bientôt : gestion du matériel, communication vocale, analyse de replay…"
};

export function getModuleById(id: string): ModuleMeta | undefined {
  return modules.find((m) => m.id === id);
}

export function getAdjacentModules(id: string): {
  prev: ModuleMeta | null;
  next: ModuleMeta | null;
} {
  const index = modules.findIndex((m) => m.id === id);
  if (index === -1) return {prev: null, next: null};
  return {
    prev: index > 0 ? modules[index - 1] : null,
    next: index < modules.length - 1 ? modules[index + 1] : null
  };
}
