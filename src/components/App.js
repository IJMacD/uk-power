import React from 'react'
import ukmap from '../img/map.svg';
import Query from 'ijmacd-query';

import './App.css';

const API_URL = process.env.NODE_ENV === "production" ? "/api" : 'http://localhost:8000/api';

const FRAME_RATE = 20;

const interconnects = [
  {
    code: "INTIRL",
    path: "M155 290 L180 280",
    width: 4,
  },
  {
    code: "INTEW",
    path: "M145 340 L190 340 L215 355",
    width: 4,
  },
  {
    code: "INTFR",
    path: "M365 460 L355 450",
    width: 4,
  },
  {
    code: "INTNEM",
    path: "M410 444 L360 444",
    width: 4,
  },
  {
    code: "INTNED",
    path: "M435 410 L350 440",
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
    path: "M370 340 L320 360",
    width: 4,
  },
  {
    code: "BIOMASS",
    path: "M120 440 L200 460",
    width: 4,
  },
  {
    code: "COAL",
    path: "M340 235 L270 270",
    width: 4,
  },
  {
    code: "OIL",
    path: "M260 520 L270 475",
    width: 4,
  }
];

const App = () => {
  const [updated, setUpdated] = React.useState(null);
  const [sources, setSources] = React.useState([]);
  const [inputs, setInputs] = React.useState([]);
  const [offsets, setOffsets] = React.useState(interconnects.map(_ => 0));

  React.useEffect(() => {
    const f = () => fetch(API_URL).then(r => r.json()).then(async d => {

      const sources = d.sources.map(s => s.code === "MAINCALC" ? { ...s, value: -s.value } : s);

      const q = new Query({ sources });

      const results = await q.run("FROM sources SELECT code, name, value ORDER BY value DESC", { output: "objects" });
      const inputs = await q.run("FROM sources WHERE code != 'RENEW' AND value > 0 SELECT code, name, value ORDER BY value DESC", { output: "objects" });

      setSources(results);
      setInputs(inputs);
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

  return (
    <>
      <div>
        <p>UK Time: {new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}</p>
        {updated && <p>Updated: {new Date(updated).toLocaleString("en-GB", { timeZone: "Europe/London" })}</p>}
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
            return <React.Fragment key={ic.code}>
              <path d={ic.path} fill="none" stroke="darkblue" strokeWidth={ic.width + 2} strokeLinecap="round" />
              <path d={ic.path} fill="none" stroke={!source || source.value === 0 ? "#ff3366" : "#00ff00"} strokeWidth={ic.width} strokeLinecap="round" strokeDasharray={`1 ${2 * ic.width}`} strokeDashoffset={-offsets[i] / ic.width} />
            </React.Fragment>;
          })
        }
      </svg>
      <div>
        <div style={{ display: "flex" }}>
          {
            inputs.map(s => <div style={{ width: 25 * s.value }} className="source-block" title={`${s.name}: ${s.value}`}>{s.name}</div>)
          }
        </div>
        {demand && <div style={{ width: 25 * demand.value }} className="source-block" title={`${demand.name}: ${demand.value}`}>{demand.name}</div>}
      </div>
    </>
  );
}

export default App