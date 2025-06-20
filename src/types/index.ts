export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  orderCount: number;
  totalCookies: number;
  box4Count: number;
  box6Count: number;
}

export type CookieSize = 'medium' | 'large';
export type SaleType = 'unit' | 'box4' | 'box6';

export interface CookieFlavor {
  id: string;
  name: string;
  available: boolean;
}

export interface Cookie {
  id: string;
  flavor: string;
  size: CookieSize;
  price: number;
  quantity: number;
}

export interface InventoryItem {
  id: string;
  flavor: string;
  size: CookieSize;
  quantity: number;
  createdAt: Date;
}

export interface InventoryMovement {
  id: string;
  flavor: string;
  size: CookieSize;
  quantity: number;
  type: 'addition' | 'deduction';
  reason: string;
  date: Date;
  orderId?: string;
}

export interface SaleItem {
  id: string;
  cookieId: string;
  flavor: string;
  size: CookieSize;
  quantity: number;
  price: number;
  total: number;
  saleType: SaleType;
  boxQuantity?: number;
}

export interface Sale {
  id: string;
  userId: string;
  userName: string;
  items: SaleItem[];
  total: number;
  date: Date;
}

export interface Order {
  id: string;
  saleId: string;
  userId: string;
  userName: string;
  items: SaleItem[];
  total: number;
  date: Date;
  isPrepared: boolean;
  preparedDate?: Date;
  isDelivered: boolean;
  deliveredDate?: Date;
  isCancelled: boolean;
  cancelledDate?: Date;
}

export interface FinancialRecord {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
}

export type AppContextType = {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  flavors: CookieFlavor[];
  setFlavors: React.Dispatch<React.SetStateAction<CookieFlavor[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  inventoryMovements: InventoryMovement[];
  setInventoryMovements: React.Dispatch<React.SetStateAction<InventoryMovement[]>>;
  currentSale: SaleItem[];
  setCurrentSale: React.Dispatch<React.SetStateAction<SaleItem[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  financialRecords: FinancialRecord[];
  setFinancialRecords: React.Dispatch<React.SetStateAction<FinancialRecord[]>>;
};