import type { Group } from "../types";

const LA1ERE_SOURCE = {
  title: "Les monopoles économiques en Guadeloupe : décryptage",
  publisher: "la1ere.franceinfo.fr",
  url: "https://la1ere.franceinfo.fr/guadeloupe/les-monopoles-economiques-en-guadeloupe-decryptage",
};

export const groups: Group[] = [
  {
    id: "safo",
    name: "SAFO",
    brands: ["Milenis"],
    sectorId: "grande-distribution",
    facts: [
      {
        text: "Les groupes SAFO (Milenis) et GBH (Destreland) sont les principaux acteurs du secteur de la grande distribution en Guadeloupe. Trois à quatre groupes mènent la danse, suivis d'une multitude de petites entreprises, mais ce sont ces gros acteurs qui maîtrisent toute la chaîne, de l'acquisition à la mise en rayon.",
        isQuote: true,
        source: LA1ERE_SOURCE,
      },
    ],
  },
  {
    id: "gbh",
    name: "GBH",
    brands: ["Destreland"],
    sectorId: "grande-distribution",
    facts: [
      {
        text: "Les groupes SAFO (Milenis) et GBH (Destreland) sont les principaux acteurs du secteur de la grande distribution en Guadeloupe. Trois à quatre groupes mènent la danse, suivis d'une multitude de petites entreprises, mais ce sont ces gros acteurs qui maîtrisent toute la chaîne, de l'acquisition à la mise en rayon.",
        isQuote: true,
        source: LA1ERE_SOURCE,
      },
    ],
  },
  {
    id: "cma-cgm",
    name: "CMA-CGM",
    brands: [],
    sectorId: "transport-maritime",
    facts: [
      {
        text: "La CMA-CGM et Seatrade. Mais CMA-CGM est en situation tellement importante, qu'on peut même parler de monopole.",
        isQuote: true,
        attributedTo: "Sébastien Matouraparsad, économiste",
        source: LA1ERE_SOURCE,
      },
    ],
  },
];
