import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { SevenDayChart } from "../../components/SevenDayChart";

function SemiCircleGauge({ value, min, max, size = 150, label }) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const strokeWidth = 20;
  const gaugeRadius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Bán nguyệt phía trên: start (trái) -> end (phải)
  const startX = cx - gaugeRadius;
  const startY = cy;
  const endX = cx + gaugeRadius;
  const endY = cy;

  // Điểm kết thúc của phần giá trị (theo pct, đi dọc cung trên)
  const phi = Math.PI * (1 - pct); // φ: từ π (trái) -> 0 (phải)
  const midX = cx + gaugeRadius * Math.cos(phi);
  const midY = cy - gaugeRadius * Math.sin(phi);

  // Path nền và path giá trị
  const trackPath = `M ${startX} ${startY} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${endX} ${endY}`;
  const valuePath = `M ${startX} ${startY} A ${gaugeRadius} ${gaugeRadius} 0 ${
    pct > 0.5 ? 1 : 0
  } 1 ${midX} ${midY}`;

  return (
    <div className="flex flex-col items-center text-center">
      <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
        <path
          d={trackPath}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={valuePath}
          stroke="#F59E0B"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <div className="-mt-[20px]">
        <div className="text-3xl font-semibold tracking-tight">
          {Number.isFinite(value) ? value : 0}
        </div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function Stat({ title, value, sub }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 text-center">
      <div className="text-xs font-medium text-gray-600 mb-1">{title}</div>
      <div className="text-xl font-semibold text-[#295376]">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function getAqiStatus(aqi) {
  if (aqi <= 50) {
    return {
      text: "Good",
      tone: "green",
      badge: "bg-green-50 text-green-700 ring-green-600/20",
      textColor: "text-green-700",
    };
  } else if (aqi <= 100) {
    return {
      text: "Moderate ",
      tone: "yellow",
      badge: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
      textColor: "text-yellow-700",
    };
  } else if (aqi <= 150) {
    return {
      text: "Unhealthy for Sensitive Groups (101–150)",
      tone: "orange",
      badge: "bg-orange-50 text-orange-700 ring-orange-600/20",
      textColor: "text-orange-700",
    };
  } else if (aqi <= 200) {
    return {
      text: "Unhealthy",
      tone: "red",
      badge: "bg-red-50 text-red-700 ring-red-600/20",
      textColor: "text-red-700",
    };
  } else {
    return {
      text: "Very Unhealthy",
      tone: "purple",
      badge: "bg-purple-50 text-purple-700 ring-purple-600/20",
      textColor: "text-purple-700",
    };
  }
}

export const Section = () => {
  const [iaqIndex, setIaqIndex] = useState(0);
  const [date, setDate] = useState("");
  const [status, setStatus] = useState({});
  const [co2Values, setCo2Values] = useState([]);
  const [outdoor, setOutdoor] = useState({});
  const [pred, setPred] = useState([]);
  const [aqiHistorical, setAqiHistorical] = useState([]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);
  const sectionRef = useRef(null);

  const fetchData = (latitude, longitude) => {
    fetch(`${import.meta.env.VITE_BASE_URL}/waqi/geo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat: latitude,
        lon: longitude,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const data = result.data;
        setDate(data.openweather.date);
        setCo2Values([
          {
            value: data.openweather.components.co || 0,
            label: "CO",
            min: 0,
            max: 50,
          },
          {
            value: data.openweather.components.pm2_5 || 0,
            label: "PM2.5",
            min: 0,
            max: 500,
          },
          {
            value: data.openweather.components.pm10 || 0,
            label: "PM10",
            min: 0,
            max: 600,
          },
          {
            value: data.openweather.components.no2 || 0,
            label: "NO2",
            min: 0,
            max: 2000,
          },
          {
            value: data.openweather.components.o3 || 0,
            label: "O3",
            min: 0,
            max: 600,
          },
          {
            value: data.openweather.components.so2 || 0,
            label: "SO2",
            min: 0,
            max: 1600,
          },
        ]);
        setOutdoor({
          tempC: data.waqi.t,
          aqi: data.openweather.aqi || 0,
          humidity: data.waqi.h || 0,
          wind: data.waqi.w || 0,
          pressure: `${data.waqi.p || 0} hPa`,
          icon: "🌙☁️",
        });
        setSelected({
          lat: latitude,
          lon: longitude,
          name: data.station || "Current location",
        });
        setQuery(data.station);

        fetch(`${import.meta.env.VITE_BASE_URL}/waqi/history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lat: latitude,
            lon: longitude,
          }),
        })
          .then((res) => res.json())
          .then((result2) => {
            console.log(result2.data);
            const temp = [];
            result2.data.forEach((item) => {
              temp.push(item.aqi);
            });
            setAqiHistorical(temp);
            // console.log(aqiHistorical);
            setIaqIndex(result2.data[6].aqi);
            setStatus(getAqiStatus(result2.data[6].aqi));
            fetch(`${import.meta.env.VITE_PYTHON_URL}/predict`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: result2.data,
                lat: latitude,
                lon: longitude,
              }),
            })
              .then((res) => res.json())
              .then((pred) => {
                setPred(
                  Array.isArray(pred.prediction)
                    ? pred.prediction
                    : Array(7).fill(0)
                );
                console.log("Prediction data:", pred);
              })
              .catch((err) => console.error("Prediction error:", err));
          });
      });
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetchData(latitude, longitude);
        },
        (err) => console.error(err)
      );
    }
  }, []);

  function MapUpdater({ selected, zoomLevel }) {
    const map = useMap();
    useEffect(() => {
      if (!selected || !map) return;
      const targetZoom =
        typeof zoomLevel === "number" ? zoomLevel : map.getZoom();
      try {
        map.flyTo([selected.lat, selected.lon], targetZoom, { animate: true });
      } catch (e) {
        map.setView([selected.lat, selected.lon], targetZoom);
      }
    }, [selected, zoomLevel, map]);
    return null;
  }

  // Handle Map Search
  async function search(q) {
    if (!q) return;
    setLoading(true);
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", q);
      url.searchParams.set("format", "json");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("limit", "8");
      const res = await fetch(url.toString());
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function onInput(e) {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => search(val), 400);
    e.target.value = "";
  }

  async function selectPlace(item) {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    setSelected({
      lat,
      lon,
      name: item.display_name,
    });
    setResults([]);
    setQuery(item.display_name);

    try {
      setLoading(true);
      await fetchData(lat, lon);
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="w-full p-6 mb-[10px]" ref={sectionRef}>
        <div className="max-w-6xl mx-auto text-white">
          <h1 className="text-3xl font-bold tracking-tight drop-shadow">
            {query}
          </h1>

          <div className="mt-6 flex flex-row gap-[10px]">
            {/* IAQ card */}
            <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/40 p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-2 text-white/95">
                <span className="text-2xl">〰️</span>
                <span className="text-lg font-semibold">AQI Index</span>
              </div>

              <div className="mt-6 grid grid-cols-2 items-end">
                <div
                  className={`text-[84px] leading-none md:text-[104px] font-extrabold drop-shadow-sm ${status.textColor}`}
                >
                  {iaqIndex}
                </div>
                <div className="justify-self-end text-right">
                  <div className="mt-2 text-white/80">
                    <div className="text-sm">Update since</div>
                    <div className="text-2xl font-semibold">{date}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <span
                  className={`inline-flex items-center rounded-2xl px-4 py-1.5 text-sm font-medium ring-1 ${status.badge} bg-clip-padding`}
                >
                  {status.text}
                </span>
              </div>
            </div>

            {/* CO2 gauges */}
            <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/40 p-6 md:p-8 shadow-xl text-[#295376] flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 place-items-center bg-white/0">
                {co2Values.map((item, i) => (
                  <SemiCircleGauge
                    key={i}
                    value={item.value}
                    label={item.label}
                    min={item.min}
                    max={item.max}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Outdoor condition */}
          <div className="mt-6 rounded-3xl bg-white/3 backdrop-blur-xl border border-white/40 p-6 md:p-8 shadow-xl text-[#295376]">
            <div className="flex flex-row items-center justify-between w-full">
              <div className="flex items-center">
                <div className="text-5xl leading-none">{outdoor.icon}</div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    {outdoor.tempC}°C
                  </div>
                  <div className="">Outdoor Condition</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* <Stat title="AQI" value={outdoor.aqi} /> */}
                <Stat title="Humidity" value={`${outdoor.humidity}%`} />
                <Stat title="Wind" value={`${outdoor.wind} m/s`} />
                <Stat title="Pressure" value={outdoor.pressure} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Map */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow text-center mb-[10px]">
          Search
        </h1>
        <div className="px-6 pb-6 flex flex-col gap-4 relative">
          <div className="relative max-w-xl w-full mx-auto z-[9999]">
            <input
              value={query}
              onChange={onInput}
              className="w-full px-5 py-3 rounded-[60px] shadow-sm outline-none bg-white"
              placeholder="Enter a location..."
            />
            {loading && (
              <div className="absolute right-3 top-3 animate-spin">⏳</div>
            )}
            {results.length > 0 && (
              <div className="absolute bg-white border rounded-lg shadow mt-2 w-full z-[9999] max-h-64 overflow-y-auto">
                {results.map((r) => (
                  <div
                    key={r.place_id}
                    onClick={() => selectPlace(r)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {r.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-[500px] rounded-xl overflow-hidden relative z-[1] flex justify-center">
            <MapContainer
              center={[selected?.lat || 10.776, selected?.lon || 106.7]}
              zoom={selected ? 15 : 13}
              style={{ height: "100%", width: "80%" }}
            >
              <MapUpdater selected={selected} zoomLevel={selected ? 15 : 13} />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {selected && (
                <Marker position={[selected.lat, selected.lon]}>
                  <Popup>{selected.name}</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      </div>

      <div className="w-full p-6 pb-10 bg-red-50// flex items-center justify-center">
        <div className="w-full flex  max-w-7xl flex-col items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow text-center mb-[10px]">
            Air Quality Index (AQI) Prediction for next 7 days
          </h1>
          <SevenDayChart
            data={pred.length > 0 ? pred : Array(7).fill(0)}
            // historyData={aqiHistorical}
          />
        </div>
      </div>
    </>
  );
};
