
export type WineType = 'Rouge' | 'Blanc' | 'Rosé' | 'Effervescent' | 'Moelleux';
export type UserRole = 'Administrateur' | 'Vendeur';

export interface Wine {
  id: string;
  name: string;
  type: WineType;
  appellation: string;
  vintage: string;
  producer: string;
  region: string;
  quantity: number;
  sellPrice: number;
  minStock: number;
  maxStock: number;
  location: string;
  supplier: string;
  dateAdded: string;
  initialQuantity: number;
}

export type TransactionType = 'Vente' | 'Perte' | 'Casse' | 'Péremption';

export interface Sale {
  id: string;
  wineId: string;
  wineName: string;
  wineType: WineType;
  quantity: number;
  price: number;
  client: string;
  date: string;
  type: TransactionType;
  total: number;
  sellerName: string;
}

export interface AlertRule {
  id: string;
  name: string;
  field: keyof Wine;
  operator: 'less' | 'greater' | 'equal' | 'contains';
  value: string | number;
  message: string;
  color: string;
}

export interface StockAlert {
  wine: Wine;
  type: 'MIN' | 'MAX' | 'OUT' | 'CUSTOM';
  message: string;
  ruleId?: string;
}
