import React from 'react';
import Query from 'ijmacd-query';

const API_URL = process.env.NODE_ENV === "production" ? "/api" : 'https://uk-power.ijmacd.com/api';

export const DEMAND_CODE = "MAINCALC";

const UPDATE_FREQUENCY = 1 * 60 * 1000;

/**
 * @typedef Source
 * @property {string} code
 * @property {string} name
 * @property {number} value
 * @property {number} [frequency]
 */

/**
 * @typedef HistoryRecord
 * @property {string} code
 * @property {import('./useFrequencyHistory').Point[]} points
 */

/**
 *
 * @returns {[string,Source[],HistoryRecord[]]}
 */
export function useGridWatch() {
    const [updated, setUpdated] = React.useState("");
    const [sources, setSources] = React.useState(/** @type {Source[]} */([]));
    const [history, setHistory] = React.useState(/** @type {HistoryRecord[]} */([]));

    React.useEffect(() => {
        const f = () => fetch(API_URL).then(r => r.json()).then(async (d) => {

            const sources = d.sources.map(s => s.code === "MAINCALC" ? { ...s, value: -s.value } : s);

            const q = new Query({ sources });

            /** @type {Source[]} */
            const results = /** @type {any[]} */(await q.run("FROM sources SELECT code, name, value, frequency ORDER BY value DESC", { output: "objects" }));

            setSources(results);

            setUpdated(d.date);

            const historyStart = +parseDate(d.lgr[0][9], "Europe/London");

            /** @type {[string, ...number[]][]} */
            const historySources = d.lgt[0];

            // 10-minute interval
            const delta = 10 * 60 * 1000;

            /** @type {{code: string, points: [number, number][]}[]} */
            const history = historySources.map(source => {
                const [code, ...values] = source;


                return {
                    code,
                    points: values.map((v, i) => [historyStart + i * delta, v]),
                };
            });


            setHistory(history);
        });
        f();
        const id = setInterval(f, UPDATE_FREQUENCY);
        return () => clearInterval(id);
    }, []);

    return [updated, sources, history];
}

/**
 *
 * @param {string} date e.g. 2024-04-20 10:35:00
 * @param {string} timeZone e.g. Europe/London
 */
function parseDate(date, timeZone) {
    const tempDate = new Date(`${date.replace(" ", "T")}+00:00`);

    const offset = getTimezoneOffset(tempDate, timeZone);

    const adjustedDate = new Date(+tempDate - offset);

    return adjustedDate;
}

/**
 * Gets offset  in millisconds for a given time zone at specific date
 * Positive is ahead of UTC, negative is behind UTC.
 * @param {Date} date
 * @param {string} timeZone e.g. Europe/London
 */
function getTimezoneOffset(date, timeZone) {
    /** @type {Intl.DateTimeFormatOptions} */
    const formatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone,
    };

    const zoneFormatter = Intl.DateTimeFormat("sv-SE", formatOptions);

    // Locale "sv-SE" gives dates in 'YYYY-MM-DD hh:mm:ss' format
    const zoneString = zoneFormatter.format(date);

    // Pretend zone string is UTC to get offset
    const fakeDate = new Date(`${zoneString.replace(" ", "T")}+00:00`);

    return +fakeDate - +date;
}
