export interface Source {
  title: string;
  publisher: string;
  url: string;
}

export interface Fact {
  /** Texte factuel, cité ou reformulé fidèlement depuis la source. */
  text: string;
  /** Vrai si `text` est une citation littérale (entre guillemets dans la source). */
  isQuote: boolean;
  /** Personne citée, le cas échéant (ex. un·e économiste). */
  attributedTo?: string;
  source: Source;
}

export interface Sector {
  id: string;
  name: string;
  description: string;
}

export interface Group {
  id: string;
  name: string;
  brands: string[];
  sectorId: string;
  facts: Fact[];
}
