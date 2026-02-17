/**
 * Sample Data — lets first-time users see tools in action instantly.
 * Called from empty states to populate analytics store with demo transactions.
 */

import {
  type Transaction, type MonthlyData,
  saveMonthData, calculateSummary, getCurrentMonthKey, monthKeyToLabel,
} from '@/app/components/tools/analytics/analytics-store';

// ── Realistic sample transactions ──────────────────────────────────────────

function makeTxn(
  idx: number, date: string, desc: string, amount: number,
  type: 'credit' | 'debit', category: string,
): Transaction {
  return {
    id: `sample-${idx}-${Date.now()}`,
    date, description: desc, amount, type, category,
    rawData: { Date: date, Description: desc, Amount: String(type === 'debit' ? -amount : amount) },
  };
}

function getSampleTransactions(): Transaction[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = (day: number) => `${y}-${m}-${String(day).padStart(2, '0')}`;

  return [
    // Credits
    makeTxn(1, d(1), 'Salary — Acme Corp', 85000, 'credit', 'Salary'),
    makeTxn(2, d(5), 'Freelance — Logo Design', 12000, 'credit', 'Freelance'),
    makeTxn(3, d(12), 'Cashback — Amazon', 450, 'credit', 'Refund'),
    makeTxn(4, d(20), 'Dividend — Mutual Fund', 3200, 'credit', 'Returns'),

    // Debits
    makeTxn(5, d(1), 'Rent — Apartment', 22000, 'debit', 'Housing'),
    makeTxn(6, d(2), 'Electricity Bill', 2800, 'debit', 'Utilities'),
    makeTxn(7, d(3), 'Swiggy — Dinner', 680, 'debit', 'Dining'),
    makeTxn(8, d(4), 'BigBasket — Groceries', 3400, 'debit', 'Groceries'),
    makeTxn(9, d(5), 'Netflix Subscription', 649, 'debit', 'Subscription'),
    makeTxn(10, d(6), 'Uber — Office Commute', 350, 'debit', 'Transport'),
    makeTxn(11, d(7), 'Zomato — Lunch', 520, 'debit', 'Dining'),
    makeTxn(12, d(8), 'Amazon — Headphones', 2999, 'debit', 'Shopping'),
    makeTxn(13, d(9), 'Petrol — Shell', 2100, 'debit', 'Transport'),
    makeTxn(14, d(10), 'Apollo Pharmacy', 890, 'debit', 'Health'),
    makeTxn(15, d(11), 'Gym Membership', 1500, 'debit', 'Health'),
    makeTxn(16, d(12), 'SIP — Axis Bluechip', 5000, 'debit', 'Investment'),
    makeTxn(17, d(13), 'Airtel Recharge', 599, 'debit', 'Utilities'),
    makeTxn(18, d(14), 'Cafe Coffee Day', 380, 'debit', 'Dining'),
    makeTxn(19, d(15), 'Flipkart — Shirt', 1299, 'debit', 'Shopping'),
    makeTxn(20, d(16), 'Home Loan EMI', 18500, 'debit', 'Loan/EMI'),
    makeTxn(21, d(17), 'D-Mart Groceries', 4200, 'debit', 'Groceries'),
    makeTxn(22, d(18), 'Spotify Premium', 119, 'debit', 'Subscription'),
    makeTxn(23, d(19), 'Birthday Gift — Friend', 1500, 'debit', 'Gifts'),
    makeTxn(24, d(20), 'Insurance Premium — LIC', 3500, 'debit', 'Insurance'),
    makeTxn(25, d(21), 'Metro Card Recharge', 500, 'debit', 'Transport'),
  ];
}

/**
 * Load sample data into analytics store for the current month.
 * Returns the month key so callers can refresh their state.
 */
export function loadSampleData(): string {
  const monthKey = getCurrentMonthKey();
  const txns = getSampleTransactions();
  const summary = calculateSummary(txns);

  const monthData: MonthlyData = {
    monthKey,
    monthLabel: monthKeyToLabel(monthKey),
    fileName: 'sample-data.xlsx (demo)',
    uploadedAt: new Date().toISOString(),
    transactions: txns,
    detectedColumns: {
      date: 'Date', amount: null, creditAmount: null,
      debitAmount: null, description: 'Description', category: null, balance: null,
    },
    rawHeaders: ['Date', 'Description', 'Amount'],
    summary,
  };

  saveMonthData(monthData);
  return monthKey;
}
