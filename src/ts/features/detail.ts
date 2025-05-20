import { renderMidTermForecastFromAddress } from "../api/weatherApi";
import { outputtingWeather } from "../api/shortWeatherApi";
import { xScroll } from "./weather";
import { getCoordsFromAddress, initKakaoMap } from "../api/kakaoApi";

document.addEventListener("DOMContentLoaded", () => {
  // 축제 상세 정보를 표시할 요소 선택
  const festivalDetail = document.getElementById("festivalDetail");

  interface Festival {
    title?: string;
    firstimage?: string;
    addr1?: string;
    addr2?: string;
    eventstartdate?: string;
    eventenddate?: string;
    overview?: string;
    tel?: string;
    homepage?: string;
  }

  // 로컬 스토리지에서 선택한 축제 데이터 가져옴
  const rawData = localStorage.getItem("selectedFestival");
  // 데이터 없으면 에러 메시지 표시
  if (!rawData || !festivalDetail) {
    festivalDetail!.innerHTML = `
      <div class="info-box text-center">
        <h2 class="text-xl font-bold text-red-500">😥 축제 정보를 찾을 수 없습니다</h2>
        <p class="mt-2">목록으로 돌아가서 다시 시도해주세요.</p>
      </div>
    `;
    return;
  }

  // 로컬스토리지에서 가져온 데이터를 JSON으로 파싱
  // JSON.parse()를 사용하여 문자열을 객체로 변환
  const selectedFestival: Festival = JSON.parse(rawData);
  console.log("rawData:", rawData); // 추가

  // 날짜 형식 변환 함수
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "";
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}년 ${month}월 ${day}일`;
  };

  let imageHTML = "";

  if (selectedFestival.firstimage) {
    imageHTML = `<img src="${selectedFestival.firstimage}" alt="${selectedFestival.title}" class="mx-auto rounded-[0.625rem]" />`;
  } else {
    imageHTML = `<div class="mx-auto w-full h-[400px] bg-ga-gray300 flex items-center justify-center rounded-2xl text-ga-gray300 text-lg">
    축제 이미지가 없습니다
  </div>`;
  }
  // 축제 상세 정보 표시
  console.log("렌더 시작");
  festivalDetail.innerHTML = `
  <div class="max-w-[58.5rem] mx-auto px-4">
    ${imageHTML}
    <div class="space-y-4 text-left" >
      <div class="border rounded-2xl border-gray-300 px-4 mt-4">
        <h1 class="text-3xl font-bold my-4">
          ${selectedFestival.title || "제목 없음"}
        </h1>

        <!-- 축제 기간 -->
        <div class="mt-6">
          <h2 class="text-xl font-bold mb-2">🗓️ 축제 기간</h2>
          <p>${formatDate(selectedFestival.eventstartdate)} ~ ${formatDate(selectedFestival.eventenddate)}</p>
        </div>

        <!-- 축제 장소 -->
        <div class="mt-6">
          <h2 class="text-xl font-bold mb-2">📍 축제 장소</h2>
          <p>${selectedFestival.addr1 || "장소 정보가 없습니다"}</p>
          ${
            selectedFestival.addr2
              ? `<p class="text-sm text-gray-500 mt-1">${selectedFestival.addr2}</p>`
              : ""
          }
        </div>

        <!-- 문의처 -->
        ${
          selectedFestival.tel
            ? `
            <div class="mt-6">
              <h2 class="text-xl font-bold mb-2">📞 문의처</h2>
              <p>${selectedFestival.tel}</p>
            </div>
          `
            : ""
        }
      </div>
      <div>
        <div class="weather-container-wrap no-select flex justify-center text-center py-4 border rounded-2xl border-gray-300 overflow-hidden">
          <ul class="weather-container flex short-term"></ul>
          <ul class="weather-container flex mid-term"></ul>
        </div>
      </div>
      <div class="mt-10 max-w-[58.5rem] mx-auto rounded-2xl">
                <section
          id="map"
          class="w-full h-[16.5rem] sm:h-[31.25rem] mb-10 rounded-2xl border border-ga-gray200 relative z-0">
          <div
            class="absolute bottom-4 right-4 flex flex-col lg:flex-row gap-2 z-10">
            <button
              id="getRoute"
              class="flex text-xs sm:text-sm items-center gap-1 sm:gap-2 px-4 py-1.5 sm:px-6 sm:py-2 bg-red-500 text-white font-semibold rounded-full shadow-md hover:bg-red-600 transition-colors duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 sm:w-5 sm:h-5"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="currentColor">
                <path
                  d="M3,4V12.5L6,9.5L9,13C10,14 10,15 10,15V21H14V14C14,14 14,13 13.47,12C12.94,11 12,10 12,10L9,6.58L11.5,4M18,4L13.54,8.47L14,9C14,9 14.93,10 15.47,11C15.68,11.4 15.8,11.79 15.87,12.13L21,7" />
              </svg>
              길 찾기
            </button>

            <button
              id="changeOrigin"
              class="flex text-xs sm:text-sm items-center gap-1 sm:gap-2 px-4 py-1.5 sm:px-6 sm:py-2 bg-white text-red-500 font-semibold rounded-full border border-red-500 shadow-md hover:bg-red-500 hover:text-white transition-colors duration-200">
              + 출발지 변경
            </button>
          </div>
        </section>

      </div>
    </div>
  </div>
`;
  document.title = `${selectedFestival.title || "축제 정보"} - 상세 정보`;

  function waitForKakao(): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  if (selectedFestival.addr1) {
    const addr = selectedFestival.addr1;

    waitForKakao().then(() => {
      renderMidTermForecastFromAddress(addr);

      const shortWeatherTarget = document.querySelector(
        ".weather-container.short-term"
      );
      if (shortWeatherTarget) {
        outputtingWeather(addr);
      }

      xScroll();

      getCoordsFromAddress(addr).then((coords) => {
        window.festivalCoords = coords; // 전역으로 넘겨줌
        initKakaoMap(); // 지도 초기화 실행
      });
    });
  }
});
