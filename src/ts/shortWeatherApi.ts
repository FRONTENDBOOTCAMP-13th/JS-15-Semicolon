import "/src/style.css";
import "../assets/style/weather.css";
import weatherRegionCodeMap2 from "../assets/ts/weather-short-data";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

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
    `?serviceKey=${WEATHER_API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON` +
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

    if (category === "TMX")
      weatherMap[fcstDate].tmx = String(Math.floor(fcstValue));
    if (category === "TMN")
      weatherMap[fcstDate].tmn = String(Math.floor(fcstValue));

    const timeInt = parseInt(fcstTime);
    const period = timeInt < 1200 ? "Am" : "Pm";

    if (category === "SKY") {
      weatherMap[fcstDate][`sky${period}`] = getSkyClass(
        String(Math.floor(fcstValue))
      );
    } else if (category === "PTY") {
      weatherMap[fcstDate][`pty${period}`] = getPtyClass(
        String(Math.floor(fcstValue))
      );
    }
  }

  return weatherMap;
}

// 하늘 상태 변환
function getSkyClass(code: string): string {
  switch (code) {
    case "1":
      return "sunny";
    case "3":
      return "cloudy";
    case "4":
      return "overcast";
    default:
      return "unknown";
  }
}

// 강수 형태 변환
function getPtyClass(code: string) {
  switch (code) {
    case "0":
      return ""; // 없음
    case "1":
    case "4":
      return "rainy";
    case "2":
      return "rain-snow";
    case "3":
      return "snowy";
    default:
      return "";
  }
}

function formatToMonthDay(dateStr: string): string {
  // "20240518" → "05월 18일"
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return `${month}월 ${day}일`;
}

function outputtingWeather() {
  const city2 = "제주특별자치도 제주시"; // 사용자가 선택한 지역
  const locationData = weatherRegionCodeMap2[city2];

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

      dates.slice(0, 4).forEach((date, i) => {
        const { tmn, tmx, skyAm, skyPm, ptyAm, ptyPm } = weatherMap[date];

        const skyAmClass = skyAm ?? "";
        const ptyAmClass = ptyAm ?? "";

        const skyPmClass = skyPm ?? "";
        const ptyPmClass = ptyPm ?? "";

        const weatherCard = document.createElement("li");
        weatherCard.className = "short-weather-card";
        weatherCard.innerHTML = `
          <li class="flex flex-col items-center text-center border-r border-gray-300 px-2 md:px-5 ">
            <time class=" text-ga-gray300 font-light text-12 md:text-14">${formatToMonthDay(
              date
            )}</time>
            <div class="flex p-1 gap-1 md:gap-4 ">
              <div class="icon ${
                skyAmClass || ptyAmClass
              } w-6 h-6 md:w-7.5 md:h-7.5 "></div>
              <div class="icon ${
                skyPmClass || ptyPmClass
              } w-6 h-6 md:w-7.5 md:h-7.5 "></div>
            </div>
            <strong  class="text-14 md:text-18">
              <span class="text-blue-500">${tmn}°</span
              ><span class="text-ga-gray200 text-12 px-0.5 font-normal">/</span
              ><span class="text-ga-red200 ml-1">${tmx}°</span>
            </strong>
          </li>
        `;

        weatherContainer.appendChild(weatherCard);
      });
    });
  }
}
outputtingWeather();
