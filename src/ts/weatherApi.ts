import "/src/style.css";
import weatherRegionCodeMap from "../assets/weather-middle-data-2";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

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

// 기존예보와 육상예보를 동시에 가져옴
export async function fetchMidTermForecast(regId: string) {
  const tmFc = getTmFc(); //기준 발표 시각

  // 육상예보 API URL
  const landUrl =
    `/weather-api/1360000/MidFcstInfoService/getMidLandFcst?` +
    `serviceKey=${API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&` +
    `regId=${regId}&tmFc=${tmFc}`;

  // 기온예보 API URL
  const tempUrl =
    `/weather-api/1360000/MidFcstInfoService/getMidTa?` +
    `serviceKey=${API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&` +
    `regId=${regId}&tmFc=${tmFc}`;

  //병렬로 요청 보내기
  const [landRes, tempRes] = await Promise.all([
    fetch(landUrl),
    fetch(tempUrl),
  ]);

  // 응답 JSON 파싱
  const landData = await landRes.json();
  const tempData = await tempRes.json();

  return {
    land: landData.response.body.items.item[0], //육상예보: 날씨 상태(맑음 등)
    temp: tempData.response.body.items.item[0], // 기온예보: 최고/최저 기온
  };
}

// 도시 이름을 입력하면 기온/육상예보 코드를 반환하는 함수
function getForecastLocationCode(city: string) {
  // 도시명 -> 기온예보 코드 조회
  const tempCode = weatherRegionCodeMap[city];

  if (!tempCode) {
    throw new Error("기온 코드 없음: " + city);
  }

  // 앞 3자리 or 4자리 → 육상예보 지역 분류
  const landPrefix = tempCode.substring(0, 3); // 예: 11B
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

// ///////////////////////////////////////////////////////
const city = "인천";
const { tempCode, landCode } = getForecastLocationCode(city);

fetchMidTermForecast(landCode) // land 설명용
  .then((res) => console.log("🌤️ 육상예보:", res));

fetchMidTermForecast(tempCode) // 기온용
  .then((res) => console.log("🌡️ 기온:", res));

////////////////
Promise.all([
  fetchMidTermForecast(tempCode), // 기온 예보용
  fetchMidTermForecast(landCode), // 날씨 상태용
]).then(([tempResult, landResult]) => {
  const temp = tempResult.temp;
  const land = landResult.land;

  // 4일 후 데이터 추출
  const minTemp = temp.taMin4;
  const maxTemp = temp.taMax4;
  const weatherDesc = `오전: ${land?.wf4Am || "정보 없음"}, 오후: ${
    land?.wf4Pm || "정보 없음"
  }`;

  console.log(`📅 4일 후 서울 날씨`);
  console.log(`🌡️ 최저기온: ${minTemp}도`);
  console.log(`🔥 최고기온: ${maxTemp}도`);
  console.log(`🌤️ 날씨 상태: ${weatherDesc}`);
});
