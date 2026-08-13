/**
 * Debounces a rapidly changing value (e.g. search input) before downstream work.
 * Delay is in milliseconds; cleanup clears the pending timer on change/unmount.
 */
import { useState, useEffect } from 'react';

/**
 * Returns `value` only after it has stayed unchanged for `delay` ms.
 * @param value - Current raw value to debounce.
 * @param delay - Quiet period in milliseconds before the debounced value updates.
 * @returns The debounced value (lags behind `value` while typing).
 * @example
 * const debounced = useDebounce(searchTerm, 300);
 */
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
