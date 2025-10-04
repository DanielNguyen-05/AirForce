// air.controller.js
import axios from "axios";

const WAQI_BASE = "https://api.waqi.info";

// ---------- Helpers ----------
function lerpAQI(Cp, [Clow, Chigh, Ilow, Ihigh]) {
    // AQI = (Ihigh - Ilow)/(Chigh - Clow) * (Cp - Clow) + Ilow
    return Math.round(((Ihigh - Ilow) / (Chigh - Clow)) * (Cp - Clow) + Ilow);
}

function findBreakpoint(Cp, table) {
    // table: array of [Clow, Chigh, Ilow, Ihigh]
    for (const row of table) {
        const [Clow, Chigh] = row;
        if (Cp >= Clow && Cp <= Chigh) return row;
    }
    return null;
}

const BP_PM25 = [
    [0.0, 12.0, 0, 50],
    [12.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500],
];

function aqiFromPM25(pm25) {
    if (!Number.isFinite(pm25)) return null;
    const row = findBreakpoint(pm25, BP_PM25);
    if (!row) return 500; // trên thang
    return lerpAQI(pm25, row);
}

// PM10 (µg/m³), 24h
const BP_PM10 = [
    [0, 54, 0, 50],
    [55, 154, 51, 100],
    [155, 254, 101, 150],
    [255, 354, 151, 200],
    [355, 424, 201, 300],
    [425, 504, 301, 400],
    [505, 604, 401, 500],
];

function aqiFromPM10(pm10) {
    if (!Number.isFinite(pm10)) return null;
    const row = findBreakpoint(pm10, BP_PM10);
    if (!row) return 500;
    return lerpAQI(pm10, row);
}

function toVNDateTimeParts(dtSec) {
    const d = new Date(dtSec * 1000);
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(d);
    const get = (k) => parts.find((p) => p.type === k)?.value;
    const yyyy = get("year"), mm = get("month"), dd = get("day");
    // weekday number: 1..7 (Mon..Sun)
    let weekday = d.getDay(); // 0..6, 0=Sun
    weekday = weekday === 0 ? 7 : weekday;
    return {
        iso: d.toISOString(),
        date: `${yyyy}-${mm}-${dd}`, // yyyy-mm-dd(VN tz)
        weekday, // 1..7
    };
}

function normalizeDaily(list) {
    const byDate = new Map();

    for (const item of list || []) {
        if (!item || !Number.isFinite(item.dt)) continue;

        const parts = toVNDateTimeParts(item.dt);
        const dateStr = parts.date; // dùng chuỗi yyyy-mm-dd làm key

        const prev = byDate.get(dateStr);
        if (!prev || item.dt > prev.dt) {
            byDate.set(dateStr, {
                dt: item.dt,
                components: item.components || null,
                weekday: parts.weekday,

            });
        }
    }

    const result = [];
    for (const [date, v] of byDate.entries()) {
        const c = v.components || {};
        const aqi_pm25 = aqiFromPM25(c.pm2_5);
        const aqi_pm10 = aqiFromPM10(c.pm10);

        // tổng hợp AQI hiện có (ưu tiên max)
        const subs = [aqi_pm25, aqi_pm10].filter(Number.isFinite);
        const aqi = subs.length ? Math.max(...subs) : null;
        result.push({
            date,
            components: c,
            weekday: v.weekday,
            aqi: aqi
        });
    }
    result.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));
    return result;
}

function toUnixFromVNDateOnly(dateStr, hour = 0, minute = 0, second = 0) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(Date.UTC(year, month - 1, day, hour - 7, minute, second));
    return Math.floor(d.getTime() / 1000);
}

// ---------- Pickers ----------
function pickPollutants(j) {
    const root = j?.data ?? j;
    const iaqi = root?.iaqi || {};
    // WAQI time: may be { s, tz, v }
    const timeObj = root?.time || null;
    const timeStr = timeObj?.s ?? null;
    const timeUnix = timeObj?.v ?? null;
    let vnDate = null, weekday = null;
    if (Number.isFinite(timeUnix)) {
        const t = toVNDateTimeParts(timeUnix);
        vnDate = t.date;
        weekday = t.weekday;
    }
    return {
        aqi: root?.aqi ?? null,
        h: iaqi?.h?.v ?? null,  // %
        p: iaqi?.p?.v ?? null,  // hPa
        t: iaqi?.t?.v ?? null,  // °C
        w: iaqi?.w?.v ?? null,  // m/s
        station: root?.city?.name ?? null,
        time: timeStr ?? vnDate, // ưu tiên chuỗi WAQI, fallback từ unix
        weekday: weekday,        // 1..7 nếu có unix
    };
}

function pickOWAir(ow) {
    const item = ow?.list?.[0] || null;
    if (!item) return { aqi: null, components: null, dt: null, date: null, weekday: null };
    const dt = item.dt ?? null;
    let date = null, weekday = null;
    if (Number.isFinite(dt)) {
        const t = toVNDateTimeParts(dt);
        date = t.date;          // "yyyy-mm-dd HH:mm:ss" (Asia/Ho_Chi_Minh)
        weekday = t.weekday;    // 1..7
    }
    return {
        // aqi: item?.main?.aqi ?? null,       // 1..5
        components: item?.components ?? null, // µg/m³
        dt,
        date,
        weekday,
    };
}

// ---------- Simple cache ----------
const cache = new Map();
const put = (k, v, ms = 10 * 60 * 1000) => cache.set(k, { v, exp: Date.now() + ms });
const get = (k) => {
    const x = cache.get(k);
    if (!x) return;
    if (Date.now() > x.exp) { cache.delete(k); return; }
    return x.v;
};

export async function getCityUID(req, res) {
    try {
        const TOKEN = process.env.WAQI_TOKEN;
        if (!TOKEN) return res.status(500).json({ error: "Missing WAQI_TOKEN" });

        const uid = Number(req.params.uid);
        if (!Number.isInteger(uid)) return res.status(400).json({ error: "uid must be integer" });

        const key = `waqi:uid:${uid}`;
        const cached = get(key); if (cached) return res.json(cached);

        const url = `${WAQI_BASE}/feed/@${uid}/?token=${TOKEN}`;
        const body = await axios.get(url, { timeout: 10000 }).then(r => r.data);

        if (body.status !== "ok") {
            console.warn("WAQI uid error:", body);
            return res.status(400).json({ error: body.data || "WAQI error" });
        }

        const out = pickPollutants(body);
        put(key, out);
        return res.json(out);
    } catch (err) {
        console.error("WAQI uid fetch error:", err?.response?.data || err.message);
        res.status(500).json({ error: err.message || "Server error" });
    }
}

// WAQI + OpenWeather by lat/lon
export async function getGeo(req, res) {
    try {
        const WAQI_TOKEN = process.env.WAQI_TOKEN;
        const OW_API_KEY = process.env.OPEN_WEATHER_API_KEY;

        if (!WAQI_TOKEN) return res.status(500).json({ success: false, error: "Missing WAQI_TOKEN" });
        if (!OW_API_KEY) return res.status(500).json({ success: false, error: "Missing OPEN_WEATHER_API_KEY" });

        // accept both body and query for convenience
        const latNum = parseFloat(req.body?.lat ?? req.query?.lat);
        const lonNum = parseFloat(req.body?.lon ?? req.query?.lon);
        if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
            return res.status(400).json({ success: false, error: "lat & lon required (numbers)" });
        }

        const waqiUrl = `${WAQI_BASE}/feed/geo:${latNum};${lonNum}/?token=${WAQI_TOKEN}`;
        const fetchedAt = toVNDateTimeParts(Math.floor(Date.now() / 1000)).date; // server call time (VN)

        const [waqiResp, owResp] = await Promise.allSettled([
            axios.get(waqiUrl, { timeout: 10000 }).then(r => r.data),
            axios.get("https://api.openweathermap.org/data/2.5/air_pollution", {
                params: { lat: latNum, lon: lonNum, appid: OW_API_KEY },
                timeout: 10000
            }).then(r => r.data),
        ]);

        // WAQI
        let waqiOk = false, waqiData = null, waqiErr = null;
        if (waqiResp.status === "fulfilled") {
            if (waqiResp.value?.status === "ok") {
                waqiOk = true;
                waqiData = pickPollutants(waqiResp.value);
            } else {
                waqiErr = waqiResp.value?.data || waqiResp.value?.status || "WAQI error";
            }
        } else {
            waqiErr = waqiResp.reason?.message || "WAQI request failed";
        }

        // OpenWeather
        let owOk = false, owData = null, owErr = null;
        if (owResp.status === "fulfilled") {
            owOk = true;
            owData = pickOWAir(owResp.value);
        } else {
            owErr = owResp.reason?.message || "OpenWeather request failed";
        }

        const payload = {
            coord: { lat: latNum, lon: lonNum },
            station: waqiData?.station ?? null,
            fetched_at: fetchedAt, // thời điểm server gọi (VN tz)
            waqi: {
                aqi: waqiData?.aqi ?? null,
                h: waqiData?.h ?? null,
                p: waqiData?.p ?? null,
                t: waqiData?.t ?? null,
                w: waqiData?.w ?? null,
                time: waqiData?.time ?? null,       // thời điểm trạm WAQI
                weekday: waqiData?.weekday ?? null
            },
            openweather: {
                components: owData?.components ?? null,
                dt: owData?.dt ?? null,             // unix (UTC)
                date: owData?.date ?? null,         // yyyy-mm-dd (VN tz)
                weekday: owData?.weekday ?? null
            }
        };

        const ok = waqiOk || owOk;
        return res.status(ok ? 200 : 502).json({ success: ok, data: payload });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

// OpenWeather history: lat, lon, start, end (unix seconds)
export async function getHistory(req, res) {
    try {
        const TOKEN = process.env.OPEN_WEATHER_API_KEY;
        if (!TOKEN)
            return res.status(500).json({ success: false, message: "Missing OPEN_WEATHER_API_KEY" });

        const lat = Number(req.body.lat);
        const lon = Number(req.body.lon);

        const format = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return toUnixFromVNDateOnly(`${year}-${month}-${day}`);
        };

        const endDate = new Date(new Date().getTime() - 1 * 24 * 60 * 60 * 1000);
        const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const end = format(endDate);
        const start = format(startDate);

        const resp = await axios.get("https://api.openweathermap.org/data/2.5/air_pollution/history", {
            params: { lat, lon, start, end, appid: TOKEN },
            timeout: 15000,
        });

        const list = resp?.data?.list ?? [];
        const normalized = normalizeDaily(list);

        return res.json({
            code: "success",
            data: normalized,
        });
    } catch (error) {
        console.error("OpenWeather API error:", error?.response?.data || error.message);
        return res
            .status(500)
            .json({ code: false, message: "Failed to fetch data from OpenWeather" });
    }
}