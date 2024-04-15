import React, { useState } from 'react'
import ukmap from '../img/map.svg';
import Query from 'ijmacd-query';
import { Gauge } from './Gauge';

import './App.css';
import { UsageBars } from './UsageBars';

const API_URL = process.env.NODE_ENV === "production" ? "/api" : 'https://uk-power.ijmacd.com/api';

const FRAME_RATE = 20;
const TARGET_FREQUENCY = 50;

const interconnects = [
  {
    // County Antrim in Northern Ireland to South Ayrshire in Scotland
    code: "INTIRL",
    path: "M155 290 L180 280",
    width: 4,
  },
  {
    // Rush North Beach, County Dublin, Ireland, to Barkby Beach in North Wales
    code: "INTEW",
    path: "M145 340 L190 340 L215 355",
    width: 4,
  },
  {
    // Sangatte (France) to Folkestone (UK)
    code: "INTFR",
    path: "M370 455 L355 450",
    width: 4,
  },
  {
    // Peuplingues (France) to Folkestone (UK)
    code: "INTELEC",
    path: "M370 465 L350 455",
    width: 4,
  },
  {
    // Caen (France) to Portsmouth (UK)
    code: "INTIFA2",
    path: "M305 535 L290 470",
    width: 4,
  },
  {
    // Zeebrugge, Belgium to Richborough Energy Park in Kent (UK)
    code: "INTNEM",
    path: "M410 444 L360 444",
    width: 4,
  },
  {
    // Rotterdam (Netherlands) to Kent(UK)
    code: "INTNED",
    path: "M435 410 L350 440",
    width: 4,
  },
  {
    // Kvilldal in Norway to Blyth in the UK
    code: "INTNSL",
    path: "M450 130 L260 250",
    width: 4,
  },
  {
    // Jutland
    code: "G_INTVKL",
    path: "M450 350 L320 370",
    width: 4,
  },
  {
    code: "WIND",
    path: "M350 130 L250 180",
    width: 4,
  },
  {
    code: "SOLAR",
    path: "M100 510 L170 490",
    width: 4,
  },
  {
    code: "NUCLEAR",
    path: "M100 100 L170 190",
    width: 4,
  },
  {
    code: "CCGT",
    path: "M330 310 L300 320",
    width: 4,
  },
  {
    code: "BIOMASS",
    path: "M160 440 L200 460",
    width: 4,
  },
  {
    code: "NPSHYD",
    path: "M160 380 L210 390",
    width: 4,
  },
  {
    code: "COAL",
    path: "M325 260 L270 270",
    width: 4,
  },
  {
    code: "OIL",
    path: "M220 530 L240 470",
    width: 4,
  }
];

const App = () => {
  const [updated, setUpdated] = React.useState(null);
  const [sources, setSources] = React.useState([]);
  // const [inputs, setInputs] = React.useState([]);
  const [offsets, setOffsets] = React.useState(interconnects.map(_ => 0));
  const [gaugeScale, setGaugeScale] = useState(3);

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

  React.useEffect(() => {
    const id = setInterval(() => setOffsets(offsets => {
      return interconnects.map((ic, i) => {
        const offset = offsets[i];

        const source = sources.find(s => s.code === ic.code);

        if (!source) return offset;

        const delta = source.value;

        return offset + delta;
      });
    }), 1000 / FRAME_RATE);

    return () => clearInterval(id);
  }, [sources]);

  const demand = sources.find(s => s.code === 'MAINCALC');

  const frequency = demand ? demand.frequency : TARGET_FREQUENCY;

  const frequencyDiscrepency = ((frequency - TARGET_FREQUENCY) / TARGET_FREQUENCY) * 100;

  return (
    <>
      <div>
        <p>UK Time: {new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}</p>
        {updated && <p>Updated: {new Date(updated).toLocaleString("en-GB", { timeZone: "Europe/London" })}</p>}
        {demand && <p>Grid Frequency: {demand.frequency} Hz</p>}
        <h3>Sources:</h3>
        <ul>
          {
            sources.map(s => <li key={s.code} title={s.code}>{s.name}: {s.value} GW</li>)
          }
        </ul>
      </div>
      <svg viewBox="0 0 440 600" width={440}>
        <image href={ukmap} />
        {
          interconnects.map((ic, i) => {
            const source = sources.find(s => s.code === ic.code);
            return <g key={ic.code}>
              <path d={ic.path} fill="none" stroke="darkblue" strokeWidth={ic.width + 2} strokeLinecap="round" />
              <path d={ic.path} fill="none" stroke={!source || source.value === 0 ? "#ff3366" : "#00ff00"} strokeWidth={ic.width} strokeLinecap="round" strokeDasharray={`1 ${2 * ic.width}`} strokeDashoffset={-offsets[i] / ic.width} />
              <title>{ic.code}</title>
            </g>;
          })
        }
      </svg>
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