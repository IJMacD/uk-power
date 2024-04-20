import React from "react";

const ONE_HOUR = 60 * 60 * 1000;

/**
 *
 * @param {object} props
 * @param {number[][]} props.points
 * @param {number} [props.xRange]
 * @param {number} [props.xGridMajor]
 * @param {number} [props.yGridMajor]
 * @param {React.CSSProperties} [props.style]
 */
export function LineChart({ points, xRange = ONE_HOUR, xGridMajor = ONE_HOUR, yGridMajor = NaN, ...otherProps }) {
    const maxX = points.at(-1)?.[0];

    if (typeof maxX === "undefined") {
        return null;
    }

    const filteredPoints = points.filter(p => p[0] >= maxX - xRange);
    const minX = maxX - xRange;
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

    const xGridlines = [];
    if (xGridMajor > 0) {
        for (let i = minX - (minX % xGridMajor); i < maxX; i += xGridMajor) {
            if (i > 0) {
                xGridlines.push(width - (maxX - i) * xScale);
            }
        }
    }

    const yGridlines = [];
    if (yGridMajor > 0) {
        for (let i = minY - (minY % yGridMajor); i < maxY; i += yGridMajor) {
            if (i > 0) {
                yGridlines.push(height - (i - minY) * yScale);
            }
        }
    }

    return (
        <svg viewBox={`${-g} ${-g} ${width + 2 * g} ${height + g * 2}`} {...otherProps}>
            {/* Y-Axis */}
            <path d={`M 0 0 V ${height}`} fill="none" stroke="black" />
            {/* major vertical gridlines */}
            <path d={xGridlines.map(x => `M ${x} 0 V ${height}`).join(" ")} fill="none" stroke="#CCC" />
            {/* X-Axis */}
            <path d={`M 0 ${height - (0 - minY) * yScale} H ${width}`} fill="none" stroke="black" />
            {/* major horizontal gridlines */}
            <path d={yGridlines.map(x => `M 0 ${x} H ${width}`).join(" ")} fill="none" stroke="#CCC" />
            {/* Values */}
            <path d={d} fill="none" stroke="red" />
        </svg>
    )
}