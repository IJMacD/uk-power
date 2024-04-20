import React from 'react'
import { Gauge } from './Gauge';

import './App.css';
import { UsageBars } from './UsageBars';
import { SourcesMap } from './SourcesMap';
import { DEMAND_CODE, useGridWatch } from '../hooks/useGridWatch';
import { useRefresh } from '../hooks/useRefresh';
import { LineChart } from './LineChart';
import { useFrequencyHistory } from '../hooks/useFrequencyHistory';
import { useSavedState } from '../hooks/useSavedState';

const TARGET_FREQUENCY = 50;

export default function App() {
  const [gaugeScale, setGaugeScale] = useSavedState("uk-power.gaugeScale", 3);

  useRefresh(1000);

  const [updated, sources, history] = useGridWatch();

  const frequencyHistory = useFrequencyHistory(updated, sources);

  const [selectedChartHistory, setSelectedChartHistory] = useSavedState("uk-power.selectedChartHistory", ["frequency"]);

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
      setSelectedChartHistory(history => [...history, code]);
    }
    else {
      setSelectedChartHistory(history => history.filter(c => c !== code));
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
              <input type="checkbox" checked={selectedChartHistory.includes("frequency")} onChange={e => handleChartHistoryChange("frequency", e.target.checked)} />
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
                  <input type="checkbox" checked={selectedChartHistory.includes(s.code)} onChange={e => handleChartHistoryChange(s.code, e.target.checked)} />
                  {' '}
                  {s.name}: {s.value} GW
                </label>
              </li>
            ))
          }
        </ul>
      </div>
      <SourcesMap sources={sources} />
      <div style={{ display: "flex", flex: 1, flexWrap: "wrap", textAlign: "center" }}>
        <div style={{ width: 300 }}>
          <Gauge discrepency={frequencyDiscrepency} scale={gaugeScale} />
          {frequency} Hz
          <p>
            <button onClick={() => setGaugeScale(3)}>3%</button>
            <button onClick={() => setGaugeScale(1)}>1%</button>
            <button onClick={() => setGaugeScale(0.3)}>0.3%</button>
            <button onClick={() => setGaugeScale(0.1)}>0.1%</button>
          </p>
        </div>
        {
          selectedChartHistory.map(chartItemCode => {
            const points = chartItemCode === "frequency" ?
              frequencyHistory :
              history.find(h => h.code === chartItemCode)?.points.filter(p => p[1] > 0) || [];

            return (
              <p key={chartItemCode} style={{ width: 300 }}>
                {chartItemCode}
                <br />
                <LineChart points={points} style={{ width: 300 }} />
              </p>
            );
          })
        }
      </div>
      <UsageBars sources={sources} />
    </>
  );
}

