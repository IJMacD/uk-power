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

const ONE_HOUR = 60 * 60 * 1000;

export default function App() {
  const [gaugeScale, setGaugeScale] = useSavedState("uk-power.gaugeScale", 3);
  const [lineChartScale, setLineChartScale] = useSavedState("uk-power.lineChartScale", ONE_HOUR);
  const [lineChartPercent, setLineChartPercent] = useSavedState("uk-power.lineChartPercent", false);

  useRefresh(1000);

  const [updated, sources, history] = useGridWatch();

  const frequencyHistory = useFrequencyHistory(updated, sources);

  const [selectedChartHistory, setSelectedChartHistory] = useSavedState("uk-power.selectedChartHistory", ["frequency"]);

  const demand = sources.find(s => s.code === DEMAND_CODE);

  const frequency = demand ? (demand.frequency || NaN) : TARGET_FREQUENCY;

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
          <Gauge value={frequencyDiscrepency} scale={gaugeScale} />
          {frequency > 0 && `${frequency} Hz`}
          <p style={{ width: 300, margin: 0 }}>
            <button onClick={() => setGaugeScale(3)}>3%</button>
            <button onClick={() => setGaugeScale(1)}>1%</button>
            <button onClick={() => setGaugeScale(0.3)}>0.3%</button>
            <button onClick={() => setGaugeScale(0.1)}>0.1%</button>
          </p>
        </div>
        {
          selectedChartHistory.length > 0 &&
          <p style={{ width: 300, margin: 0 }}>
            <button onClick={() => setLineChartScale(ONE_HOUR)} disabled={lineChartScale === ONE_HOUR}>1h</button>
            <button onClick={() => setLineChartScale(3 * ONE_HOUR)} disabled={lineChartScale === 3 * ONE_HOUR}>3h</button>
            <button onClick={() => setLineChartScale(6 * ONE_HOUR)} disabled={lineChartScale === 6 * ONE_HOUR}>6h</button>
            <button onClick={() => setLineChartScale(12 * ONE_HOUR)} disabled={lineChartScale === 12 * ONE_HOUR}>12h</button>
            <button onClick={() => setLineChartScale(24 * ONE_HOUR)} disabled={lineChartScale === 24 * ONE_HOUR}>24h</button>
            <br />
            <button onClick={() => setLineChartPercent(false)} disabled={!lineChartPercent}>GW</button>
            <button onClick={() => setLineChartPercent(true)} disabled={lineChartPercent}>%</button>
          </p>
        }
        {
          selectedChartHistory.map(chartItemCode => {
            let points;
            if (chartItemCode === "frequency") {
              points = frequencyHistory;
            }
            else if (lineChartPercent) {
              const demandPoints = history.find(h => h.code === DEMAND_CODE)?.points.filter(p => p[1] > 0) || [];
              points = history.find(h => h.code === chartItemCode)?.points.filter(p => p[1] > 0).map((p, i) => [p[0], 100 * p[1] / demandPoints[i][1]]) || [];
            }
            else {
              points = history.find(h => h.code === chartItemCode)?.points.filter(p => p[1] > 0) || [];
            }

            return (
              <p key={chartItemCode} style={{ width: 300, margin: 0 }}>
                {chartItemCode}
                <br />
                <LineChart points={points} xRange={lineChartScale} yGridMajor={10} style={{ width: 300 }} />
              </p>
            );
          })
        }
      </div>
      <UsageBars sources={sources} />
    </>
  );
}

