import React from "react";

const ONE_HOUR = 60 * 60 * 1000;

/**
 *
 * @param {object} props
 * @param {number[][]} props.points
 * @param {number} [props.xRange]
 * @param {React.CSSProperties} [props.style]
 */
export function LineChart({ points, xRange = ONE_HOUR, ...otherProps }) {
    const maxX = points.at(-1)?.[0];

    if (typeof maxX === "undefined") {
        return null;
    }

    const filteredPoints = points.filter(p => p[0] >= maxX - xRange);
    const minY = Math.min(0, ...filteredPoints.map(p => p[1]));
    const maxY = Math.max(0, ...filteredPoints.map(p => p[1]));
    const yRange = maxY - minY;

    if (yRange === 0) {
        return null;
    }

    const width = 300;
    const height = 150;

    const g = 10;

    const xScale = width / xRange;
    const yScale = height / yRange;

    const d = filteredPoints.map((p, i) => {
        const x = width - (maxX - p[0]) * xScale;
        const y = height - (p[1] - minY) * yScale;

        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");

    const xGridline = width - (maxX % ONE_HOUR) * xScale;

    return (
        <svg viewBox={`${-g} ${-g} ${width + 2 * g} ${height + g * 2}`} {...otherProps}>
            {/* Y-Axis */}
            <path d={`M 0 0 V ${height}`} fill="none" stroke="black" />
            {/* x-value major gridline */}
            <path d={`M ${xGridline} 0 V ${height}`} fill="none" stroke="#888" />
            {/* X-Axis */}
            <path d={`M 0 ${height - (0 - minY) * yScale} H ${width}`} fill="none" stroke="black" />
            {/* Values */}
            <path d={d} fill="none" stroke="red" />
        </svg>
    )
}