import React, { useEffect, useState } from 'react'
import Query from 'ijmacd-query';
import { Gauge } from './Gauge';

import './App.css';
import { UsageBars } from './UsageBars';
import { SourcesMap } from './SourcesMap';

const API_URL = process.env.NODE_ENV === "production" ? "/api" : 'https://uk-power.ijmacd.com/api';

const TARGET_FREQUENCY = 50;

const App = () => {
  const [updated, setUpdated] = React.useState(null);
  const [sources, setSources] = React.useState([]);
  // const [inputs, setInputs] = React.useState([]);
  const [gaugeScale, setGaugeScale] = useState(3);

  useRefresh(1000);

  React.useEffect(() => {
    const f = () => fetch(API_URL).then(r => r.json()).then(async d => {

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

  const demand = sources.find(s => s.code === 'MAINCALC');

  const frequency = demand ? demand.frequency : TARGET_FREQUENCY;

  const frequencyDiscrepency = ((frequency - TARGET_FREQUENCY) / TARGET_FREQUENCY) * 100;

  const dateTimeFormatter = new Intl.DateTimeFormat([], { timeStyle: "long", timeZone: "Europe/London" });

  return (
    <>
      <div>
        <p>UK Time: {dateTimeFormatter.format()}</p>
        {updated && <p>Updated: {dateTimeFormatter.format(new Date(updated))}</p>}
        {demand && <p>Grid Frequency: {demand.frequency} Hz</p>}
        <h3>Sources:</h3>
        <ul>
          {
            sources.map(s => <li key={s.code} title={s.code}>{s.name}: {s.value} GW</li>)
          }
        </ul>
      </div>
      <SourcesMap sources={sources} />
      <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
        <Gauge discrepency={frequencyDiscrepency} scale={gaugeScale} />
        {frequency} Hz
        <p>
          <button onClick={() => setGaugeScale(3)}>3%</button>
          <button onClick={() => setGaugeScale(1)}>1%</button>
          <button onClick={() => setGaugeScale(0.3)}>0.3%</button>
          <button onClick={() => setGaugeScale(0.1)}>0.1%</button>
        </p>
      </div>
      <UsageBars sources={sources} />
    </>
  );
}

export default App

/**
 * @param {number} interval
 */
function useRefresh(interval) {
  const [_, setCounter] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCounter(c => c + 1), interval);
    return () => clearInterval(id);
  }, []);
}
