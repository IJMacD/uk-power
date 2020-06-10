const http = require('http');
const https = require('https');
const port = process.env.PORT || 8000;

const server = http.createServer(async (request, response) => {
    const body = await cachedFetch('https://gridwatch.co.uk/Demand');
    const rawdata = parseBody(body);

    /* lgen:
    [
        "Demand",       Name
        "MAINCALC",     Code
        "big",          Graph size: big/sml
        "red",          Graph colour
        0,              Graph min value
        60,             Graph max value
        29.109,         Current value
        49.978          { Demand: Freq, Others: Percent }
    ],
    */

    const data = {
        sources: rawdata.lgen.map(lg => {
            const d = ({ name: lg[0], code: lg[1], value: lg[6] });
            if (d.code === "MAINCALC") d.frequency = lg[7];
            return d;
        }),
        lgen: rawdata.lgen,
        lgr: rawdata.lgr,
        lgt: rawdata.lgt,
    };

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Content-Type", "application/json");
    response.write(JSON.stringify(data));
    response.end();
});

server.listen(port);
console.log(`Listening on port ${port}`);

function fetch (url) {
    return new Promise(resolve => {
        https.get(url, res => {
            let buf = "";
            res.on("data", chunk => buf += chunk);
            res.on("end", () => resolve(buf));
        });
    });
}

const CACHE = {};
const ONE_MINUTE = 60 * 1000;

async function cachedFetch (url, timeout=10 * ONE_MINUTE) {
    if (CACHE[url]) {
        const { data, ttl } = CACHE[url];
        if (Date.now() < ttl) return data;
    }

    const data = await fetch(url);

    CACHE[url] = {
        data,
        ttl: Date.now() + timeout,
    };

    return data;
}

function parseBody (data) {
    let lgen, lgr = [], lgt = [];

    try {
        data  = data.replace(/'/g, '"');

        const a = /lgen=(.*?);/.exec(data);
        lgen = JSON.parse(a[1]);

        const re = /lgr\[\d+\]=(.*?);/g;
        let b;
        while(b = re.exec(data)) {
            lgr.push(JSON.parse(b[1]));
        }

        const re2 = /lgt\[\d+\]=(.*?);/g;
        let c;
        while(c = re2.exec(data)) {
            lgt.push(JSON.parse(c[1]));
        }

    } catch (e) {
        console.log(e);
    }

    return {
        lgen,
        lgr,
        lgt,
    };
}