
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string; 
  type: TransactionType;
  category: string;
  amount: number;
  date: string; 
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType; 
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string; 
}

export interface MonthlySummary {
  month: string; 
  income: number;
  expenses: number;
}

export type LoanRatePeriod = 'year' | 'month' | 'rupees_per_100_per_month';

export interface Loan {
  id: string;
  userId: string;
  loanName: string;
  lenderName: string;
  principalAmount: number;
  interestRate: number;
  ratePeriod: LoanRatePeriod;
  loanTermYears: number;
  startDate: string; // YYYY-MM-DD stored as string, converted to Timestamp for Firestore
  totalAmountPaid: number;
  // status: 'active' | 'paid_off'; // Future enhancement
}
