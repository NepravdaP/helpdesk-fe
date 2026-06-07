import { useEffect, useState } from "react";

// useState, который сохраняет значение в localStorage и восстанавливает при загрузке.
// Используем для пользовательских настроек интерфейса (например, набор столбцов таблицы).
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage недоступен — молча игнорируем
    }
  }, [key, value]);

  return [value, setValue] as const;
}
