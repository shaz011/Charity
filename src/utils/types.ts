export interface ProductInput {
  name: string; // Now allows any string, including custom products
  unit: "kg" | "pack";
  salePrice: number;
  quantity: number;
  buyingDate: string; // YYYY-MM-DD
}

export interface Product extends ProductInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaleInput {
  productId: string;
  weight: number;
  pricePerKg: number;
  expectedCash: number;
  receivedCash: number;
  saleDate: string; // YYYY-MM-DD
  topup: number; // Additional payment/adjustment
  charity: number; // Charity amount to be added to arrears
  credit: number; // Credit amount to be added to total received
}

export interface Sale extends SaleInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  arrears: number;
}

// General Expense Types
export interface GeneralExpenseInput {
  name: string; // Now allows any string, not just predefined items
  unit: "kg" | "pack" | "piece" | "liter" | "dozen" | "gram" | "bottle" | "packet";
  price: number;
  quantity: number;
  weight?: number; // Optional weight in kg
  expenseDate: string; // YYYY-MM-DD
  notes?: string; // Optional notes
}

export interface GeneralExpense extends GeneralExpenseInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Custom Items Management
export interface CustomItem {
  id: string;
  name: string;
  unit: "kg" | "pack" | "piece" | "liter" | "dozen" | "gram" | "bottle" | "packet";
  createdAt: string;
  updatedAt: string;
}

export interface CustomItemInput {
  name: string;
  unit: "kg" | "pack" | "piece" | "liter" | "dozen" | "gram" | "bottle" | "packet";
}

// Custom Products Management
export interface CustomProduct {
  id: string;
  name: string;
  unit: "kg" | "pack";
  createdAt: string;
  updatedAt: string;
}

export interface CustomProductInput {
  id?: string;
  name: string;
  unit: "kg" | "pack";
}

// Misc Expense Types - for custom user-defined expenses
export interface MiscExpenseInput {
  name: string; // User can enter any name
  price: number;
  quantity: number;
  expenseDate: string; // YYYY-MM-DD
  notes?: string; // Optional notes
}

export interface MiscExpense extends MiscExpenseInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Item Consumption Types - for tracking what items are consumed daily
export interface ItemConsumedInput {
  itemName: string; // Name of the item consumed
  unit: "kg" | "pack" | "piece" | "liter" | "dozen" | "gram" | "bottle" | "packet";
  quantity: number; // Quantity consumed
  weight?: number; // Optional weight in kg if applicable
  consumptionDate: string; // YYYY-MM-DD
  notes?: string; // Optional notes about consumption
  sourceType: "general_expense" | "custom_item"; // Where the item came from
  sourceId?: string; // ID of the source expense or custom item
}

export interface ItemConsumed extends ItemConsumedInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}



