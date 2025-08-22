import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, ProductInput, Sale, SaleInput, GeneralExpense, GeneralExpenseInput, MiscExpense, MiscExpenseInput, CustomItem, CustomItemInput, CustomProduct, CustomProductInput, ItemConsumed, ItemConsumedInput } from './types';

const PRODUCTS_STORAGE_KEY = 'charity.products.v4';
const SALES_STORAGE_KEY = 'charity.sales.v2';
const EXPENSES_STORAGE_KEY = 'charity.expenses.v1';
const MISC_EXPENSES_STORAGE_KEY = 'charity.misc_expenses.v1';
const CUSTOM_ITEMS_STORAGE_KEY = 'charity.custom_items.v1';
const CUSTOM_PRODUCTS_STORAGE_KEY = 'charity.custom_products.v1';
const CONSUMED_ITEMS_STORAGE_KEY = 'charity.consumed_items.v1';

// Helper functions for localStorage
const readFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const writeToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to write to localStorage:', error);
  }
};

// Clear old localStorage keys to avoid conflicts
const clearOldStorageKeys = () => {
  const oldKeys = [
    'charity.products.v1',
    'charity.products.v2', 
    'charity.products.v3',
    'charity.sales.v1'
  ];
  
  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log('Clearing old storage key:', key);
      localStorage.removeItem(key);
    }
  });
};

export function useLocalStorage() {
  // Generate a unique ID for this hook instance
  const hookId = useMemo(() => Math.random().toString(36).slice(2), []);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<GeneralExpense[]>([]);
  const [miscExpenses, setMiscExpenses] = useState<MiscExpense[]>([]);
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [consumedItems, setConsumedItems] = useState<ItemConsumed[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false); // Track if we've already initialized
  const [keysCleared, setKeysCleared] = useState(false); // Track if old keys have been cleared

  console.log(`useLocalStorage [${hookId}]: Hook created/rendered`);

  // Load initial data
  useEffect(() => {
    if (initialized) {
      console.log(`useLocalStorage [${hookId}]: Already initialized, skipping load`);
      return;
    }
    
    console.log(`useLocalStorage [${hookId}]: Initializing and loading data...`);
    
    // Clear old storage keys first (only once)
    if (!keysCleared) {
      console.log(`useLocalStorage [${hookId}]: Clearing old storage keys...`);
      clearOldStorageKeys();
      setKeysCleared(true);
    }
    
    const storedProducts = readFromStorage<any[]>(PRODUCTS_STORAGE_KEY, []);
    const storedSales = readFromStorage<any[]>(SALES_STORAGE_KEY, []);
    const storedExpenses = readFromStorage<any[]>(EXPENSES_STORAGE_KEY, []);
    const storedMiscExpenses = readFromStorage<any[]>(MISC_EXPENSES_STORAGE_KEY, []);
    const storedCustomItems = readFromStorage<any[]>(CUSTOM_ITEMS_STORAGE_KEY, []);
    const storedCustomProducts = readFromStorage<any[]>(CUSTOM_PRODUCTS_STORAGE_KEY, []);
    const storedConsumedItems = readFromStorage<any[]>(CONSUMED_ITEMS_STORAGE_KEY, []);
    
    console.log(`useLocalStorage [${hookId}]: Raw stored products:`, storedProducts);
    console.log(`useLocalStorage [${hookId}]: Raw stored sales:`, storedSales);
    console.log(`useLocalStorage [${hookId}]: Raw stored expenses:`, storedExpenses);
    console.log(`useLocalStorage [${hookId}]: Raw stored misc expenses:`, storedMiscExpenses);
    console.log(`useLocalStorage [${hookId}]: Raw stored custom items:`, storedCustomItems);
    console.log(`useLocalStorage [${hookId}]: Raw stored consumed items:`, storedConsumedItems);
    
    // Migrate existing products to include salePrice field
    const migratedProducts = storedProducts.map(product => {
      if (!('salePrice' in product)) {
        return { ...product, salePrice: 0 };
      }
      return product;
    }) as Product[];
    
    // Migrate existing sales to include credit field
    const migratedSales = storedSales.map(sale => {
      console.log(`useLocalStorage [${hookId}]: Processing sale:`, sale);
      let updatedSale = sale;
      
      if (!('credit' in sale)) {
        console.log(`useLocalStorage [${hookId}]: Adding credit field to sale:`, sale.id);
        updatedSale = { ...sale, credit: 0 };
      }
      
      // Recalculate arrears to ensure it includes credit field
      const expectedCash = updatedSale.expectedCash || 0;
      const receivedCash = updatedSale.receivedCash || 0;
      const topup = updatedSale.topup || 0;
      const charity = updatedSale.charity || 0;
      const credit = updatedSale.credit || 0;
      const recalculatedArrears = expectedCash - (receivedCash + topup + charity + credit);
      
      if (Math.abs((updatedSale.arrears || 0) - recalculatedArrears) > 0.01) {
        console.log(`useLocalStorage [${hookId}]: Updating arrears for sale:`, sale.id, 'from', updatedSale.arrears, 'to', recalculatedArrears);
        updatedSale = { ...updatedSale, arrears: recalculatedArrears };
      }
      
      return updatedSale;
    }) as Sale[];
    
    // Load expenses (no migration needed for new feature)
    const migratedExpenses = storedExpenses as GeneralExpense[];
    
    // Load misc expenses (no migration needed for new feature)
    const migratedMiscExpenses = storedMiscExpenses as MiscExpense[];
    
    // Load custom items (no migration needed for new feature)
    const migratedCustomItems = storedCustomItems as CustomItem[];
    
    // Load custom products (no migration needed for new feature)
    const migratedCustomProducts = storedCustomProducts as CustomProduct[];
    
    // Load consumed items (no migration needed for new feature)
    const migratedConsumedItems = storedConsumedItems as ItemConsumed[];
    
    console.log(`useLocalStorage [${hookId}]: Migrated products:`, migratedProducts);
    console.log(`useLocalStorage [${hookId}]: Migrated sales:`, migratedSales);
    console.log(`useLocalStorage [${hookId}]: Migrated expenses:`, migratedExpenses);
    console.log(`useLocalStorage [${hookId}]: Migrated misc expenses:`, migratedMiscExpenses);
    console.log(`useLocalStorage [${hookId}]: Migrated custom items:`, migratedCustomItems);
    console.log(`useLocalStorage [${hookId}]: Migrated custom products:`, migratedCustomProducts);
    console.log(`useLocalStorage [${hookId}]: Migrated consumed items:`, migratedConsumedItems);
    console.log(`useLocalStorage [${hookId}]: Setting products state to:`, migratedProducts);
    console.log(`useLocalStorage [${hookId}]: Setting sales state to:`, migratedSales);
    console.log(`useLocalStorage [${hookId}]: Setting expenses state to:`, migratedExpenses);
    console.log(`useLocalStorage [${hookId}]: Setting misc expenses state to:`, migratedMiscExpenses);
    console.log(`useLocalStorage [${hookId}]: Setting custom items state to:`, migratedCustomItems);
    console.log(`useLocalStorage [${hookId}]: Setting custom products state to:`, migratedCustomProducts);
    console.log(`useLocalStorage [${hookId}]: Setting consumed items state to:`, migratedConsumedItems);
    
    setProducts(migratedProducts);
    setSales(migratedSales);
    setExpenses(migratedExpenses);
    setMiscExpenses(migratedMiscExpenses);
    setCustomItems(migratedCustomItems);
    setCustomProducts(migratedCustomProducts);
    setConsumedItems(migratedConsumedItems);
    setInitialized(true);
    
    console.log(`useLocalStorage [${hookId}]: Initialization complete`);
  }, [initialized, keysCleared, hookId]);

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (!initialized) {
      console.log(`useLocalStorage [${hookId}]: Skipping save - not yet initialized`);
      return;
    }
    
    console.log(`useLocalStorage [${hookId}]: Saving products to localStorage:`, products);
    console.log(`useLocalStorage [${hookId}]: Products array length:`, products.length);
    writeToStorage(PRODUCTS_STORAGE_KEY, products);
  }, [products, initialized, hookId]);

  // Save sales to localStorage whenever they change
  useEffect(() => {
    if (!initialized) {
      console.log(`useLocalStorage [${hookId}]: Skipping save - not yet initialized`);
      return;
    }
    
    console.log(`useLocalStorage [${hookId}]: Saving sales to localStorage:`, sales);
    writeToStorage(SALES_STORAGE_KEY, sales);
  }, [sales, initialized, hookId]);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    if (!initialized) {
      console.log(`useLocalStorage [${hookId}]: Skipping save - not yet initialized`);
      return;
    }
    
    console.log(`useLocalStorage [${hookId}]: Saving expenses to localStorage:`, expenses);
    writeToStorage(EXPENSES_STORAGE_KEY, expenses);
  }, [expenses, initialized, hookId]);

  // Save misc expenses to localStorage whenever they change
  useEffect(() => {
    if (!initialized) {
      console.log(`useLocalStorage [${hookId}]: Skipping save - not yet initialized`);
      return;
    }
    
    console.log(`useLocalStorage [${hookId}]: Saving misc expenses to localStorage:`, miscExpenses);
    writeToStorage(MISC_EXPENSES_STORAGE_KEY, miscExpenses);
  }, [miscExpenses, initialized, hookId]);

  // Save custom items to localStorage whenever they change
  useEffect(() => {
    if (!initialized) {
      console.log(`useLocalStorage [${hookId}]: Skipping save - not yet initialized`);
      return;
    }
    
    console.log(`useLocalStorage [${hookId}]: Saving custom items to localStorage:`, customItems);
    writeToStorage(CUSTOM_ITEMS_STORAGE_KEY, customItems);
  }, [customItems, initialized, hookId]);

  // Save custom products to localStorage whenever they change
  useEffect(() => {
    if (!initialized) {
      console.log(`useLocalStorage [${hookId}]: Skipping save - not yet initialized`);
      return;
    }
    
    console.log(`useLocalStorage [${hookId}]: Saving custom products to localStorage:`, customProducts);
    writeToStorage(CUSTOM_PRODUCTS_STORAGE_KEY, customProducts);
  }, [customProducts, initialized, hookId]);

  // Save consumed items to localStorage whenever they change
  useEffect(() => {
    if (!initialized) {
      console.log(`useLocalStorage [${hookId}]: Skipping save - not yet initialized`);
      return;
    }
    
    console.log(`useLocalStorage [${hookId}]: Saving consumed items to localStorage:`, consumedItems);
    writeToStorage(CONSUMED_ITEMS_STORAGE_KEY, consumedItems);
  }, [consumedItems, initialized, hookId]);

  // Product operations
  const createProduct = useCallback(async (input: ProductInput): Promise<void> => {
    try {
      if (!initialized) {
        console.log(`useLocalStorage [${hookId}]: Cannot create product - hook not initialized`);
        throw new Error('Hook not initialized');
      }
      
      setError(null);
      console.log(`useLocalStorage [${hookId}]: Creating product with input:`, input);
      const now = new Date().toISOString();
      const newProduct: Product = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      console.log(`useLocalStorage [${hookId}]: New product created:`, newProduct);
      setProducts(prev => {
        const updated = [newProduct, ...prev];
        console.log(`useLocalStorage [${hookId}]: Updated products array:`, updated);
        return updated;
      });
    } catch (err) {
      console.error(`useLocalStorage [${hookId}]: Error creating product:`, err);
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  }, [initialized, hookId]);

  const updateProduct = useCallback(async (id: string, input: ProductInput): Promise<void> => {
    try {
      setError(null);
      setProducts(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, ...input, updatedAt: new Date().toISOString() }
            : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  }, []);

  // Sale operations
  const createSale = useCallback(async (input: SaleInput): Promise<void> => {
    try {
      setError(null);
      const now = new Date().toISOString();
      const newSale: Sale = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: now,
        updatedAt: now,
        ...input,
        arrears: input.expectedCash - (input.receivedCash + input.topup + input.charity + input.credit),
      };
      setSales(prev => [newSale, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sale');
      throw err;
    }
  }, []);

  const updateSale = useCallback(async (id: string, input: SaleInput): Promise<void> => {
    try {
      setError(null);
      setSales(prev =>
        prev.map(s =>
          s.id === id
            ? { ...s, ...input, updatedAt: new Date().toISOString(), arrears: input.expectedCash - (input.receivedCash + input.topup + input.charity + input.credit) }
            : s
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sale');
      throw err;
    }
  }, []);

  const deleteSale = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      setSales(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sale');
      throw err;
    }
  }, []);

  // Expense operations
  const createExpense = useCallback(async (input: GeneralExpenseInput): Promise<void> => {
    try {
      setError(null);
      const now = new Date().toISOString();
      const newExpense: GeneralExpense = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      setExpenses(prev => [newExpense, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
      throw err;
    }
  }, []);

  const updateExpense = useCallback(async (id: string, input: GeneralExpenseInput): Promise<void> => {
    try {
      setError(null);
      setExpenses(prev =>
        prev.map(e =>
          e.id === id
            ? { ...e, ...input, updatedAt: new Date().toISOString() }
            : e
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      throw err;
    }
  }, []);

  const deleteExpense = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      throw err;
    }
  }, []);

  // Misc Expense operations
  const createMiscExpense = useCallback(async (input: MiscExpenseInput): Promise<void> => {
    try {
      setError(null);
      const now = new Date().toISOString();
      const newMiscExpense: MiscExpense = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      setMiscExpenses(prev => [newMiscExpense, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create misc expense');
      throw err;
    }
  }, []);

  const updateMiscExpense = useCallback(async (id: string, input: MiscExpenseInput): Promise<void> => {
    try {
      setError(null);
      setMiscExpenses(prev =>
        prev.map(e =>
          e.id === id
            ? { ...e, ...input, updatedAt: new Date().toISOString() }
            : e
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update misc expense');
      throw err;
    }
  }, []);

  const deleteMiscExpense = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      setMiscExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete misc expense');
      throw err;
    }
  }, []);

  // Custom Item operations
  const createCustomItem = useCallback(async (input: CustomItemInput): Promise<void> => {
    try {
      setError(null);
      const now = new Date().toISOString();
      const newCustomItem: CustomItem = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      setCustomItems(prev => [newCustomItem, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create custom item');
      throw err;
    }
  }, []);

  const updateCustomItem = useCallback(async (id: string, input: CustomItemInput): Promise<void> => {
    try {
      setError(null);
      setCustomItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, ...input, updatedAt: new Date().toISOString() }
            : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update custom item');
      throw err;
    }
  }, []);

  const deleteCustomItem = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      setCustomItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete custom item');
      throw err;
    }
  }, []);

  // Custom Product operations
  const createCustomProduct = useCallback(async (input: CustomProductInput): Promise<void> => {
    try {
      setError(null);
      const now = new Date().toISOString();
      const newCustomProduct: CustomProduct = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      setCustomProducts(prev => [newCustomProduct, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create custom product');
      throw err;
    }
  }, []);

  const updateCustomProduct = useCallback(async (id: string, input: CustomProductInput): Promise<void> => {
    try {
      setError(null);
      setCustomProducts(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, ...input, updatedAt: new Date().toISOString() }
            : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update custom product');
      throw err;
    }
  }, []);

  const deleteCustomProduct = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      setCustomProducts(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete custom product');
      throw err;
    }
  }, []);

  // Consumed Item operations
  const createConsumedItem = useCallback(async (input: ItemConsumedInput): Promise<void> => {
    try {
      setError(null);
      const now = new Date().toISOString();
      const newConsumedItem: ItemConsumed = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      setConsumedItems(prev => [newConsumedItem, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create consumed item');
      throw err;
    }
  }, []);

  const updateConsumedItem = useCallback(async (id: string, input: ItemConsumedInput): Promise<void> => {
    try {
      setError(null);
      setConsumedItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, ...input, updatedAt: new Date().toISOString() }
            : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update consumed item');
      throw err;
    }
  }, []);

  const deleteConsumedItem = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      setConsumedItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete consumed item');
      throw err;
    }
  }, []);

  const loadData = useCallback(async (): Promise<void> => {
    // localStorage data is already loaded in useEffect
    // This is just for API compatibility
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    // Data
    products,
    sales,
    expenses,
    miscExpenses,
    customItems,
    customProducts,
    consumedItems,
    loading,
    error,
    
    // Actions
    loadData,
    createProduct,
    updateProduct,
    deleteProduct,
    createSale,
    updateSale,
    deleteSale,
    createExpense,
    updateExpense,
    deleteExpense,
    createMiscExpense,
    updateMiscExpense,
    deleteMiscExpense,
    createCustomItem,
    updateCustomItem,
    deleteCustomItem,
    createCustomProduct,
    updateCustomProduct,
    deleteCustomProduct,
    createConsumedItem,
    updateConsumedItem,
    deleteConsumedItem,
    clearError,
  };
}
