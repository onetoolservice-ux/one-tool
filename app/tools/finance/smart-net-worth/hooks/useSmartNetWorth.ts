"use client";
import { useState, useMemo } from "react";
import { showToast } from "@/app/shared/Toast";

export interface AssetItem { id: string; name: string; value: number; type: 'Asset' | 'Liability'; category: string; }

const SAMPLE_DATA: AssetItem[] = [
  { id: '1', name: 'Primary Home', value: 7500000, type: 'Asset', category: 'Real Estate' },
  { id: '2', name: 'Stocks Portfolio', value: 1200000, type: 'Asset', category: 'Investments' },
  { id: '3', name: 'Car Loan', value: 450000, type: 'Liability', category: 'Loans' },
  { id: '4', name: 'Emergency Fund', value: 300000, type: 'Asset', category: 'Cash' },
  { id: '5', name: 'Credit Card Due', value: 45000, type: 'Liability', category: 'Credit' },
];

export function useSmartNetWorth() {
  const [items, setItems] = useState<AssetItem[]>(SAMPLE_DATA);

  const addItem = (item: Omit<AssetItem, "id">) => {
    setItems([...items, { ...item, id: crypto.randomUUID() }]);
    showToast(`${item.type} Added`);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
    showToast("Item Removed");
  };

  const summary = useMemo(() => {
    const assets = items.filter(i => i.type === 'Asset').reduce((s, i) => s + i.value, 0);
    const liabilities = items.filter(i => i.type === 'Liability').reduce((s, i) => s + i.value, 0);
    return { assets, liabilities, netWorth: assets - liabilities };
  }, [items]);

  const chartData = useMemo(() => {
    return items.map(i => ({ name: i.name, value: i.value, type: i.type }));
  }, [items]);

  return { items, addItem, deleteItem, summary, chartData };
}
