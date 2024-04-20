import { useEffect, useState } from "react";
import { DEMAND_CODE } from "./useGridWatch";

const TARGET_FREQUENCY = 50;

/**
 * @typedef {[number, number]} Point
 */

/**
 * @param {string} updated
 * @param {import("./useGridWatch").Source[]} sources
 * @returns {Point[]}
 */
export function useFrequencyHistory(updated, sources) {
    const [frequencyHistory, setFrequencyHistory] = useState(/** @type {[Number,number][]} */([]));

    useEffect(() => {
        setFrequencyHistory(points => {
            const d = +new Date(updated);

            // Ignore invalid date
            if (d === 0 || isNaN(d)) {
                return points;
            }

            // Don't update the points if the the most recent point has the same date
            const lastPoint = points.at(-1);
            if (lastPoint && lastPoint[0] === d) {
                return points;
            }

            // Find the source record containing the frequency
            const sFreq = sources.find(s => s.code === DEMAND_CODE);
            if (sFreq && sFreq?.frequency) {
                return [...points, [d, sFreq.frequency / TARGET_FREQUENCY - 1]];
            }

            // We couldn't find it for some reason, make sure we preserve the data
            return points;
        })
    }, [updated, sources]);

    return frequencyHistory;
}