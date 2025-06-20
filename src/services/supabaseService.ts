import { supabase } from '../hooks/useSupabase';
import { User, Sale, Order, InventoryItem, FinancialRecord, CookieFlavor } from '../types';

export class SupabaseService {
  // Usuarios
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async createUser(user: Omit<User, 'id'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        order_count: user.orderCount,
        total_cookies: user.totalCookies,
        box4_count: user.box4Count,
        box6_count: user.box6Count,
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapUserFromDB(data);
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        address: updates.address,
        order_count: updates.orderCount,
        total_cookies: updates.totalCookies,
        box4_count: updates.box4Count,
        box6_count: updates.box6Count,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapUserFromDB(data);
  }

  // Ventas
  static async getSales(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapSaleFromDB) || [];
  }

  static async createSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert([{
        user_id: sale.userId,
        user_name: sale.userName,
        total: sale.total,
      }])
      .select()
      .single();

    if (saleError) throw saleError;

    // Insertar items de la venta
    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(
        sale.items.map(item => ({
          sale_id: saleData.id,
          cookie_id: item.cookieId,
          flavor: item.flavor,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          sale_type: item.saleType,
          box_quantity: item.boxQuantity,
        }))
      );

    if (itemsError) throw itemsError;

    // Obtener la venta completa
    const { data: completeSale, error: fetchError } = await supabase
      .from('sales')
      .select(`
        *,
        sale_items (*)
      `)
      .eq('id', saleData.id)
      .single();

    if (fetchError) throw fetchError;
    return this.mapSaleFromDB(completeSale);
  }

  // Pedidos
  static async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        sale_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapOrderFromDB) || [];
  }

  static async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        sale_id: order.saleId,
        user_id: order.userId,
        user_name: order.userName,
        total: order.total,
        is_prepared: order.isPrepared,
        is_delivered: order.isDelivered,
        is_cancelled: order.isCancelled,
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapOrderFromDB(data);
  }

  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({
        is_prepared: updates.isPrepared,
        prepared_date: updates.preparedDate,
        is_delivered: updates.isDelivered,
        delivered_date: updates.deliveredDate,
        is_cancelled: updates.isCancelled,
        cancelled_date: updates.cancelledDate,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapOrderFromDB(data);
  }

  // Inventario
  static async getInventory(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapInventoryFromDB) || [];
  }

  static async createInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory')
      .insert([{
        flavor: item.flavor,
        size: item.size,
        quantity: item.quantity,
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapInventoryFromDB(data);
  }

  static async updateInventoryItem(id: string, quantity: number): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapInventoryFromDB(data);
  }

  static async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Registros financieros
  static async getFinancialRecords(): Promise<FinancialRecord[]> {
    const { data, error } = await supabase
      .from('financial_records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapFinancialFromDB) || [];
  }

  static async createFinancialRecord(record: Omit<FinancialRecord, 'id'>): Promise<FinancialRecord> {
    const { data, error } = await supabase
      .from('financial_records')
      .insert([{
        type: record.type,
        description: record.description,
        amount: record.amount,
        category: record.category,
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapFinancialFromDB(data);
  }

  // Sabores
  static async getFlavors(): Promise<CookieFlavor[]> {
    const { data, error } = await supabase
      .from('flavors')
      .select('*')
      .order('name');

    if (error) throw error;
    return data?.map(this.mapFlavorFromDB) || [];
  }

  static async createFlavor(flavor: Omit<CookieFlavor, 'id'>): Promise<CookieFlavor> {
    const { data, error } = await supabase
      .from('flavors')
      .insert([{
        name: flavor.name,
        available: flavor.available,
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapFlavorFromDB(data);
  }

  // Mappers para convertir datos de DB a tipos de la app
  private static mapUserFromDB(data: any): User {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      createdAt: new Date(data.created_at),
      orderCount: data.order_count || 0,
      totalCookies: data.total_cookies || 0,
      box4Count: data.box4_count || 0,
      box6Count: data.box6_count || 0,
    };
  }

  private static mapSaleFromDB(data: any): Sale {
    return {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      total: data.total,
      date: new Date(data.created_at),
      items: data.sale_items?.map((item: any) => ({
        id: item.id,
        cookieId: item.cookie_id,
        flavor: item.flavor,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        saleType: item.sale_type,
        boxQuantity: item.box_quantity,
      })) || [],
    };
  }

  private static mapOrderFromDB(data: any): Order {
    return {
      id: data.id,
      saleId: data.sale_id,
      userId: data.user_id,
      userName: data.user_name,
      total: data.total,
      date: new Date(data.created_at),
      isPrepared: data.is_prepared || false,
      preparedDate: data.prepared_date ? new Date(data.prepared_date) : undefined,
      isDelivered: data.is_delivered || false,
      deliveredDate: data.delivered_date ? new Date(data.delivered_date) : undefined,
      isCancelled: data.is_cancelled || false,
      cancelledDate: data.cancelled_date ? new Date(data.cancelled_date) : undefined,
      items: data.sale_items?.map((item: any) => ({
        id: item.id,
        cookieId: item.cookie_id,
        flavor: item.flavor,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        saleType: item.sale_type,
        boxQuantity: item.box_quantity,
      })) || [],
    };
  }

  private static mapInventoryFromDB(data: any): InventoryItem {
    return {
      id: data.id,
      flavor: data.flavor,
      size: data.size,
      quantity: data.quantity,
      createdAt: new Date(data.created_at),
    };
  }

  private static mapFinancialFromDB(data: any): FinancialRecord {
    return {
      id: data.id,
      type: data.type,
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: new Date(data.created_at),
    };
  }

  private static mapFlavorFromDB(data: any): CookieFlavor {
    return {
      id: data.id,
      name: data.name,
      available: data.available,
    };
  }
}