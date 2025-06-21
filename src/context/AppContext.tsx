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
  selectUser: (userId: string) => void;
  
  // Cookies & Flavors
  flavors: CookieFlavor[];
  addFlavor: (name: string) => Promise<void>;
  toggleFlavorAvailability: (id: string) => Promise<void>;
  
  // Inventory
  inventory: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  addToInventory: (flavor: string, size: string, quantity: number) => Promise<void>;
  
  // Sales
  currentSale: SaleItem[];
  addToSale: (flavor: string, size: string, quantity: number, price: number, saleType: SaleType, boxQuantity?: number) => void;
  removeFromSale: (id: string) => void;
  updateSaleItemQuantity: (id: string, quantity: number) => void;
  completeSale: () => Promise<void>;
  clearSale: () => void;
  
  // Sales History
  sales: Sale[];

  // Orders
  orders: Order[];
  addOrder: (sale: Sale) => Promise<void>;
  markOrderPrepared: (orderId: string) => Promise<void>;
  markOrderDelivered: (orderId: string) => Promise<void>;
  markOrderPaid: (orderId: string) => Promise<void>; // Cambié de markOrderCancelled
  
  // Financial Records
  financialRecords: FinancialRecord[];
  addFinancialRecord: (type: 'income' | 'expense', description: string, amount: number, category: string) => Promise<void>;
  updateFinancialRecord: (id: string, type: 'income' | 'expense', description: string, amount: number, category: string) => Promise<void>;
  deleteFinancialRecord: (id: string) => Promise<void>;

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
  const { isConnected } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);

  // Load data from localStorage or initialize with defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('cookie-app-users');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [flavors, setFlavors] = useState<CookieFlavor[]>(() => {
    const saved = localStorage.getItem('cookie-app-flavors');
    return saved ? JSON.parse(saved) : defaultFlavors;
  });
  
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('cookie-app-inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem('cookie-app-inventory-movements');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('cookie-app-sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cookie-app-orders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('cookie-app-financial');
    return saved ? JSON.parse(saved) : [];
  });
  
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
    if (isConnected) {
      loadData();
    }
  }, [isConnected]);

  // Data loading function
  const loadData = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
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

      setUsers(cloudUsers);
      setFlavors(cloudFlavors);
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
        const newUser = await SupabaseService.createUser(userData);
        setUsers(prev => [newUser, ...prev]);
        setCurrentUser(newUser);
        return newUser;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    } else {
      // Local fallback
      const newUser: User = {
        ...userData,
        id: uuidv4(),
        createdAt: new Date(),
      };
      setUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      return newUser;
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
        const newFlavor = await SupabaseService.createFlavor(flavorData);
        setFlavors(prev => [...prev, newFlavor]);
      } catch (error) {
        console.error('Error creating flavor:', error);
        throw error;
      }
    } else {
      // Local fallback
      const newFlavor: CookieFlavor = {
        ...flavorData,
        id: uuidv4(),
      };
      setFlavors(prev => [...prev, newFlavor]);
    }
  };
  
  const toggleFlavorAvailability = async (id: string) => {
    const flavor = flavors.find(f => f.id === id);
    if (!flavor) return;

    const updatedFlavor = { ...flavor, available: !flavor.available };

    if (isConnected) {
      try {
        await SupabaseService.updateFlavor(id, updatedFlavor);
        setFlavors(prev => 
          prev.map(f => f.id === id ? updatedFlavor : f)
        );
      } catch (error) {
        console.error('Error updating flavor:', error);
        throw error;
      }
    } else {
      // Local fallback
      setFlavors(prev => 
        prev.map(f => f.id === id ? updatedFlavor : f)
      );
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
        const newItem = await SupabaseService.createInventoryItem(inventoryData);
        setInventory(prev => [newItem, ...prev]);
        
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
        throw error;
      }
    } else {
      // Local fallback
      const newItem: InventoryItem = {
        ...inventoryData,
        id: uuidv4(),
        createdAt: new Date(),
      };
      setInventory(prev => [newItem, ...prev]);
      
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
        const newOrder = await SupabaseService.createOrder(orderData);
        setOrders(prev => [newOrder, ...prev]);
      } catch (error) {
        console.error('Error creating order:', error);
        throw error;
      }
    } else {
      // Local fallback
      const newOrder: Order = {
        ...orderData,
        id: uuidv4(),
        date: new Date(),
        items: orderData.items.map(item => ({ ...item, orderId: uuidv4() })),
      };
      setOrders(prev => [newOrder, ...prev]);
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
        setOrders(prev =>
          prev.map(o => o.id === orderId ? updatedOrder : o)
        );
      } catch (error) {
        console.error('Error updating order:', error);
        throw error;
      }
    } else {
      // Local fallback
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? { ...o, isPrepared: true, preparedDate: new Date() }
            : o
        )
      );
    }
  };

  const markOrderDelivered = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.isDelivered) return;

    if (isConnected) {
      try {
        const updatedOrder = await SupabaseService.updateOrder(orderId, { 
          isDelivered: true,
          deliveredDate: new Date()
        });
        setOrders(prev =>
          prev.map(o => o.id === orderId ? updatedOrder : o)
        );
        
        // Reload inventory to reflect changes from triggers
        await loadData();
      } catch (error) {
        console.error('Error updating order:', error);
        throw error;
      }
    } else {
      // Local fallback with inventory deduction
      // ... (mantener lógica local existente)
      setOrders(prev =>
        prev.map(o => (o.id === orderId ? { ...o, isDelivered: true, deliveredDate: new Date() } : o))
      );
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
        // : item.quantity * (item.boxQuantity || 0);
      return total + cookieCount;
    }, 0);

    
 // Add financial record when order is delivered
  addFinancialRecord(
  'income', 
  `Venta ${order.userName} (${totalCookies} galletas)`, 
  order.total,
  'Ventas'
);
    // Mark order as cancelled
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, isCancelled: true, cancelledDate: new Date() } : o))
    );
  };
  
  const completeSale = async () => {
    if (!currentUser || currentSale.length === 0) return;
    
    const saleTotal = currentSale.reduce((sum, item) => sum + item.total, 0);
    
    const saleData = {
      userId: currentUser.id,
      userName: currentUser.name,
      items: [...currentSale],
      total: saleTotal,
    };

    if (isConnected) {
      try {
        const newSale = await SupabaseService.createSale(saleData);
        setSales(prev => [newSale, ...prev]);
        
        // Create order from sale
        await addOrder(newSale);
        
        clearSale();
      } catch (error) {
        console.error('Error completing sale:', error);
        throw error;
      }
    } else {
      // Local fallback
      const newSale: Sale = {
        ...saleData,
        id: uuidv4(),
        date: new Date(),
      };
      
      setSales(prev => [newSale, ...prev]);
      await addOrder(newSale);
      clearSale();
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
        const newRecord = await SupabaseService.createFinancialRecord(recordData);
        setFinancialRecords(prev => [newRecord, ...prev]);
      } catch (error) {
        console.error('Error creating financial record:', error);
        throw error;
      }
    } else {
      // Local fallback
      const newRecord: FinancialRecord = {
        ...recordData,
        id: uuidv4(),
        date: new Date(),
      };
      setFinancialRecords(prev => [newRecord, ...prev]);
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
        setFinancialRecords(prev =>
          prev.map(record => record.id === id ? updatedRecord : record)
        );
      } catch (error) {
        console.error('Error updating financial record:', error);
        throw error;
      }
    } else {
      // Local fallback
      setFinancialRecords(prev =>
        prev.map(record =>
          record.id === id ? { ...record, ...updates } : record
        )
      );
    }
  };

  const deleteFinancialRecord = async (id: string) => {
    if (isConnected) {
      try {
        await SupabaseService.deleteFinancialRecord(id);
        setFinancialRecords(prev => prev.filter(record => record.id !== id));
      } catch (error) {
        console.error('Error deleting financial record:', error);
        throw error;
      }
    } else {
      // Local fallback
      setFinancialRecords(prev => prev.filter(record => record.id !== id));
    }
  };
  
  return (
    <AppContext.Provider
      value={{
        isConnected,
        isLoading,
        
        users,
        currentUser,
        addUser,
        selectUser,
        
        flavors,
        addFlavor,
        toggleFlavorAvailability,
        
        inventory,
        inventoryMovements,
        addToInventory,
        
        currentSale,
        addToSale,
        removeFromSale,
        updateSaleItemQuantity,
        completeSale,
        clearSale,
        
        sales,
        
        orders,
        addOrder,
        markOrderPrepared,
        markOrderDelivered,
        markOrderPaid,

        financialRecords,
        addFinancialRecord,
        updateFinancialRecord,
        deleteFinancialRecord,

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