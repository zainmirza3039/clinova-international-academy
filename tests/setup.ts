const storage = new Map<string, string>();

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      get length() { return storage.size; },
      clear() { storage.clear(); },
      getItem(key: string) { return storage.get(String(key)) ?? null; },
      key(index: number) { return Array.from(storage.keys())[index] ?? null; },
      removeItem(key: string) { storage.delete(String(key)); },
      setItem(key: string, value: string) { storage.set(String(key), String(value)); },
    },
  });
}
