import React from "react";

/**
 * @typedef {{code: string;name: string;value: number;}} Source
 */

/**
 *
 * @param {object} props
 * @param {Source[]} props.sources
 * @returns
 */
export function UsageBars({ sources }) {
    if (!sources.length) {
        return null;
    }

    const inputs = sources.filter(s => s.value > 0 && s.code !== "RENEW" && s.code !== "CARBON");
    const demand = sources.find(s => s.code === 'MAINCALC');
    const renewables = sources.find(s => s.code === 'RENEW');
    const carbonNeutral = sources.find(s => s.code === 'CARBON');
    const outputs = sources.filter(s => s.value < 0 && s.code !== "MAINCALC");

    const totalIn = inputs.reduce((total, s) => total + s.value, 0);
    const totalOut = (demand ? -demand.value : 0);// + outputs.reduce((total, s) => total + -s.value, 0);

    const SCALE = 25;

    const bgSize = SCALE * 10;

    const usageBarsStyle = {
        borderLeft: "1px solid #333",
        borderBottom: "1px solid #333",
        borderRight: "1px dashed #CCC",
        paddingBottom: "0.5em",
        backgroundImage: `linear-gradient(to right, transparent, transparent ${bgSize - 1}px, #999 ${bgSize - 1}px, #999)`,
        backgroundSize: `${bgSize}px`,
    };

    return (
        <div style={usageBarsStyle}>
            <p style={{ textAlign: "right" }}>{totalIn.toFixed(2)} GW</p>
            {/* <div style={{ width: SCALE * totalIn }} className="source-block">Total In {(totalIn).toFixed(2)} GW</div> */}
            <div style={{ display: "flex" }}>
                {
                    inputs.map(s => <div style={{ width: SCALE * s.value }} className="source-block" title={`${s.name}: ${s.value}`}>{s.name} {((s.value / totalOut) * 100).toFixed()}%</div>)
                }
            </div>
            {renewables && <div style={{ width: SCALE * renewables.value }} className="source-block" title={`${renewables.name}: ${renewables.value}`}>{renewables.name} {((renewables.value / totalOut) * 100).toFixed()}%</div>}
            {carbonNeutral && <div style={{ width: SCALE * carbonNeutral.value }} className="source-block" title={`${carbonNeutral.name}: ${carbonNeutral.value}`}>{carbonNeutral.name} {((carbonNeutral.value / totalOut) * 100).toFixed()}%</div>}
            <div style={{ display: "flex", justifyContent: "right" }}>
                {
                    outputs.map(s => <div style={{ width: SCALE * -s.value }} className="source-block" title={`${s.name}: ${s.value}`}>{s.name}</div>)
                }
            </div>
            <div style={{ display: "flex" }}>
                {demand && <div style={{ width: SCALE * -demand.value }} className="source-block" title={`${demand.name}: ${demand.value}`}>{demand.name} {(-demand.value).toFixed(2)} GW</div>}
                {/* {
                    outputs.map(s => <div style={{ width: SCALE * -s.value }} className="source-block" title={`${s.name}: ${s.value}`}>{s.name}</div>)
                } */}
            </div>
            {/* <div style={{ width: SCALE * totalOut }} className="source-block">Total Out {(totalOut).toFixed(2)} GW</div> */}
            {/* <p style={{ textAlign: "right" }}>{totalOut.toFixed(2)} GW</p> */}
            {/* {demand && <p style={{ textAlign: "right" }}>{(-demand.value).toFixed(2)} GW</p>} */}
        </div>
    )
}