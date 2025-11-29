export type TransactionType = 'Income' | 'Expense';
export type Status = 'Posted' | 'Parked' | 'Draft';

export interface Transaction {
  // Core Identifiers
  id: string;
  docNumber: string; // SAP Document Number
  
  // Dates
  postingDate: string;
  documentDate: string;
  fiscalYear: string;

  // Classification
  type: TransactionType;
  category: string; // e.g., OPEX, CAPEX
  subCategory: string; // e.g., Travel, Software
  
  // Financials
  description: string;
  amount: number;
  currency: string;
  taxCode: string; // V0, A1
  taxAmount: number;
  
  // Controlling (CO)
  glAccount: string; // G/L Account
  costCenter: string;
  profitCenter: string;
  
  // Partners
  vendorCustomer: string;
  
  // Meta
  paymentMethod: string;
  status: Status;
  user: string;
}

export interface FilterState {
  search: string;
  category: string;
  type: 'All' | TransactionType;
  status: 'All' | Status;
  startDate: string;
  endDate: string;
}

export interface KPI {
  totalDebit: number; // Expense
  totalCredit: number; // Income
  netBalance: number;
  count: number;
}

// Master Data for Categories
export const MASTER_CATEGORIES = [
  "Operational Exp (OPEX)",
  "Capital Exp (CAPEX)",
  "Revenue / Sales",
  "Personnel Costs",
  "Marketing & Ads",
  "Travel & Living",
  "Office Supplies",
  "IT & Software",
  "Utilities",
  "Legal & Professional",
  "Tax & Interest",
  "Depreciation",
  "Inventory",
  "Logistics",
  "Other Income"
];
