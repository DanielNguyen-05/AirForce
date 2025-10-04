import axios from "axios";

const WAQI_BASE = "https://api.waqi.info";

function pickPollutants(j) {
    const root = j?.data ?? j;
    const iaqi = root?.iaqi || {};
    return {
        aqi: j?.data?.aqi ?? null,
        h: iaqi?.h?.v ?? null,
        p: iaqi?.p?.v ?? null,
        t: iaqi?.t?.v ?? null,
        w: iaqi?.w?.v ?? null,
        station: root?.city?.name ?? null,
    };
}

function pickOWAir(ow) {
    const item = ow?.list?.[0] || null;
    if (!item) return { components: null, dt: null, date: null };

    const dt = item.dt ?? null;
    let date = null;

    if (dt) {
        const d = new Date(dt * 1000);
        const parts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Ho_Chi_Minh",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).formatToParts(d);

        const days = {
            1: "Mon",
            2: "Tue",
            3: "Wed",
            4: "Thu",
            5: "Fri",
            6: "Sat",
            0: "Sun",
        };

        const get = k => parts.find(p => p.type === k)?.value;
        let weekday = d.getDay();
        if (weekday === 0) weekday = 7
        date = `${days[`${weekday}`]} ${get("year")}-${get("month")}-${get("day")}`; 
    }

    return {
        components: item?.components ?? null,
        dt,
        date
    };
}

export async function getCity(req, res) {
    try {
        const TOKEN = process.env.WAQI_TOKEN;
        if (!TOKEN) return res.status(500).json({ error: "Missing WAQI_TOKEN" });

        const name = req.query.name;
        const url = `${WAQI_BASE}/feed/${encodeURIComponent(name)}/?token=${TOKEN}`;
        const { data } = await axios.get(url, { timeout: 10000 });
        if (data.status !== "ok") return res.status(400).json({ error: data.data || "WAQI error" });
        return res.json(pickPollutants(data));
    } catch (error) {
        console.error("Error fetching city data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const cache = new Map();
const put = (k, v, ms = 10 * 60 * 1000) => cache.set(k, { v, exp: Date.now() + ms });
const get = (k) => {
    const x = cache.get(k);
    if (!x) return;
    if (Date.now() > x.exp) { cache.delete(k); return; }
    return x.v;
};

// ---- handlers ----
export async function getCityUID(req, res) {
    try {
        const TOKEN = process.env.WAQI_TOKEN;
        if (!TOKEN) return res.status(500).json({ error: 'Missing WAQI_TOKEN' });

        const uid = Number(req.params.uid);
        if (!Number.isInteger(uid)) return res.status(400).json({ error: 'uid must be integer' });

        const key = `waqi:uid:${uid}`;
        const cached = get(key); if (cached) return res.json(cached);

        const url = `${WAQI_BASE}/feed/@${uid}/?token=${TOKEN}`;
        const body = await axios.get(url, { timeout: 10000 }).then(r => r.data);

        if (body.status !== 'ok') {
            console.warn('WAQI uid error:', body);
            return res.status(400).json({ error: body.data || 'WAQI error' });
        }

        const out = pickPollutants(body);
        put(key, out);
        return res.json(out);
    } catch (err) {
        console.error('WAQI uid fetch error:', err?.response?.data || err.message);
        res.status(500).json({ error: err.message || 'Server error' });
    }
}

// Lấy dữ liệu từ WAQI + OpenWeather cùng lúc khi có lat/lon
export async function getGeo(req, res) {
    try {
        const WAQI_TOKEN = process.env.WAQI_TOKEN;
        const OW_API_KEY = process.env.OPEN_WEATHER_API_KEY;

        if (!WAQI_TOKEN) return res.status(500).json({ success: false, error: "Missing WAQI_TOKEN" });
        if (!OW_API_KEY) return res.status(500).json({ success: false, error: "Missing OPEN_WEATHER_API_KEY" });

        const latNum = parseFloat(req.body?.lat);
        const lonNum = parseFloat(req.body?.lon);
        if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
            return res.status(400).json({ success: false, error: "lat & lon required (numbers)" });
        }

        // Gọi WAQI + OpenWeather song song
        const waqiUrl = `${WAQI_BASE}/feed/geo:${latNum};${lonNum}/?token=${WAQI_TOKEN}`;

        const [waqiResp, owResp] = await Promise.allSettled([
            axios.get(waqiUrl, { timeout: 10000 }).then(r => r.data),
            axios.get("http://api.openweathermap.org/data/2.5/air_pollution", {
                params: { lat: latNum, lon: lonNum, appid: OW_API_KEY },
                timeout: 10000
            }).then(r => r.data),
        ]);

        // Xử lý WAQI
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

        // Xử lý OpenWeather
        let owOk = false, owData = null, owErr = null;
        if (owResp.status === "fulfilled") {
            owOk = true;
            owData = pickOWAir(owResp.value);
        } else {
            owErr = owResp.reason?.message || "OpenWeather request failed";
        }

        // Ghép payload (trả về cả khi 1 nguồn lỗi để bạn vẫn có phần còn lại)
        const payload = {
            coord: { lat: latNum, lon: lonNum },
            station: waqiData?.station ?? null,
            waqi: {
                ok: waqiOk,
                aqi: waqiData?.aqi ?? null,
                h: waqiData?.h ?? null,
                p: waqiData?.p ?? null,
                t: waqiData?.t ?? null,
                w: waqiData?.w ?? null,
                time: waqiData?.waqi_time ?? null,
            },
            openweather: {
                ok: owOk,
                components: owData?.components ?? null, // {co,no,no2,o3,so2,pm2_5,pm10,nh3} (µg/m³)
                date: owData?.date ?? null,
            }
        };

        // Thành công nếu có ít nhất 1 nguồn ok
        const ok = waqiOk || owOk;
        return res.status(ok ? 200 : 502).json({ code: "success", data: payload });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message || "Server error" });
    }
}

export async function getSearch(req, res) {
    try {
        const TOKEN = process.env.WAQI_TOKEN;
        if (!TOKEN) return res.status(500).json({ error: "Missing WAQI_TOKEN" });

        const q = (req.query.q || "").toString().trim();
        if (!q) return res.status(400).json({ error: "q required" });

        const url = `${WAQI_BASE}/search/?token=${TOKEN}&keyword=${encodeURIComponent(q)}`;
        const { data } = await axios.get(url, { timeout: 10000 });
        if (data.status !== "ok") return res.status(400).json({ error: data.data || "WAQI error" });

        // Chuẩn hoá danh sách trạm từ /search
        const items = (data.data || []).map(it => ({
            uid: it.uid,
            aqi: isNaN(+it.aqi) ? null : +it.aqi,
            name: it.station?.name || null,
            geo: it.station?.geo || null,
            url: it.station?.url || null,
        }));

        return res.json({ q, count: items.length, items });
    } catch (err) {
        res.status(500).json({ error: err.message || "Server error" });
    }
}

//Lấy data lịch sử từ OpenWeather với query: lat, lon, start, end 
export async function getHistory(req, res) {
    try {
        const TOKEN = process.env.OPEN_WEATHER_API_KEY; // API key trong .env
        const { lat, lon, start, end } = req.query; // lấy query params từ request

        // Gọi API OpenWeather
        const response = await axios.get("http://api.openweathermap.org/data/2.5/air_pollution/history", {
            params: {
                lat: lat,            // default nếu user không truyền
                lon: lon,
                start: start,
                end: end,
                appid: TOKEN
            }
        });

        // Trả data về client
        return res.status(200).json({
            success: true,
            data: response.data
        });
    } catch (error) {
        console.error("OpenWeather API error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch data from OpenWeather"
        });
    }
}

