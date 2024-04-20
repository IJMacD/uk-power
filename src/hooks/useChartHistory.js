import { useEffect, useState } from "react";
import { useDeepArray } from "./useDeepArray";
import { DEMAND_CODE } from "../components/App";

const TARGET_FREQUENCY = 50;

/**
 * @typedef HistoryRecord
 * @property {string} code
 * @property {[number, number][]} points
 */

/**
 * @param {string} updated
 * @param {import("./useGridWatch").Source[]} sources
 * @returns {[HistoryRecord[], (newHistory: HistoryRecord[]|((oldHistory: HistoryRecord[]) => HistoryRecord[])) => void]}
 */
export function useChartHistory(updated, sources) {
    const [chartHistory, setChartHistory] = useState(() => [{
        code: "frequency",
        points: /** @type {[Number,number][]} */([]),
    }]);

    const recordedHistory = useDeepArray(chartHistory.map(h => h.code));

    useEffect(() => {
        setChartHistory(history => {
            const d = +new Date(updated);

            // Ignore invalid date
            if (d === 0 || isNaN(d)) {
                return history;
            }

            /** @type {{code: string, points: [number, number][]}[]} */
            const out = [];

            for (const h of history) {

                // Don't double add the most recent point
                const lastPoint = h.points.at(-1);
                if (lastPoint && lastPoint[0] === d) {
                    out.push(h);
                    continue;
                }

                // We need to add a new point,

                // First check if we have special case of frequency
                if (h.code === "frequency") {
                    // find the required source record
                    const s = sources.find(s => s.code === DEMAND_CODE);
                    if (s && s.frequency) {
                        out.push({ code: h.code, points: [...h.points, [d, s.frequency / TARGET_FREQUENCY - 1]] });
                    }
                    else {
                        // We couldn't find it for some reason, make sure we preserve the data
                        out.push(h);
                    }
                    continue;
                }

                // find the required source record
                const s = sources.find(s => s.code === h.code);
                if (s) {
                    out.push({ code: h.code, points: [...h.points, [d, s.value]] });
                }
                else {
                    // We couldn't find it for some reason, make sure we preserve the data
                    out.push(h);
                }
            }

            return out;
        })
    }, [updated, sources, recordedHistory]);

    return [chartHistory, setChartHistory];
}