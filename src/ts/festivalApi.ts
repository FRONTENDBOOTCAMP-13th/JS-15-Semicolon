import "../style.css";

const API_KEY = import.meta.env.VITE_TOUR_API_KEY;
const BASE_URL = "/api/B551011/KorService2/searchFestival2";

const form = document.getElementById("filterForm"); // form은 지역과 날짜를 선택하는 전체 영역
const locationFilter = document.getElementById(
  "locationFilter"
) as HTMLSelectElement; // 지역을 선택하는 부분
const startDateInput = document.getElementById("startDate") as HTMLInputElement; // 시작 날짜 저장
const endDateInput = document.getElementById("endDate") as HTMLInputElement; // 종료 날짜 저장
const festivalList = document.getElementById("festivalList")!; // 찾은 축제들을 보여줄 곳

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

  dropdownButton?.addEventListener("click", () => {
    dropdownMenu?.classList.toggle("hidden");
    arrow?.classList.toggle("rotate-180");

    if (!dropdownMenu?.classList.contains("hidden")) {
      dropdownButton.classList.add("border-red-500");
    } else {
      dropdownButton.classList.remove("border-red-500");
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (!dropdownButton?.contains(target) && !dropdownMenu?.contains(target)) {
      dropdownMenu?.classList.add("hidden");
      arrow?.classList.remove("rotate-180");
      dropdownButton?.classList.remove("border-red-500");
    }
  });

  locationOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.getAttribute("data-value") || "";
      const text = option.textContent || "";

      if (selectedLocation) {
        selectedLocation.textContent = text;
      }

      if (locationFilter) {
        locationFilter.value = value;

        const event = new Event("change", { bubbles: true });
        locationFilter.dispatchEvent(event);
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
  e.preventDefault();

  const areaCode = locationFilter.value;
  const startDate = startDateInput.value.replace(/-/g, "");
  const endDate = endDateInput.value.replace(/-/g, "");

  const query = [
    `serviceKey=${API_KEY}`,
    "MobileApp=AppTest",
    "MobileOS=ETC",
    "_type=json",
    "numOfRows=15",
    "pageNo=1", // TODO : 수정 -> 다음 호출때 + 1 하는 형식으로 로직 구현 시도
    "arrange=A",
    startDate && `eventStartDate=${startDate}`,
    endDate && `eventEndDate=${endDate}`,
    areaCode && `areaCode=${areaCode}`,
  ]
    .filter(Boolean)
    .join("&");

  const url = `${BASE_URL}?${query}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    const items = json.response?.body?.items?.item || [];

    renderFestivalList(items);
  } catch (err) {
    console.error("❌ API 에러:", err);
    festivalList.innerHTML = `<p style="color:red;">데이터를 불러오는 데 실패했습니다.</p>`;
  }
});

function renderFestivalList(items: any[]) {
  festivalList.innerHTML = "";

  if (items.length === 0) {
    festivalList.innerHTML = "<p>📭 해당 조건에 맞는 축제가 없습니다.</p>";
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "festivalCard";
    const image =
      item.firstimage || "https://via.placeholder.com/300x200?text=No+Image";
    card.innerHTML = `
      <div class="w-full flex flex-col bg-white rounded-[1rem] overflow-hidden shadow border border-gray-300 transform transition duration-300 ease-in-out hover:-translate-y-1">
        <img src="${image}" alt="축제 이미지" class="w-full h-[200px] object-cover rounded-[1rem]" />
        <div class="p-3">
          <h3 class="font-bold text-[1rem] text-black truncate whitespace-nowrap overflow-hidden text-ellipsis">${item.title}</h3>
          <p class="text-gray-500 text-xs md:text-base truncate whitespace-nowrap overflow-hidden text-ellipsis">📍 ${item.addr1 || "지역 정보 없음"}</p>
          <p class="text-gray-500 text-xs md:text-base truncate whitespace-nowrap overflow-hidden text-ellipsis">🗓️ ${item.eventstartdate} ~ ${item.eventenddate}</p>
        </div>
      </div>
    `;
    festivalList.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initCustomDropdown();
  initDateRangePicker();
});
