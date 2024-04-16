import React, { useState } from 'react'
import { Gauge } from './Gauge';

import './App.css';
import { UsageBars } from './UsageBars';
import { SourcesMap } from './SourcesMap';
import { useGridWatch } from './useGridWatch';
import { useRefresh } from './useRefresh';

const TARGET_FREQUENCY = 50;

const App = () => {
  // const [inputs, setInputs] = React.useState([]);
  const [gaugeScale, setGaugeScale] = useState(3);

  useRefresh(1000);


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


