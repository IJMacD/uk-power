import { useEffect, useState } from "react";
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
 * @returns {HistoryRecord[]}
 */
export function useChartHistory(updated, sources) {
    const [chartHistory, setChartHistory] = useState(() => [
        {
            code: "frequency",
            points: /** @type {[Number,number][]} */([]),
        },
        ...sources.map(s => ({
            code: s.code,
            points: /** @type {[Number,number][]} */([]),
        }))
    ]);

    useEffect(() => {
        setChartHistory(history => {
            const d = +new Date(updated);

            // Ignore invalid date
            if (d === 0 || isNaN(d)) {
                return history;
            }

            /** @type {{code: string, points: [number, number][]}[]} */
            const out = [];

            // Handle frequency first
            const hFreq = history.find(h => h.code === "frequency") || {
                code: "frequency",
                points: [],
            };

            const lastPoint = hFreq.points.at(-1);
            if (lastPoint && lastPoint[0] === d) {
                out.push(hFreq);
            }
            else {
                const sFreq = sources.find(s => s.code === DEMAND_CODE);
                if (sFreq && sFreq?.frequency) {
                    out.push({ code: "frequency", points: [...hFreq.points, [d, sFreq.frequency / TARGET_FREQUENCY - 1]] });
                }
                else {
                    // We couldn't find it for some reason, make sure we preserve the data
                    out.push(hFreq);
                }
            }


            for (const s of sources) {
                const h = history.find(h => h.code === s.code) || {
                    code: s.code,
                    points: [],
                };

                // Don't double add the most recent point
                const lastPoint = h.points.at(-1);
                if (lastPoint && lastPoint[0] === d) {
                    out.push(h);
                    continue;
                }

                if (s) {
                    out.push({ code: s.code, points: [...h.points, [d, s.value]] });
                }
                else {
                    // We couldn't find it for some reason, make sure we preserve the data
                    out.push(h);
                }
            }

            return out;
        })
    }, [updated, sources]);

    return chartHistory;
}