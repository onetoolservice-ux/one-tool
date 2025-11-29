"use client";

import { clearAllUserData } from "../utils/storage";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  const handleClear = () => {
    clearAllUserData();
    router.refresh();
    alert("Demo data cleared. You can now add your own transactions!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="border rounded-lg p-4 space-y-4">
        <h2 className="font-semibold">Data Management</h2>

        <button
          onClick={handleClear}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Clear Demo Data
        </button>
      </div>
    </div>
  );
}
