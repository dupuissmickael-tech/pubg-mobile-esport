/**
 * Familles officielles de produits du Bouclier Qualité Prix, telles que
 * listées dans l'Annexe 1 de l'Accord de Modération de Prix en Guadeloupe
 * 2024 ("Liste de produits de consommation courante"). "Autre" est ajouté
 * pour les signalements hors liste officielle. Cette liste évolue selon
 * l'arrêté préfectoral en vigueur — à mettre à jour si un nouvel accord
 * est publié.
 */
export const PRODUCT_CATEGORIES = [
  "Pains et céréales",
  "Viandes, charcuteries, volailles, plats cuisinés",
  "Poissons",
  "Lait, fromage, œufs",
  "Huiles et graisses",
  "Sel, épices, sauces, condiments",
  "Sucre, confiture, chocolat, confiserie",
  "Café, thé, cacao",
  "Boissons",
  "Légumes secs, préparés et surgelés",
  "Fruits et légumes frais",
  "Hygiène corporelle",
  "Entretien ménager",
  "Petits équipements ménagers",
  "Très jeunes enfants",
  "Fournitures scolaires",
  "Multimédia",
  "Automobile",
  "Autre",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/**
 * Les 105 produits du panier BQP 2024 (+ le panier "multimédia/automobile"
 * réservé aux magasins de plus de 2000 m²), extraits de l'Annexe 1 de
 * l'Accord de Modération de Prix en Guadeloupe 2024. Sert de liste de
 * suggestions dans le formulaire de signalement — n'importe quel autre
 * produit reste saisissable librement.
 *
 * Important : ce document liste la COMPOSITION du panier (produit,
 * famille, quantité nominale) mais ne donne aucun prix plafond par
 * produit — seulement deux prix globaux de panier (314 € pour les ~105
 * produits, 60 € pour les 6 produits multimédia/automobile). Le prix
 * plafond BQP par produit reste donc saisi par le citoyen déclarant,
 * comme affiché en rayon.
 */
export interface BqpProduct {
  nom: string;
  categorie: ProductCategory;
  quantiteNominale: string;
}

export const BQP_PRODUCTS: BqpProduct[] = [
  // Pains et céréales
  { nom: "Pain de mie", categorie: "Pains et céréales", quantiteNominale: "500 g" },
  { nom: "Farine de blé", categorie: "Pains et céréales", quantiteNominale: "1 kg" },
  { nom: "Biscottes", categorie: "Pains et céréales", quantiteNominale: "300 g" },
  { nom: "Biscuits chocolatés", categorie: "Pains et céréales", quantiteNominale: "300 g" },
  { nom: "Biscuit petit beurre", categorie: "Pains et céréales", quantiteNominale: "200 g" },
  { nom: "Riz parfumé", categorie: "Pains et céréales", quantiteNominale: "1 kg" },
  { nom: "Pâtes : spaghetti", categorie: "Pains et céréales", quantiteNominale: "500 g" },
  { nom: "Pâtes : coquillettes", categorie: "Pains et céréales", quantiteNominale: "500 g" },
  { nom: "Céréales pour petit déjeuner", categorie: "Pains et céréales", quantiteNominale: "400 g" },
  { nom: "Flocons d'avoine BIO", categorie: "Pains et céréales", quantiteNominale: "500 g" },
  { nom: "Levure chimique (poudre à lever)", categorie: "Pains et céréales", quantiteNominale: "x6 11 g" },

  // Viandes, charcuteries, volailles, plats cuisinés
  { nom: "Salaison (queue de porc) sous vide", categorie: "Viandes, charcuteries, volailles, plats cuisinés", quantiteNominale: "500 g" },
  { nom: "Steak haché surgelé 15% MG", categorie: "Viandes, charcuteries, volailles, plats cuisinés", quantiteNominale: "4x100 g" },
  { nom: "Charcuterie : jambon de Paris préemballé", categorie: "Viandes, charcuteries, volailles, plats cuisinés", quantiteNominale: "x4 tranches" },
  { nom: "Charcuterie : saucisses", categorie: "Viandes, charcuteries, volailles, plats cuisinés", quantiteNominale: "x6" },
  { nom: "Plat cuisiné : conserve de cassoulet", categorie: "Viandes, charcuteries, volailles, plats cuisinés", quantiteNominale: "840 g" },
  { nom: "Plat cuisiné surgelé", categorie: "Viandes, charcuteries, volailles, plats cuisinés", quantiteNominale: "400 g" },
  { nom: "Conserve de légumes 4/4", categorie: "Viandes, charcuteries, volailles, plats cuisinés", quantiteNominale: "4/4" },
  { nom: "Ragoût de porc frais local", categorie: "Viandes, charcuteries, volailles, plats cuisinés", quantiteNominale: "kg" },

  // Poissons
  { nom: "Poisson séché", categorie: "Poissons", quantiteNominale: "500 g" },
  { nom: "Cubes de thon surgelés", categorie: "Poissons", quantiteNominale: "450 g" },
  { nom: "Maquereaux en boîte", categorie: "Poissons", quantiteNominale: "135 g" },

  // Lait, fromage, œufs
  { nom: "Lait demi-écrémé UHT", categorie: "Lait, fromage, œufs", quantiteNominale: "1 L" },
  { nom: "Lait en poudre", categorie: "Lait, fromage, œufs", quantiteNominale: "400 g" },
  { nom: "Œufs", categorie: "Lait, fromage, œufs", quantiteNominale: "x24" },
  { nom: "Yaourt aromatisé", categorie: "Lait, fromage, œufs", quantiteNominale: "8x125 g" },
  { nom: "Yaourt nature", categorie: "Lait, fromage, œufs", quantiteNominale: "8x125 g" },
  { nom: "Crème dessert lactée", categorie: "Lait, fromage, œufs", quantiteNominale: "4x100 g" },
  { nom: "Fromage en portion à tartiner allégé", categorie: "Lait, fromage, œufs", quantiteNominale: "x12" },
  { nom: "Camembert", categorie: "Lait, fromage, œufs", quantiteNominale: "" },
  { nom: "Emmental râpé", categorie: "Lait, fromage, œufs", quantiteNominale: "200 g" },
  { nom: "Crème fraîche", categorie: "Lait, fromage, œufs", quantiteNominale: "3x20 ml" },

  // Huiles et graisses
  { nom: "Beurre doux", categorie: "Huiles et graisses", quantiteNominale: "250 g" },
  { nom: "Huile de tournesol", categorie: "Huiles et graisses", quantiteNominale: "1 L" },
  { nom: "Margarine", categorie: "Huiles et graisses", quantiteNominale: "250 g" },

  // Sel, épices, sauces, condiments
  { nom: "Sel fin", categorie: "Sel, épices, sauces, condiments", quantiteNominale: "750 g" },
  { nom: "Vinaigre d'alcool", categorie: "Sel, épices, sauces, condiments", quantiteNominale: "1 L" },
  { nom: "Moutarde", categorie: "Sel, épices, sauces, condiments", quantiteNominale: "440 g" },
  { nom: "Concentré de tomates en conserve", categorie: "Sel, épices, sauces, condiments", quantiteNominale: "tube 150 g" },
  { nom: "Tomate pelée en conserve", categorie: "Sel, épices, sauces, condiments", quantiteNominale: "4/4" },

  // Sucre, confiture, chocolat, confiserie
  { nom: "Sucre de canne", categorie: "Sucre, confiture, chocolat, confiserie", quantiteNominale: "750 g" },
  { nom: "Confiture locale", categorie: "Sucre, confiture, chocolat, confiserie", quantiteNominale: "325 g" },
  { nom: "Compote de fruits", categorie: "Sucre, confiture, chocolat, confiserie", quantiteNominale: "4x100 g" },
  { nom: "Chocolat tablette", categorie: "Sucre, confiture, chocolat, confiserie", quantiteNominale: "100 g" },

  // Café, thé, cacao
  { nom: "Café moulu 100% Arabica", categorie: "Café, thé, cacao", quantiteNominale: "250 g" },
  { nom: "Poudre cacaotée instantanée", categorie: "Café, thé, cacao", quantiteNominale: "450 g" },
  { nom: "Thé", categorie: "Café, thé, cacao", quantiteNominale: "x25" },

  // Boissons
  { nom: "Eau embouteillée", categorie: "Boissons", quantiteNominale: "6x1,5 L" },
  { nom: "Jus de fruits sans sucre ajouté", categorie: "Boissons", quantiteNominale: "1 L" },
  { nom: "Nectar multivitaminé", categorie: "Boissons", quantiteNominale: "1 L" },

  // Légumes secs, préparés et surgelés
  { nom: "Haricots rosés secs ou rouges", categorie: "Légumes secs, préparés et surgelés", quantiteNominale: "454 g" },
  { nom: "Haricots verts très fins surgelés", categorie: "Légumes secs, préparés et surgelés", quantiteNominale: "1 kg" },
  { nom: "Lentilles blondes sèches", categorie: "Légumes secs, préparés et surgelés", quantiteNominale: "500 g" },
  { nom: "Petits pois très fins", categorie: "Légumes secs, préparés et surgelés", quantiteNominale: "boîte 1/2" },
  { nom: "Préparation pour purée de pomme de terre", categorie: "Légumes secs, préparés et surgelés", quantiteNominale: "4x125 g" },
  { nom: "Légumes surgelés", categorie: "Légumes secs, préparés et surgelés", quantiteNominale: "1 kg" },

  // Fruits et légumes frais (y compris locaux)
  { nom: "Banane verte", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Banane dessert", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Giraumon", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Persil", categorie: "Fruits et légumes frais", quantiteNominale: "botte" },
  { nom: "Bouquet à soupe", categorie: "Fruits et légumes frais", quantiteNominale: "botte" },
  { nom: "Pommes de terre", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Carottes", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Igname", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Oignon", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  // Fruits et légumes locaux (liste complémentaire, magasins >= 1000 m²)
  { nom: "Patate douce", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Banane plantain", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Tomate", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Aubergine", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Ananas", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Pastèque", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Melon", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Mangue", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },
  { nom: "Courgette", categorie: "Fruits et légumes frais", quantiteNominale: "kg" },

  // Hygiène corporelle
  { nom: "Savonnette", categorie: "Hygiène corporelle", quantiteNominale: "4x100 g" },
  { nom: "Déodorant femme bille", categorie: "Hygiène corporelle", quantiteNominale: "50 ml" },
  { nom: "Déodorant homme bille", categorie: "Hygiène corporelle", quantiteNominale: "50 ml" },
  { nom: "Dentifrice fluoré", categorie: "Hygiène corporelle", quantiteNominale: "tube 75 ml" },
  { nom: "Brosse à dents", categorie: "Hygiène corporelle", quantiteNominale: "" },
  { nom: "Tampons", categorie: "Hygiène corporelle", quantiteNominale: "x20" },
  { nom: "Bâtonnets ouatés", categorie: "Hygiène corporelle", quantiteNominale: "boîte x160" },
  { nom: "Gel douche", categorie: "Hygiène corporelle", quantiteNominale: "250 ml" },
  { nom: "Shampooing format familial", categorie: "Hygiène corporelle", quantiteNominale: "500 ml" },
  { nom: "Préservatifs masculins", categorie: "Hygiène corporelle", quantiteNominale: "boîte de 6" },
  { nom: "Papier toilette", categorie: "Hygiène corporelle", quantiteNominale: "x6" },
  { nom: "Serviettes hygiéniques", categorie: "Hygiène corporelle", quantiteNominale: "x16" },
  { nom: "Rasoirs jetables", categorie: "Hygiène corporelle", quantiteNominale: "x5" },
  { nom: "Mousse à raser", categorie: "Hygiène corporelle", quantiteNominale: "200 ml" },

  // Entretien ménager
  { nom: "Eau de javel", categorie: "Entretien ménager", quantiteNominale: "1 L" },
  { nom: "Produits luttant contre les maladies vectorielles", categorie: "Entretien ménager", quantiteNominale: "400 ml" },
  { nom: "Nettoyant ménager multi-usage", categorie: "Entretien ménager", quantiteNominale: "1,25 L" },
  { nom: "Liquide vaisselle", categorie: "Entretien ménager", quantiteNominale: "750 ml" },
  { nom: "Gresil", categorie: "Entretien ménager", quantiteNominale: "650 ml" },
  { nom: "Lessive liquide", categorie: "Entretien ménager", quantiteNominale: "750 ml" },
  { nom: "Essuie-tout", categorie: "Entretien ménager", quantiteNominale: "x6" },
  { nom: "Serpillière", categorie: "Entretien ménager", quantiteNominale: "" },
  { nom: "Éponge grattoir", categorie: "Entretien ménager", quantiteNominale: "x2" },
  { nom: "Sacs poubelles", categorie: "Entretien ménager", quantiteNominale: "20x30 L, x2" },

  // Petits équipements ménagers - autres produits
  { nom: "Pile électrique", categorie: "Petits équipements ménagers", quantiteNominale: "x4" },
  { nom: "Filtre à café n°4", categorie: "Petits équipements ménagers", quantiteNominale: "x40" },
  { nom: "Bougie", categorie: "Petits équipements ménagers", quantiteNominale: "x8" },
  { nom: "Ampoule électrique", categorie: "Petits équipements ménagers", quantiteNominale: "" },

  // Très jeunes enfants
  { nom: "Lingettes bébé", categorie: "Très jeunes enfants", quantiteNominale: "x16" },
  { nom: "Pot pour bébé salé", categorie: "Très jeunes enfants", quantiteNominale: "2x200 g" },
  { nom: "Pot pour bébé sucré", categorie: "Très jeunes enfants", quantiteNominale: "2x130 g" },
  { nom: "Lait 1er âge", categorie: "Très jeunes enfants", quantiteNominale: "400 g" },
  { nom: "Lait 2ème âge en poudre", categorie: "Très jeunes enfants", quantiteNominale: "400 g" },
  { nom: "Couches bébé", categorie: "Très jeunes enfants", quantiteNominale: "x26" },

  // Fournitures scolaires
  { nom: "Crayon", categorie: "Fournitures scolaires", quantiteNominale: "x4" },
  { nom: "Stylo bille", categorie: "Fournitures scolaires", quantiteNominale: "x4" },
  { nom: "Cahier 96 pages petit format", categorie: "Fournitures scolaires", quantiteNominale: "" },

  // Multimédia (magasins > 2000 m²)
  { nom: "Clé USB", categorie: "Multimédia", quantiteNominale: "" },
  { nom: "Batterie de secours", categorie: "Multimédia", quantiteNominale: "" },
  { nom: "Souris filaire", categorie: "Multimédia", quantiteNominale: "" },
  { nom: "Oreillette", categorie: "Multimédia", quantiteNominale: "" },
  { nom: "Câble de charge USB", categorie: "Multimédia", quantiteNominale: "" },

  // Automobile (magasins > 2000 m²)
  { nom: "Lave-glace", categorie: "Automobile", quantiteNominale: "5 L" },
];

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
