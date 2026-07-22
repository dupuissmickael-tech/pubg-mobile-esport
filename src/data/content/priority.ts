export interface PriorityPhase {
  id: 'early' | 'mid' | 'late';
  label: string;
  timing: string;
  summary: string;
  priorities: string[];
}

export const priorityIntro = `Dans une partie compétitive, aucune décision ne se prend "au feeling" : chaque choix (où dropper, quand bouger, quand engager) répond à une hiérarchie de priorités. Cette hiérarchie n'est pas fixe — elle change radicalement selon la phase de la partie. Une équipe qui applique les priorités du early game en fin de partie perd presque toujours, et inversement.`;

export const priorityPhases: PriorityPhase[] = [
  {
    id: 'early',
    label: 'Early game',
    timing: 'Du drop à la 2ᵉ-3ᵉ zone',
    summary:
      "L'objectif n'est pas encore de tuer à tout prix : c'est de sortir de cette phase avec du matériel complet et de l'information sur les squads voisines, sans prendre de risque inutile.",
    priorities: [
      'Loot complet (arme principale + secondaire, munitions, soin) avant tout engagement non nécessaire',
      "Contrôle de la zone de drop : savoir combien de squads sont autour, pas juste looter dans son coin",
      'Information : écouter les fights lointains, repérer les véhicules qui passent, anticiper les squads qui vont rotate tôt',
      "Éviter les fights à 50/50 sans avantage clair — un fight non nécessaire en early peut coûter toute la partie"
    ]
  },
  {
    id: 'mid',
    label: 'Mid game',
    timing: 'De la 3ᵉ à la 6ᵉ-7ᵉ zone',
    summary:
      "La priorité bascule vers le positionnement. Le nombre de squads diminue, la zone se resserre, et la question centrale devient : d'où va-t-on défendre la prochaine zone, pas juste où looter.",
    priorities: [
      'Rotation anticipée : partir avant que la zone bleue ne force un passage à découvert',
      'Prise de position avant les autres squads plutôt que d\'arriver en dernier sur un point haut déjà tenu',
      'Kills sécurisés uniquement : un ennemi isolé, visible, sans risque de contre par une 3ᵉ squad',
      "Gestion des ressources : garder des grenades/fumigènes pour la fin plutôt que de tout consommer"
    ]
  },
  {
    id: 'late',
    label: 'Late game',
    timing: 'Zone finale, 3-4 squads restantes',
    summary:
      'La priorité dépend du format de classement du tournoi : maximiser les points de placement (survivre) ou les points de kill (engager) ne demande pas la même approche, et une équipe doit savoir laquelle elle applique avant même que la zone finale commence.',
    priorities: [
      'Connaître son objectif de classement : besoin de points de placement (jouer prudent) vs besoin de points de kill (jouer agressif)',
      'Zone finale : privilégier une position qui couvre le centre du prochain cercle plutôt que sa périphérie',
      "Gestion du bruit : chaque tir informe les autres squads de sa position — tirer seulement quand c'est nécessaire",
      'Discipline de zone : mourir dans le bleu pour un kill non nécessaire est l\'erreur la plus commune en fin de partie'
    ]
  }
];
