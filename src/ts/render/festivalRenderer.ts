import { FestivalItem } from "../api/festivalApi";

export class FestivalRenderer {
  private container: HTMLElement;
  private onCardClick: (item: FestivalItem) => void;
  private loadingElement: HTMLElement | null = null; // 🍀 아영 추가
  private loadingTimeout: number | null = null; // 🍀 아영 추가

  constructor(containerId: string, onCardClick: (item: FestivalItem) => void) {
    const element = document.getElementById(containerId);
    if (!element) {
      throw new Error(`Element with ID ${containerId} not found`);
    }
    this.container = element;
    this.onCardClick = onCardClick;
  }

  // 날짜 포맷 변환 함수 추가: YYYYMMDD -> YYYY.MM.DD
  private formatDate(dateString: string): string {
    if (!dateString || dateString.length !== 8) return dateString;

    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);

    return `${year}.${month}.${day}`;
  }

  //  🍀 아영 추가 로딩 인디케이터 표시
  public showLoading(): void {
    if (this.loadingElement) return;

    this.loadingElement = document.createElement("div");
    this.loadingElement.className =
      "loading-overlay fixed top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-10";

    this.loadingElement.innerHTML = `
      <div class="loading-content bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div class="spinner mb-3">
          <div class="w-12 h-12 border-4 border-gray-300 border-t-[#ff515d] rounded-full animate-spin"></div>
        </div>
        <p class="text-gray-800 font-medium">축제 정보를 불러오고 있습니다.</p>
      </div>
    `;

    document.body.appendChild(this.loadingElement);
  }

  // 🍀 아영 추가 로딩 인디케이터 제거
  public hideLoading(): void {
    if (this.loadingElement && this.loadingElement.parentNode) {
      this.loadingElement.parentNode.removeChild(this.loadingElement);
      this.loadingElement = null;
    }

    if (this.loadingTimeout !== null) {
      window.clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
  }

  // 축제 목록 렌더링
  renderFestivals(items: FestivalItem[], append: boolean = false): void {
    //  🍀 아영 추가로딩 타이머 설정 (0.5초 후에 로딩 표시)
    this.loadingTimeout = window.setTimeout(() => {
      this.showLoading();
    }, 500);

    // 기존 내용 삭제 (append가 아닐 경우)
    if (!append) {
      this.container.innerHTML = "";
    }

    //  🍀 아영 추가 비동기로 렌더링 처리 (브라우저가 UI를 업데이트할 기회 제공)
    setTimeout(() => {
      if (items.length === 0 && !append) {
        this.container.innerHTML =
          "<p>📭 해당 조건에 맞는 축제가 없습니다.</p>";
        this.hideLoading();
        return;
      }

      items.forEach((item) => {
        const card = document.createElement("div");
        card.className = "festivalCard";
        card.style.cursor = "pointer";

        const image = item.firstimage;
        const imageElement = image
          ? `<img src="${image}" alt="축제 이미지" class="w-full h-[200px] object-cover rounded-[1rem]" />`
          : `<div class="w-full h-[200px] bg-ga-gray300 flex items-center justify-center text-gray-600 text-sm rounded-[1rem]">
              이미지 없음
            </div>`;

        // 날짜 형식 변환 적용
        const startDate = this.formatDate(item.eventstartdate);
        const endDate = this.formatDate(item.eventenddate);

        card.innerHTML = `
          <div class="w-full flex flex-col relative rounded-[1rem] overflow-hidden shadow border border-ga-gray100 transform transition duration-300 ease-in-out hover:-translate-y-1">
            <button class="bookmark-btn absolute right-0 p-2 text-white">
              <svg
                width="24"
                height="23"
                viewBox="0 0 24 23"
                fill="none"
                aria-label="북마크한 축제만 보기"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.5127 2.12695C11.7933 1.26326 12.9567 1.20918 13.3477 1.96484L13.415 2.12695L14.7686 6.29199C15.1701 7.52795 16.3216 8.36509 17.6211 8.36523H22.001C22.9696 8.36527 23.3723 9.60436 22.5889 10.1738L19.0459 12.748C18.0602 13.4642 17.612 14.6992 17.8906 15.8691L17.9561 16.1025L19.3096 20.2676C19.6087 21.1888 18.5542 21.9548 17.7705 21.3857L14.2275 18.8115C13.1761 18.0476 11.7517 18.0476 10.7002 18.8115L7.15723 21.3857C6.37357 21.9548 5.31899 21.1887 5.61816 20.2676L6.97168 16.1025C7.3733 14.8665 6.9333 13.512 5.88184 12.748L2.33887 10.1738C1.55547 9.60436 1.95816 8.36527 2.92676 8.36523H7.30664C8.60618 8.36509 9.75759 7.52795 10.1592 6.29199L11.5127 2.12695Z"
                  stroke="#fde3b3"
                  stroke-width="1.5"
                />
              </svg>
            </button>
            ${imageElement}
            <div class="p-3">
              <h3 class="font-bold text-[1rem] text-black truncate whitespace-nowrap overflow-hidden text-ellipsis">${
                item.title
              }</h3>
              <p class="text-gray-500 text-xs md:text-base truncate whitespace-nowrap overflow-hidden text-ellipsis">📍 ${
                item.addr1 || "지역 정보 없음"
              }</p>
              <p class="text-gray-500 text-xs md:text-base truncate whitespace-nowrap overflow-hidden text-ellipsis">🗓️ ${startDate} ~ ${endDate}</p>
            </div>
          </div>
        `;

        // 카드 클릭 이벤트
        card.addEventListener("click", (e) => {
          const target = e.target as HTMLElement;
          if (target.closest(".bookmark-btn")) return;
          this.onCardClick(item);
        });

        this.container.appendChild(card);
      });

      // 🍀 아영 추가 렌더링 완료 후 로딩 표시 제거
      this.hideLoading();
    }, 0);
  }

  // 오류 표시
  showError(message: string): void {
    this.hideLoading(); // 🍀 아영 추가
    this.container.innerHTML = `<p class="text-red-500 text-center py-4">${message}</p>`;
  }
}
