import React from "react";

/**
 * @typedef {{code: string;name: string;value: number;}} Source
 */

/**
 *
 * @param {object} props
 * @param {Source[]} props.inputs
 * @param {Source} props.renewables
 * @param {Source} props.carbonNeutral
 * @param {Source} props.demand
 * @returns
 */
export function UsageBars({ inputs, renewables, carbonNeutral, demand }) {

    return (
        <div>
            <div style={{ display: "flex" }}>
                {
                    inputs.map(s => <div style={{ width: 25 * s.value }} className="source-block" title={`${s.name}: ${s.value}`}>{s.name}</div>)
                }
            </div>
            {renewables && <div style={{ width: 25 * renewables.value }} className="source-block" title={`${renewables.name}: ${renewables.value}`}>{renewables.name}</div>}
            {renewables && <div style={{ width: 25 * carbonNeutral.value }} className="source-block" title={`${carbonNeutral.name}: ${carbonNeutral.value}`}>{carbonNeutral.name}</div>}
            {demand && <div style={{ width: 25 * -demand.value }} className="source-block" title={`${demand.name}: ${demand.value}`}>{demand.name}</div>}
        </div>
    )
}