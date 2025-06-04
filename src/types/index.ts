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

export interface FinancialRecord {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
}