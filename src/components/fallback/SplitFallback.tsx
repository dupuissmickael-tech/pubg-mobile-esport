import TopDownSchema, {toSvg} from './TopDownSchema';

const DUOS = [
  {
    id: 'duo-a',
    x: -3,
    z: -1.5,
    label: 'Duo A — angle nord',
    color: '#22d3ee',
    description:
      "Ce binôme prend l'angle nord du compound. Il peut voir et couvrir toute approche par l'extérieur, sans être visible depuis l'intérieur du bâtiment principal."
  },
  {
    id: 'duo-b',
    x: 2.5,
    z: 2,
    label: 'Duo B — angle sud-est',
    color: '#a78bfa',
    description:
      "Ce binôme prend l'angle opposé. Résultat : un ennemi qui entre dans le compound se retrouve pris entre deux angles de tir — c'est tout l'intérêt du split, plutôt que de rester groupés en un seul point vulnérable à une seule direction."
  }
];

/** 2D equivalent of SplitScene. */
export default function SplitFallback() {
  return (
    <TopDownSchema
      points={DUOS}
      extraSvg={
        <rect
          x={toSvg(-2.5)}
          y={toSvg(-1.5)}
          width={30}
          height={30}
          fill="#334155"
          rx={3}
        />
      }
    />
  );
}
