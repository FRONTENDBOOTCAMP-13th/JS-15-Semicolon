// festivalFilter.ts
export interface FilterOptions {
  areaCode: string;
  startDate: string;
  endDate: string;
}

export interface FestivalFilterHandlers {
  onFilterChange?: (options: FilterOptions) => void;
}

export class FestivalFilter {
  private locationFilter: HTMLSelectElement;
  private startDateInput: HTMLInputElement;
  private endDateInput: HTMLInputElement;
  private form: HTMLFormElement;
  private handlers: FestivalFilterHandlers;

  constructor(handlers: FestivalFilterHandlers = {}) {
    this.handlers = handlers;

    // DOM 요소 선택
    this.form = document.getElementById("filterForm") as HTMLFormElement;
    this.locationFilter = document.getElementById(
      "locationFilter"
    ) as HTMLSelectElement;
    this.startDateInput = document.getElementById(
      "startDate"
    ) as HTMLInputElement;
    this.endDateInput = document.getElementById("endDate") as HTMLInputElement;

    // 필터 초기화
    this.initCustomDropdown();
    this.initDateRangePicker();
    this.initEventListeners();

    // 저장된 필터 복원
    this.restoreFilters();
  }

  // 필터 값 가져오기
  getFilters(): FilterOptions {
    return {
      areaCode: this.locationFilter.value,
      startDate: this.startDateInput.value.replace(/-/g, ""),
      endDate: this.endDateInput.value.replace(/-/g, ""),
    };
  }

  // 필터 값 설정하기
  setFilters(options: FilterOptions): void {
    this.locationFilter.value = options.areaCode;
    this.startDateInput.value = options.startDate.includes("-")
      ? options.startDate
      : options.startDate.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
    this.endDateInput.value = options.endDate.includes("-")
      ? options.endDate
      : options.endDate.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");

    // 드롭다운 UI 업데이트
    const selectedLocation = document.getElementById("selectedLocation");
    const selectedText = [
      ...document.querySelectorAll(".location-option"),
    ].find(
      (opt) => opt.getAttribute("data-value") === options.areaCode
    )?.textContent;

    if (selectedLocation && selectedText) {
      selectedLocation.textContent = selectedText;
    }

    // 날짜 범위 UI 업데이트
    const selectedDateRange = document.getElementById("selectedDateRange");
    if (selectedDateRange) {
      const formattedStart = options.startDate.includes("-")
        ? options.startDate
        : options.startDate.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
      const formattedEnd = options.endDate.includes("-")
        ? options.endDate
        : options.endDate.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");
      selectedDateRange.textContent = `${formattedStart} ~ ${formattedEnd}`;
    }
  }

  // 필터 저장하기
  saveFilters(): void {
    const filters = this.getFilters();
    localStorage.setItem("searchConditions", JSON.stringify(filters));
  }

  // 필터 복원하기
  restoreFilters(): void {
    const savedConditions = localStorage.getItem("searchConditions");
    if (savedConditions) {
      const filters = JSON.parse(savedConditions) as FilterOptions;
      this.setFilters(filters);
    }
  }

  // 초기화 함수들
  private initEventListeners(): void {
    // 폼 제출 이벤트
    this.form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const filters = this.getFilters();
      this.saveFilters();

      // 필터 변경 이벤트 핸들러 호출
      if (this.handlers.onFilterChange) {
        this.handlers.onFilterChange(filters);
      }
    });
  }

  // 드롭다운 초기화
  private initCustomDropdown(): void {
    const dropdownButton = document.getElementById("dropdownButton");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const locationOptions = document.querySelectorAll(".location-option");
    const selectedLocation = document.getElementById("selectedLocation");
    const arrow = dropdownButton?.querySelector("svg");

    // 드롭다운 메뉴 클릭 이벤트
    dropdownButton?.addEventListener("click", () => {
      dropdownMenu?.classList.toggle("hidden");
      arrow?.classList.toggle("rotate-180");

      if (!dropdownMenu?.classList.contains("hidden")) {
        dropdownButton.classList.add("border-ga-red300");
      } else {
        dropdownButton.classList.remove("border-ga-red300");
      }
    });

    // 외부 클릭 이벤트
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      if (
        !dropdownButton?.contains(target) &&
        !dropdownMenu?.contains(target)
      ) {
        dropdownMenu?.classList.add("hidden");
        arrow?.classList.remove("rotate-180");
        dropdownButton?.classList.remove("border-ga-red300");
      }
    });

    // 지역 옵션 클릭 이벤트
    locationOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const value = option.getAttribute("data-value") || "";
        const text = option.textContent || "";

        if (selectedLocation) {
          selectedLocation.textContent = text;
        }

        if (this.locationFilter) {
          this.locationFilter.value = value;
          const event = new Event("change", { bubbles: true });
          this.locationFilter.dispatchEvent(event);
        }

        dropdownMenu?.classList.add("hidden");
        arrow?.classList.remove("rotate-180");
        dropdownButton?.classList.remove("border-red-500");
      });
    });
  }

  // 날짜 범위 선택기 초기화
  private initDateRangePicker(): void {
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
    let tempStartDate: Date | null = null;
    let isDateCellClicked = false;

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

      currentMonthYear.textContent = `${year}년 ${month + 1}월`;

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const firstDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();

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

        let cellClass =
          "h-8 flex items-center justify-center rounded-md text-sm cursor-pointer";

        if (startDate && formatDate(startDate) === formattedDate) {
          cellClass += " bg-red-500 text-white";
        } else if (endDate && formatDate(endDate) === formattedDate) {
          cellClass += " bg-red-500 text-white";
        } else if (
          startDate &&
          endDate &&
          currentCellDate > startDate &&
          currentCellDate < endDate
        ) {
          cellClass += " bg-red-100";
        } else {
          cellClass += " hover:bg-gray-100";
        }

        dateCell.className = cellClass;
        dateCell.textContent = String(day);
        dateCell.dataset.date = formattedDate;

        // 날짜 클릭 이벤트 처리
        dateCell.addEventListener("click", (e) => {
          isDateCellClicked = true;
          e.stopPropagation();

          const clickedDate = new Date(formattedDate);

          if (!startDate || (startDate && endDate)) {
            startDate = clickedDate;
            endDate = null;
            tempStartDate = null;
          } else if (startDate && !endDate) {
            if (clickedDate < startDate) {
              endDate = startDate;
              startDate = clickedDate;
            } else {
              endDate = clickedDate;
            }
          }

          if (displayStartDate) {
            displayStartDate.textContent = startDate
              ? formatDate(startDate)
              : "-";
          }
          if (displayEndDate) {
            displayEndDate.textContent = endDate ? formatDate(endDate) : "-";
          }

          renderCalendar();

          setTimeout(() => {
            isDateCellClicked = false;
          }, 10);
        });

        calendarDays.appendChild(dateCell);
      }
    };

    // 이전/다음 월 버튼 이벤트
    prevMonthBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });

    nextMonthBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });

    // 날짜 초기화
    clearDatesBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      startDate = null;
      endDate = null;
      if (displayStartDate) displayStartDate.textContent = "-";
      if (displayEndDate) displayEndDate.textContent = "-";
      renderCalendar();
    });

    // 선택한 날짜 적용
    applyDateRangeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();

      if (startDate && endDate) {
        // hidden input 업데이트
        if (this.startDateInput)
          this.startDateInput.value = formatDate(startDate);
        if (this.endDateInput) this.endDateInput.value = formatDate(endDate);

        // 버튼 텍스트 업데이트
        if (selectedDateRangeText) {
          selectedDateRangeText.textContent = `${formatDate(
            startDate
          )} ~ ${formatDate(endDate)}`;
        }

        // 달력 닫기
        dateRangePicker?.classList.add("hidden");
        dateRangeButton?.classList.remove("border-red-500");
      } else {
        alert("시작일과 종료일을 모두 선택해주세요.");
      }
    });

    // 날짜 범위 선택기 이벤트
    dateRangePicker?.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // 날짜 범위 선택기 토글
    dateRangeButton?.addEventListener("click", (e) => {
      e.stopPropagation();
      dateRangePicker?.classList.toggle("hidden");

      if (!dateRangePicker?.classList.contains("hidden")) {
        dateRangeButton.classList.add("border-red-500");

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

    // // =================초기화 버튼======================
    // const resetBtn = document.querySelector(".reset-btn");
    // resetBtn?.addEventListener("click", (e) => {
    //   const resetBtn = document.querySelector(".reset-btn");
    //   const locationText = document.getElementById("selectedLocation");
    //   const displayStartDate = document.getElementById("displayStartDate");
    //   const displayEndDate = document.getElementById("displayEndDate");
    //   const locationSelect = document.getElementById(
    //     "locationFilter"
    //   ) as HTMLSelectElement | null;

    //   if (!locationText) return;
    //   if (!locationSelect) return;
    //   if (!displayStartDate) return;

    //   locationText.textContent = "전체"; // 지역 선택 텍스트 리셋
    //   locationSelect.value = ""; // 실제 select value 리셋

    //   e.stopPropagation();
    //   startDate = null;
    //   endDate = null;
    //   if (displayStartDate) displayStartDate.textContent = "-";
    //   if (displayEndDate) displayEndDate.textContent = "-";

    //   const cards = document.querySelectorAll("#festivalList > .festivalCard");
    //   let isFiltered = false;

    //   cards.forEach((card) => {
    //     const cardE = card as HTMLElement;

    //     cardE.style.display = "block";
    //   });

    //   renderCalendar();
    // });

    // 초기 렌더링
    renderCalendar();
  }
}
