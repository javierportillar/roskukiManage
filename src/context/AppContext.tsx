import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  Cookie, 
  CookieFlavor, 
  InventoryItem, 
  Sale, 
  FinancialRecord, 
  SaleItem,
  SaleType 
} from '../types';

interface AppContextType {
  // Users
  users: User[];
  currentUser: User | null;
  addUser: (name: string, email?: string, phone?: string) => User;
  selectUser: (userId: string) => void;
  
  // Cookies & Flavors
  flavors: CookieFlavor[];
  addFlavor: (name: string) => void;
  toggleFlavorAvailability: (id: string) => void;
  
  // Inventory
  inventory: InventoryItem[];
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
  
  // Financial Records
  financialRecords: FinancialRecord[];
  addFinancialRecord: (type: 'income' | 'expense', description: string, amount: number, category: string) => void;
}

const defaultFlavors: CookieFlavor[] = [
  { id: uuidv4(), name: 'Chips Chocolate Relleno Nutela', available: true },
  { id: uuidv4(), name: 'Chips Chocolate Relleno Naranja', available: true },
  { id: uuidv4(), name: 'Red Velvet Relleno Nutella', available: true },
  { id: uuidv4(), name: `M&m's Relleno Nutella`, available: true },
  { id: uuidv4(), name: 'Oreo Rellenor Oreo', available: true },
  { id: uuidv4(), name: 'Oreo Rellenor Nutella', available: true },

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
  
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('cookie-app-sales');
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
    localStorage.setItem('cookie-app-sales', JSON.stringify(sales));
  }, [sales]);
  
  useEffect(() => {
    localStorage.setItem('cookie-app-financial', JSON.stringify(financialRecords));
  }, [financialRecords]);
  
  // User functions
  const addUser = (name: string, email?: string, phone?: string): User => {
    const newUser = {
      id: uuidv4(),
      name,
      email,
      phone,
      createdAt: new Date(),
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
    setInventory(prev => [
      ...prev,
      {
        id: uuidv4(),
        flavor,
        size: size as 'medium' | 'large',
        quantity,
        createdAt: new Date(),
      },
    ]);
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
    
    // Add financial record for the sale
    addFinancialRecord('income', `Sale to ${currentUser.name}`, saleTotal, 'Sales');
    
    // Update inventory
    currentSale.forEach(item => {
      const totalCookies = item.saleType === 'unit' 
        ? item.quantity 
        : item.quantity * (item.boxQuantity || 0);
        
      // Find and reduce inventory
      const inventoryItem = inventory.find(
        inv => inv.flavor === item.flavor && inv.size === item.size
      );
      
      if (inventoryItem && inventoryItem.quantity >= totalCookies) {
        setInventory(prev => 
          prev.map(inv => 
            inv.id === inventoryItem.id 
              ? { ...inv, quantity: inv.quantity - totalCookies }
              : inv
          ).filter(inv => inv.quantity > 0) // Remove empty inventory items
        );
      }
    });
    
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
        addToInventory,
        
        currentSale,
        addToSale,
        removeFromSale,
        updateSaleItemQuantity,
        completeSale,
        clearSale,
        
        sales,
        
        financialRecords,
        addFinancialRecord,
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