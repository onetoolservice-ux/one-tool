"use client";

import { useState, useEffect } from "react";
import Card from "../components/Card";
import { readLS, writeLS } from "../utils/storage";
import { Download, Upload, RotateCcw } from "lucide-react";

export default function SettingsPage() {
  const [currency, setCurrency] = useState("INR");
  const [financialYear, setFinancialYear] = useState("2025-2026");
  const [autoCategory, setAutoCategory] = useState(true);

  // Load stored settings on mount
  useEffect(() => {
    const saved = readLS("ots_budget_settings_v1") || {};
    if (saved.currency) setCurrency(saved.currency);
    if (saved.financialYear) setFinancialYear(saved.financialYear);
    if (saved.autoCategory !== undefined) setAutoCategory(saved.autoCategory);
  }, []);

  // Save settings to LS
  const saveSettings = () => {
    writeLS("ots_budget_settings_v1", {
      currency,
      financialYear,
      autoCategory,
    });
    alert("Settings saved successfully.");
  };

  // Download backup JSON
  const downloadBackup = () => {
    const data = {
      transactions: readLS("ots_budget_txns_v1") || [],
      categories: readLS("ots_budget_categories_v1") || [],
      settings: readLS("ots_budget_settings_v1") || {},
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "onetool_budget_backup.json";
    a.click();
  };

  // Upload backup JSON
  const uploadBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result, string);
        if (data.transactions) writeLS("ots_budget_txns_v1", data.transactions);
        if (data.categories)
          writeLS("ots_budget_categories_v1", data.categories);
        if (data.settings) writeLS("ots_budget_settings_v1", data.settings);
        alert("Backup restored successfully.");
      } catch {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  // Reset all data
  const resetAll = () => {
    if (!confirm("Are you sure? This will remove ALL your budget data."))
      return;
    writeLS("ots_budget_txns_v1", []);
    writeLS("ots_budget_categories_v1", []);
    writeLS("ots_budget_settings_v1", {});
    alert("All data cleared.");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-main">Finance Settings</h1>
        <p className="text-sm text-muted">
          Configure your default currency, calculation modes, and backup data.
        </p>
      </div>

      {/* Currency */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">General Preferences</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Currency */}
          <div>
            <label className="text-sm text-muted">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          {/* Financial Year */}
          <div>
            <label className="text-sm text-muted">Financial Year</label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            >
              <option>2024–2025</option>
              <option>2025–2026</option>
              <option>2026–2027</option>
            </select>
          </div>
        </div>

        {/* Auto category */}
        <div className="flex items-center gap-3 mt-2">
          <input
            type="checkbox"
            checked={autoCategory}
            onChange={(e) => setAutoCategory(e.target.checked)}
            className="w-4 h-4"
          />
          <label className="text-sm text-muted">
            Enable Smart Auto-Categorisation
          </label>
        </div>

        <button
          onClick={saveSettings}
          className="px-4 py-2 bg-black text-white rounded-lg mt-3 text-sm"
        >
          Save Settings
        </button>
      </Card>

      {/* Backup */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Data Backup & Restore</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={downloadBackup}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg"
          >
            <Download size={16} /> Download Backup
          </button>

          <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer">
            <Upload size={16} /> Restore Backup
            <input type="file" className="hidden" onChange={uploadBackup} />
          </label>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 space-y-4 border-red-300">
        <h2 className="text-lg font-semibold text-red-600">Danger Zone</h2>
        <p className="text-sm text-muted">
          Reset all budget data including transactions, categories, and
          settings.
        </p>

        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
        >
          <RotateCcw size={16} /> Reset Everything
        </button>
      </Card>
    </div>
  );
}
