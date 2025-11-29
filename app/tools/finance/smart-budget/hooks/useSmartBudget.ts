"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Transaction, FilterState, KPI, MASTER_CATEGORIES } from "../types";
import { showToast } from "@/app/shared/Toast"; // Corrected Path

const STORAGE_KEY = "smart-budget-enterprise-v1";
const MODE_KEY = "smart-budget-mode-pref";

export type UserMode = 'Personal' | 'Enterprise';

const SAMPLE_DATA: Transaction[] = [
  { 
    id: "1", docNumber: "10000001", postingDate: "2023-10-01", documentDate: "2023-09-28", fiscalYear: "2023",
    type: "Income", category: "Revenue / Sales", subCategory: "Service Revenue",
    description: "Q3 Consulting Fees", amount: 150000, currency: "INR", 
    taxCode: "A1", taxAmount: 27000, glAccount: "400000", costCenter: "CC-101", profitCenter: "PC-900",
    vendorCustomer: "C-Tech Corp", paymentMethod: "Bank Transfer", status: "Posted", user: "ADMIN"
  },
  { 
    id: "2", docNumber: "20000001", postingDate: "2023-10-05", documentDate: "2023-10-05", fiscalYear: "2023",
    type: "Expense", category: "Operational Exp (OPEX)", subCategory: "Rent",
    description: "Office HQ Rent Oct", amount: 45000, currency: "INR", 
    taxCode: "V0", taxAmount: 0, glAccount: "600100", costCenter: "CC-200", profitCenter: "PC-100",
    vendorCustomer: "V-RealEstate", paymentMethod: "Bank Transfer", status: "Posted", user: "ADMIN"
  },
  { 
    id: "3", docNumber: "20000002", postingDate: "2023-10-10", documentDate: "2023-10-08", fiscalYear: "2023",
    type: "Expense", category: "IT & Software", subCategory: "Cloud Hosting",
    description: "AWS Invoice #9921", amount: 12500, currency: "INR", 
    taxCode: "V1", taxAmount: 2250, glAccount: "600350", costCenter: "CC-IT", profitCenter: "PC-100",
    vendorCustomer: "V-AmazonWeb", paymentMethod: "Credit Card", status: "Posted", user: "DEV01"
  }
];

export function useSmartBudget() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mode, setMode] = useState<UserMode>('Enterprise');
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: "", category: "All", type: "All", status: "All", startDate: "", endDate: "",
  });

  // Load Data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedMode = localStorage.getItem(MODE_KEY) as UserMode;
    if (savedData) {
      try { setTransactions(JSON.parse(savedData)); } catch (e) { setTransactions(SAMPLE_DATA); }
    } else {
      setTransactions(SAMPLE_DATA); 
    }
    if (savedMode) setMode(savedMode);
    setIsLoaded(true);
  }, []);

  // Save Data
  useEffect(() => {
    if (isLoaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions, isLoaded]);

  const toggleMode = () => {
    const newMode = mode === 'Personal' ? 'Enterprise' : 'Personal';
    setMode(newMode);
    localStorage.setItem(MODE_KEY, newMode);
    showToast(`Switched to ${newMode} Mode`);
  };

  const addTransaction = (partialTx: any) => {
    // Auto-calculate Fiscal Year
    const dateObj = new Date(partialTx.postingDate);
    const fy = dateObj.getMonth() >= 3 ? dateObj.getFullYear() : dateObj.getFullYear() - 1; // India FY (Apr-Mar)

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      docNumber: (Math.floor(Math.random() * 90000000) + 10000000).toString(),
      fiscalYear: fy.toString(),
      currency: "INR", taxCode: "V0", taxAmount: 0,
      glAccount: "N/A", costCenter: "N/A", profitCenter: "N/A",
      vendorCustomer: "One-Time", paymentMethod: "Cash",
      status: "Posted", user: "YOU", subCategory: "General",
      postingDate: new Date().toISOString().split('T')[0],
      documentDate: new Date().toISOString().split('T')[0],
      ...partialTx
    };
    setTransactions(prev => [newTx, ...prev]);
    showToast("Transaction Saved");
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    showToast("Record Deleted");
  };

  const clearAllData = () => {
    setTransactions([]);
    showToast("All Data Cleared");
  };

  const resetToSample = () => {
    setTransactions(SAMPLE_DATA);
    showToast("Sample Data Restored");
  };

  const exportCSV = () => {
    if (transactions.length === 0) return showToast("No data to export");
    const headers = Object.keys(transactions[0]).join(",");
    const rows = transactions.map(t => Object.values(t).join(",")).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `smart_budget_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    showToast("CSV Exported Successfully");
  };

  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const s = filters.search.toLowerCase();
      const matchesSearch = t.description.toLowerCase().includes(s) || 
                            t.docNumber.includes(s) || 
                            t.glAccount.includes(s) ||
                            t.vendorCustomer.toLowerCase().includes(s);
      const matchesType = filters.type === 'All' || t.type === filters.type;
      const matchesCategory = filters.category === 'All' || t.category === filters.category;
      const matchesStatus = filters.status === 'All' || t.status === filters.status;
      
      let matchesDate = true;
      if (filters.startDate) matchesDate = matchesDate && t.postingDate >= filters.startDate;
      if (filters.endDate) matchesDate = matchesDate && t.postingDate <= filters.endDate;

      return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesDate;
    });
  }, [transactions, filters]);

  const kpi: KPI = useMemo(() => {
    const totalCredit = filteredData.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = filteredData.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    return { totalCredit, totalDebit, netBalance: totalCredit - totalDebit, count: filteredData.length };
  }, [filteredData]);

  const getGroupedData = (groupBy: string) => {
    const map: Record<string, number> = {};
    filteredData.forEach(t => {
      if (t.type !== 'Expense') return;
      let key = (t as any)[groupBy] || 'N/A';
      map[key] = (map[key] || 0) + t.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  };

  const categories = useMemo(() => Array.from(new Set([...MASTER_CATEGORIES, ...transactions.map(t => t.category)])), [transactions]);

  return { transactions, filteredData, filters, setFilters, kpi, addTransaction, deleteTransaction, clearAllData, resetToSample, getGroupedData, categories, isLoaded, mode, toggleMode, exportCSV };
}
