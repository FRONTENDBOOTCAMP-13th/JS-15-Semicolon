import "/src/style.css";
import "../../assets/style/weather.css";
import weatherRegionCodeMap2 from "../../assets/ts/weather-short-data";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// 오늘 날짜를 'yyyymmdd' 형태로 반환하는 함수
function getBaseDate() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const MM = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}${MM}${dd}`;
}

// 날씨 데이터를 기상청 API로부터 받아오는 함수
async function fetchDailyWeather(nx: number, ny: number) {
  const BASE_DATE = getBaseDate(); // 기준 날짜
  const BASE_TIME = "0200"; // 새벽 2시 기준으로 예보 받음

  // 기상청 API 호출 URL 생성
  const url =
    `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst` +
    `?serviceKey=${WEATHER_API_KEY}&pageNo=1&numOfRows=1000&dataType=JSON` +
    `&base_date=${BASE_DATE}&base_time=${BASE_TIME}&nx=${nx}&ny=${ny}`;

  // API 호출 및 JSON 파싱
  const res = await fetch(url);
  const data = await res.json();
  const items = data.response.body.items.item;

  // 날짜별 날씨 정보를 담을 객체 선언
  const weatherMap: Record<
    string,
    {
      tmx?: string; // 최고기온
      tmn?: string; // 최저기온
      skyAm?: string; // 오전 하늘 상태
      skyPm?: string; // 오후 하늘 상태
      ptyAm?: string; // 오전 강수 상태
      ptyPm?: string; // 오후 강수 상태
    }
  > = {};

  for (const item of items) {
    const { category, fcstDate, fcstTime, fcstValue } = item;

    // 날짜별 초기화
    if (!weatherMap[fcstDate]) {
      weatherMap[fcstDate] = {};
    }

    // 최고, 최저기온 저장
    if (category === "TMX")
      weatherMap[fcstDate].tmx = String(Math.floor(fcstValue));
    if (category === "TMN")
      weatherMap[fcstDate].tmn = String(Math.floor(fcstValue));

    const timeInt = parseInt(fcstTime);
    const period = timeInt < 1200 ? "Am" : "Pm"; //오전/오후 판단

    // 하늘 상태
    if (category === "SKY") {
      weatherMap[fcstDate][`sky${period}`] = getSkyClass(
        String(Math.floor(fcstValue))
      );
    } else if (category === "PTY") {
      // 강수 상태
      weatherMap[fcstDate][`pty${period}`] = getPtyClass(
        String(Math.floor(fcstValue))
      );
    }
  }

  return weatherMap;
}

// 하늘 상태 클래스로 변환
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

// 강수 형태 클래스로 변환
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

function getWeatherLabel(code: string): string {
  const labelMap: Record<string, string> = {
    sunny: "맑음",
    cloudy: "구름 많음",
    overcast: "흐림",
    rainy: "비",
    snowy: "눈",
    "rain-snow": "비 또는 눈",
    unknown: "날씨 정보 없음",
    "": "날씨 정보 없음",
  };
  return labelMap[code] || "날씨 정보 없음";
}

// 날짜 포맷 변경 (0월 0일)
function formatToMonthDay(dateStr: string): string {
  // "20240518" → "05월 18일"
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return `${month}월 ${day}일`;
}

// 주소 문자열에서 해당 지역의 nx, ny 좌표 찾기
function findRegionFromAddress(
  address: string
): { nx: number; ny: number } | null {
  const regions = Object.keys(weatherRegionCodeMap2);
  // weatherRegionCodeMap2에 정의된 지역명(예: "서울특별시", "경기도 성남시")을 배열로 가져옴
  // 예: ["서울특별시", "경기도", "부산광역시" ...]

  // 긴 지역부터 먼저 찾도록 정렬(예: "서울특별시 강남구"가 "서울특별시"보다 먼저 오도록)
  regions.sort((a, b) => b.length - a.length);

  for (const region of regions) {
    // 정렬된 지역명 배열을 순회하면서
    if (address.startsWith(region)) {
      // 현재 주소가 해당 지역(region)으로 시작한다면
      return weatherRegionCodeMap2[region]; // 해당 지역의 nx, ny 좌표 값을 리턴
    }
  }

  return null;
}

// 실제로 날씨를 불러오고 화면에 표시하는 함수
export function outputtingWeather(address: string) {
  // const city2 = "서울특별시 종로구 사직로 161 경복궁"; // 사용자가 선택한 지역
  const locationData = findRegionFromAddress(address); // 좌표 찾기

  if (!locationData) {
    console.error("해당 지역의 좌표가 없습니다.");
  } else {
    const { nx, ny } = locationData;

    // 날씨 데이터 받아온 후, DOM 요소 생성 및 렌더링
    fetchDailyWeather(nx, ny).then((weatherMap) => {
      const dates = Object.keys(weatherMap).sort(); // 날짜 정렬
      const weatherContainer = document.querySelector(
        ".weather-container.short-term"
      );

      if (!weatherContainer) return;
      weatherContainer.innerHTML = ""; // 초기화

      // 최대 4일치 데이터 표시
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
            <div class="AmWeatherAria flex p-1 gap-1 md:gap-4 ">
              <div class="icon ${
                skyAmClass || ptyAmClass
              } w-6 h-6 md:w-7.5 md:h-7.5 "><span class="sr-only">${getWeatherLabel(
          skyAmClass || ptyAmClass
        )}</span> </div>
              <div class="PmWeatherAria icon ${
                skyPmClass || ptyPmClass
              } w-6 h-6 md:w-7.5 md:h-7.5 "><span class="sr-only">${getWeatherLabel(
          skyPmClass || ptyPmClass
        )}</span></div>
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
// outputtingWeather("서울특별시 종로구 사직로 161 경복궁");
