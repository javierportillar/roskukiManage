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

interface AppContextType {
  // Users
  users: User[];
  currentUser: User | null;
  addUser: (name: string, email?: string, phone?: string, address?: string) => User;
  selectUser: (userId: string) => void;
  
  // Cookies & Flavors
  flavors: CookieFlavor[];
  addFlavor: (name: string) => void;
  toggleFlavorAvailability: (id: string) => void;
  
  // Inventory
  inventory: InventoryItem[];
  inventoryMovements: InventoryMovement[];
  addToInventory: (flavor: string, size: string, quantity: number) => void;
  
  // Sales
  currentSale: SaleItem[];
  addToSale: (flavor: string, size: string, quantity: number, price: number, saleType: SaleType, boxQuantity?: number) => void;
  removeFromSale: (id: string) => void;
  updateSaleItemQuantity: (id: string, quantity: number) => void;
  completeSale: () => void;
  clearSale: () => void;
  
  // Sales History
  sales: Sale[];

  // Orders
  orders: Order[];
  addOrder: (sale: Sale) => void;
  markOrderPrepared: (orderId: string) => void;
  markOrderDelivered: (orderId: string) => void;
  markOrderCancelled: (orderId: string) => void;
  
  // Financial Records
  financialRecords: FinancialRecord[];
  addFinancialRecord: (type: 'income' | 'expense', description: string, amount: number, category: string) => void;
  updateFinancialRecord: (id: string, type: 'income' | 'expense', description: string, amount: number, category: string) => void;
  deleteFinancialRecord: (id: string) => void;
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

  // Helper function to add inventory movement

  const addInventoryMovement = (
    flavor: string,
    size: CookieSize,
    quantity: number,
    type: 'addition' | 'deduction',
    reason: string,
    saleType: 'unit' | 'box4' | 'box6',
    orderId?: string
  ) => {
    const adjustedQuantity = saleType === 'unit' ? quantity : 1;

    const movement: InventoryMovement = {
      id: uuidv4(),
      flavor,
      size,
      quantity: adjustedQuantity,
      type,
      reason,
      date: new Date(),
      orderId,
    };
    setInventoryMovements(prev => [...prev, movement]);
  };
  
  // User functions
  const addUser = (name: string, email?: string, phone?: string, address?: string): User => {
    const newUser = {
      id: uuidv4(),
      name,
      email,
      phone,
      address,
      createdAt: new Date(),
      orderCount: 0,
      totalCookies: 0,
      box4Count: 0,
      box6Count: 0,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };
  
  const selectUser = (userId: string) => {
    const user = users.find(u => u.id === userId) || null;
    setCurrentUser(user);
  };
  
  // Flavor functions
  const addFlavor = (name: string) => {
    setFlavors(prev => [...prev, { id: uuidv4(), name, available: true }]);
  };
  
  const toggleFlavorAvailability = (id: string) => {
    setFlavors(prev => 
      prev.map(flavor => 
        flavor.id === id ? { ...flavor, available: !flavor.available } : flavor
      )
    );
  };
  
  // Inventory functions
  const addToInventory = (flavor: string, size: string, quantity: number) => {
    const sizeTyped = size as 'medium' | 'large';
    
    setInventory(prev => [
      ...prev,
      {
        id: uuidv4(),
        flavor,
        size: sizeTyped,
        quantity,
        createdAt: new Date(),
      },
    ]);

    // Add movement record
    addInventoryMovement(
      flavor,
      sizeTyped,
      quantity,
      'addition',
      'Añadido al inventario',
      'unit'
    );
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
  const addOrder = (sale: Sale) => {
    const newOrder: Order = {
      id: uuidv4(),
      saleId: sale.id,
      userId: sale.userId,
      userName: sale.userName,
      items: sale.items,
      total: sale.total,
      date: sale.date,
      isPrepared: false,
      isDelivered: false,
      isCancelled: false,
    };
    setOrders(prev => [...prev, newOrder]);
  };

  // const markOrderPrepared = (orderId: string) => {
  //   const order = orders.find(o => o.id === orderId);
  //   // if (!order || order.isPrepared || order.isCancelled) return;
  //   if (!order || order.isPrepared) return;

  //   // Deduct inventory when order is marked as prepared
  //   order.items.forEach(item => {
  //     const totalCookies = item.saleType === 'unit' 
  //       ? item.quantity 
  //       : item.quantity * (item.boxQuantity || 0);
        
  //     // Find and reduce inventory
  //     const inventoryItem = inventory.find(
  //       inv => inv.flavor === item.flavor && inv.size === item.size
  //     );
      
  //     if (inventoryItem && inventoryItem.quantity >= totalCookies) {
  //       setInventory(prev => 
  //         prev.map(inv => 
  //           inv.id === inventoryItem.id 
  //             ? { ...inv, quantity: inv.quantity - totalCookies }
  //             : inv
  //         ).filter(inv => inv.quantity > 0) // Remove empty inventory items
  //       );

  //       // Add movement record
  //       addInventoryMovement(
  //         item.flavor,
  //         item.size,
  //         totalCookies,
  //         'deduction',
  //         `Pedido preparado - ${order.userName}`,
  //         orderId
  //       );
  //     }
  //   });

  //   // Mark order as prepared
  //   setOrders(prev =>
  //     prev.map(order =>
  //       order.id === orderId
  //         ? { ...order, isPrepared: true, preparedDate: new Date() }
  //         : order
  //     )
  //   );
  // };

  const markOrderPrepared = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.isPrepared) return;
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? { ...order, isPrepared: true, preparedDate: new Date() }
          : order
      )
    );
  };

  const markOrderDelivered = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    // if (!order || order.isDelivered || order.isCancelled) return;
    if (!order || order.isDelivered) return;
    // Mark order as delivered

  // Verificar si hay suficiente inventario para todos los elementos de la orden
    // const hasSufficientInventory = order.items.every(item => {
    //   const totalCookies = item.saleType === 'unit' 
    //     ? item.quantity 
    //     : item.quantity * (item.boxQuantity || 0);
  
    //   const inventoryItem = inventory.find(
    //     inv => inv.flavor === item.flavor && inv.size === item.size
    //   );
  
    //   return inventoryItem && inventoryItem.quantity >= totalCookies;
    // });
  
    // if (!hasSufficientInventory) {
    //   console.error('No hay suficiente inventario para preparar esta orden.');
    //   return; // Salir si no hay suficiente inventario
    // }
  
    // Marcar la orden como preparada
    // Verificar si hay suficiente inventario para todos los elementos de la orden
const hasSufficientInventory = order.items.every(item => {
  // La cantidad total de galletas para este sabor
  const totalCookies = item.quantity; // Aquí `quantity` ya representa la cantidad específica de este sabor

  // Buscar el inventario para el sabor y tamaño específico
  const inventoryItem = inventory.find(
    inv => inv.flavor === item.flavor && inv.size === item.size
  );

  // Verificar si hay suficiente cantidad en el inventario
  return inventoryItem && inventoryItem.quantity >= totalCookies;
});

if (!hasSufficientInventory) {
  console.error('No hay suficiente inventario para preparar esta orden.');
  return; // Salir si no hay suficiente inventario
}
// Deducir el inventario para cada elemento de la orden
order.items.forEach(item => {
  // La cantidad total de galletas para este sabor
  const totalCookies = item.quantity; // Aquí `quantity` ya representa la cantidad específica de este sabor

  // Buscar el inventario para el sabor y tamaño específico
  const inventoryItem = inventory.find(
    inv => inv.flavor === item.flavor && inv.size === item.size
  );

  if (inventoryItem) {
    // Deducir la cantidad solicitada del inventario
    inventoryItem.quantity -= totalCookies;
  }
});
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, isDelivered: true, deliveredDate: new Date() } : o))
    );
  };

  const markOrderCancelled = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.isCancelled) return;

    // Calculate total cookies in the order
    const totalCookies = order.items.reduce((total, item) => {
      const cookieCount = item.saleType === 'unit' 
        ? item.quantity 
        : item.quantity;
        // : item.quantity * (item.boxQuantity || 0);
      return total + cookieCount;
    }, 0);

    // If order was already prepared, we need to add back the inventory
    // if (order.isPrepared) {
    //   order.items.forEach(item => {
    //     const totalCookies = item.saleType === 'unit' 
    //       ? item.quantity 
    //       : item.quantity * (item.boxQuantity || 0);

    //     // Find existing inventory item or create new one
    //     const existingInventoryItem = inventory.find(
    //       inv => inv.flavor === item.flavor && inv.size === item.size
    //     );

    //     if (existingInventoryItem) {
    //       setInventory(prev => 
    //         prev.map(inv => 
    //           inv.id === existingInventoryItem.id 
    //             ? { ...inv, quantity: inv.quantity + totalCookies }
    //             : inv
    //         )
    //       );
    //     } else {
    //       setInventory(prev => [
    //         ...prev,
    //         {
    //           id: uuidv4(),
    //           flavor: item.flavor,
    //           size: item.size,
    //           quantity: totalCookies,
    //           createdAt: new Date(),
    //         },
    //       ]);
    //     }

    //     // Add movement record
    //     addInventoryMovement(
    //       item.flavor,
    //       item.size,
    //       totalCookies,
    //       'addition',
    //       `Pedido cancelado - ${order.userName}`,
    //       orderId
    //     );
    //   });
    // }
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
  
  const completeSale = () => {
    if (!currentUser || currentSale.length === 0) return;
    
    const saleTotal = currentSale.reduce((sum, item) => sum + item.total, 0);
    
    const newSale: Sale = {
      id: uuidv4(),
      userId: currentUser.id,
      userName: currentUser.name,
      items: [...currentSale],
      total: saleTotal,
      date: new Date(),
    };
    
    setSales(prev => [...prev, newSale]);
    
    // Create order from sale
    addOrder(newSale);
    
    clearSale();
  };
  
  const clearSale = () => {
    setCurrentSale([]);
  };
  
  // Financial functions
  const addFinancialRecord = (
    type: 'income' | 'expense',
    description: string,
    amount: number,
    category: string
  ) => {
    setFinancialRecords(prev => [
      ...prev,
      {
        id: uuidv4(),
        type,
        description,
        amount,
        category,
        date: new Date(),
      },
    ]);
  };

  const updateFinancialRecord = (
    id: string,
    type: 'income' | 'expense',
    description: string,
    amount: number,
    category: string
  ) => {
    setFinancialRecords(prev =>
      prev.map(record =>
        record.id === id
          ? { ...record, type, description, amount, category }
          : record
      )
    );
  };

  const deleteFinancialRecord = (id: string) => {
    setFinancialRecords(prev => prev.filter(record => record.id !== id));
  };
  
  return (
    <AppContext.Provider
      value={{
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
        markOrderCancelled,

        financialRecords,
        addFinancialRecord,
        updateFinancialRecord,
        deleteFinancialRecord,
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