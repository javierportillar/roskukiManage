import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  CookieSize,
  CookieFlavor, 
  InventoryItem, 
  InventoryMovement,
  Sale, 
  Order,
  FinancialRecord, 
  SaleItem,
  SaleType 
} from '../types';
import { SupabaseService } from '../services/supabaseService';
import { useSupabase } from '../hooks/useSupabase';

export interface AppContextType {
  // Connection status
  isConnected: boolean;
  isLoading: boolean;
  
  // Users
  users: User[];
  currentUser: User | null;
  addUser: (name: string, email?: string, phone?: string, address?: string) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  selectUser: (userId: string) => void;
  setUsers: (users: User[]) => void;
  
  // Cookies & Flavors
  flavors: CookieFlavor[];
  addFlavor: (name: string) => Promise<void>;
  toggleFlavorAvailability: (id: string) => Promise<void>;
  setFlavors: (flavors: CookieFlavor[]) => void;
  
  // Inventory
  inventory: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  addToInventory: (flavor: string, size: string, quantity: number) => Promise<void>;
  setInventory: (inventory: InventoryItem[]) => void;
  
  // Sales
  currentSale: SaleItem[];
  isCompletingSale: boolean; // New loading state
  addToSale: (flavor: string, size: string, quantity: number, price: number, saleType: SaleType, boxQuantity?: number) => void;
  removeFromSale: (id: string) => void;
  updateSaleItemQuantity: (id: string, quantity: number) => void;
  completeSale: () => Promise<void>;
  clearSale: () => void;
  
  // Sales History
  sales: Sale[];
  setSales: (sales: Sale[]) => void;

  // Orders
  orders: Order[];
  addOrder: (sale: Sale) => Promise<void>;
  markOrderPrepared: (orderId: string) => Promise<void>;
  markOrderDelivered: (orderId: string) => Promise<void>;
  markOrderPaid: (orderId: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>; // Nueva función
  setOrders: (orders: Order[]) => void;
  
  // Financial Records
  financialRecords: FinancialRecord[];
  addFinancialRecord: (type: 'income' | 'expense', description: string, amount: number, category: string) => Promise<void>;
  updateFinancialRecord: (id: string, type: 'income' | 'expense', description: string, amount: number, category: string) => Promise<void>;
  deleteFinancialRecord: (id: string) => Promise<void>;
  setFinancialRecords: (records: FinancialRecord[]) => void;

  // Sync functions
  syncData: () => Promise<void>;
  loadData: () => Promise<void>;
}

const defaultFlavors: CookieFlavor[] = [
  { id: uuidv4(), name: 'Chips Chocolate Relleno Nutela', available: true },
  { id: uuidv4(), name: 'Red Velvet Relleno Nutella', available: true },
  { id: uuidv4(), name: `M&m's Relleno Nutella`, available: true },
  { id: uuidv4(), name: 'Oreo Relleno Oreo', available: true },
  { id: uuidv4(), name: 'Oreo Relleno Nutella', available: true },
  { id: uuidv4(), name: 'Galleta Galak', available: true },
  { id: uuidv4(), name: 'Galleta Nucita', available: true },
  { id: uuidv4(), name: 'Chocolatina Jet', available: true },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected, isLoading: supabaseLoading } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [isCompletingSale, setIsCompletingSale] = useState(false); // New state

  // Load data from localStorage or initialize with defaults
  const [users, setUsersState] = useState<User[]>(() => {
    const saved = localStorage.getItem('cookie-app-users');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [flavors, setFlavorsState] = useState<CookieFlavor[]>(() => {
    const saved = localStorage.getItem('cookie-app-flavors');
    return saved ? JSON.parse(saved) : defaultFlavors;
  });
  
  const [inventory, setInventoryState] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('cookie-app-inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem('cookie-app-inventory-movements');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  
  const [sales, setSalesState] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('cookie-app-sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrdersState] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cookie-app-orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [financialRecords, setFinancialRecordsState] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('cookie-app-financial');
    return saved ? JSON.parse(saved) : [];
  });

  // Wrapper functions to update both state and localStorage
  const setUsers = (newUsers: User[]) => {
    setUsersState(newUsers);
    localStorage.setItem('cookie-app-users', JSON.stringify(newUsers));
  };

  const setFlavors = (newFlavors: CookieFlavor[]) => {
    setFlavorsState(newFlavors);
    localStorage.setItem('cookie-app-flavors', JSON.stringify(newFlavors));
  };

  const setInventory = (newInventory: InventoryItem[]) => {
    setInventoryState(newInventory);
    localStorage.setItem('cookie-app-inventory', JSON.stringify(newInventory));
  };

  const setSales = (newSales: Sale[]) => {
    setSalesState(newSales);
    localStorage.setItem('cookie-app-sales', JSON.stringify(newSales));
  };

  const setOrders = (newOrders: Order[]) => {
    setOrdersState(newOrders);
    localStorage.setItem('cookie-app-orders', JSON.stringify(newOrders));
  };

  const setFinancialRecords = (newRecords: FinancialRecord[]) => {
    setFinancialRecordsState(newRecords);
    localStorage.setItem('cookie-app-financial', JSON.stringify(newRecords));
  };
  
  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('cookie-app-users', JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
    localStorage.setItem('cookie-app-flavors', JSON.stringify(flavors));
  }, [flavors]);
  
  useEffect(() => {
    localStorage.setItem('cookie-app-inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('cookie-app-inventory-movements', JSON.stringify(inventoryMovements));
  }, [inventoryMovements]);
  
  useEffect(() => {
    localStorage.setItem('cookie-app-sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('cookie-app-orders', JSON.stringify(orders));
  }, [orders]);
  
  useEffect(() => {
    localStorage.setItem('cookie-app-financial', JSON.stringify(financialRecords));
  }, [financialRecords]);

  // Load data from Supabase when connected
  useEffect(() => {
    if (isConnected && !supabaseLoading) {
      console.log('Cargando datos desde Supabase...');
      loadData();
    }
  }, [isConnected, supabaseLoading]);

  // Update flavor availability based on inventory
  useEffect(() => {
    updateFlavorAvailability();
  }, [inventory]);

  const updateFlavorAvailability = () => {
    const updatedFlavors = flavors.map(flavor => {
      const totalInventory = inventory
        .filter(item => item.flavor === flavor.name)
        .reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...flavor,
        available: totalInventory > 0
      };
    });
    
    // Only update if there are actual changes
    const hasChanges = updatedFlavors.some((flavor, index) => 
      flavor.available !== flavors[index].available
    );
    
    if (hasChanges) {
      setFlavors(updatedFlavors);
    }
  };

  // Data loading function
  const loadData = async () => {
    if (!isConnected) {
      console.log('No conectado a Supabase, usando datos locales');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Iniciando carga de datos...');
      
      const [
        cloudUsers,
        cloudFlavors,
        cloudInventory,
        cloudInventoryMovements,
        cloudSales,
        cloudOrders,
        cloudFinancialRecords
      ] = await Promise.all([
        SupabaseService.getUsers(),
        SupabaseService.getFlavors(),
        SupabaseService.getInventory(),
        SupabaseService.getInventoryMovements(),
        SupabaseService.getSales(),
        SupabaseService.getOrders(),
        SupabaseService.getFinancialRecords()
      ]);

      console.log('Datos cargados:', {
        users: cloudUsers.length,
        flavors: cloudFlavors.length,
        inventory: cloudInventory.length,
        movements: cloudInventoryMovements.length,
        sales: cloudSales.length,
        orders: cloudOrders.length,
        financial: cloudFinancialRecords.length
      });

      setUsers(cloudUsers);
      setFlavors(cloudFlavors.length > 0 ? cloudFlavors : defaultFlavors);
      setInventory(cloudInventory);
      setInventoryMovements(cloudInventoryMovements);
      setSales(cloudSales);
      setOrders(cloudOrders);
      setFinancialRecords(cloudFinancialRecords);
    } catch (error) {
      console.error('Error loading data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync data function
  const syncData = async () => {
    if (!isConnected) return;
    await loadData();
  };

  // Helper function to calculate user statistics from sale items
  const calculateUserStats = (saleItems: SaleItem[]) => {
    let totalCookies = 0;
    let box4Count = 0;
    let box6Count = 0;

    saleItems.forEach(item => {
      if (item.saleType === 'unit') {
        totalCookies += item.quantity;
      } else if (item.saleType === 'box4') {
        box4Count += item.quantity;
        totalCookies += item.quantity; // Each box4 item represents 4 cookies
      } else if (item.saleType === 'box6') {
        box6Count += item.quantity;
        totalCookies += item.quantity; // Each box6 item represents 6 cookies
      }
    });

    return { totalCookies, box4Count, box6Count };
  };

  // Helper function to update user statistics
  const updateUserStats = async (userId: string, saleItems: SaleItem[]) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const stats = calculateUserStats(saleItems);
    
    const updatedUser = {
      ...user,
      orderCount: user.orderCount + 1,
      totalCookies: user.totalCookies + stats.totalCookies,
      box4Count: user.box4Count + stats.box4Count,
      box6Count: user.box6Count + stats.box6Count,
    };

    console.log('📊 Actualizando estadísticas del usuario:', {
      usuario: user.name,
      antes: {
        pedidos: user.orderCount,
        galletas: user.totalCookies,
        cajas4: user.box4Count,
        cajas6: user.box6Count
      },
      despues: {
        pedidos: updatedUser.orderCount,
        galletas: updatedUser.totalCookies,
        cajas4: updatedUser.box4Count,
        cajas6: updatedUser.box6Count
      },
      incremento: stats
    });

    try {
      await updateUser(userId, {
        orderCount: updatedUser.orderCount,
        totalCookies: updatedUser.totalCookies,
        box4Count: updatedUser.box4Count,
        box6Count: updatedUser.box6Count,
      });
      
      // Update current user if it's the same
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error('Error actualizando estadísticas del usuario:', error);
    }
  };

  // Helper function to add inventory movement
  const addInventoryMovement = async (
    flavor: string,
    size: CookieSize,
    quantity: number,
    type: 'addition' | 'deduction',
    reason: string,
    orderId?: string
  ) => {
    const movement: Omit<InventoryMovement, 'id' | 'date'> = {
      flavor,
      size,
      quantity,
      type,
      reason,
      orderId,
    };

    if (isConnected) {
      try {
        const newMovement = await SupabaseService.createInventoryMovement(movement);
        setInventoryMovements(prev => [newMovement, ...prev]);
      } catch (error) {
        console.error('Error creating inventory movement:', error);
      }
    } else {
      // Local fallback
      const localMovement: InventoryMovement = {
        ...movement,
        id: uuidv4(),
        date: new Date(),
      };
      setInventoryMovements(prev => [localMovement, ...prev]);
    }
  };

  // Helper function to deduct inventory locally
  const deductInventoryLocal = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      console.error('❌ Pedido no encontrado:', orderId);
      return;
    }

    console.log('🔄 Iniciando deducción de inventario para pedido:', order.userName);
    
    let updatedInventory = [...inventory];

    // Process each item in the order
    for (const item of order.items) {
      const quantityToDeduct = item.quantity;
      
      console.log(`📦 Procesando: ${quantityToDeduct}x ${item.flavor} (${item.size})`);

      // Find inventory items that match this flavor and size
      const matchingItems = updatedInventory.filter(
        inv => inv.flavor === item.flavor && inv.size === item.size && inv.quantity > 0
      );

      if (matchingItems.length === 0) {
        console.warn(`⚠️ No hay inventario disponible para ${item.flavor} ${item.size}`);
        continue;
      }

      // Calculate total available quantity
      const totalAvailable = matchingItems.reduce((sum, inv) => sum + inv.quantity, 0);
      
      if (totalAvailable < quantityToDeduct) {
        console.warn(`⚠️ Inventario insuficiente para ${item.flavor} ${item.size}. Disponible: ${totalAvailable}, Necesario: ${quantityToDeduct}`);
      }

      let remainingToDeduct = quantityToDeduct;

      // Sort by creation date (FIFO - First In, First Out)
      const sortedItems = matchingItems.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Deduct from inventory items
      for (const invItem of sortedItems) {
        if (remainingToDeduct <= 0) break;

        const invIndex = updatedInventory.findIndex(inv => inv.id === invItem.id);
        if (invIndex === -1) continue;

        const currentQuantity = updatedInventory[invIndex].quantity;
        const deductFromThis = Math.min(remainingToDeduct, currentQuantity);

        if (deductFromThis > 0) {
          const newQuantity = currentQuantity - deductFromThis;
          
          console.log(`✅ Deduciendo ${deductFromThis} de lote ${invItem.id.substring(0, 8)}... (${currentQuantity} → ${newQuantity})`);

          updatedInventory[invIndex] = {
            ...updatedInventory[invIndex],
            quantity: newQuantity,
            updatedAt: new Date()
          };

          remainingToDeduct -= deductFromThis;
        }
      }

      // Remove inventory items with 0 quantity
      updatedInventory = updatedInventory.filter(inv => inv.quantity > 0);

      // Add movement record
      console.log(`📝 Registrando movimiento: -${quantityToDeduct} ${item.flavor} ${item.size}`);
      await addInventoryMovement(
        item.flavor,
        item.size,
        quantityToDeduct,
        'deduction',
        `Entrega de pedido - ${order.userName}`,
        orderId
      );
    }

    // Update inventory state
    console.log('💾 Actualizando inventario...');
    setInventory(updatedInventory);
    
    console.log('✅ Deducción de inventario completada');
  };

  // User functions
  const addUser = async (name: string, email?: string, phone?: string, address?: string): Promise<User> => {
    const userData = {
      name,
      email,
      phone,
      address,
      orderCount: 0,
      totalCookies: 0,
      box4Count: 0,
      box6Count: 0,
    };

    if (isConnected) {
      try {
        console.log('Creando usuario en Supabase:', userData);
        const newUser = await SupabaseService.createUser(userData);
        console.log('Usuario creado:', newUser);
        setUsers([newUser, ...users]);
        setCurrentUser(newUser);
        return newUser;
      } catch (error) {
        console.error('Error creating user:', error);
        // Fallback to local storage
        const newUser: User = {
          ...userData,
          id: uuidv4(),
          createdAt: new Date(),
        };
        setUsers([newUser, ...users]);
        setCurrentUser(newUser);
        return newUser;
      }
    } else {
      // Local fallback
      const newUser: User = {
        ...userData,
        id: uuidv4(),
        createdAt: new Date(),
      };
      setUsers([newUser, ...users]);
      setCurrentUser(newUser);
      return newUser;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>): Promise<void> => {
    if (isConnected) {
      try {
        console.log('Actualizando usuario en Supabase:', { id, updates });
        const updatedUser = await SupabaseService.updateUser(id, updates);
        console.log('Usuario actualizado:', updatedUser);
        
        // Update local state
        setUsers(users.map(user => user.id === id ? updatedUser : user));
        
        // Update current user if it's the one being edited
        if (currentUser && currentUser.id === id) {
          setCurrentUser(updatedUser);
        }
      } catch (error) {
        console.error('Error updating user:', error);
        // Fallback to local update
        const updatedUsers = users.map(user => 
          user.id === id ? { ...user, ...updates, updatedAt: new Date() } : user
        );
        setUsers(updatedUsers);
        
        if (currentUser && currentUser.id === id) {
          setCurrentUser({ ...currentUser, ...updates, updatedAt: new Date() });
        }
        throw error; // Re-throw to show error to user
      }
    } else {
      // Local fallback
      const updatedUsers = users.map(user => 
        user.id === id ? { ...user, ...updates, updatedAt: new Date() } : user
      );
      setUsers(updatedUsers);
      
      if (currentUser && currentUser.id === id) {
        setCurrentUser({ ...currentUser, ...updates, updatedAt: new Date() });
      }
    }
  };
  
  const selectUser = (userId: string) => {
    const user = users.find(u => u.id === userId) || null;
    setCurrentUser(user);
  };
  
  // Flavor functions
  const addFlavor = async (name: string) => {
    const flavorData = { name, available: true };

    if (isConnected) {
      try {
        console.log('Creando sabor en Supabase:', flavorData);
        const newFlavor = await SupabaseService.createFlavor(flavorData);
        console.log('Sabor creado:', newFlavor);
        setFlavors([...flavors, newFlavor]);
      } catch (error) {
        console.error('Error creating flavor:', error);
        // Fallback to local storage
        const newFlavor: CookieFlavor = {
          ...flavorData,
          id: uuidv4(),
        };
        setFlavors([...flavors, newFlavor]);
      }
    } else {
      // Local fallback
      const newFlavor: CookieFlavor = {
        ...flavorData,
        id: uuidv4(),
      };
      setFlavors([...flavors, newFlavor]);
    }
  };
  
  const toggleFlavorAvailability = async (id: string) => {
    const flavor = flavors.find(f => f.id === id);
    if (!flavor) return;

    const updatedFlavor = { ...flavor, available: !flavor.available };

    if (isConnected) {
      try {
        await SupabaseService.updateFlavor(id, updatedFlavor);
        setFlavors(flavors.map(f => f.id === id ? updatedFlavor : f));
      } catch (error) {
        console.error('Error updating flavor:', error);
        // Fallback to local update
        setFlavors(flavors.map(f => f.id === id ? updatedFlavor : f));
      }
    } else {
      // Fallback to local update
      setFlavors(flavors.map(f => f.id === id ? updatedFlavor : f));
    }
  };
  
  // Inventory functions
  const addToInventory = async (flavor: string, size: string, quantity: number) => {
    const sizeTyped = size as 'medium' | 'large';
    const inventoryData = {
      flavor,
      size: sizeTyped,
      quantity,
    };

    if (isConnected) {
      try {
        console.log('Añadiendo al inventario en Supabase:', inventoryData);
        const newItem = await SupabaseService.createInventoryItem(inventoryData);
        console.log('Item de inventario creado:', newItem);
        setInventory([newItem, ...inventory]);
        
        // Add movement record
        await addInventoryMovement(
          flavor,
          sizeTyped,
          quantity,
          'addition',
          'Añadido al inventario'
        );
      } catch (error) {
        console.error('Error adding to inventory:', error);
        // Fallback to local storage
        const newItem: InventoryItem = {
          ...inventoryData,
          id: uuidv4(),
          createdAt: new Date(),
        };
        setInventory([newItem, ...inventory]);
        
        await addInventoryMovement(
          flavor,
          sizeTyped,
          quantity,
          'addition',
          'Añadido al inventario'
        );
      }
    } else {
      // Local fallback
      const newItem: InventoryItem = {
        ...inventoryData,
        id: uuidv4(),
        createdAt: new Date(),
      };
      setInventory([newItem, ...inventory]);
      
      await addInventoryMovement(
        flavor,
        sizeTyped,
        quantity,
        'addition',
        'Añadido al inventario'
      );
    }
  };
  
  // Sales functions
  const addToSale = (
    flavor: string,
    size: string,
    quantity: number,
    price: number,
    saleType: SaleType,
    boxQuantity?: number
  ) => {
    const existingItemIndex = currentSale.findIndex(
      item => item.flavor === flavor && item.size === size && item.saleType === saleType
    );
    
    if (existingItemIndex >= 0) {
      const updatedSale = [...currentSale];
      const item = updatedSale[existingItemIndex];
      updatedSale[existingItemIndex] = {
        ...item,
        quantity: item.quantity + quantity,
        total: (item.quantity + quantity) * item.price,
      };
      setCurrentSale(updatedSale);
    } else {
      setCurrentSale(prev => [
        ...prev,
        {
          id: uuidv4(),
          cookieId: uuidv4(),
          flavor,
          size: size as 'medium' | 'large',
          quantity,
          price,
          total: quantity * price,
          saleType,
          boxQuantity,
        },
      ]);
    }
  };
  
  const removeFromSale = (id: string) => {
    setCurrentSale(prev => prev.filter(item => item.id !== id));
  };
  
  const updateSaleItemQuantity = (id: string, quantity: number) => {
    setCurrentSale(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity, total: quantity * item.price } 
          : item
      )
    );
  };

  // Order functions
  const addOrder = async (sale: Sale) => {
    const orderData = {
      saleId: sale.id,
      userId: sale.userId,
      userName: sale.userName,
      items: sale.items.map(item => ({
        id: uuidv4(),
        orderId: '', // Se asignará después
        flavor: item.flavor,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        saleType: item.saleType,
        boxQuantity: item.boxQuantity,
      })),
      total: sale.total,
      isPrepared: false,
      isDelivered: false,
      isPaid: false,
    };

    if (isConnected) {
      try {
        console.log('Creando pedido en Supabase:', orderData);
        const newOrder = await SupabaseService.createOrder(orderData);
        console.log('Pedido creado:', newOrder);
        setOrders([newOrder, ...orders]);
      } catch (error) {
        console.error('Error creating order:', error);
        // Fallback to local storage
        const newOrder: Order = {
          ...orderData,
          id: uuidv4(),
          date: new Date(),
          items: orderData.items.map(item => ({ ...item, orderId: uuidv4() })),
        };
        setOrders([newOrder, ...orders]);
      }
    } else {
      // Local fallback
      const newOrder: Order = {
        ...orderData,
        id: uuidv4(),
        date: new Date(),
        items: orderData.items.map(item => ({ ...item, orderId: uuidv4() })),
      };
      setOrders([newOrder, ...orders]);
    }
  };

  const markOrderPrepared = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.isPrepared) return;

    if (isConnected) {
      try {
        const updatedOrder = await SupabaseService.updateOrder(orderId, { 
          isPrepared: true,
          preparedDate: new Date()
        });
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      } catch (error) {
        console.error('Error updating order:', error);
        // Fallback to local update
        setOrders(orders.map(o =>
          o.id === orderId
            ? { ...o, isPrepared: true, preparedDate: new Date() }
            : o
        ));
      }
    } else {
      // Local fallback
      setOrders(orders.map(o =>
        o.id === orderId
          ? { ...o, isPrepared: true, preparedDate: new Date() }
          : o
      ));
    }
  };

  const markOrderDelivered = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.isDelivered) return;

    console.log('🚚 Marcando pedido como entregado:', orderId);

    if (isConnected) {
      try {
        console.log('☁️ Actualizando en Supabase...');
        const updatedOrder = await SupabaseService.updateOrder(orderId, { 
          isDelivered: true,
          deliveredDate: new Date()
        });
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
        
        // Reload all data to get updated inventory and movements from triggers
        console.log('🔄 Recargando datos desde Supabase...');
        await loadData();
        console.log('✅ Datos recargados exitosamente');
      } catch (error) {
        console.error('❌ Error updating order in Supabase:', error);
        // Fallback to local update with manual inventory deduction
        console.log('⚠️ Error en Supabase, usando modo local');
        setOrders(orders.map(o => (o.id === orderId ? { ...o, isDelivered: true, deliveredDate: new Date() } : o)));
        
        // Manually deduct inventory in local mode
        await deductInventoryLocal(orderId);
      }
    } else {
      // Local fallback with inventory deduction
      console.log('💻 Modo local: actualizando pedido y deduciendo inventario');
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, isDelivered: true, deliveredDate: new Date() } : o
      ));
      
      // Manually deduct inventory in local mode
      await deductInventoryLocal(orderId);
    }
  };

  const markOrderPaid = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.isPaid) return;

    // Calculate total cookies in the order
    const totalCookies = order.items.reduce((total, item) => {
      const cookieCount = item.saleType === 'unit' 
        ? item.quantity 
        : item.quantity;
      return total + cookieCount;
    }, 0);

    // Add financial record when order is paid
    await addFinancialRecord(
      'income', 
      `Venta ${order.userName} (${totalCookies} galletas)`, 
      order.total,
      'Ventas'
    );

    if (isConnected) {
      try {
        const updatedOrder = await SupabaseService.updateOrder(orderId, { 
          isPaid: true,
          paidDate: new Date()
        });
        setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      } catch (error) {
        console.error('Error updating order:', error);
        // Fallback to local update
        setOrders(orders.map(o => (o.id === orderId ? { ...o, isPaid: true, paidDate: new Date() } : o)));
      }
    } else {
      // Local fallback
      setOrders(orders.map(o => (o.id === orderId ? { ...o, isPaid: true, paidDate: new Date() } : o)));
    }
  };

  // Nueva función para eliminar pedidos
  const deleteOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    console.log('🗑️ Eliminando pedido:', orderId);

    if (isConnected) {
      try {
        console.log('☁️ Eliminando en Supabase...');
        await SupabaseService.deleteOrder(orderId);
        
        // Eliminar del estado local
        setOrders(orders.filter(o => o.id !== orderId));
        
        // Eliminar registros financieros relacionados
        const relatedFinancialRecords = financialRecords.filter(record => record.orderId === orderId);
        for (const record of relatedFinancialRecords) {
          await SupabaseService.deleteFinancialRecord(record.id);
        }
        setFinancialRecords(financialRecords.filter(record => record.orderId !== orderId));
        
        console.log('✅ Pedido eliminado exitosamente');
      } catch (error) {
        console.error('❌ Error eliminando pedido en Supabase:', error);
        // Fallback to local delete
        setOrders(orders.filter(o => o.id !== orderId));
        setFinancialRecords(financialRecords.filter(record => record.orderId !== orderId));
      }
    } else {
      // Local fallback
      console.log('💻 Modo local: eliminando pedido');
      setOrders(orders.filter(o => o.id !== orderId));
      setFinancialRecords(financialRecords.filter(record => record.orderId !== orderId));
    }
  };
  
  const completeSale = async () => {
    if (!currentUser || currentSale.length === 0 || isCompletingSale) return;
    
    setIsCompletingSale(true); // Set loading state
    
    try {
      const saleTotal = currentSale.reduce((sum, item) => sum + item.total, 0);
      
      const saleData = {
        userId: currentUser.id,
        userName: currentUser.name,
        items: [...currentSale],
        total: saleTotal,
      };

      if (isConnected) {
        try {
          console.log('Completando venta en Supabase:', saleData);
          const newSale = await SupabaseService.createSale(saleData);
          console.log('Venta completada:', newSale);
          setSales([newSale, ...sales]);
          
          // Update user statistics
          await updateUserStats(currentUser.id, currentSale);
          
          // Create order from sale
          await addOrder(newSale);
          
          clearSale();
        } catch (error) {
          console.error('Error completing sale:', error);
          // Fallback to local storage
          const newSale: Sale = {
            ...saleData,
            id: uuidv4(),
            date: new Date(),
          };
          
          setSales([newSale, ...sales]);
          
          // Update user statistics
          await updateUserStats(currentUser.id, currentSale);
          
          await addOrder(newSale);
          clearSale();
        }
      } else {
        // Local fallback
        const newSale: Sale = {
          ...saleData,
          id: uuidv4(),
          date: new Date(),
        };
        
        setSales([newSale, ...sales]);
        
        // Update user statistics
        await updateUserStats(currentUser.id, currentSale);
        
        await addOrder(newSale);
        clearSale();
      }
    } catch (error) {
      console.error('Error completing sale:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsCompletingSale(false); // Reset loading state
    }
  };
  
  const clearSale = () => {
    setCurrentSale([]);
  };
  
  // Financial functions
  const addFinancialRecord = async (
    type: 'income' | 'expense',
    description: string,
    amount: number,
    category: string
  ) => {
    const recordData = {
      type,
      description,
      amount,
      category,
    };

    if (isConnected) {
      try {
        console.log('Creando registro financiero en Supabase:', recordData);
        const newRecord = await SupabaseService.createFinancialRecord(recordData);
        console.log('Registro financiero creado:', newRecord);
        setFinancialRecords([newRecord, ...financialRecords]);
      } catch (error) {
        console.error('Error creating financial record:', error);
        // Fallback to local storage
        const newRecord: FinancialRecord = {
          ...recordData,
          id: uuidv4(),
          date: new Date(),
        };
        setFinancialRecords([newRecord, ...financialRecords]);
      }
    } else {
      // Local fallback
      const newRecord: FinancialRecord = {
        ...recordData,
        id: uuidv4(),
        date: new Date(),
      };
      setFinancialRecords([newRecord, ...financialRecords]);
    }
  };

  const updateFinancialRecord = async (
    id: string,
    type: 'income' | 'expense',
    description: string,
    amount: number,
    category: string
  ) => {
    const updates = { type, description, amount, category };

    if (isConnected) {
      try {
        const updatedRecord = await SupabaseService.updateFinancialRecord(id, updates);
        setFinancialRecords(financialRecords.map(record => record.id === id ? updatedRecord : record));
      } catch (error) {
        console.error('Error updating financial record:', error);
        // Fallback to local update
        setFinancialRecords(financialRecords.map(record =>
          record.id === id ? { ...record, ...updates } : record
        ));
      }
    } else {
      // Local fallback
      setFinancialRecords(financialRecords.map(record =>
        record.id === id ? { ...record, ...updates } : record
      ));
    }
  };

  const deleteFinancialRecord = async (id: string) => {
    if (isConnected) {
      try {
        await SupabaseService.deleteFinancialRecord(id);
        setFinancialRecords(financialRecords.filter(record => record.id !== id));
      } catch (error) {
        console.error('Error deleting financial record:', error);
        // Fallback to local delete
        setFinancialRecords(financialRecords.filter(record => record.id !== id));
      }
    } else {
      // Local fallback
      setFinancialRecords(financialRecords.filter(record => record.id !== id));
    }
  };
  
  return (
    <AppContext.Provider
      value={{
        isConnected,
        isLoading: isLoading || supabaseLoading,
        
        users,
        currentUser,
        addUser,
        updateUser,
        selectUser,
        setUsers,
        
        flavors,
        addFlavor,
        toggleFlavorAvailability,
        setFlavors,
        
        inventory,
        inventoryMovements,
        addToInventory,
        setInventory,
        
        currentSale,
        isCompletingSale, // Add to context
        addToSale,
        removeFromSale,
        updateSaleItemQuantity,
        completeSale,
        clearSale,
        
        sales,
        setSales,
        
        orders,
        addOrder,
        markOrderPrepared,
        markOrderDelivered,
        markOrderPaid,
        deleteOrder, // Nueva función añadida al contexto
        setOrders,

        financialRecords,
        addFinancialRecord,
        updateFinancialRecord,
        deleteFinancialRecord,
        setFinancialRecords,

        syncData,
        loadData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};