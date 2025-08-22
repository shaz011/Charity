import { createClient } from '@supabase/supabase-js';

// Database configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  PRODUCTS: 'products',
  SALES: 'sales',
  EXPENSES: 'expenses',
  MISC_EXPENSES: 'misc_expenses',
  CUSTOM_ITEMS: 'custom_items',
  CUSTOM_PRODUCTS: 'custom_products',
  CONSUMED_ITEMS: 'consumed_items',
  BANK_TRANSACTIONS: 'bank_transactions',
} as const;

// Database schema types
export interface DatabaseProduct {
  id: string;
  name: string; // Now allows any string, including custom products
  unit: "kg" | "pack";
  sale_price: number;
  quantity: number;
  buying_date: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSale {
  id: string;
  product_id: string;
  weight_before_sale: number; // Weight of item + container before sale
  weight_after_sale: number; // Weight of item + container after sale
  weight: number; // Actual weight sold (weight_before_sale - weight_after_sale)
  price_per_kg: number;
  expected_cash: number;
  received_cash: number;
  sale_date: string;
  topup: number;
  charity: number; // Charity amount to be added to arrears
  credit: number; // Credit amount to be added to total received
  arrears: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseExpense {
  id: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  weight: number | null;
  expense_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMiscExpense {
  id: string;
  name: string;
  price: number;
  quantity: number;
  expense_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCustomItem {
  id: string;
  name: string;
  unit: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCustomProduct {
  id: string;
  name: string;
  unit: "kg" | "pack";
  created_at: string;
  updated_at: string;
}

export interface DatabaseConsumedItem {
  id: string;
  item_name: string;
  unit: string;
  quantity: number;
  weight: number | null;
  price: number | null;
  consumption_date: string;
  notes: string | null;
  source_type: "general_expense" | "custom_item";
  source_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBankTransaction {
  id: string;
  type: "cash_received" | "cash_withdrawn";
  amount: number;
  transaction_date: string;
  description: string;
  notes: string | null;
  reference: string | null;
  running_balance: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBankTransactionInput {
  type: "cash_received" | "cash_withdrawn";
  amount: number;
  transaction_date: string;
  description: string;
  notes: string | null;
  reference: string | null;
}

// Database operations
export const db = {
  // Products
  async getProducts(): Promise<DatabaseProduct[]> {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createProduct(product: Omit<DatabaseProduct, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseProduct> {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .insert([{
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<Omit<DatabaseProduct, 'id' | 'created_at'>>): Promise<DatabaseProduct> {
    const { data, error } = await supabase
      .from(TABLES.PRODUCTS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.PRODUCTS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Sales
  async getSales(): Promise<DatabaseSale[]> {
    const { data, error } = await supabase
      .from(TABLES.SALES)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createSale(sale: Omit<DatabaseSale, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseSale> {
    const { data, error } = await supabase
      .from(TABLES.SALES)
      .insert([{
        ...sale,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateSale(id: string, updates: Partial<Omit<DatabaseSale, 'id' | 'created_at'>>): Promise<DatabaseSale> {
    const { data, error } = await supabase
      .from(TABLES.SALES)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteSale(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.SALES)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Expenses
  async getExpenses(): Promise<DatabaseExpense[]> {
    const { data, error } = await supabase
      .from(TABLES.EXPENSES)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createExpense(expense: Omit<DatabaseExpense, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseExpense> {
    const { data, error } = await supabase
      .from(TABLES.EXPENSES)
      .insert([{
        ...expense,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateExpense(id: string, updates: Partial<Omit<DatabaseExpense, 'id' | 'created_at'>>): Promise<DatabaseExpense> {
    const { data, error } = await supabase
      .from(TABLES.EXPENSES)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.EXPENSES)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Misc Expenses
  async getMiscExpenses(): Promise<DatabaseMiscExpense[]> {
    const { data, error } = await supabase
      .from(TABLES.MISC_EXPENSES)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createMiscExpense(expense: Omit<DatabaseMiscExpense, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseMiscExpense> {
    const { data, error } = await supabase
      .from(TABLES.MISC_EXPENSES)
      .insert([{
        ...expense,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateMiscExpense(id: string, updates: Partial<Omit<DatabaseMiscExpense, 'id' | 'created_at'>>): Promise<DatabaseMiscExpense> {
    const { data, error } = await supabase
      .from(TABLES.MISC_EXPENSES)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteMiscExpense(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.MISC_EXPENSES)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Custom Items
  async getCustomItems(): Promise<DatabaseCustomItem[]> {
    const { data, error } = await supabase
      .from(TABLES.CUSTOM_ITEMS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createCustomItem(item: Omit<DatabaseCustomItem, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseCustomItem> {
    const { data, error } = await supabase
      .from(TABLES.CUSTOM_ITEMS)
      .insert([{
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCustomItem(id: string, updates: Partial<Omit<DatabaseCustomItem, 'id' | 'created_at'>>): Promise<DatabaseCustomItem> {
    const { data, error } = await supabase
      .from(TABLES.CUSTOM_ITEMS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCustomItem(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CUSTOM_ITEMS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Custom Products
  async getCustomProducts(): Promise<DatabaseCustomProduct[]> {
    const { data, error } = await supabase
      .from(TABLES.CUSTOM_PRODUCTS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createCustomProduct(product: Omit<DatabaseCustomProduct, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseCustomProduct> {
    const { data, error } = await supabase
      .from(TABLES.CUSTOM_PRODUCTS)
      .insert([{
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateCustomProduct(id: string, updates: Partial<Omit<DatabaseCustomProduct, 'id' | 'created_at'>>): Promise<DatabaseCustomProduct> {
    const { data, error } = await supabase
      .from(TABLES.CUSTOM_PRODUCTS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteCustomProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CUSTOM_PRODUCTS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Consumed Items
  async getConsumedItems(): Promise<DatabaseConsumedItem[]> {
    const { data, error } = await supabase
      .from(TABLES.CONSUMED_ITEMS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createConsumedItem(item: Omit<DatabaseConsumedItem, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseConsumedItem> {
    const { data, error } = await supabase
      .from(TABLES.CONSUMED_ITEMS)
      .insert([{
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateConsumedItem(id: string, updates: Partial<Omit<DatabaseConsumedItem, 'id' | 'created_at'>>): Promise<DatabaseConsumedItem> {
    const { data, error } = await supabase
      .from(TABLES.CONSUMED_ITEMS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteConsumedItem(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.CONSUMED_ITEMS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Bank Transactions
  async getBankTransactions(): Promise<DatabaseBankTransaction[]> {
    const { data, error } = await supabase
      .from(TABLES.BANK_TRANSACTIONS)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createBankTransaction(transaction: DatabaseBankTransactionInput): Promise<DatabaseBankTransaction> {
    const { data, error } = await supabase
      .from(TABLES.BANK_TRANSACTIONS)
      .insert([{
        ...transaction,
        running_balance: 0, // Will be calculated by database trigger or application logic
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateBankTransaction(id: string, updates: Partial<DatabaseBankTransactionInput>): Promise<DatabaseBankTransaction> {
    const { data, error } = await supabase
      .from(TABLES.BANK_TRANSACTIONS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteBankTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.BANK_TRANSACTIONS)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
