import { useEffect, useState } from "react";

/**
 * @template T
 * @param {string} key
 * @param {T|(() => T)} defaultValue
 * @returns {[T, ((newValueorSetter: T|((oldValue: T) => T)) => void)]}
 */
export function useSavedState(key, defaultValue) {
    const [state, setState] = useState(() => {
        const saved = localStorage.getItem(key);

        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) { }
        }

        return defaultValue instanceof Function ? defaultValue() : defaultValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [state]);

    return [state, setState];
}