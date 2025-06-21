export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt?: Date;
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
  createdAt?: Date;
  updatedAt?: Date;
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
  flavorId?: string;
  flavor: string;
  size: CookieSize;
  quantity: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface InventoryMovement {
  id: string;
  flavorId?: string;
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
  flavorId?: string;
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

export interface OrderItem {
  id: string;
  orderId: string;
  saleItemId?: string;
  flavorId?: string;
  flavor: string;
  size: CookieSize;
  quantity: number;
  price: number;
  total: number;
  saleType: SaleType;
  boxQuantity?: number;
  createdAt?: Date;
}

export interface Order {
  id: string;
  saleId: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  total: number;
  date: Date;
  isPrepared: boolean;
  preparedDate?: Date;
  isDelivered: boolean;
  deliveredDate?: Date;
  isPaid: boolean; // Cambié de isCancelled a isPaid
  paidDate?: Date; // Cambié de cancelledDate a paidDate
  updatedAt?: Date;
}

export interface FinancialRecord {
  id: string;
  date: Date;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  orderId?: string; // Nueva relación con orders
}