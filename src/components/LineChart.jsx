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
    let minY = Math.min(0, ...filteredPoints.map(p => p[1]));
    let maxY = Math.max(0, ...filteredPoints.map(p => p[1]));
    if (!isNaN(yGridMajor) && yGridMajor > 0) {
        maxY = yGridMajor * Math.ceil(maxY / yGridMajor);
        minY = yGridMajor * Math.floor(minY / yGridMajor);
    }
    const yRange = maxY - minY;

    if (yRange === 0) {
        return null;
    }

    const width = 300;
    const height = 150;

    const g = 15;

    const xScale = width / xRange;
    const yScale = height / yRange;

    const d = filteredPoints.map((p, i) => {
        const x = width - (maxX - p[0]) * xScale;
        const y = height - (p[1] - minY) * yScale;

        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");

    const xGridLines = [];
    const xGridLabels = [];
    const hourFormatter = new Intl.DateTimeFormat([], { hour: "2-digit", timeZone: "Europe/London" });
    if (xGridMajor > 0) {
        for (let i = minX - (minX % xGridMajor); i <= maxX; i += xGridMajor) {
            const x = width - (maxX - i) * xScale;
            if (x > 0) {
                xGridLines.push(x);
                xGridLabels.push(hourFormatter.format(new Date(i)));
            }
        }
    }

    const yGridLines = [];
    const yGridLabels = [];
    if (yGridMajor > 0) {
        for (let i = minY - (minY % yGridMajor); i <= maxY; i += yGridMajor) {
            if (i > 0) {
                yGridLines.push(height - (i - minY) * yScale);
                yGridLabels.push(`${i}`);
            }
        }
    }

    return (
        <svg viewBox={`${-g} ${-g} ${width + 2 * g} ${height + g * 2}`} {...otherProps}>
            {/* major vertical gridlines */}
            <path d={xGridLines.map(x => `M ${x} 0 V ${height}`).join(" ")} fill="none" stroke="#CCC" />
            {/* major vertical grid labels */}
            {
                xGridLabels.map((v, i) => <text key={i} x={xGridLines[i] - 5} y={height + 8} style={{ fontSize: "6pt" }} fill="#CCC">{v}</text>)
            }
            {/* major horizontal gridlines */}
            <path d={yGridLines.map(x => `M 0 ${x} H ${width}`).join(" ")} fill="none" stroke="#CCC" />
            {/* major horizontal grid labels */}
            {
                yGridLabels.map((v, i) => <text key={i} x={-1} y={yGridLines[i]} style={{ fontSize: "6pt" }} textAnchor="end" fill="#CCC">{v}</text>)
            }
            {/* Values */}
            <path d={d} fill="none" stroke="red" />
            {/* Y-Axis */}
            <path d={`M 0 0 V ${height}`} fill="none" stroke="black" />
            {/* X-Axis */}
            <path d={`M 0 ${height - (0 - minY) * yScale} H ${width}`} fill="none" stroke="black" />
        </svg>
    )
}