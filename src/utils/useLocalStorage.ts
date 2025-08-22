import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product, ProductInput, Sale, SaleInput, GeneralExpense, GeneralExpenseInput, MiscExpense, MiscExpenseInput, CustomItem, CustomItemInput, CustomProduct, CustomProductInput, ItemConsumed, ItemConsumedInput, BankTransaction, BankTransactionInput, FamilyPayment, FamilyPaymentInput, FamilyMember, FamilyMemberInput } from './types';

const PRODUCTS_STORAGE_KEY = 'charity.products.v4';
const SALES_STORAGE_KEY = 'charity.sales.v2';
const EXPENSES_STORAGE_KEY = 'charity.expenses.v1';
const MISC_EXPENSES_STORAGE_KEY = 'charity.misc_expenses.v1';
const CUSTOM_ITEMS_STORAGE_KEY = 'charity.custom_items.v1';
const CUSTOM_PRODUCTS_STORAGE_KEY = 'charity.custom_products.v1';
const CONSUMED_ITEMS_STORAGE_KEY = 'charity.consumed_items.v1';
const BANK_TRANSACTIONS_STORAGE_KEY = 'charity.bank_transactions.v1';
const FAMILY_PAYMENTS_STORAGE_KEY = 'charity.family_payments.v1';
const FAMILY_MEMBERS_STORAGE_KEY = 'charity.family_members.v1';

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
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [familyPayments, setFamilyPayments] = useState<FamilyPayment[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
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
    const storedBankTransactions = readFromStorage<any[]>(BANK_TRANSACTIONS_STORAGE_KEY, []);
    const storedFamilyPayments = readFromStorage<any[]>(FAMILY_PAYMENTS_STORAGE_KEY, []);
    const storedFamilyMembers = readFromStorage<any[]>(FAMILY_MEMBERS_STORAGE_KEY, []);
    
    console.log(`useLocalStorage [${hookId}]: Raw stored products:`, storedProducts);
    console.log(`useLocalStorage [${hookId}]: Raw stored sales:`, storedSales);
    console.log(`useLocalStorage [${hookId}]: Raw stored expenses:`, storedExpenses);
    console.log(`useLocalStorage [${hookId}]: Raw stored misc expenses:`, storedMiscExpenses);
    console.log(`useLocalStorage [${hookId}]: Raw stored custom items:`, storedCustomItems);
    console.log(`useLocalStorage [${hookId}]: Raw stored consumed items:`, storedConsumedItems);
    console.log(`useLocalStorage [${hookId}]: Raw stored bank transactions:`, storedBankTransactions);
    console.log(`useLocalStorage [${hookId}]: Raw stored family payments:`, storedFamilyPayments);
    console.log(`useLocalStorage [${hookId}]: Raw stored family members:`, storedFamilyMembers);
    
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
    
    // Load consumed items and migrate to include price field
    const migratedConsumedItems = storedConsumedItems.map(item => {
      if (!('price' in item)) {
        return { ...item, price: 0 };
      }
      return item;
    }) as ItemConsumed[];

    // Load bank transactions and migrate to include amount field
    const migratedBankTransactions = storedBankTransactions.map(transaction => {
      if (!('amount' in transaction)) {
        return { ...transaction, amount: 0 };
      }
      return transaction;
    }) as BankTransaction[];
    
    // Load family payments (no migration needed for new feature)
    const migratedFamilyPayments = storedFamilyPayments as FamilyPayment[];
    
    // Load family members (no migration needed for new feature)
    const migratedFamilyMembers = storedFamilyMembers as FamilyMember[];
    
    console.log(`useLocalStorage [${hookId}]: Migrated products:`, migratedProducts);
    console.log(`useLocalStorage [${hookId}]: Migrated sales:`, migratedSales);
    console.log(`useLocalStorage [${hookId}]: Migrated expenses:`, migratedExpenses);
    console.log(`useLocalStorage [${hookId}]: Migrated misc expenses:`, migratedMiscExpenses);
    console.log(`useLocalStorage [${hookId}]: Migrated custom items:`, migratedCustomItems);
    console.log(`useLocalStorage [${hookId}]: Migrated custom products:`, migratedCustomProducts);
    console.log(`useLocalStorage [${hookId}]: Migrated consumed items:`, migratedConsumedItems);
    console.log(`useLocalStorage [${hookId}]: Migrated bank transactions:`, migratedBankTransactions);
    console.log(`useLocalStorage [${hookId}]: Migrated family payments:`, migratedFamilyPayments);
    console.log(`useLocalStorage [${hookId}]: Migrated family members:`, migratedFamilyMembers);
    console.log(`useLocalStorage [${hookId}]: Setting products state to:`, migratedProducts);
    console.log(`useLocalStorage [${hookId}]: Setting sales state to:`, migratedSales);
    console.log(`useLocalStorage [${hookId}]: Setting expenses state to:`, migratedExpenses);
    console.log(`useLocalStorage [${hookId}]: Setting misc expenses state to:`, migratedMiscExpenses);
    console.log(`useLocalStorage [${hookId}]: Setting custom items state to:`, migratedCustomItems);
    console.log(`useLocalStorage [${hookId}]: Setting custom products state to:`, migratedCustomProducts);
    console.log(`useLocalStorage [${hookId}]: Setting consumed items state to:`, migratedConsumedItems);
    console.log(`useLocalStorage [${hookId}]: Setting bank transactions state to:`, migratedBankTransactions);
    console.log(`useLocalStorage [${hookId}]: Setting family payments state to:`, migratedFamilyPayments);
    console.log(`useLocalStorage [${hookId}]: Setting family members state to:`, migratedFamilyMembers);
    
    setProducts(migratedProducts);
    setSales(migratedSales);
    setExpenses(migratedExpenses);
    setMiscExpenses(migratedMiscExpenses);
    setCustomItems(migratedCustomItems);
    setCustomProducts(migratedCustomProducts);
    setConsumedItems(migratedConsumedItems);
    setBankTransactions(migratedBankTransactions);
    setFamilyPayments(migratedFamilyPayments);
    setFamilyMembers(migratedFamilyMembers);
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

  // Save bank transactions to localStorage whenever they change
  useEffect(() => {
    if (!initialized) {
      console.log(`useLocalStorage [${hookId}]: Skipping save - not yet initialized`);
      return;
    }
    
    console.log(`useLocalStorage [${hookId}]: Saving bank transactions to localStorage:`, bankTransactions);
    writeToStorage(BANK_TRANSACTIONS_STORAGE_KEY, bankTransactions);
  }, [bankTransactions, initialized, hookId]);

  // Save family payments to localStorage whenever they change
  useEffect(() => {
    if (!initialized) {
      console.log(`useLocalStorage [${hookId}]: Skipping save - not yet initialized`);
      return;
    }
    
    console.log(`useLocalStorage [${hookId}]: Saving family payments to localStorage:`, familyPayments);
    writeToStorage(FAMILY_PAYMENTS_STORAGE_KEY, familyPayments);
  }, [familyPayments, initialized, hookId]);

  // Save family members to localStorage whenever they change
  useEffect(() => {
    if (!initialized) {
      console.log(`useLocalStorage [${hookId}]: Skipping save - not yet initialized`);
      return;
    }
    
    console.log(`useLocalStorage [${hookId}]: Saving family members to localStorage:`, familyMembers);
    writeToStorage(FAMILY_MEMBERS_STORAGE_KEY, familyMembers);
  }, [familyMembers, initialized, hookId]);

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

  // Bank Transaction operations
  const createBankTransaction = useCallback(async (input: BankTransactionInput): Promise<void> => {
    try {
      setError(null);
      const now = new Date().toISOString();
      
      // Calculate running balance
      const currentBalance = bankTransactions.reduce((balance, transaction) => {
        if (transaction.type === 'cash_received') {
          return balance + transaction.amount;
        } else {
          return balance - transaction.amount;
        }
      }, 0);
      
      const newBalance = input.type === 'cash_received' 
        ? currentBalance + input.amount 
        : currentBalance - input.amount;
      
      const newBankTransaction: BankTransaction = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: now,
        updatedAt: now,
        ...input,
        runningBalance: newBalance,
      };
      setBankTransactions(prev => [newBankTransaction, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bank transaction');
      throw err;
    }
  }, [bankTransactions]);

  const updateBankTransaction = useCallback(async (id: string, input: BankTransactionInput): Promise<void> => {
    try {
      setError(null);
      setBankTransactions(prev => {
        const updatedTransactions = prev.map(transaction =>
          transaction.id === id
            ? { ...transaction, ...input, updatedAt: new Date().toISOString() }
            : transaction
        );
        
        // Recalculate running balances for all transactions after the updated one
        let runningBalance = 0;
        return updatedTransactions.map(transaction => {
          if (transaction.type === 'cash_received') {
            runningBalance += transaction.amount;
          } else {
            runningBalance -= transaction.amount;
          }
          return { ...transaction, runningBalance };
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bank transaction');
      throw err;
    }
  }, []);

  const deleteBankTransaction = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      setBankTransactions(prev => {
        const filteredTransactions = prev.filter(transaction => transaction.id !== id);
        
        // Recalculate running balances for all remaining transactions
        let runningBalance = 0;
        return filteredTransactions.map(transaction => {
          if (transaction.type === 'cash_received') {
            runningBalance += transaction.amount;
          } else {
            runningBalance -= transaction.amount;
          }
          return { ...transaction, runningBalance };
        });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bank transaction');
      throw err;
    }
  }, []);

  // Family Payment operations
  const createFamilyPayment = useCallback(async (input: FamilyPaymentInput): Promise<void> => {
    try {
      setError(null);
      const now = new Date().toISOString();
      const newFamilyPayment: FamilyPayment = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      setFamilyPayments(prev => [newFamilyPayment, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create family payment');
      throw err;
    }
  }, []);

  const updateFamilyPayment = useCallback(async (id: string, input: FamilyPaymentInput): Promise<void> => {
    try {
      setError(null);
      setFamilyPayments(prev =>
        prev.map(payment =>
          payment.id === id
            ? { ...payment, ...input, updatedAt: new Date().toISOString() }
            : payment
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update family payment');
      throw err;
    }
  }, []);

  const deleteFamilyPayment = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      setFamilyPayments(prev => prev.filter(payment => payment.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete family payment');
      throw err;
    }
  }, []);

  // Family Member operations
  const createFamilyMember = useCallback(async (input: FamilyMemberInput): Promise<void> => {
    try {
      setError(null);
      const now = new Date().toISOString();
      const newFamilyMember: FamilyMember = {
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: now,
        updatedAt: now,
        ...input,
      };
      setFamilyMembers(prev => [newFamilyMember, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create family member');
      throw err;
    }
  }, []);

  const updateFamilyMember = useCallback(async (id: string, input: FamilyMemberInput): Promise<void> => {
    try {
      setError(null);
      setFamilyMembers(prev =>
        prev.map(member =>
          member.id === id
            ? { ...member, ...input, updatedAt: new Date().toISOString() }
            : member
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update family member');
      throw err;
    }
  }, []);

  const deleteFamilyMember = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      setFamilyMembers(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete family member');
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
    bankTransactions,
    familyPayments,
    familyMembers,
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
    createBankTransaction,
    updateBankTransaction,
    deleteBankTransaction,
    createFamilyPayment,
    updateFamilyPayment,
    deleteFamilyPayment,
    createFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    clearError,
  };
}
