import { uid } from "@/app/utils/uid";

export const demoCategories = [
  { id: uid(), name: "Groceries", type: "Expense", color: "#10B981" },
  { id: uid(), name: "Bills", type: "Expense", color: "#EF4444" },
  { id: uid(), name: "Salary", type: "Income", color: "#6366F1" },
];
