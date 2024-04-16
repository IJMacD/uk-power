import { useRef } from "react";


/**
 * Returns a stable array reference if all members of array remain unchanged
 * @template T
 * @param {T[]} array
 * @returns {T[]}
 */
export function useDeepArray(array) {
    const arrayRef = useRef(array);

    if (!arrayCompare(arrayRef.current, array)) {
        arrayRef.current = array;
    }

    return arrayRef.current;
}

/**
 * @template T
 * @param {T[]} a
 * @param {T[]} b
 * @returns {boolean} True if equal, false otherwise
 */
function arrayCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}