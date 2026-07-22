export interface MapZone {
  id: string;
  /** x, z in -10..10 schema space */
  position: [number, number];
  label: string;
  kind: 'hot' | 'rotation';
  description: string;
}

export interface SquadMarker {
  id: string;
  position: [number, number];
  label: string;
  group: 'A' | 'B';
}

export interface RotationArrow {
  id: string;
  from: [number, number];
  to: [number, number];
  label: string;
  description: string;
}

export interface MapDefinition {
  id: string;
  slug: string;
  name: string;
  size: string;
  terrainColor: string;
  accentColor: string;
  tagline: string;
  specifics: string[];
  commonMistakes: string[];
  zones: MapZone[];
  squads: SquadMarker[];
  rotationArrows: RotationArrow[];
  splitNote: string;
}

export const maps: MapDefinition[] = [
  {
    id: 'erangel',
    slug: 'erangel',
    name: 'Erangel',
    size: '8×8 km',
    terrainColor: '#1a2e1f',
    accentColor: '#4ade80',
    tagline: "La carte la plus équilibrée : végétation dense, distances de duel moyennes, beaucoup d'axes de rotation possibles.",
    specifics: [
      "La végétation (champs de blé, forêts) casse les lignes de vue longue distance — les duels s'y jouent souvent à distance moyenne plutôt qu'au sniper pur.",
      "De nombreuses petites routes relient les compounds : les rotations en véhicule y sont fréquentes et rapides.",
      "La carte offre un bon équilibre entre zones ouvertes (champs) et zones fermées (villages, bâtiments industriels), ce qui la rend adaptée à toutes les compositions d'équipe."
    ],
    commonMistakes: [
      "Sous-estimer la végétation comme couverture : un joueur immobile dans un champ de blé haut est souvent invisible, y compris à faible distance.",
      "Rotate en ligne droite sur les routes principales, très surveillées depuis les collines environnantes."
    ],
    zones: [
      {
        id: 'military',
        position: [-4, -3],
        label: 'Zone militaire',
        kind: 'hot',
        description: "Concentration d'armement de haut niveau. Très contestée en early game, à réserver aux squads qui cherchent l'action immédiate."
      },
      {
        id: 'coastal-town',
        position: [3, -2],
        label: 'Ville côtière',
        kind: 'hot',
        description: 'Grande zone urbaine avec beaucoup de loot et de bâtiments à étages — bons angles de tir mais rotations complexes une fois engagé.'
      },
      {
        id: 'central-fields',
        position: [0, 2.5],
        label: 'Champs centraux',
        kind: 'rotation',
        description: 'Grands champs ouverts utilisés comme axe de rotation rapide, mais offrant peu de couverture — à traverser avec prudence en véhicule plutôt qu\'à pied.'
      },
      {
        id: 'hills',
        position: [4.5, 3],
        label: 'Collines Est',
        kind: 'rotation',
        description: 'Point haut naturel donnant une vue sur une grande partie de la carte — souvent utilisé comme position de repli en fin de partie.'
      }
    ],
    squads: [
      {id: 'a1', position: [3.6, 1.4], label: 'Binôme A', group: 'A'},
      {id: 'a2', position: [4.3, 1.9], label: 'Binôme A', group: 'A'},
      {id: 'b1', position: [-0.6, 3.6], label: 'Binôme B', group: 'B'},
      {id: 'b2', position: [0.4, 4.1], label: 'Binôme B', group: 'B'}
    ],
    splitNote:
      "Le binôme A tient les collines en hauteur : il surveille l'ensemble des champs et repère toute squad qui traverse à découvert. Le binôme B reste au niveau des champs, plus proche de la zone bleue si elle se referme sur ce côté. Les deux duos restent à une distance de course courte l'un de l'autre en cas de problème.",
    rotationArrows: [
      {
        id: 'r1',
        from: [-4, -3],
        to: [0, 2.5],
        label: 'Zone militaire → Champs centraux',
        description: "Rotation classique en véhicule après un drop zone militaire. La traversée des champs ouverts est rapide mais visible de loin — à faire tôt, avant que les squads voisines n'aient les yeux sur cet axe."
      },
      {
        id: 'r2',
        from: [3, -2],
        to: [4.5, 3],
        label: 'Ville côtière → Collines Est',
        description: "Repli vers la hauteur en fin de partie : quitter les bâtiments de la ville pour prendre un point de vue dégagé sur la zone finale, plutôt que de rester au niveau du sol sans visibilité."
      }
    ]
  },
  {
    id: 'rondo',
    slug: 'rondo',
    name: 'Rondo',
    size: '6×6 km',
    terrainColor: '#1e2536',
    accentColor: '#a78bfa',
    tagline: 'Carte verticale et compacte : canaux, structures multi-niveaux, beaucoup de duels rapprochés.',
    specifics: [
      "La verticalité est la spécificité centrale : de nombreux bâtiments ont plusieurs étages praticables, ce qui multiplie les angles de tir possibles sur une même zone.",
      "Les canaux et zones aquatiques créent des goulots d'étranglement naturels — les traverser à découvert est risqué, il faut anticiper les angles adverses.",
      'La taille compacte de la carte réduit le temps entre les zones : les rotations y sont plus courtes mais plus fréquentes que sur Erangel.'
    ],
    commonMistakes: [
      "Ignorer les étages supérieurs d'un bâtiment en pensant qu'un ennemi est forcément au rez-de-chaussée.",
      "Traverser un canal ou un pont directement face à un bâtiment à étages sans avoir vérifié les fenêtres en hauteur."
    ],
    zones: [
      {
        id: 'harbor',
        position: [-3.5, -2.5],
        label: 'Zone portuaire',
        kind: 'hot',
        description: 'Bâtiments industriels denses en bord de canal, très contestés pour leur loot mais dangereux à cause des multiples angles hauts.'
      },
      {
        id: 'central-tower',
        position: [0.5, 0],
        label: 'Tour centrale',
        kind: 'hot',
        description: "Point le plus haut de la carte, offre une vue sur presque toute la zone environnante — très recherché en fin de partie."
      },
      {
        id: 'canal-crossing',
        position: [2.5, -3],
        label: 'Passage du canal',
        kind: 'rotation',
        description: "Goulot d'étranglement obligé pour rejoindre l'est de la carte — à traverser en vérifiant les bâtiments en hauteur des deux côtés."
      },
      {
        id: 'outskirts',
        position: [-2, 3],
        label: 'Périphérie',
        kind: 'rotation',
        description: 'Zone plus ouverte et moins contestée, souvent utilisée comme position de repli en début de fin de partie.'
      }
    ],
    squads: [
      {id: 'a1', position: [3, -2.2], label: 'Binôme A', group: 'A'},
      {id: 'a2', position: [3.6, -2.6], label: 'Binôme A', group: 'A'},
      {id: 'b1', position: [1.4, -3.6], label: 'Binôme B', group: 'B'},
      {id: 'b2', position: [1.9, -4.1], label: 'Binôme B', group: 'B'}
    ],
    splitNote:
      "Sur un passage obligé comme celui-ci, le binôme A monte à l'étage d'un bâtiment pour surveiller les fenêtres et toits adverses, pendant que le binôme B reste au niveau du sol pour couvrir la traversée elle-même. Sans ce split vertical, toute l'équipe regarderait dans la même direction et resterait aveugle aux étages.",
    rotationArrows: [
      {
        id: 'r1',
        from: [-3.5, -2.5],
        to: [0.5, 0],
        label: 'Zone portuaire → Tour centrale',
        description: 'Rotation vers le point le plus haut de la carte : à faire en vérifiant chaque bâtiment traversé, car la verticalité de Rondo veut dire qu\'un ennemi peut tirer depuis un étage sans être vu au niveau de la rue.'
      },
      {
        id: 'r2',
        from: [0.5, 0],
        to: [-2, 3],
        label: 'Tour centrale → Périphérie',
        description: "Repli vers une zone plus calme quand la tour centrale devient intenable : la périphérie offre moins de vue mais aussi moins d'angles adverses simultanés."
      }
    ]
  },
  {
    id: 'miramar',
    slug: 'miramar',
    name: 'Miramar',
    size: '8×8 km',
    terrainColor: '#3a2f24',
    accentColor: '#fb923c',
    tagline: 'Carte désertique : très longues lignes de vue, peu de couverture naturelle, duels longue distance.',
    specifics: [
      "L'absence de végétation dense rend chaque déplacement à découvert visible de très loin — la traversée d'une zone ouverte est le moment le plus dangereux sur cette carte.",
      'Les duels au fusil de précision y sont beaucoup plus fréquents que sur les autres cartes, à cause des lignes de vue qui dépassent largement 300 mètres.',
      "Le relief montagneux et les canyons offrent des axes couverts, mais ils sont bien identifiés par tous les joueurs expérimentés et donc plus contestés."
    ],
    commonMistakes: [
      "Rotate en plein découvert en pensant être hors de portée : les fusils de précision présents sur cette carte ont une portée bien supérieure à ce qu'on anticipe.",
      "Se regrouper en ligne lors d'une traversée ouverte, ce qui permet à un seul tireur adverse de toucher plusieurs joueurs avec un axe de tir unique."
    ],
    zones: [
      {
        id: 'desert-town',
        position: [-4, 2],
        label: 'Ville désertique',
        kind: 'hot',
        description: 'Zone urbaine dense avec un bon niveau de loot, mais entourée de terrain ouvert — sortir de la ville est souvent plus dangereux que d\'y looter.'
      },
      {
        id: 'canyon',
        position: [1, -3],
        label: 'Canyon',
        kind: 'rotation',
        description: "Axe couvert par le relief, très utilisé pour rotate sans être vu — mais bien connu de toutes les squads expérimentées, donc parfois lui-même surveillé depuis les hauteurs environnantes."
      },
      {
        id: 'refinery',
        position: [4, 1],
        label: 'Raffinerie',
        kind: 'hot',
        description: 'Grande zone industrielle avec du loot de qualité et plusieurs bâtiments à étages, mais peu de couverture à l\'approche.'
      },
      {
        id: 'open-plains',
        position: [-1, -1],
        label: 'Plaines ouvertes',
        kind: 'rotation',
        description: "Vaste étendue sans couverture : axe rapide mais extrêmement exposé, à traverser uniquement si la fenêtre de temps ne laisse pas d'alternative."
      }
    ],
    squads: [
      {id: 'a1', position: [1.9, -3.7], label: 'Binôme A', group: 'A'},
      {id: 'a2', position: [2.4, -4.1], label: 'Binôme A', group: 'A'},
      {id: 'b1', position: [0.3, -2.5], label: 'Binôme B', group: 'B'},
      {id: 'b2', position: [0.8, -2.9], label: 'Binôme B', group: 'B'}
    ],
    splitNote:
      "Le binôme A se poste en hauteur sur le bord du canyon pour repérer une éventuelle embuscade avant qu'elle ne se déclenche. Le binôme B avance dans le fond du canyon, protégé du relief. Si toute la squad avançait groupée dans le canyon, un seul tireur posté en hauteur pourrait tous les toucher sur un même axe.",
    rotationArrows: [
      {
        id: 'r1',
        from: [-4, 2],
        to: [1, -3],
        label: 'Ville désertique → Canyon',
        description: "Plutôt que de traverser les plaines à découvert, cette rotation passe par le canyon : plus long, mais protégé des fusils de précision qui dominent cette carte."
      },
      {
        id: 'r2',
        from: [4, 1],
        to: [-1, -1],
        label: 'Raffinerie → Plaines ouvertes',
        description: "Axe direct et rapide mais totalement exposé — à n'utiliser que si le temps avant la fermeture de la zone ne permet pas de passer par un axe couvert."
      }
    ]
  }
];

export function getMapBySlug(slug: string): MapDefinition | undefined {
  return maps.find((m) => m.slug === slug);
}
