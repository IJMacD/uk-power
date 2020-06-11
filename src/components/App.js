import React from 'react'
import ukmap from '../img/map.svg';

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
    path: "M340 130 L220 220",
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
    path: "M390 340 L300 360",
    width: 4,
  },
  {
    code: "BIOMASS",
    path: "M120 440 L200 460",
    width: 4,
  },
  {
    code: "COAL",
    path: "M350 240 L270 270",
    width: 4,
  },
  {
    code: "OIL",
    path: "M260 520 L270 475",
    width: 4,
  }
];

const App = () => {
  const [ sources, setSources ] = React.useState([]);
  const [ offsets, setOffsets ] = React.useState(interconnects.map(_ => 0));

  React.useEffect(() => {
    const f = () => fetch('http://localhost:8000').then(r => r.json()).then(d => setSources(d.sources));
    f();
    const id = setInterval(f, 10 * 60 * 1000);
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

  return <div style={{display:"flex"}}>
    <div>
      UK Time: {new Date().toLocaleString("en-GB", { timeZone: "Europe/London" })}
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
        interconnects.map((ic,i) => {
          return <React.Fragment key={ic.code}>
            <path d={ic.path} fill="none" stroke="darkblue" strokeWidth={ic.width+2} strokeLinecap="round" />
            <path d={ic.path} fill="none" stroke={offsets[i] === 0 ? "#ff3366" : "#00ff00"} strokeWidth={ic.width} strokeLinecap="round" strokeDasharray={`1 ${2*ic.width}`} strokeDashoffset={-offsets[i]/ic.width} />
          </React.Fragment>;
        })
      }
    </svg>
  </div>
}

export default App