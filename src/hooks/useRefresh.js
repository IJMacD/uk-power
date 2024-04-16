import { useEffect, useState } from 'react';

/**
 * @param {number} interval
 */
export function useRefresh(interval) {
    const [_, setCounter] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setCounter(c => c + 1), interval);
        return () => clearInterval(id);
    }, []);
}
