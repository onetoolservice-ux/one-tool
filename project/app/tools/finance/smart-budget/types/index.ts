export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: TransactionType;
  amount: number;
}

export interface FilterState {
  search: string;
  category: string;
  type: 'All' | TransactionType;
  startDate: string;
  endDate: string;
}

export interface KPI {
  income: number;
  expense: number;
  balance: number;
  count: number;
}
