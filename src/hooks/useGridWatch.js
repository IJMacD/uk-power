import React from 'react';
import Query from 'ijmacd-query';

const API_URL = process.env.NODE_ENV === "production" ? "/api" : 'https://uk-power.ijmacd.com/api';

export const DEMAND_CODE = "MAINCALC";

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
    const [updated, setUpdated] = React.useState(null);
    const [sources, setSources] = React.useState([]);

    React.useEffect(() => {
        const f = () => fetch(API_URL).then(r => r.json()).then(async (d) => {

            const sources = d.sources.map(s => s.code === "MAINCALC" ? { ...s, value: -s.value } : s);

            const q = new Query({ sources });

            const results = await q.run("FROM sources SELECT code, name, value, frequency ORDER BY value DESC", { output: "objects" });
            // const inputs = await q.run("FROM sources WHERE code != 'RENEW' AND code != 'CARBON' AND value > 0 SELECT code, name, value ORDER BY value DESC", { output: "objects" });
            setSources(results);
            // setInputs(inputs);
            setUpdated(d.date);
        });
        f();
        const id = setInterval(f, 5 * 60 * 1000);
        return () => clearInterval(id);
    }, []);

    return [updated, sources];
}
