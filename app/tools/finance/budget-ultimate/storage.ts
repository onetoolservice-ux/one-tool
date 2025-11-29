export const LS_KEYS = {
  TRANSACTIONS: "ots_budget_txns_v2",
  CATEGORIES: "ots_budget_categories_v1",
  VARIANTS: "ots_budget_variants_v1",
  SETTINGS: "ots_budget_settings_v1",
};

export function readLS(key: string, fallback: any = null) {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function writeLS(key: string, value: any) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // noop
  }
}
