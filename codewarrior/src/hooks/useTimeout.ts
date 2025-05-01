import { useEffect, useCallback, useRef } from 'react';

export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);
  const timeoutId = useRef<NodeJS.Timeout>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const set = useCallback(() => {
    timeoutId.current = setTimeout(() => savedCallback.current(), delay || 0);
  }, [delay]);

  const clear = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
  }, []);

  const reset = useCallback(() => {
    clear();
    set();
  }, [clear, set]);

  useEffect(() => {
    if (delay !== null) {
      set();
      return clear;
    }
    return undefined;
  }, [delay, set, clear]);

  return { reset, clear };
};