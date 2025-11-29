import { uid } from "@/app/utils/uid";
import { LS_KEYS, readLS, writeLS } from "./storage";

/* Types */
export type Txn = {
  id: string;
  date: string;
  type: "Income" | "Expense";
  category: string;
  desc: string;
  amount: number;
};

export type Category = {
  id: string;
  name: string;
  type: "Income" | "Expense";
  color?: string;
};

/* Demo data (used if storage is empty) */
const demoTransactions: Txn[] = [
  {
    id: uid(),
    date: "2025-01-05",
    type: "Expense",
    category: "Groceries",
    desc: "Milk, Bread",
    amount: 450,
  },
  {
    id: uid(),
    date: "2025-01-10",
    type: "Income",
    category: "Salary",
    desc: "Monthly salary",
    amount: 48000,
  },
];

const demoCategories: Category[] = [
  { id: uid(), name: "Groceries", type: "Expense", color: "#10B981" },
  { id: uid(), name: "Bills", type: "Expense", color: "#EF4444" },
  { id: uid(), name: "Salary", type: "Income", color: "#6366F1" },
];

/* Transactions API */
export function getTransactions(): Txn[] {
  const saved = readLS(LS_KEYS.TRANSACTIONS, null);
  if (saved === null) {
    // seed demo
    writeLS(LS_KEYS.TRANSACTIONS, demoTransactions);
    return demoTransactions;
  }
  return saved;
}

export function saveTransactions(data: Txn[]) {
  writeLS(LS_KEYS.TRANSACTIONS, data);
}

export function addTransaction(tx: Omit<Txn, "id">): Txn {
  const newTx = { id: uid(), ...tx };
  const current = getTransactions();
  const updated = [...current, newTx];
  saveTransactions(updated);
  return newTx;
}

export function clearTransactions() {
  saveTransactions([]);
}

/* Categories API */
export function getCategories(): Category[] {
  const saved = readLS(LS_KEYS.CATEGORIES, null);
  if (saved === null) {
    writeLS(LS_KEYS.CATEGORIES, demoCategories);
    return demoCategories;
  }
  return saved;
}

export function saveCategories(list: Category[]) {
  writeLS(LS_KEYS.CATEGORIES, list);
}

export function addCategory(cat: Omit<Category, "id">): Category {
  const newCat = { id: uid(), ...cat };
  const current = getCategories();
  const updated = [...current, newCat];
  saveCategories(updated);
  return newCat;
}
