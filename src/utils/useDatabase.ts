import { useState, useEffect, useCallback } from 'react';
import { db, DatabaseProduct, DatabaseSale, DatabaseExpense, DatabaseMiscExpense, DatabaseCustomItem, DatabaseCustomProduct, DatabaseConsumedItem, DatabaseBankTransaction } from './database';
import { Product, ProductInput, Sale, SaleInput, GeneralExpense, GeneralExpenseInput, MiscExpense, MiscExpenseInput, CustomItem, CustomItemInput, CustomProduct, CustomProductInput, ItemConsumed, ItemConsumedInput, BankTransaction, BankTransactionInput } from './types';

// Convert database types to app types
const mapDatabaseProduct = (dbProduct: DatabaseProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  unit: dbProduct.unit,
  salePrice: dbProduct.sale_price,
  quantity: dbProduct.quantity,
  buyingDate: dbProduct.buying_date,
  createdAt: dbProduct.created_at,
  updatedAt: dbProduct.updated_at,
});

const mapDatabaseSale = (dbSale: DatabaseSale): Sale => ({
  id: dbSale.id,
  productId: dbSale.product_id,
  weightBeforeSale: dbSale.weight_before_sale,
  weightAfterSale: dbSale.weight_after_sale,
  weight: dbSale.weight,
  pricePerKg: dbSale.price_per_kg,
  expectedCash: dbSale.expected_cash,
  receivedCash: dbSale.received_cash,
  saleDate: dbSale.sale_date,
  topup: dbSale.topup,
  charity: dbSale.charity, // Charity amount
  credit: dbSale.credit, // Credit amount
  arrears: dbSale.arrears,
  createdAt: dbSale.created_at,
  updatedAt: dbSale.updated_at,
});

// Convert app types to database types
const mapToDatabaseProduct = (product: ProductInput): Omit<DatabaseProduct, 'id' | 'created_at' | 'updated_at'> => ({
  name: product.name,
  unit: product.unit,
  sale_price: product.salePrice,
  quantity: product.quantity,
  buying_date: product.buyingDate,
});

const mapToDatabaseSale = (sale: SaleInput): Omit<DatabaseSale, 'id' | 'created_at' | 'updated_at'> => ({
  product_id: sale.productId,
  weight_before_sale: sale.weightBeforeSale,
  weight_after_sale: sale.weightAfterSale,
  weight: sale.weight,
  price_per_kg: sale.pricePerKg,
  expected_cash: sale.expectedCash,
  received_cash: sale.receivedCash,
  sale_date: sale.saleDate,
  topup: sale.topup,
  charity: sale.charity, // Charity amount
  credit: sale.credit, // Credit amount
  arrears: sale.expectedCash - (sale.receivedCash + sale.topup + sale.charity + sale.credit),
});

// Convert database types to app types for expenses
const mapDatabaseExpense = (dbExpense: DatabaseExpense): GeneralExpense => ({
  id: dbExpense.id,
  name: dbExpense.name as any, // Type assertion for the enum
  unit: dbExpense.unit as any, // Type assertion for the enum
  price: dbExpense.price,
  quantity: dbExpense.quantity,
  weight: dbExpense.weight || undefined,
  expenseDate: dbExpense.expense_date,
  notes: dbExpense.notes || undefined,
  createdAt: dbExpense.created_at,
  updatedAt: dbExpense.updated_at,
});

// Convert app types to database types for expenses
const mapToDatabaseExpense = (expense: GeneralExpenseInput): Omit<DatabaseExpense, 'id' | 'created_at' | 'updated_at'> => ({
  name: expense.name,
  unit: expense.unit,
  price: expense.price,
  quantity: expense.quantity,
  weight: expense.weight || null,
  expense_date: expense.expenseDate,
  notes: expense.notes || null,
});

// Convert database types to app types for misc expenses
const mapDatabaseMiscExpense = (dbMiscExpense: DatabaseMiscExpense): MiscExpense => ({
  id: dbMiscExpense.id,
  name: dbMiscExpense.name,
  price: dbMiscExpense.price,
  quantity: dbMiscExpense.quantity,
  expenseDate: dbMiscExpense.expense_date,
  notes: dbMiscExpense.notes || undefined,
  createdAt: dbMiscExpense.created_at,
  updatedAt: dbMiscExpense.updated_at,
});

// Convert app types to database types for misc expenses
const mapToDatabaseMiscExpense = (expense: MiscExpenseInput): Omit<DatabaseMiscExpense, 'id' | 'created_at' | 'updated_at'> => ({
  name: expense.name,
  price: expense.price,
  quantity: expense.quantity,
  expense_date: expense.expenseDate,
  notes: expense.notes || null,
});

// Convert database types to app types for consumed items
const mapDatabaseConsumedItem = (dbConsumedItem: DatabaseConsumedItem): ItemConsumed => ({
  id: dbConsumedItem.id,
  itemName: dbConsumedItem.item_name,
  unit: dbConsumedItem.unit as any, // Type assertion for the enum
  quantity: dbConsumedItem.quantity,
  weight: dbConsumedItem.weight || undefined,
  price: dbConsumedItem.price || undefined,
  consumptionDate: dbConsumedItem.consumption_date,
  notes: dbConsumedItem.notes || undefined,
  sourceType: dbConsumedItem.source_type,
  sourceId: dbConsumedItem.source_id || undefined,
  createdAt: dbConsumedItem.created_at,
  updatedAt: dbConsumedItem.updated_at,
});

// Convert app types to database types for consumed items
const mapToDatabaseConsumedItem = (consumedItem: ItemConsumedInput): Omit<DatabaseConsumedItem, 'id' | 'created_at' | 'updated_at'> => ({
  item_name: consumedItem.itemName,
  unit: consumedItem.unit,
  quantity: consumedItem.quantity,
  weight: consumedItem.weight || null,
  price: consumedItem.price || null,
  consumption_date: consumedItem.consumptionDate,
  notes: consumedItem.notes || null,
  source_type: consumedItem.sourceType,
  source_id: consumedItem.sourceId || null,
});

// Convert database types to app types for custom items
const mapDatabaseCustomItem = (dbCustomItem: DatabaseCustomItem): CustomItem => ({
  id: dbCustomItem.id,
  name: dbCustomItem.name,
  unit: dbCustomItem.unit as any,
  createdAt: dbCustomItem.created_at,
  updatedAt: dbCustomItem.updated_at,
});

// Convert app types to database types for custom items
const mapToDatabaseCustomItem = (customItem: CustomItemInput): Omit<DatabaseCustomItem, 'id' | 'created_at' | 'updated_at'> => ({
  name: customItem.name,
  unit: customItem.unit,
});

// Convert database types to app types for custom products
const mapDatabaseCustomProduct = (dbCustomProduct: DatabaseCustomProduct): CustomProduct => ({
  id: dbCustomProduct.id,
  name: dbCustomProduct.name,
  unit: dbCustomProduct.unit,
  createdAt: dbCustomProduct.created_at,
  updatedAt: dbCustomProduct.updated_at,
});

// Convert app types to database types for custom products
const mapToDatabaseCustomProduct = (customProduct: CustomProductInput): Omit<DatabaseCustomProduct, 'id' | 'created_at' | 'updated_at'> => ({
  name: customProduct.name,
  unit: customProduct.unit,
});

// Convert database types to app types for bank transactions
const mapDatabaseBankTransaction = (dbBankTransaction: DatabaseBankTransaction): BankTransaction => ({
  id: dbBankTransaction.id,
  type: dbBankTransaction.type,
  amount: dbBankTransaction.amount,
  transactionDate: dbBankTransaction.transaction_date,
  description: dbBankTransaction.description,
  notes: dbBankTransaction.notes || undefined,
  reference: dbBankTransaction.reference || undefined,
  runningBalance: dbBankTransaction.running_balance,
  createdAt: dbBankTransaction.created_at,
  updatedAt: dbBankTransaction.updated_at,
});

// Convert app types to database types for bank transactions
const mapToDatabaseBankTransaction = (bankTransaction: BankTransactionInput): Omit<DatabaseBankTransaction, 'id' | 'created_at' | 'updated_at' | 'running_balance'> => ({
  type: bankTransaction.type,
  amount: bankTransaction.amount,
  transaction_date: bankTransaction.transactionDate,
  description: bankTransaction.description,
  notes: bankTransaction.notes || null,
  reference: bankTransaction.reference || null,

});

export function useDatabase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<GeneralExpense[]>([]);
  const [miscExpenses, setMiscExpenses] = useState<MiscExpense[]>([]);
  const [customItems, setCustomItems] = useState<CustomItem[]>([]);
  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [consumedItems, setConsumedItems] = useState<ItemConsumed[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from database
  const loadData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsData, salesData, expensesData, miscExpensesData, customItemsData, customProductsData, consumedItemsData, bankTransactionsData] = await Promise.all([
        db.getProducts(),
        db.getSales(),
        db.getExpenses(),
        db.getMiscExpenses(),
        db.getCustomItems(),
        db.getCustomProducts(),
        db.getConsumedItems(),
        db.getBankTransactions(),
      ]);
      
      setProducts(productsData.map(mapDatabaseProduct));
      setSales(salesData.map(mapDatabaseSale));
      setExpenses(expensesData.map(mapDatabaseExpense));
      setMiscExpenses(miscExpensesData.map(mapDatabaseMiscExpense));
      setCustomItems(customItemsData.map(mapDatabaseCustomItem));
      setCustomProducts(customProductsData.map(mapDatabaseCustomProduct));
      setConsumedItems(consumedItemsData.map(mapDatabaseConsumedItem));
      setBankTransactions(bankTransactionsData.map(mapDatabaseBankTransaction));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Product operations
  const createProduct = useCallback(async (input: ProductInput): Promise<void> => {
    try {
      setError(null);
      const dbProduct = await db.createProduct(mapToDatabaseProduct(input));
      const newProduct = mapDatabaseProduct(dbProduct);
      setProducts(prev => [newProduct, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, input: ProductInput): Promise<void> => {
    try {
      setError(null);
      const dbProduct = await db.updateProduct(id, mapToDatabaseProduct(input));
      const updatedProduct = mapDatabaseProduct(dbProduct);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await db.deleteProduct(id);
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
      const dbSale = await db.createSale(mapToDatabaseSale(input));
      const newSale = mapDatabaseSale(dbSale);
      setSales(prev => [newSale, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sale');
      throw err;
    }
  }, []);

  const updateSale = useCallback(async (id: string, input: SaleInput): Promise<void> => {
    try {
      setError(null);
      const dbSale = await db.updateSale(id, mapToDatabaseSale(input));
      const updatedSale = mapDatabaseSale(dbSale);
      setSales(prev => prev.map(s => s.id === id ? updatedSale : s));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sale');
      throw err;
    }
  }, []);

  const deleteSale = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await db.deleteSale(id);
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
      const dbExpense = await db.createExpense(mapToDatabaseExpense(input));
      const newExpense = mapDatabaseExpense(dbExpense);
      setExpenses(prev => [newExpense, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create expense');
      throw err;
    }
  }, []);

  const updateExpense = useCallback(async (id: string, input: GeneralExpenseInput): Promise<void> => {
    try {
      setError(null);
      const dbExpense = await db.updateExpense(id, mapToDatabaseExpense(input));
      const updatedExpense = mapDatabaseExpense(dbExpense);
      setExpenses(prev => prev.map(e => e.id === id ? updatedExpense : e));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      throw err;
    }
  }, []);

  const deleteExpense = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await db.deleteExpense(id);
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
      const dbMiscExpense = await db.createMiscExpense(mapToDatabaseMiscExpense(input));
      const newMiscExpense = mapDatabaseMiscExpense(dbMiscExpense);
      setMiscExpenses(prev => [newMiscExpense, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create misc expense');
      throw err;
    }
  }, []);

  const updateMiscExpense = useCallback(async (id: string, input: MiscExpenseInput): Promise<void> => {
    try {
      setError(null);
      const dbMiscExpense = await db.updateMiscExpense(id, mapToDatabaseMiscExpense(input));
      const updatedMiscExpense = mapDatabaseMiscExpense(dbMiscExpense);
      setMiscExpenses(prev => prev.map(e => e.id === id ? updatedMiscExpense : e));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update misc expense');
      throw err;
    }
  }, []);

  const deleteMiscExpense = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await db.deleteMiscExpense(id);
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
      const dbCustomItem = await db.createCustomItem(mapToDatabaseCustomItem(input));
      const newCustomItem = mapDatabaseCustomItem(dbCustomItem);
      setCustomItems(prev => [newCustomItem, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create custom item');
      throw err;
    }
  }, []);

  const updateCustomItem = useCallback(async (id: string, input: CustomItemInput): Promise<void> => {
    try {
      setError(null);
      const dbCustomItem = await db.updateCustomItem(id, mapToDatabaseCustomItem(input));
      const updatedCustomItem = mapDatabaseCustomItem(dbCustomItem);
      setCustomItems(prev =>
        prev.map(item =>
          item.id === id ? updatedCustomItem : item
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
      await db.deleteCustomItem(id);
      setCustomItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete custom item');
      throw err;
    }
  }, []);

  // Custom Products operations
  const createCustomProduct = useCallback(async (input: CustomProductInput): Promise<void> => {
    try {
      setError(null);
      const dbCustomProduct = await db.createCustomProduct(mapToDatabaseCustomProduct(input));
      const newCustomProduct = mapDatabaseCustomProduct(dbCustomProduct);
      setCustomProducts(prev => [newCustomProduct, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create custom product');
      throw err;
    }
  }, []);

  const updateCustomProduct = useCallback(async (id: string, input: CustomProductInput): Promise<void> => {
    try {
      setError(null);
      const dbCustomProduct = await db.updateCustomProduct(id, mapToDatabaseCustomProduct(input));
      const updatedCustomProduct = mapDatabaseCustomProduct(dbCustomProduct);
      setCustomProducts(prev => prev.map(item => item.id === id ? updatedCustomProduct : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update custom product');
      throw err;
    }
  }, []);

  const deleteCustomProduct = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await db.deleteCustomProduct(id);
      setCustomProducts(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete custom product');
      throw err;
    }
  }, []);

  // Consumed Items operations
  const createConsumedItem = useCallback(async (input: ItemConsumedInput): Promise<void> => {
    try {
      setError(null);
      const dbConsumedItem = await db.createConsumedItem(mapToDatabaseConsumedItem(input));
      const newConsumedItem = mapDatabaseConsumedItem(dbConsumedItem);
      setConsumedItems(prev => [newConsumedItem, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create consumed item');
      throw err;
    }
  }, []);

  const updateConsumedItem = useCallback(async (id: string, input: ItemConsumedInput): Promise<void> => {
    try {
      setError(null);
      const dbConsumedItem = await db.updateConsumedItem(id, mapToDatabaseConsumedItem(input));
      const updatedConsumedItem = mapDatabaseConsumedItem(dbConsumedItem);
      setConsumedItems(prev =>
        prev.map(item =>
          item.id === id ? updatedConsumedItem : item
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
      await db.deleteConsumedItem(id);
      setConsumedItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete consumed item');
      throw err;
    }
  }, []);

  // Bank Transactions operations
  const createBankTransaction = useCallback(async (input: BankTransactionInput): Promise<void> => {
    try {
      setError(null);
      const dbBankTransaction = await db.createBankTransaction(mapToDatabaseBankTransaction(input));
      const newBankTransaction = mapDatabaseBankTransaction(dbBankTransaction);
      setBankTransactions(prev => [newBankTransaction, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bank transaction');
      throw err;
    }
  }, []);

  const updateBankTransaction = useCallback(async (id: string, input: BankTransactionInput): Promise<void> => {
    try {
      setError(null);
      const dbBankTransaction = await db.updateBankTransaction(id, mapToDatabaseBankTransaction(input));
      const updatedBankTransaction = mapDatabaseBankTransaction(dbBankTransaction);
      setBankTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id ? updatedBankTransaction : transaction
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bank transaction');
      throw err;
    }
  }, []);

  const deleteBankTransaction = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await db.deleteBankTransaction(id);
      setBankTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bank transaction');
      throw err;
    }
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
    clearError: () => setError(null),
  };
}
