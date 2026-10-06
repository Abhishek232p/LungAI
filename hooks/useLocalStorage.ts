import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error(`useLocalStorage: could not read "${key}"`, error);
      return initialValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Keeps the latest value available inside the memoized setter so that
  // functional updates (prev => next) always work on current data.
  const storedValueRef = useRef<T>(storedValue);
  storedValueRef.current = storedValue;

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      const valueToStore =
        value instanceof Function ? value(storedValueRef.current) : value;
      storedValueRef.current = valueToStore;
      setStoredValue(valueToStore);
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`useLocalStorage: could not write "${key}"`, error);
      }
    },
    [key]
  );

  // Keep multiple tabs in sync.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== key) return;
      try {
        const next = event.newValue ? (JSON.parse(event.newValue) as T) : initialValue;
        storedValueRef.current = next;
        setStoredValue(next);
      } catch (error) {
        console.error(`useLocalStorage: could not parse update for "${key}"`, error);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
