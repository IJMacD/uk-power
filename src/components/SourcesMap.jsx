import React from "react";
import ukmap from '../img/map.svg';

const interconnects = [
    {
        // County Antrim in Northern Ireland to South Ayrshire in Scotland
        code: "INTIRL",
        path: "M155 290 L180 280",
        width: 4,
    },
    {
        // Rush North Beach, County Dublin, Ireland, to Barkby Beach in North Wales
        code: "INTEW",
        path: "M145 340 L190 340 L215 355",
        width: 4,
    },
    {
        // Sangatte (France) to Folkestone (UK)
        code: "INTFR",
        path: "M370 455 L355 450",
        width: 4,
    },
    {
        // Peuplingues (France) to Folkestone (UK)
        code: "INTELEC",
        path: "M370 465 L350 455",
        width: 4,
    },
    {
        // Caen (France) to Portsmouth (UK)
        code: "INTIFA2",
        path: "M305 535 L290 470",
        width: 4,
    },
    {
        // Zeebrugge, Belgium to Richborough Energy Park in Kent (UK)
        code: "INTNEM",
        path: "M410 444 L360 444",
        width: 4,
    },
    {
        // Rotterdam (Netherlands) to Kent(UK)
        code: "INTNED",
        path: "M435 410 L350 440",
        width: 4,
    },
    {
        // Kvilldal in Norway to Blyth in the UK
        code: "INTNSL",
        path: "M450 130 L260 250",
        width: 4,
    },
    {
        // Jutland
        code: "INTVKL",
        path: "M450 350 L320 370",
        width: 4,
    },
    {
        code: "WIND",
        path: "M350 130 L250 180",
        width: 4,
    },
    {
        code: "SOLAR",
        path: "M100 510 L170 490",
        width: 4,
    },
    {
        code: "NUCLEAR",
        path: "M100 100 L170 190",
        width: 4,
    },
    {
        code: "CCGT",
        path: "M330 310 L300 320",
        width: 4,
    },
    {
        code: "BIOMASS",
        path: "M160 440 L200 460",
        width: 4,
    },
    {
        code: "NPSHYD",
        path: "M160 380 L210 390",
        width: 4,
    },
    {
        code: "COAL",
        path: "M325 260 L270 270",
        width: 4,
    },
    {
        code: "OIL",
        path: "M220 530 L240 470",
        width: 4,
    }
];

const FRAME_RATE = 20;

export function SourcesMap({ sources }) {
    const [offsets, setOffsets] = React.useState(interconnects.map(_ => 0));

    React.useEffect(() => {
        const id = setInterval(() => setOffsets(offsets => {
            return interconnects.map((ic, i) => {
                const offset = offsets[i];

                const source = sources.find(s => s.code === ic.code);

                if (!source) return offset;

                const delta = source.value;

                return offset + delta;
            });
        }), 1000 / FRAME_RATE);

        return () => clearInterval(id);
    }, [sources]);

    return (
        <svg viewBox="0 0 440 600" width={440}>
            <image href={ukmap} />
            {
                interconnects.map((ic, i) => {
                    const source = sources.find(s => s.code === ic.code);
                    return <g key={ic.code}>
                        <path d={ic.path} fill="none" stroke="darkblue" strokeWidth={ic.width + 2} strokeLinecap="round" />
                        <path d={ic.path} fill="none" stroke={!source || source.value === 0 ? "#ff3366" : "#00ff00"} strokeWidth={ic.width} strokeLinecap="round" strokeDasharray={`1 ${2 * ic.width}`} strokeDashoffset={-offsets[i] / ic.width} />
                        <title>{ic.code}</title>
                    </g>;
                })
            }
        </svg>
    )
}