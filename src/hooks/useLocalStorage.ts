import { useCallback, useState } from "react";

const STORAGE_VERSION = "v1";

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const fullKey = `${STORAGE_VERSION}:${key}`;

  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(fullKey);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  });

  const update = useCallback(
    (newValue: T) => {
      setValue(newValue);
      try {
        localStorage.setItem(fullKey, JSON.stringify(newValue));
      } catch {
        // Storage full or unavailable; the app remains usable.
      }
    },
    [fullKey],
  );

  return [value, update];
}
