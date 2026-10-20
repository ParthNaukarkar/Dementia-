/**
 * Safe Storage Adapter for Smriti Setu
 * 
 * Provides an isomorphic, fault-tolerant Storage implementation.
 * - In browser: Delegates to window.localStorage with quota-error shielding.
 * - In Node.js / SSR / Unit Tests: Gracefully falls back to an in-memory Map.
 * - Guarantees zero `ReferenceError: localStorage is not defined` crashes.
 */

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  public get length(): number {
    return this.store.size;
  }

  public clear(): void {
    this.store.clear();
  }

  public getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  public key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  public removeItem(key: string): void {
    this.store.delete(key);
  }

  public setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

const memoryFallback = new MemoryStorage();

export function getSafeStorage(): Storage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Test read/write in case of Safari private browsing or blocked storage
      const testKey = '__smriti_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    }
  } catch {
    // Falls through to memory storage
  }
  return memoryFallback;
}

export const safeStorage: Storage = {
  get length(): number {
    return getSafeStorage().length;
  },
  clear(): void {
    getSafeStorage().clear();
  },
  getItem(key: string): string | null {
    return getSafeStorage().getItem(key);
  },
  key(index: number): string | null {
    return getSafeStorage().key(index);
  },
  removeItem(key: string): void {
    getSafeStorage().removeItem(key);
  },
  setItem(key: string, value: string): void {
    getSafeStorage().setItem(key, value);
  },
};

const sessionMemoryFallback = new MemoryStorage();

export function getSafeSessionStorage(): Storage {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const testKey = '__smriti_session_storage_test__';
      window.sessionStorage.setItem(testKey, '1');
      window.sessionStorage.removeItem(testKey);
      return window.sessionStorage;
    }
  } catch {
    // Falls through to memory storage
  }
  return sessionMemoryFallback;
}

export const safeSessionStorage: Storage = {
  get length(): number {
    return getSafeSessionStorage().length;
  },
  clear(): void {
    getSafeSessionStorage().clear();
  },
  getItem(key: string): string | null {
    return getSafeSessionStorage().getItem(key);
  },
  key(index: number): string | null {
    return getSafeSessionStorage().key(index);
  },
  removeItem(key: string): void {
    getSafeSessionStorage().removeItem(key);
  },
  setItem(key: string, value: string): void {
    getSafeSessionStorage().setItem(key, value);
  },
};
