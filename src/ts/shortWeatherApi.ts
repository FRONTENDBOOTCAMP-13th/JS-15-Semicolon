import "/src/style.css";
import weatherRegionCodeMap2 from "../assets/weather-short-data";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_DATE = getBaseDate(); // 오늘 날짜, 기준시간 0200
const BASE_TIME = "0200"; // TMX/TMN은 보통 0200에 제공됨

const NX = 64; // 서울
const NY = 68;

function getBaseDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}${MM}${dd}`;
}

async function fetchDailyWeather(nx: number, ny: number) {
  const BASE_DATE = getBaseDate();
  const BASE_TIME = "0200";

  const url =
    `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst` +
    `?serviceKey=${API_KEY}&pageNo=1&numOfRows=800&dataType=JSON` +
    `&base_date=${BASE_DATE}&base_time=${BASE_TIME}&nx=${nx}&ny=${ny}`;

  const res = await fetch(url);
  const data = await res.json();
  const items = data.response.body.items.item;

  const weatherMap: Record<
    string,
    {
      tmx?: string;
      tmn?: string;
      skyAm?: string;
      skyPm?: string;
      ptyAm?: string;
      ptyPm?: string;
    }
  > = {};

  for (const item of items) {
    const { category, fcstDate, fcstTime, fcstValue } = item;

    if (!weatherMap[fcstDate]) {
      weatherMap[fcstDate] = {};
    }

    if (category === "TMX") weatherMap[fcstDate].tmx = fcstValue;
    if (category === "TMN") weatherMap[fcstDate].tmn = fcstValue;

    const timeInt = parseInt(fcstTime);
    const period = timeInt < 1200 ? "Am" : "Pm";

    if (category === "SKY") {
      weatherMap[fcstDate][`sky${period}`] = getSkyText(fcstValue);
    } else if (category === "PTY") {
      weatherMap[fcstDate][`pty${period}`] = getPtyText(fcstValue);
    }
  }

  return weatherMap;
}

// 하늘 상태 변환
function getSkyText(code: string) {
  switch (code) {
    case "1":
      return "맑음";
    case "3":
      return "구름 많음";
    case "4":
      return "흐림";
    default:
      return "정보 없음";
  }
}

// 강수 형태 변환
function getPtyText(code: string) {
  switch (code) {
    case "0":
      return ""; // 없음
    case "1":
      return "비";
    case "2":
      return "비/눈";
    case "3":
      return "눈";
    case "4":
      return "소나기";
    default:
      return "";
  }
}

const city = "서울특별시 종로구"; // 사용자가 선택한 지역
const locationData = weatherRegionCodeMap2[city];

if (!locationData) {
  console.error("해당 지역의 좌표가 없습니다.");
} else {
  const { nx, ny } = locationData;

  fetchDailyWeather(nx, ny).then((weatherMap) => {
    const dates = Object.keys(weatherMap).sort();
    const weatherContainer = document.querySelector(
      ".weather-container.short-term"
    );

    if (!weatherContainer) return;
    weatherContainer.innerHTML = "";

    dates.slice(0, 3).forEach((date, i) => {
      const { tmn, tmx, skyAm, skyPm, ptyAm, ptyPm } = weatherMap[date];

      const weatherAm = ptyAm ? `${ptyAm} / ${skyAm}` : skyAm;
      const weatherPm = ptyPm ? `${ptyPm} / ${skyPm}` : skyPm;

      const weatherCard = document.createElement("li");
      weatherCard.className = "short-weather-card";
      weatherCard.innerHTML = `
        <div class="date">${date}</div>
        <div class="weather">
          <div>🌄 오전: ${weatherAm}</div>
          <div>🌇 오후: ${weatherPm}</div>
        </div>
        <div class="temp">
          <div>🌡️ 최저: ${tmn}°</div>
          <div>🔥 최고: ${tmx}°</div>
        </div>
      `;

      weatherContainer.appendChild(weatherCard);
    });
  });
}
