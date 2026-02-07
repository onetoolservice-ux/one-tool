import { safeLocalStorage } from './storage';

const TOOL_PREFIX = 'otsd-tool-';

export function saveToolData(toolId: string, data: Record<string, unknown>): void {
  try {
    safeLocalStorage.setItem(`${TOOL_PREFIX}${toolId}`, JSON.stringify(data));
  } catch {
    // Silently fail - localStorage may be full or unavailable
  }
}

export function loadToolData<T extends Record<string, unknown>>(toolId: string, defaults: T): T {
  try {
    const raw = safeLocalStorage.getItem(`${TOOL_PREFIX}${toolId}`);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function exportToolData(toolId: string): string | null {
  try {
    return safeLocalStorage.getItem(`${TOOL_PREFIX}${toolId}`);
  } catch {
    return null;
  }
}
