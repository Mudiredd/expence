
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string; // Added to associate transaction with a user
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // Store as ISO string (e.g., YYYY-MM-DD) for input, convert to Timestamp for Firestore
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType; // So categories can be income-specific or expense-specific
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string; // For pie chart segment colors
}

export interface MonthlySummary {
  month: string; // e.g., "Jan 2024"
  income: number;
  expenses: number;
}
