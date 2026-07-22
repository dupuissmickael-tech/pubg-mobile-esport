import type {CompoundPoint} from '@/components/three/CompoundScene';

export interface RoleInfo {
  id: string;
  name: string;
  subtitle: string;
  responsibilities: string[];
  equipment: string;
  position: string;
}

export const roles: RoleInfo[] = [
  {
    id: 'igl',
    name: 'IGL',
    subtitle: 'In-Game Leader',
    responsibilities: [
      "Décide des rotations : quand partir, par quel axe, à quel moment",
      "Lit la situation générale (nombre de squads restantes, zones de fights) et donne les appels d'engagement",
      "Gère le timing des ressources d'équipe (véhicules, fumigènes) plutôt que son propre score individuel"
    ],
    equipment: 'Matériel équilibré : un fusil d\'assaut fiable, priorité aux fumigènes et à l\'UAV/drone d\'information si disponible',
    position: 'Position centrale du compound, souvent en retrait, avec vue sur plusieurs angles pour garder la lecture globale de la situation'
  },
  {
    id: 'assaulter',
    name: 'Fragger / Assaut',
    subtitle: 'Ouvreur de duels',
    responsibilities: [
      "Prend les premiers engagements pour ouvrir un fight dans de bonnes conditions",
      "Rush les positions ennemies affaiblies pour finir un combat rapidement",
      'Absorbe les premiers échanges pour permettre au reste de la squad de repositionner'
    ],
    equipment: "Fusil d'assaut à cadence élevée, souvent avec un lance-grenades ou des frags en quantité pour déloger un ennemi retranché",
    position: 'Position avancée, la plus proche du point de contact — première ligne du compound côté ennemi identifié'
  },
  {
    id: 'support',
    name: 'Support',
    subtitle: "Réassort et couverture",
    responsibilities: [
      "Ramasse et redistribue le loot laissé par les ennemis abattus",
      "Couvre les côtés ou l'arrière pendant qu'un fight se déroule sur un autre angle",
      'Relance les coéquipiers tombés (down) en priorité sur la prise de kill'
    ],
    equipment: "Fusil polyvalent + kits de soin en quantité (bandages, medkits, boosts) pour toute l'équipe",
    position: 'Position flexible, souvent en retrait immédiat de l\'assaut, capable de couvrir deux angles à la fois'
  },
  {
    id: 'sniper',
    name: 'Sniper / Scout',
    subtitle: 'Information longue distance',
    responsibilities: [
      "Surveille les axes d'approche longue distance et prévient d'un flanc ennemi",
      "Sécurise des kills à distance sur des cibles isolées sans risque de contre rapproché",
      "Fournit de l'information sur les mouvements adverses même sans tirer"
    ],
    equipment: 'Fusil de précision (DMR ou sniper bolt-action) avec une lunette longue portée, garde une arme secondaire courte portée pour se défendre',
    position: 'Position haute, en retrait, avec une ligne de vue dégagée sur l\'approche la plus probable — jamais au contact direct'
  }
];

export const roleCompoundPoints: CompoundPoint[] = [
  {
    id: 'igl',
    position: [0.2, 0.6, -0.2],
    label: 'IGL',
    description: roles[0].position
  },
  {
    id: 'assaulter',
    position: [-3.2, 0.9, -2],
    label: 'Assaut',
    description: roles[1].position
  },
  {
    id: 'support',
    position: [-1, 0.5, 2.6],
    label: 'Support',
    description: roles[2].position
  },
  {
    id: 'sniper',
    position: [2.2, 2, -1.4],
    label: 'Sniper',
    description: roles[3].position
  }
];
