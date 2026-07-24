/**
 * Catégories indicatives (regroupement pratique pour filtrer, ce n'est PAS
 * la nomenclature officielle du Bouclier Qualité Prix, qui varie selon
 * l'arrêté préfectoral en vigueur).
 */
export const PRODUCT_CATEGORIES = [
  "Alimentaire",
  "Boissons",
  "Hygiène & beauté",
  "Entretien & droguerie",
  "Bébé & puériculture",
  "Autre",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/**
 * Les 32 communes de Guadeloupe. Liste établie de mémoire (pas de vérification
 * en direct possible dans cet environnement) — à corriger si une commune
 * manque ou a été mal orthographiée.
 */
export const GUADELOUPE_COMMUNES = [
  "Anse-Bertrand",
  "Baie-Mahault",
  "Baillif",
  "Basse-Terre",
  "Bouillante",
  "Capesterre-Belle-Eau",
  "Capesterre-de-Marie-Galante",
  "Deshaies",
  "Gourbeyre",
  "Goyave",
  "Grand-Bourg",
  "La Désirade",
  "Lamentin",
  "Le Gosier",
  "Le Moule",
  "Les Abymes",
  "Morne-à-l'Eau",
  "Petit-Bourg",
  "Petit-Canal",
  "Pointe-à-Pitre",
  "Pointe-Noire",
  "Port-Louis",
  "Saint-Claude",
  "Saint-François",
  "Saint-Louis (Marie-Galante)",
  "Sainte-Anne",
  "Sainte-Rose",
  "Terre-de-Bas",
  "Terre-de-Haut",
  "Trois-Rivières",
  "Vieux-Fort",
  "Vieux-Habitants",
] as const;

export type GuadeloupeCommune = (typeof GUADELOUPE_COMMUNES)[number];
