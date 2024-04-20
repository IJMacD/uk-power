import React from 'react'
import { Gauge } from './Gauge';

import './App.css';
import { UsageBars } from './UsageBars';
import { SourcesMap } from './SourcesMap';
import { useGridWatch } from '../hooks/useGridWatch';
import { useRefresh } from '../hooks/useRefresh';
import { LineChart } from './LineChart';
import { useChartHistory } from '../hooks/useChartHistory';
import { useSavedState } from '../../useSavedState';

const TARGET_FREQUENCY = 50;
export const DEMAND_CODE = "MAINCALC";

const App = () => {
  const [gaugeScale, setGaugeScale] = useSavedState("uk-power.gaugeScale", 3);

  useRefresh(1000);

  const [updated, sources] = useGridWatch();

  const [chartHistory, setChartHistory] = useChartHistory(updated, sources);

  const demand = sources.find(s => s.code === DEMAND_CODE);

  const frequency = demand ? (demand.frequency || 0) : TARGET_FREQUENCY;

  const frequencyDiscrepency = ((frequency - TARGET_FREQUENCY) / TARGET_FREQUENCY) * 100;

  const dateTimeFormatter = new Intl.DateTimeFormat([], { timeStyle: "long", timeZone: "Europe/London" });

  /**
   * @param {string} code
   * @param {boolean} checked
   */
  function handleChartHistoryChange(code, checked) {
    if (checked) {
      setChartHistory(history => [...history, { code, points: [] }]);
    }
    else {
      setChartHistory(history => history.filter(c => c.code !== code));
    }
  }

  return (
    <>
      <div>
        <p>UK Time: {dateTimeFormatter.format()}</p>
        {updated && <p>Updated: {dateTimeFormatter.format(new Date(updated))}</p>}
        {demand &&
          <p>
            <label>
              <input type="checkbox" checked={chartHistory.some(c => c.code === "frequency")} onChange={e => handleChartHistoryChange("frequency", e.target.checked)} />
              {' '}
              Grid Frequency: {demand.frequency} Hz
            </label>
          </p>
        }
        <h3>Sources:</h3>
        <ul>
          {
            sources.map(s => (
              <li key={s.code} title={s.code}>
                <label>
                  <input type="checkbox" checked={chartHistory.some(c => c.code === s.code)} onChange={e => handleChartHistoryChange(s.code, e.target.checked)} />
                  {' '}
                  {s.name}: {s.value} GW
                </label>
              </li>
            ))
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
        {
          chartHistory.map(chartItem => <p key={chartItem.code}>{chartItem.code} <LineChart points={chartItem.points} /></p>)
        }
      </div>
      <UsageBars sources={sources} />
    </>
  );
}

export default App


