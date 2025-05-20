import "/src/style.css";
import "../../assets/style/weather.css";
import weatherRegionCodeMap from "../../assets/ts/weather-middle-data";

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// 기준 날짜를 계산 (발표시간: 매일 오전 6시)
function getTmFc(): string {
  const now = new Date();
  const hours = now.getHours();

  // 오전 6시 이전이면 전날 날짜로 처리
  const baseTime =
    hours < 6 ? new Date(now.getTime() - 24 * 60 * 60 * 1000) : now;
  //날짜 포맷을 yyyymmdd 형식으로 반환
  const yyyy = baseTime.getFullYear();
  const MM = String(baseTime.getMonth() + 1).padStart(2, "0");
  const dd = String(baseTime.getDate()).padStart(2, "0");
  return `${yyyy}${MM}${dd}0600`; // 기준 시간: 오전 6시
}

// 기온예보와 육상예보를 동시에 가져옴
export async function fetchMidTermForecast(regId: string) {
  const tmFc = getTmFc(); //기준 발표 시각
  //===============================================================
  // 🚀 훈진 수정 : 프록시 서버 주소 세팅
  const proxy = `https://fesp-api.koyeb.app/proxy`;
  // 기상청 API 경로
  const landPath = `1360000/MidFcstInfoService/getMidLandFcst`;
  const tempPath = `1360000/MidFcstInfoService/getMidTa`;
  // 공통 쿼리
  const commonQuery = `serviceKey=${WEATHER_API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&regId=${regId}&tmFc=${tmFc}`;

  // 프록시를 통한 요청 URL
  const landUrl = `${proxy}${landPath}?${commonQuery}`;
  const tempUrl = `${proxy}${tempPath}?${commonQuery}`;

  // 요청 보낼 때 헤더에 타겟 API 도메인 명시 (프록시 서버가 필요로 함)
  const headers = {
    "X-target-url": "https://apis.data.go.kr", // 이건 프록시 서버가 보고 리다이렉트할 도메인
  };

  // // 육상예보 API URL
  // const landUrl =
  //   `/weather-api/1360000/MidFcstInfoService/getMidLandFcst?` +
  //   `serviceKey=${WEATHER_API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&` +
  //   `regId=${regId}&tmFc=${tmFc}`;

  // // 기온예보 API URL
  // const tempUrl =
  //   `/weather-api/1360000/MidFcstInfoService/getMidTa?` +
  //   `serviceKey=${WEATHER_API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&` +
  //   `regId=${regId}&tmFc=${tmFc}`;
  //===============================================================
  //병렬로 요청 보내기
  const [landRes, tempRes] = await Promise.all([
    fetch(landUrl, { headers }),
    fetch(tempUrl, { headers }),
  ]);

  // 응답 JSON 파싱
  const landData = await landRes.json();
  const tempData = await tempRes.json();

  return {
    land: landData.response.body.items.item[0], //육상예보: 날씨 상태(맑음 등)
    temp: tempData.response.body.items.item[0], // 기온예보: 최고/최저 기온
  };
}

const weatherFullAddress = "서울 종로구 사직로 161 경복궁";
renderMidTermForecastFromAddress(weatherFullAddress);

// 주소 문자열 안에서 날씨 지역을 찾아내기
function matchRegionFromAddress(address: string): string | null {
  const regions = Object.keys(weatherRegionCodeMap).sort(
    (a, b) => b.length - a.length
  ); // 길이가 긴 지역부터 먼저 검사

  // address 문자열에서 가능한 지역 단위만 추출
  const candidates = extractRegionCandidates(address);

  for (const candidate of candidates) {
    for (const region of regions) {
      if (candidate.includes(region)) return region;
    }
  }

  return null;
}

// 시/군/구 단위로 주소 자르기
function extractRegionCandidates(address: string): string[] {
  // 시/군/구 단위로 자르기 (예: "충청남도 보령시" → ["보령시", "보령", ...])
  const matches = address.match(/(.*?[시군구])/g) || []; // 시,군,구로 끝나는 단어들 뽑기
  const trimmed = matches.map(
    (
      m //시/도 등 접두사 제거
    ) => m.replace(/(특별시|광역시|도)/g, "").trim() // ex:"서울특별시"->"서울"
  );

  const splitWords = address
    .replace(/(특별시|광역시|도)/g, "") //시/도 접두사 없앤 다음, 공백으로 분리해서 각각의 단어를 배열로 만듦
    .split(/[\s]+/)
    .map((w) => w.trim());

  return [...trimmed, ...splitWords].filter(Boolean);
}

// 훈진 - 상세페이지에서 날씨 정보 넘겨받기 위해 export 추가
export async function renderMidTermForecastFromAddress(address: string) {
  const matchedRegion = matchRegionFromAddress(address);
  console.log(matchedRegion);

  if (!matchedRegion) {
    console.error("주소에서 매칭되는 지역명을 찾을 수 없습니다.");
    return;
  }

  try {
    const { tempCode, landCode } = getForecastLocationCode(matchedRegion);

    const [tempResult, landResult] = await Promise.all([
      fetchMidTermForecast(tempCode),
      fetchMidTermForecast(landCode),
    ]);

    displayMidTermForecast(tempResult.temp, landResult.land);
  } catch (error) {
    console.error("날씨 데이터를 가져오는 중 오류 발생:", error);
  }
}

// 도시 이름을 입력하면 기온/육상예보 코드를 반환하는 함수
function getForecastLocationCode(city: string) {
  // 도시명 -> 기온예보 코드 조회
  const tempCode = weatherRegionCodeMap[city];

  if (!tempCode) {
    throw new Error("기온 코드 없음: " + city);
  }

  // 앞 3자리 or 4자리 → 육상예보 지역 분류
  const landPrefix =
    tempCode.startsWith("11D1") ||
    tempCode.startsWith("11D2") ||
    tempCode.startsWith("11C1") ||
    tempCode.startsWith("11C2") ||
    tempCode.startsWith("11F1") ||
    tempCode.startsWith("11F2") ||
    tempCode.startsWith("11H1") ||
    tempCode.startsWith("11H2")
      ? tempCode.substring(0, 4)
      : tempCode.substring(0, 3);

  const regionToLandCodeMap: Record<string, string> = {
    "11B": "11B00000",
    "11D1": "11D10000",
    "11D2": "11D20000",
    "11C2": "11C20000",
    "11C1": "11C10000",
    "11F2": "11F20000",
    "11F1": "11F10000",
    "11H1": "11H10000",
    "11H2": "11H20000",
    "11G": "11G00000",
  };

  // 육상예보 코드 찾기
  const landCode = regionToLandCodeMap[landPrefix];

  if (!landCode) {
    throw new Error("육상예보 코드 없음: " + tempCode);
  }

  return { tempCode, landCode };
}

// 오늘 기준 N일 후 날짜를 MM월 DD일 형식으로 반환
function getDateAfterDays(days: number): string {
  // 오늘 기준 N일 후 날짜를 "MM월 DD일" 형식으로 반환
  const now = new Date();
  now.setDate(now.getDate() + days);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  return `${month}월 ${date}일`;
}

// text로 오는 육상예보를 class name으로 반환
function getMidTermWeatherClass(text: string): string {
  if (text.includes("맑음")) return "sunny";
  if (text.includes("구름")) return "cloudy";
  if (text.includes("안개") || text.includes("흐림")) return "overcast";
  if (text.includes("비") || text.includes("소나기")) return "rainy";
  if (text.includes("눈")) return "snowy";
  return "unknown";
}

// 여기서 작동~~~~~~~~~~~~~ html에 날씨예보 삽입
function displayMidTermForecast(temp: any, land: any) {
  const weatherContainer = document.querySelector(
    ".weather-container.mid-term"
  );

  if (!weatherContainer) return;
  weatherContainer.innerHTML = ""; // 초기화

  for (let i = 4; i <= 6; i++) {
    const date = getDateAfterDays(i); // ex) 05월 20일

    const minTemp = temp[`taMin${i}`];
    const maxTemp = temp[`taMax${i}`];

    let weatherAm = land[`wf${i}Am`];
    let weatherPm = land[`wf${i}Pm`];

    if (i <= 7) {
      weatherAm = land[`wf${i}Am`] || "-";
      weatherPm = land[`wf${i}Pm`] || "-";
    } else {
      const fullDay = land[`wf${i}`];
      weatherAm = fullDay || "-";
      weatherPm = fullDay || "-";
    }

    const weatherAmClass = getMidTermWeatherClass(weatherAm);
    const weatherPmClass = getMidTermWeatherClass(weatherPm);

    // 마지막 카드인지 체크 (i === 6이면 마지막)
    const isLast = i === 6;

    // border-r 제거할 조건 클래스 설정
    const borderClass = isLast ? "" : "border-r border-gray-300";

    // 카드 요소 생성
    const weatherCard = document.createElement("li");
    weatherCard.className = "middle-weather-card";
    weatherCard.innerHTML = `
      <li class="flex flex-col items-center text-center ${borderClass} px-2 md:px-5">
        <time class=" text-ga-gray300 font-light text-12 md:text-14">${date}</time>
        <div class="flex p-1 gap-1 md:gap-4 ">
          <div class="icon ${weatherAmClass} w-6 h-6 md:w-7.5 md:h-7.5 "></div>
          <div class="icon ${weatherPmClass} w-6 h-6 md:w-7.5 md:h-7.5 "></div>
        </div>
        <strong  class="text-14 md:text-18">
          <span class="text-blue-500">${minTemp}°</span
          ><span class="text-ga-gray200 text-12 px-0.5 font-normal">/</span
          ><span class="text-ga-red200 ml-1">${maxTemp}°</span>
        </strong>
      </li>
    `;
    weatherContainer.appendChild(weatherCard);
  }
}
