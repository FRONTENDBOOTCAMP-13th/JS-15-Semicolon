/*
 * 1️⃣ 페이지 로딩 시 초기화 단계
 * - 페이지 로딩 -> 필요 기능 초기화 -> 이전 검색 기록 확인 -> 초기 축제 목록 표시
 *
 * 2️⃣ 사용자 상호작용 흐름
 * 🚀 지역 선택 시
 * 지역 드롭다운 클릭 -> 지역 목록 표시 -> 지역 선택 -> 선택한 지역 표시 및 값 저장
 *
 * 🚀 날짜 선택 시
 * 날짜 버튼 클릭 -> 캘린더 표시 -> 시작일 표시 -> 종료일 선택 -> 적용 버튼 클릭 -> 선택한 날짜 표시 및 값 저장
 *
 * 🚀 축제 검색 시
 * 검색 버튼 클릭 -> 검색 조건 수집 -> 서버에 요청 -> 응답 받기 -> 축제 목록 표시 -> 검색 조건 및 결과 저장
 * - user가 검색 버튼 클릭시 form 제출 이벤트 발생
 * - 선택한 지역 코드 및 날짜를 수집하여 검색 조건 생성
 * - 만든 조건으로 API 서버에 요청
 * - 서버에서 응답 받아 JSON 형태로 변환
 * - 받은 축제 목록 화면에 표시
 * - 로컬 스토리지에 저장하여 나중에도 사용가능토록 세팅
 *
 * 3️⃣ 축제 목록 표시 및 상호작용
 * 🚀 축제 목록 표시
 * 축제 데이터 받기 -> 각 축제마다 카드 생성 -> 카드에 정보 채우기 -> 클릭 이벤트 추가 -> 페이지에 표시
 * - 서버에서 받은 축제 데이터 처리
 * - 각 축제마다 카드 요소 생성
 * - 카드에 축제 정보 채우기
 * - 클릭 이벤트 추가하여 상세 페이지로 이동할 수 있게 세팅
 * - 만들어진 카드를 축제 목록 영역에 추가
 *
 * 🚀 무한 스크롤
 * 스크롤 감지 -> 페이지 하단 도달 확인 -> 다음 페이지 축제 요청 -> 추가 데이터 받기 -> 기존 목록에 추가
 *
 * 🚀 축제 상세 정보 이동
 * 축제 카드 클릭 -> 선택한 축제 정보 저장 -> 상세 페이지 이동
 *
 * 4️⃣ 예외 처리 흐름
 * 🚀 데이터 로딩 실패
 * 에러 발생 -> 에러 로깅 -> 사용자에게 오류 표시
 *
 * 🚀 검색 결과 없음
 * 빈 결과 배열 확인 -> "문구 표시"
 */

import "/src/style.css";

const API_KEY = import.meta.env.VITE_TOUR_API_KEY; // TOUR API 키 저장
const BASE_URL = "/api/B551011/KorService2/searchFestival2"; // Base URL 저장

const form = document.getElementById("filterForm"); // form은 지역과 날짜를 선택하는 전체 영역
const locationEl = document.getElementById("locationFilter");
if (!(locationEl instanceof HTMLSelectElement)) {
  throw new Error("X");
}
const locationFilter = locationEl; // 지역 선택 부분

const startEl = document.getElementById("startDate"); // 시작 날짜 저장
if (!(startEl instanceof HTMLInputElement)) {
  throw new Error("start는 input 요소여야 함");
} // 타입 가드로 변환
const startDateInput = startEl;

const endEl = document.getElementById("endDate");
if (!(endEl instanceof HTMLInputElement)) {
  throw new Error("end는 input 요소여야 함");
}
const endDateInput = endEl; // 종료 날짜 저장
const festivalList = document.getElementById("festivalList")!; // 찾은 축제들을 보여줄 곳

// 리렌더링 변수 선언
let currentPage = 1; // 몇번째 페이지인지 기록할 변수
let isFetching = false; // 연속으로 호출되지 않도록 막는 플래그

// 🚀 무한 스크롤 이벤트 리스너
// 스크롤하면 다음 축제 데이터 20개 불러오는 부분
// 스크롤 감지해서 렌더링 함수 출력(fetchMoreFestivals)
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY; // 얼마나 스크롤했는지 확인
  const windowHeight = window.innerHeight; // 화면의 높이 확인
  const bodyHeight = document.body.offsetHeight; // 전체 페이지의 높이 확인

  // 페이지 끝 부분에 도달하면 다음 페이지 렌더링
  if (scrollTop + windowHeight >= bodyHeight - 100 && !isFetching) {
    currentPage++; // 다음 페이지로 이동
    fetchMoreFestivals(currentPage);
  }
});

//==============================================================================================
// 🚀 지역 선택 함수
//==============================================================================================
const initCustomDropdown = () => {
  // 지역 선택 드롭다운 메뉴 초기화 함수
  const dropdownButton = document.getElementById("dropdownButton");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const locationOptions = document.querySelectorAll(".location-option");
  const selectedLocation = document.getElementById("selectedLocation");
  const arrow = dropdownButton?.querySelector("svg");

  // 드롭다운 메뉴를 클릭하면 보여주거나 숨기기
  dropdownButton?.addEventListener("click", () => {
    dropdownMenu?.classList.toggle("hidden");
    arrow?.classList.toggle("rotate-180");

    // 메뉴가 보이면 버튼 테두리 색 변경
    if (!dropdownMenu?.classList.contains("hidden")) {
      dropdownButton.classList.add("border-ga-red300");
    } else {
      dropdownButton.classList.remove("border-ga-red300");
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement; // 클릭한 대상을 target에 저장
    if (!dropdownButton?.contains(target) && !dropdownMenu?.contains(target)) {
      // 클릭 대상이 드롭다운 버튼 및 메뉴가 아니면 실행
      dropdownMenu?.classList.add("hidden");
      // 드롭다운 메뉴에 hidden을 추가해서 메뉴 숨기기
      arrow?.classList.remove("rotate-180");
      // 드롭다운 메뉴 화살표 원래 방향으로 돌려놓기
      dropdownButton?.classList.remove("border-ga-red300");
    }
  });

  locationOptions.forEach((option) => {
    // 모든 지역 옵션에 대해 반복해서 다음 코드 실행
    option.addEventListener("click", () => {
      // 각 옵션에 클릭 이벤트 추가
      const value = option.getAttribute("data-value") || "";
      // 옵션 date-value 속성값을 가져와서 저장
      const text = option.textContent || "";
      // 옵션의 텍스트 내용을 가져와서 저장

      if (selectedLocation) {
        selectedLocation.textContent = text;
      }

      if (locationFilter) {
        locationFilter.value = value;
        // locationFilter의 값을 클릭한 옵션의 value로 설정

        const event = new Event("change", { bubbles: true });
        // change라는 새로운 이벤트를 만들어 bubbles: true를 통해 이벤트가 상위 요소들에게도 전달
        locationFilter.dispatchEvent(event);
        // change 이벤트를 발생시켜 선택의 변경 사항을 공유 가능
      }

      dropdownMenu?.classList.add("hidden");
      arrow?.classList.remove("rotate-180");
      dropdownButton?.classList.remove("border-red-500");
    });
  });
};

//==============================================================================================
// 🚀 날짜 범위 선택 기능
//==============================================================================================
const initDateRangePicker = () => {
  const dateRangeButton = document.getElementById("dateRangeButton");
  const dateRangePicker = document.getElementById("dateRangePicker");
  const calendarDays = document.getElementById("calendarDays");
  const currentMonthYear = document.getElementById("currentMonthYear");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const clearDatesBtn = document.getElementById("clearDates");
  const applyDateRangeBtn = document.getElementById("applyDateRange");
  const displayStartDate = document.getElementById("displayStartDate");
  const displayEndDate = document.getElementById("displayEndDate");
  const selectedDateRangeText = document.getElementById("selectedDateRange");

  // 날짜 관련 상태 변수
  let currentDate = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let tempStartDate: Date | null = null; // 임시 시작일(날짜 범위 선택 중)
  let isDateCellClicked = false; // 날짜 셀 클릭 여부를 추적하는 플래그

  // 날짜 포맷 함수
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 달력 렌더링 함수
  const renderCalendar = () => {
    if (!calendarDays || !currentMonthYear) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 월, 년도 표시 업데이트
    currentMonthYear.textContent = `${year}년 ${month + 1}월`;

    // 해당 월의 첫날과 마지막 날 계산
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 달력 그리드에 필요한 정보 계산
    const firstDayOfWeek = firstDay.getDay(); // 0(일요일)부터 6(토요일)
    const daysInMonth = lastDay.getDate();

    // 달력 초기화
    calendarDays.innerHTML = "";

    // 첫째 주 이전의 빈 셀 추가
    for (let i = 0; i < firstDayOfWeek; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "h-8 rounded-md";
      calendarDays.appendChild(emptyCell);
    }

    // 날짜 셀 생성
    for (let day = 1; day <= daysInMonth; day++) {
      const dateCell = document.createElement("div");
      const currentCellDate = new Date(year, month, day);
      const formattedDate = formatDate(currentCellDate);

      // 기본 스타일
      let cellClass =
        "h-8 flex items-center justify-center rounded-md text-sm cursor-pointer";

      // 날짜 범위 선택 스타일 적용
      if (startDate && formatDate(startDate) === formattedDate) {
        // 시작일
        cellClass += " bg-red-500 text-white";
      } else if (endDate && formatDate(endDate) === formattedDate) {
        // 종료일
        cellClass += " bg-red-500 text-white";
      } else if (
        startDate &&
        endDate &&
        currentCellDate > startDate &&
        currentCellDate < endDate
      ) {
        // 범위 내 날짜
        cellClass += " bg-red-100";
      } else {
        // 일반 날짜
        cellClass += " hover:bg-gray-100";
      }

      dateCell.className = cellClass;
      dateCell.textContent = String(day);
      dateCell.dataset.date = formattedDate;

      // 날짜 클릭 이벤트 처리
      dateCell.addEventListener("click", (e) => {
        // 클릭 이벤트 발생 시 플래그 설정
        isDateCellClicked = true;

        // 이벤트 버블링 막기
        e.stopPropagation();

        const clickedDate = new Date(formattedDate);

        // 첫 클릭 또는 양쪽 다 선택된 후 다시 시작하는 경우
        if (!startDate || (startDate && endDate)) {
          startDate = clickedDate;
          endDate = null;
          tempStartDate = null;
        }
        // 시작일만 선택된 상태에서 두번째 클릭
        else if (startDate && !endDate) {
          // 시작일보다 이전 날짜를 클릭한 경우
          if (clickedDate < startDate) {
            endDate = startDate;
            startDate = clickedDate;
          } else {
            endDate = clickedDate;
          }
        }

        // 선택된 날짜 표시 업데이트
        if (displayStartDate) {
          displayStartDate.textContent = startDate
            ? formatDate(startDate)
            : "-";
        }
        if (displayEndDate) {
          displayEndDate.textContent = endDate ? formatDate(endDate) : "-";
        }

        // 달력 다시 렌더링
        renderCalendar();

        // 다음 틱에서 플래그 초기화 (이벤트 전파 후)
        setTimeout(() => {
          isDateCellClicked = false;
        }, 10);
      });

      calendarDays.appendChild(dateCell);
    }
  };

  // 이전/다음 월 버튼 이벤트
  prevMonthBtn?.addEventListener("click", (e) => {
    e.stopPropagation(); // 이벤트 전파 방지
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn?.addEventListener("click", (e) => {
    e.stopPropagation(); // 이벤트 전파 방지
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  // 날짜 초기화
  clearDatesBtn?.addEventListener("click", (e) => {
    e.stopPropagation(); // 이벤트 전파 방지
    startDate = null;
    endDate = null;
    if (displayStartDate) displayStartDate.textContent = "-";
    if (displayEndDate) displayEndDate.textContent = "-";
    renderCalendar();
  });

  // 선택한 날짜 적용
  applyDateRangeBtn?.addEventListener("click", (e) => {
    e.stopPropagation(); // 이벤트 전파 방지

    // 시작일과 종료일 모두 선택된 경우만 적용
    if (startDate && endDate) {
      // hidden input 업데이트
      if (startDateInput) startDateInput.value = formatDate(startDate);
      if (endDateInput) endDateInput.value = formatDate(endDate);

      // 버튼 텍스트 업데이트
      if (selectedDateRangeText) {
        selectedDateRangeText.textContent = `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
      }

      // 달력 닫기
      dateRangePicker?.classList.add("hidden");
      dateRangeButton?.classList.remove("border-red-500");
    } else {
      alert("시작일과 종료일을 모두 선택해주세요.");
    }
  });

  // 날짜 범위 선택기 자체에 클릭 이벤트 추가하여 버블링 방지
  dateRangePicker?.addEventListener("click", (e) => {
    e.stopPropagation(); // 이벤트 전파 방지
  });

  // 날짜 범위 선택기 토글
  dateRangeButton?.addEventListener("click", (e) => {
    e.stopPropagation(); // 이벤트 전파 방지
    dateRangePicker?.classList.toggle("hidden");

    // 선택기가 열렸을 때 테두리 색 변경
    if (!dateRangePicker?.classList.contains("hidden")) {
      dateRangeButton.classList.add("border-red-500");

      // 값이 없을 경우 오늘 날짜로 달력 초기화
      if (!startDate && !endDate) {
        currentDate = new Date();
      }

      renderCalendar();
    } else {
      dateRangeButton.classList.remove("border-red-500");
    }
  });

  // 외부 클릭 시 닫기
  document.addEventListener("click", (event) => {
    // 날짜 셀 클릭 직후에는 처리하지 않음
    if (isDateCellClicked) return;

    const target = event.target as HTMLElement;

    const isOutsideClick =
      !dateRangeButton?.contains(target) &&
      !dateRangePicker?.contains(target) &&
      !dateRangePicker?.classList.contains("hidden");

    if (isOutsideClick) {
      dateRangePicker?.classList.add("hidden");
      dateRangeButton?.classList.remove("border-red-500");
    }
  });

  // 초기 렌더링
  renderCalendar();
};
//==============================================================================================
// 🚀 축제 검색 기능
//==============================================================================================
form?.addEventListener("submit", async (e) => {
  // 검색 버튼 클릭시 실행
  // form 제출 이벤트 추가
  e.preventDefault(); // 새로고침 막기

  const areaCode = locationFilter.value; // 선택한 지역 코드를 area code에 저장
  const startDate = startDateInput.value.replace(/-/g, "");
  const endDate = endDateInput.value.replace(/-/g, "");
  // const startDate = startDateInput.value;
  // const endDate = endDateInput.value;

  const query = [
    // 축제 요청 정보 필요 조건
    `serviceKey=${API_KEY}`,
    "MobileApp=AppTest",
    "MobileOS=ETC",
    "_type=json", // json 형식으로 받기
    "numOfRows=20", // 전달 받는 축제 정보량
    "pageNo=1",
    "arrange=A", // 알파벳 순서대로 정렬
    startDate && `eventStartDate=${startDate}`,
    endDate && `eventEndDate=${endDate}`,
    areaCode && `areaCode=${areaCode}`,
  ]
    .filter(Boolean)
    .join("&");

  const url = `${BASE_URL}?${query}`;
  // 기본 주소와 조건을 합쳐 최종 URL 만들기

  try {
    const res = await fetch(url); // 서버에 축제 정보를 요청
    const json = await res.json(); // 받은 정보를 json으로 변환
    const items = json.response?.body?.items?.item || []; // 축제 목록을 가져오고 없으면 빈 배열 생성

    renderFestivalList(items, areaCode, startDate, endDate); // 축제 목록을 화면에 보여줌
  } catch (err) {
    console.error("❌ API 에러:", err);
    festivalList.innerHTML = `<p style="color:red;">데이터를 불러오는 데 실패했습니다.</p>`;
  }
});

function renderFestivalList(
  items: any[], // 축제 목록
  areaCode: string, // 지역 코드
  startDate: string, // 시작 날짜
  endDate: string, // 종료 날짜
  append: boolean = false // 첫 렌더링, 기존 추가 렌더링 여부
) {
  if (!append) {
    festivalList.innerHTML = ""; // 축제 목록을 보여줄 부분 비움
  }

  if (items.length === 0 && !append) {
    festivalList.innerHTML = "<p>📭 해당 조건에 맞는 축제가 없습니다.</p>";
    return;
  }

  items.forEach((item) => {
    // 각 축제에 대한 정보를 반복해서 코드 실행
    const card = document.createElement("div"); // 축제 정보가 들어갈 카드 div 만들기
    card.className = "festivalCard"; // 스타일 적용을 위한 클래스 추가
    card.style.cursor = "pointer"; // 커서 스타일 조정

    // const image =
    //   item.firstimage || "https://via.placeholder.com/300x200?text=No+Image";
    // card.innerHTML = `
    //   <div class="w-full flex flex-col bg-white rounded-[1rem] overflow-hidden shadow border border-gray-300 transform transition duration-300 ease-in-out hover:-translate-y-1">
    //     <img src="${image}" alt="축제 이미지" class="w-full h-[200px] object-cover rounded-[1rem]" />
    //     <div class="p-3">
    //       <h3 class="font-bold text-[1rem] text-black truncate whitespace-nowrap overflow-hidden text-ellipsis">${item.title}</h3>
    //       <p class="text-gray-500 text-xs md:text-base truncate whitespace-nowrap overflow-hidden text-ellipsis">📍 ${item.addr1 || "지역 정보 없음"}</p>
    //       <p class="text-gray-500 text-xs md:text-base truncate whitespace-nowrap overflow-hidden text-ellipsis">🗓️ ${item.eventstartdate} ~ ${item.eventenddate}</p>
    //     </div>
    //   </div>
    // `;
    const image = item.firstimage;
    const imageElement = image
      ? `<img src="${image}" alt="축제 이미지" class="w-full h-[200px] object-cover rounded-[1rem]" />`
      : `<div class="w-full h-[200px] bg-ga-gray300 flex items-center justify-center text-gray-600 text-sm rounded-[1rem]">
      이미지 없음
    </div>`;

    card.innerHTML = `
  <div class="w-full flex flex-col bg-white rounded-[1rem] overflow-hidden shadow border border-ga-gray100 transform transition duration-300 ease-in-out hover:-translate-y-1">
    ${imageElement}
    <div class="p-3">
      <h3 class="font-bold text-[1rem] text-black truncate whitespace-nowrap overflow-hidden text-ellipsis">${item.title}</h3>
      <p class="text-gray-500 text-xs md:text-base truncate whitespace-nowrap overflow-hidden text-ellipsis">📍 ${item.addr1 || "지역 정보 없음"}</p>
      <p class="text-gray-500 text-xs md:text-base truncate whitespace-nowrap overflow-hidden text-ellipsis">🗓️ ${item.eventstartdate} ~ ${item.eventenddate}</p>
    </div>
  </div>
`;
    // 카드 클릭시 상세 페이지로 이동하는 이벤트 리스너 추가
    card.addEventListener("click", () => {
      localStorage.setItem("selectedFestival", JSON.stringify(item)); // 선택한 축제 정보 저장
      // 상세 페이지로 이동
      window.location.href = "detail.html";
    });
    festivalList.appendChild(card); // 만든 카드를 축제 목록에 추가
  });
  // 검색 조건과 결과를 localStorage에 저장
  localStorage.setItem(
    "searchConditions",
    JSON.stringify({
      areaCode,
      startDate,
      endDate,
    })
  );
  localStorage.setItem("searchResults", JSON.stringify(items));
}
//==============================================================================================
// 무한스크롤이 작동할 때, 더 많은 축제를 가져오는 함수
async function fetchMoreFestivals(page: number) {
  isFetching = true;

  const areaCode = locationFilter.value;
  const startDate = startDateInput.value.replace(/-/g, "");
  const endDate = endDateInput.value.replace(/-/g, "");

  // 서버에 보낼 요청 조건 만들기
  const query = [
    `serviceKey=${API_KEY}`,
    "MobileApp=AppTest",
    "MobileOS=ETC",
    "_type=json",
    "numOfRows=20",
    `pageNo=${page}`,
    "arrange=A",
    startDate && `eventStartDate=${startDate}`,
    endDate && `eventEndDate=${endDate}`,
    areaCode && `areaCode=${areaCode}`,
  ]
    .filter(Boolean)
    .join("&");

  const url = `${BASE_URL}?${query}`;

  try {
    // 서버에서 추가 축제 정보 가져오기
    const res = await fetch(url);
    const json = await res.json();
    const items = json.response?.body?.items?.item || [];
    renderFestivalList(items, areaCode, startDate, endDate, true); // append = true
  } catch (err) {
    console.error("❌ 무한 스크롤 API 에러:", err);
  } finally {
    isFetching = false;
  }
}

//==============================================================================================
document.addEventListener("DOMContentLoaded", () => {
  initCustomDropdown();
  initDateRangePicker();

  // 로컬스토리지에서 지난 검색 기록 꺼내기
  const savedConditions = localStorage.getItem("searchConditions");
  // 내가 이전에 검색했던 지역, 날짜 같은 조건들
  const savedResults = localStorage.getItem("searchResults");
  // 그 조건으로 받았던 축제들(결과)

  if (savedConditions && savedResults) {
    // 만약 전에 찾아본 조건과 결과가 모두 있다면 다음 코드 실행
    const { areaCode, startDate, endDate } = JSON.parse(savedConditions);
    // 저장된 검색 조건을 풀어서 지역코드와 시작날짜, 끝날짜를 꺼낸다.
    const items = JSON.parse(savedResults);
    // 저장된 축제 결과도 풀어서 목록으로 가져오기

    // 지역 필터 복원
    locationFilter.value = areaCode;
    const selectedLocation = document.getElementById("selectedLocation");
    const selectedText = [
      ...document.querySelectorAll(".location-option"),
    ].find((opt) => opt.getAttribute("data-value") === areaCode)?.textContent;
    if (selectedLocation && selectedText)
      selectedLocation.textContent = selectedText;

    // 날짜 필터 복원
    if (startDateInput && endDateInput) {
      startDateInput.value = startDate.replace(/-/g, "");
      endDateInput.value = endDate.replace(/-/g, "");
    }

    const selectedDateRange = document.getElementById("selectedDateRange");
    if (selectedDateRange) {
      selectedDateRange.textContent = `${startDate} ~ ${endDate}`;
    }

    // 카드 다시 렌더링
    renderFestivalList(items, areaCode, startDate, endDate);
  } else {
    // 처음 방문하면 오늘 날짜의 축제 보여줌
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");

    // 오늘 날짜 기준으로 카드 렌더링
    const url = `${BASE_URL}?${[
      `serviceKey=${API_KEY}`,
      "MobileApp=AppTest",
      "MobileOS=ETC",
      "_type=json",
      "numOfRows=20",
      "pageNo=1",
      "arrange=R", // 최신순
      `eventStartDate=${formattedDate}`,
    ].join("&")}`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        const items = json.response?.body?.items?.item || [];
        renderFestivalList(items, "", formattedDate, formattedDate);
      })
      .catch((err) => {
        console.error("❌ 초기 로딩 실패:", err);
        festivalList.innerHTML = `<p style="color:red;">초기 데이터를 불러오지 못했습니다.</p>`;
      });
  }
});
