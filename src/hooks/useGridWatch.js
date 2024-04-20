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
 *
 * @returns {[string,Source[]]}
 */
export function useGridWatch() {
    const [updated, setUpdated] = React.useState("");
    const [sources, setSources] = React.useState(/** @type {Source[]} */([]));

    React.useEffect(() => {
        const f = () => fetch(API_URL).then(r => r.json()).then(async (d) => {

            const sources = d.sources.map(s => s.code === "MAINCALC" ? { ...s, value: -s.value } : s);

            const q = new Query({ sources });

            /** @type {Source[]} */
            const results = /** @type {any[]} */(await q.run("FROM sources SELECT code, name, value, frequency ORDER BY value DESC", { output: "objects" }));

            setSources(results);

            setUpdated(d.date);
        });
        f();
        const id = setInterval(f, UPDATE_FREQUENCY);
        return () => clearInterval(id);
    }, []);

    return [updated, sources];
}
