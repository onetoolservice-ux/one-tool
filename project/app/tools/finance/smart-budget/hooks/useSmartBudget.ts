"use client";

import { useState, useEffect, useMemo } from "react";
import { Transaction, FilterState, KPI } from "../types";

const STORAGE_KEY = "smart-budget-pro-v1";

const SAMPLE_DATA: Transaction[] = [
  { id: "1", date: "2023-10-01", description: "Salary", category: "Salary", type: "Income", amount: 50000 },
  { id: "2", date: "2023-10-05", description: "Rent", category: "Housing", type: "Expense", amount: 15000 },
  { id: "3", date: "2023-10-06", description: "Grocery Shopping", category: "Food", type: "Expense", amount: 4500 },
  { id: "4", date: "2023-10-10", description: "Freelance Project", category: "Freelance", type: "Income", amount: 12000 },
  { id: "5", date: "2023-10-12", description: "Netflix Subscription", category: "Entertainment", type: "Expense", amount: 650 },
  { id: "6", date: "2023-10-15", description: "Uber Rides", category: "Transport", type: "Expense", amount: 1200 },
];

export function useSmartBudget() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    category: "All",
    type: "All",
    startDate: "",
    endDate: "",
  });

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTransactions(JSON.parse(saved));
    } else {
      // Load sample data if empty
      setTransactions(SAMPLE_DATA); 
    }
    setIsLoaded(true);
  }, []);

  // Save Data
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  // Actions
  const addTransaction = (tx: Omit<Transaction, "id">) => {
    const newTx = { ...tx, id: crypto.randomUUID() };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const clearAllData = () => {
    if(confirm("Are you sure? This will delete all local data.")) {
      setTransactions([]);
    }
  };

  const resetToSample = () => {
    setTransactions(SAMPLE_DATA);
  };

  // Engine: Filtering
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(filters.search.toLowerCase()) || 
                            t.category.toLowerCase().includes(filters.search.toLowerCase());
      const matchesType = filters.type === 'All' || t.type === filters.type;
      const matchesCategory = filters.category === 'All' || t.category === filters.category;
      
      let matchesDate = true;
      if (filters.startDate) matchesDate = matchesDate && t.date >= filters.startDate;
      if (filters.endDate) matchesDate = matchesDate && t.date <= filters.endDate;

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, filters]);

  // Engine: KPIs
  const kpi: KPI = useMemo(() => {
    const income = filteredData.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredData.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
      count: filteredData.length
    };
  }, [filteredData]);

  // Engine: Analytics Grouping
  const getGroupedData = (groupBy: 'category' | 'date' | 'type') => {
    const map: Record<string, number> = {};
    filteredData.forEach(t => {
      // Only summarize expenses for category/date usually, but let's do Net for logic
      const val = t.type === 'Expense' ? t.amount : 0; 
      if (val === 0) return; // Skip income for expense charts

      let key = t.category;
      if (groupBy === 'date') key = t.date.substring(0, 7); // YYYY-MM
      if (groupBy === 'type') key = t.type;

      map[key] = (map[key] || 0) + val;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  };

  return {
    transactions,
    filteredData,
    filters,
    setFilters,
    kpi,
    addTransaction,
    deleteTransaction,
    clearAllData,
    resetToSample,
    getGroupedData,
    categories: Array.from(new Set(transactions.map(t => t.category))),
    isLoaded
  };
}
