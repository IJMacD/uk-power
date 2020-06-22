const http = require('http');
const https = require('https');
const path = require("path");
const fs = require('fs');
const port = process.env.PORT || 8000;

const ONE_MINUTE = 60 * 1000;

const server = http.createServer((request, response) => {
    if (request.url === "/api") {
        return sendDemand(response);
    }

    let filename = path.join(__dirname, "public", request.url);
    if (!fs.existsSync(filename) || fs.lstatSync(filename).isDirectory()) {
        filename = path.join(__dirname, "public", "index.html");
    }

    if (filename.match(/\.svg$/)) {
        response.setHeader("Content-Type", "image/svg+xml");
    }

    response.write(fs.readFileSync(filename));
    response.end();
    return;
});

/**
 * @param {import("http").ServerResponse} response
 */
async function sendDemand (response) {
    const body = await cachedFetch('https://gridwatch.co.uk/Demand', 5 * ONE_MINUTE);
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
        date: rawdata.date,
        lgen: rawdata.lgen,
        lgr: rawdata.lgr,
        lgt: rawdata.lgt,
    };

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Content-Type", "application/json");
    response.write(JSON.stringify(data));
    response.end();
}

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
    let lgen, lgr = [], lgt = [], date = null;

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

        const d = /last update ([^<]*)/.exec(data);
        date = new Date(d[1]);

    } catch (e) {
        console.log(e);
    }

    return {
        lgen,
        lgr,
        lgt,
        date,
    };
}