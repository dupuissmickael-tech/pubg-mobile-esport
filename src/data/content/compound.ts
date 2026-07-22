import type {CompoundPoint} from '@/components/three/CompoundScene';

export const compoundIntro = `Un compound (un groupement de bâtiments) n'offre jamais des positions équivalentes. Avant même qu'un ennemi n'apparaisse, une bonne squad a déjà identifié quelle position tenir selon la direction du danger. Ces quatre concepts reviennent dans presque toutes les analyses de position.`;

export const compoundPoints: CompoundPoint[] = [
  {
    id: 'high-ground',
    position: [2.2, 2.4, -1.4],
    label: 'Position haute',
    description:
      "Un étage ou un toit donne une vue dégagée sur une grande zone et l'avantage du tir plongeant. Inconvénient : on y est aussi plus visible depuis loin, et la sortie est souvent plus lente (un seul escalier)."
  },
  {
    id: 'low-ground',
    position: [-1, 0.4, 2.6],
    label: 'Position basse',
    description:
      "Moins de visibilité offerte, mais aussi moins exposée aux tirs longue distance. Utile pour couvrir un angle proche ou se replier rapidement vers l'extérieur du compound."
  },
  {
    id: 'blind-spot',
    position: [-3.2, 0.9, -2],
    label: 'Angle mort',
    description:
      "Une zone qu'un ennemi en position haute ne peut pas voir sans se déplacer. S'y positionner permet d'approcher sans être repéré, mais y rester trop longtemps ne donne aucune information sur le reste du compound."
  },
  {
    id: 'fallback',
    position: [4, 0.5, 3.6],
    label: 'Position de repli',
    description:
      "Un point identifié à l'avance où se regrouper si le compound devient intenable (perte d'un joueur, flanc repéré). La pire erreur est de ne pas en avoir défini une avant l'engagement."
  }
];

export const compoundConcepts = [
  {
    title: "Angle mort et lignes de vue",
    body: "Avant de choisir une position, il faut se demander : depuis quels points un ennemi peut-il me voir ? Une position qui semble sûre parce qu'elle est en hauteur peut être totalement exposée à un axe qu'on n'a pas anticipé."
  },
  {
    title: "Contrôle des entrées/sorties",
    body: "Un compound a un nombre limité de points d'entrée. Les couvrir (même à distance, sans les occuper physiquement) empêche un ennemi de rentrer sans être vu — c'est souvent plus efficace que de multiplier les joueurs à l'intérieur."
  }
];
