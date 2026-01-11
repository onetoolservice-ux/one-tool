/**
 * Safe Storage Utility
 * 
 * Handles localStorage with quota management, fallback to sessionStorage,
 * and proper error handling for private browsing mode
 */

import { logger } from './logger';

type StorageType = 'localStorage' | 'sessionStorage';

interface StorageOptions {
  fallback?: StorageType;
  maxSize?: number; // in bytes
}

class SafeStorage {
  private storage: Storage | null = null;
  private fallbackStorage: Storage | null = null;
  private storageType: StorageType;
  private fallbackType: StorageType | null = null;

  constructor(type: StorageType = 'localStorage', options: StorageOptions = {}) {
    this.storageType = type;
    this.fallbackType = options.fallback || (type === 'localStorage' ? 'sessionStorage' : null);
    this.initializeStorage();
  }

  private initializeStorage() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // Test if storage is available
      const testKey = '__storage_test__';
      this.storage = window[this.storageType];
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
    } catch (e) {
      // Storage not available (private browsing, quota exceeded, etc.)
      this.storage = null;
      logger.warn(`${this.storageType} not available, using fallback`);

      // Try fallback storage
      if (this.fallbackType) {
        try {
          const testKey = '__storage_test__';
          this.fallbackStorage = window[this.fallbackType];
          this.fallbackStorage.setItem(testKey, 'test');
          this.fallbackStorage.removeItem(testKey);
        } catch (e2) {
          this.fallbackStorage = null;
          logger.warn(`${this.fallbackType} also not available`);
        }
      }
    }
  }

  private getStorage(): Storage | null {
    return this.storage || this.fallbackStorage;
  }

  /**
   * Get item from storage
   * Handles both JSON-serialized values and plain strings for backward compatibility
   */
  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    const storage = this.getStorage();
    if (!storage) {
      return defaultValue;
    }

    try {
      const item = storage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      // Try to parse as JSON first
      try {
        return JSON.parse(item) as T;
      } catch (parseError) {
        // If JSON.parse fails, check if it's a plain string value
        // This handles backward compatibility with old values stored as plain strings
        // Check if the value doesn't look like JSON (doesn't start with {, [, or ")
        const isPlainString = !item.trim().match(/^[\{\["]/);
        
        // If it's a plain string and we're expecting a string type (defaultValue is null or string),
        // return it as-is for backward compatibility
        if (isPlainString && (defaultValue === null || typeof defaultValue === 'string')) {
          return item as T;
        }
        
        // For non-string types or malformed JSON, return default
        logger.warn(`Failed to parse storage key "${key}" as JSON, returning default value`);
        return defaultValue;
      }
    } catch (error) {
      logger.error(`Error reading storage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in storage
   */
  setItem<T>(key: string, value: T): boolean {
    const storage = this.getStorage();
    if (!storage) {
      logger.warn('Storage not available, cannot save data');
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      const size = new Blob([serialized]).size;

      // Check quota (5MB limit for localStorage, 5-10MB for sessionStorage)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (size > maxSize) {
        logger.warn(`Item "${key}" exceeds size limit (${size} bytes)`);
        return false;
      }

      storage.setItem(key, serialized);
      return true;
    } catch (error: any) {
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        logger.warn(`Storage quota exceeded for key "${key}"`);
        this.handleQuotaExceeded(key);
        return false;
      }

      logger.error(`Error setting storage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): boolean {
    const storage = this.getStorage();
    if (!storage) {
      return false;
    }

    try {
      storage.removeItem(key);
      return true;
    } catch (error) {
      logger.error(`Error removing storage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all items from storage
   */
  clear(): boolean {
    const storage = this.getStorage();
    if (!storage) {
      return false;
    }

    try {
      storage.clear();
      return true;
    } catch (error) {
      logger.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  getUsage(): { used: number; available: number; percentage: number } {
    const storage = this.getStorage();
    if (!storage) {
      return { used: 0, available: 0, percentage: 0 };
    }

    let used = 0;
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          const value = storage.getItem(key) || '';
          used += new Blob([key + value]).size;
        }
      }
    } catch (error) {
      logger.error('Error calculating storage usage:', error);
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const available = maxSize - used;
    const percentage = (used / maxSize) * 100;

    return { used, available, percentage };
  }

  /**
   * Clean up old items when quota is exceeded
   */
  private handleQuotaExceeded(newKey: string) {
    const storage = this.getStorage();
    if (!storage) {
      return;
    }

    try {
      // Get all keys and their sizes
      const items: Array<{ key: string; size: number; timestamp: number }> = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key !== newKey) {
          const value = storage.getItem(key) || '';
          const size = new Blob([key + value]).size;
          
          // Try to get timestamp from value
          let timestamp = 0;
          try {
            const parsed = JSON.parse(value);
            if (parsed.timestamp) {
              timestamp = parsed.timestamp;
            }
          } catch {
            // If no timestamp, use current time (keep it)
            timestamp = Date.now();
          }
          
          items.push({ key, size, timestamp });
        }
      }

      // Sort by timestamp (oldest first)
      items.sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest items until we have space
      const newItemSize = new Blob([newKey]).size;
      let freedSpace = 0;
      
      for (const item of items) {
        if (freedSpace >= newItemSize) {
          break;
        }
        storage.removeItem(item.key);
        freedSpace += item.size;
      }

      logger.info(`Freed ${freedSpace} bytes by removing old items`);
    } catch (error) {
      logger.error('Error handling quota exceeded:', error);
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    return this.getStorage() !== null;
  }
}

// Export singleton instances
export const safeLocalStorage = new SafeStorage('localStorage', {
  fallback: 'sessionStorage',
});

export const safeSessionStorage = new SafeStorage('sessionStorage');

// Export class for custom instances
export { SafeStorage };
