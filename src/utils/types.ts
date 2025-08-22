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
  weightBeforeSale: number; // Weight of item + container before sale (e.g., rice + pot)
  weightAfterSale: number; // Weight of item + container after sale
  weight: number; // Actual weight sold (weightBeforeSale - weightAfterSale)
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
  price?: number; // Price per unit from the source item
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

// Bank Account Transaction Types
export interface BankTransactionInput {
  type: "cash_received" | "cash_withdrawn";
  amount: number;
  transactionDate: string; // YYYY-MM-DD
  description: string;
  notes?: string; // Optional notes about the transaction
  reference?: string; // Optional reference number or receipt number
}

export interface BankTransaction extends BankTransactionInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  runningBalance: number; // Running balance after this transaction
}

// Bank Account Summary
export interface BankAccountSummary {
  totalCashReceived: number;
  totalCashWithdrawn: number;
  currentBalance: number;
  lastTransactionDate: string | null;
  transactionCount: number;
}

// Family Payment Types
export interface FamilyPaymentInput {
  familyMemberName: string;
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  paymentType: "monthly_support" | "emergency" | "special_occasion" | "education" | "medical" | "other";
  description: string;
  notes?: string; // Optional notes about the payment
  isRecurring: boolean; // Whether this is a regular monthly payment
  nextPaymentDue?: string; // YYYY-MM-DD for recurring payments
}

export interface FamilyPayment extends FamilyPaymentInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Family Member for managing recurring payments
export interface FamilyMemberInput {
  name: string;
  relationship: string; // e.g., "Mother", "Brother", "Sister", "Child"
  monthlyAmount?: number; // Default monthly amount
  paymentDay?: number; // Day of month for recurring payments (1-31)
  isActive: boolean; // Whether payments are currently active
  notes?: string;
}

export interface FamilyMember extends FamilyMemberInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Family Payment Summary
export interface FamilyPaymentSummary {
  totalPaidThisMonth: number;
  totalPaidThisYear: number;
  activeFamilyMembers: number;
  upcomingPayments: number;
  lastPaymentDate: string | null;
  paymentCount: number;
}



