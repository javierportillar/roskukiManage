import { supabase } from '../hooks/useSupabase';
import { User, Sale, Order, InventoryItem, FinancialRecord, CookieFlavor, InventoryMovement, OrderItem } from '../types';

export class SupabaseService {
  // Usuarios
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapUserFromDB) || [];
  }

  static async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
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
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.orderCount !== undefined) updateData.order_count = updates.orderCount;
    if (updates.totalCookies !== undefined) updateData.total_cookies = updates.totalCookies;
    if (updates.box4Count !== undefined) updateData.box4_count = updates.box4Count;
    if (updates.box6Count !== undefined) updateData.box6_count = updates.box6Count;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapUserFromDB(data);
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

  static async createFlavor(flavor: Omit<CookieFlavor, 'id' | 'createdAt' | 'updatedAt'>): Promise<CookieFlavor> {
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

  static async updateFlavor(id: string, updates: Partial<CookieFlavor>): Promise<CookieFlavor> {
    const { data, error } = await supabase
      .from('flavors')
      .update({
        name: updates.name,
        available: updates.available,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapFlavorFromDB(data);
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

  static async createInventoryItem(item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> {
    // Primero buscar el flavor_id
    const { data: flavorData, error: flavorError } = await supabase
      .from('flavors')
      .select('id')
      .eq('name', item.flavor)
      .single();

    if (flavorError) throw flavorError;

    // Verificar si ya existe un registro para el mismo sabor y tamaño
    const { data: existing } = await supabase
      .from('inventory')
      .select('*')
      .eq('flavor_id', flavorData.id)
      .eq('size', item.size)
      .maybeSingle();

    if (existing) {
      const newQuantity = (existing.quantity as number) + item.quantity;
      return this.updateInventoryItem(existing.id as string, newQuantity);
    }


    const { data, error } = await supabase
      .from('inventory')
      .insert([{
        flavor_id: flavorData.id,
        flavor_name: item.flavor,
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
      .update({
        quantity,
        updated_at: new Date().toISOString()
      })
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

  // Movimientos de inventario
  static async getInventoryMovements(): Promise<InventoryMovement[]> {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapInventoryMovementFromDB) || [];
  }

  static async createInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'date'>): Promise<InventoryMovement> {
    // Buscar flavor_id si no se proporciona
    let flavorId = movement.flavorId;
    if (!flavorId) {
      const { data: flavorData, error: flavorError } = await supabase
        .from('flavors')
        .select('id')
        .eq('name', movement.flavor)
        .single();

      if (flavorError) throw flavorError;
      flavorId = flavorData.id;
    }

    const { data, error } = await supabase
      .from('inventory_movements')
      .insert([{
        flavor_id: flavorId,
        flavor_name: movement.flavor,
        size: movement.size,
        quantity: movement.quantity,
        movement_type: movement.type,
        reason: movement.reason,
        order_id: movement.orderId,
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapInventoryMovementFromDB(data);
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

  static async createSale(sale: Omit<Sale, 'id' | 'date'>): Promise<Sale> {
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

    // Insertar items de la venta con flavor_id
    const saleItemsWithFlavorId = await Promise.all(
      sale.items.map(async (item) => {
        // Buscar flavor_id
        const { data: flavorData } = await supabase
          .from('flavors')
          .select('id')
          .eq('name', item.flavor)
          .single();

        return {
          sale_id: saleData.id,
          cookie_id: item.cookieId,
          flavor_id: flavorData?.id,
          flavor_name: item.flavor,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          sale_type: item.saleType,
          box_quantity: item.boxQuantity,
        };
      })
    );

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItemsWithFlavorId);

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
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(this.mapOrderFromDB) || [];
  }

  static async createOrder(order: Omit<Order, 'id' | 'date' | 'updatedAt'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        sale_id: order.saleId,
        user_id: order.userId,
        user_name: order.userName,
        total: order.total,
        is_prepared: order.isPrepared,
        is_delivered: order.isDelivered,
        is_paid: order.isPaid,
      }])
      .select()
      .single();

    if (error) throw error;

    // Los order_items se crean automáticamente por el trigger
    // Obtener el pedido completo
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', data.id)
      .single();

    if (fetchError) throw fetchError;
    return this.mapOrderFromDB(completeOrder);
  }

  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const updateData: any = {};
    if (updates.isPrepared !== undefined) {
      updateData.is_prepared = updates.isPrepared;
      if (updates.isPrepared) updateData.prepared_date = new Date().toISOString();
    }
    if (updates.isDelivered !== undefined) {
      updateData.is_delivered = updates.isDelivered;
      if (updates.isDelivered) updateData.delivered_date = new Date().toISOString();
    }
    if (updates.isPaid !== undefined) {
      updateData.is_paid = updates.isPaid;
      if (updates.isPaid) updateData.paid_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        order_items (*)
      `)
      .single();

    if (error) throw error;
    return this.mapOrderFromDB(data);
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

  static async createFinancialRecord(record: Omit<FinancialRecord, 'id' | 'date'>): Promise<FinancialRecord> {
    const { data, error } = await supabase
      .from('financial_records')
      .insert([{
        type: record.type,
        description: record.description,
        amount: record.amount,
        category: record.category,
        order_id: record.orderId,
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapFinancialFromDB(data);
  }

  static async updateFinancialRecord(id: string, updates: Partial<FinancialRecord>): Promise<FinancialRecord> {
    const { data, error } = await supabase
      .from('financial_records')
      .update({
        type: updates.type,
        description: updates.description,
        amount: updates.amount,
        category: updates.category,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapFinancialFromDB(data);
  }

  static async deleteFinancialRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      orderCount: data.order_count || 0,
      totalCookies: data.total_cookies || 0,
      box4Count: data.box4_count || 0,
      box6Count: data.box6_count || 0,
    };
  }

  private static mapFlavorFromDB(data: any): CookieFlavor {
    return {
      id: data.id,
      name: data.name,
      available: data.available,
      createdAt: data.created_at ? new Date(data.created_at) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    };
  }

  private static mapInventoryFromDB(data: any): InventoryItem {
    return {
      id: data.id,
      flavorId: data.flavor_id,
      flavor: data.flavor_name,
      size: data.size,
      quantity: data.quantity,
      createdAt: new Date(data.created_at),
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
    };
  }

  private static mapInventoryMovementFromDB(data: any): InventoryMovement {
    return {
      id: data.id,
      flavorId: data.flavor_id,
      flavor: data.flavor_name,
      size: data.size,
      quantity: data.quantity,
      type: data.movement_type,
      reason: data.reason,
      date: new Date(data.created_at),
      orderId: data.order_id,
    };
  }

  private static mapSaleFromDB(data: any): Sale {
    return {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      total: parseFloat(data.total),
      date: new Date(data.created_at),
      items: data.sale_items?.map((item: any) => ({
        id: item.id,
        cookieId: item.cookie_id,
        flavorId: item.flavor_id,
        flavor: item.flavor_name,
        size: item.size,
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: parseFloat(item.total),
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
      total: parseFloat(data.total),
      date: new Date(data.created_at),
      isPrepared: data.is_prepared || false,
      preparedDate: data.prepared_date ? new Date(data.prepared_date) : undefined,
      isDelivered: data.is_delivered || false,
      deliveredDate: data.delivered_date ? new Date(data.delivered_date) : undefined,
      isPaid: data.is_paid || false,
      paidDate: data.paid_date ? new Date(data.paid_date) : undefined,
      updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
      items: data.order_items?.map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        saleItemId: item.sale_item_id,
        flavorId: item.flavor_id,
        flavor: item.flavor_name,
        size: item.size,
        quantity: item.quantity,
        price: parseFloat(item.price),
        total: parseFloat(item.total),
        saleType: item.sale_type,
        boxQuantity: item.box_quantity,
        createdAt: item.created_at ? new Date(item.created_at) : undefined,
      })) || [],
    };
  }

  private static mapFinancialFromDB(data: any): FinancialRecord {
    return {
      id: data.id,
      type: data.type,
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      date: new Date(data.created_at),
      orderId: data.order_id,
    };
  }
}