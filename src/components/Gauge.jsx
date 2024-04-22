import React from "react";

/**
 *
 * @param {object} props
 * @param {number} props.value In percent
 * @param {number} props.scale Max scale in percent
 * @returns
 */
export function Gauge({ value, scale = 3 }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={300}
            height={150}
            viewBox="0 0 53.181 26.723"
        >
            <g strokeLinejoin="round">
                <g fill="none">
                    <path
                        stroke="#000"
                        strokeLinecap="round"
                        strokeWidth={0.265}
                        d="M.132.132h52.917V26.59H.132z"
                    />
                    <path
                        stroke="#e79696"
                        strokeLinecap="round"
                        strokeWidth={4}
                        d="M7.116 23.416A19.475 19.475 0 0 1 26.591 3.941a19.475 19.475 0 0 1 19.475 19.475"
                    />
                    <path
                        stroke="#eaea5c"
                        strokeWidth={4}
                        d="M9.725 13.678A19.475 19.475 0 0 1 26.59 3.941a19.475 19.475 0 0 1 16.865 9.737"
                    />
                </g>
                <g fill="none">
                    <path
                        stroke="#5b5"
                        strokeWidth={4}
                        d="M16.853 6.55a19.475 19.475 0 0 1 19.475 0"
                    />
                    <path
                        stroke="#000"
                        strokeLinecap="round"
                        strokeWidth={0.26}
                        d="M5.124 23.416h3.965M26.591 5.826V2.009"
                    />
                </g>
                <g fill="none" stroke="#000" strokeLinecap="round" strokeWidth={0.26}>
                    <path d="M44.068 23.416h3.985M15.818 4.826l2.036 3.455m17.49-.016L37.31 4.83" />
                </g>
                {
                    typeof value === "number" && !isNaN(value) &&
                    <path d="m26.591 3.941 1.569 19.475-1.522 2.391-1.616-2.39z" fill="#F00" style={{ transition: "transform 1s" }} transform={`rotate(${value / scale * 90} 26.56 23.74)`} />
                }
                <g
                    strokeWidth={0.26}
                    fontFamily="'Eras Bold ITC'"
                    fontSize={2.117}
                    letterSpacing={-0.114}
                    textAnchor="end"
                >
                    <text
                        xmlSpace="preserve"
                        x={15.357}
                        y={4.428}
                        style={{
                            lineHeight: 1.1,
                            fontSize: "1.2pt"
                        }}
                    >
                        <tspan x={15.243} y={4.428}>
                            {`-${(scale / 3).toFixed(1)}%`}
                        </tspan>
                    </text>
                    <text
                        xmlSpace="preserve"
                        x={4.464}
                        y={23.61}
                        style={{
                            lineHeight: 1.1,
                            fontSize: "1.2pt"
                        }}
                    >
                        <tspan x={4.35} y={23.61}>
                            {`-${scale}%`}
                        </tspan>
                    </text>
                    <text
                        xmlSpace="preserve"
                        x={42.345}
                        y={4.428}
                        style={{
                            lineHeight: 1.1,
                            fontSize: "1.2pt"
                        }}
                        textAnchor="start"
                    >
                        <tspan x={38.231} y={4.428}>
                            {`+${(scale / 3).toFixed(1)}%`}
                        </tspan>
                    </text>
                    <text
                        xmlSpace="preserve"
                        x={52.618}
                        y={23.61}
                        style={{
                            lineHeight: 1.1,
                            fontSize: "1.2pt",
                        }}
                        textAnchor="start"
                    >
                        <tspan x={48.504} y={23.61}>
                            {`+${scale}%`}
                        </tspan>
                    </text>
                </g>
            </g>
        </svg>
    );
}
