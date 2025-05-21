let isFiltered = false; // 현재 필터링 상태 저장 (true: 북마크된 것만 표시)

export function getBookmarkFilterStatus() {
  return isFiltered; // ✅ 외부에서 이걸 통해 접근 가능
}

// 🍀아영 위치 변경 |요소와 색깔을 받아 요소 내부의 svg아이콘 fill 색깔 변경하는 함수
export function changeFill(button: Element, status: boolean) {
  if (status === true) {
    button.classList.replace("text-white", "text-yellow-400");
  } else {
    button.classList.replace("text-yellow-400", "text-white");
  }
}

// 북마크 기능 전체를 담은 함수
export function bookmark() {
  const LOCAL_KEY = "bookmarkedFestivalTitles";

  // 로컬스토리지에서 현재 북마크 되어있는 제목 배열 가져오는 함수
  function getBookmarks(): string[] {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  // 클릭한 축제 이름 배열을 받아서 로컬스토리지에 저장
  function setBookmarks(titles: string[]) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(titles));
  }

  // 축제 이름을 받아서 북마크 추가/제거 후 추가 시 true, 제거 시 false를 반환하는 함수
  function toggleBookmark(title: string): boolean {
    const current = getBookmarks();
    const exists = current.includes(title); // 로컬스토리지에 축제 이름이 있는 지 확인
    const updated = exists
      ? current.filter((t) => t !== title) // 제목이 같지 않은 것만 모은 배열 반환
      : [...current, title]; // 기존의 배열에 새로운 제목 추가
    setBookmarks(updated);
    return !exists;
  }

  const renderBookmarksBtn = document.querySelector(".render-bookmarks"); // 즐겨찾기 필터 버튼

  // 바인딩 전에 중복 리스너 방지를 위해 기존 북마크 버튼을 복제해서 이벤트 제거
  const bookmarkBtns = document.querySelectorAll(".bookmark-btn");
  bookmarkBtns.forEach((btn) => {
    btn.replaceWith(btn.cloneNode(true)); // 이벤트 리스너 초기화
  });

  // 복제된 북마크 버튼에 클릭 이벤트 다시 바인딩
  const newBookmarkBtns = document.querySelectorAll(".bookmark-btn");
  newBookmarkBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      const card = btn.closest(".festivalCard"); // 북마크 버튼의 부모 카드
      if (!card) return;

      const title = card.querySelector("h3")?.textContent?.trim(); // 카드 제목 추출
      if (!title) return;

      const svg = btn.querySelector("svg path");
      const nowBookmarked = toggleBookmark(title);

      // 아이콘 색상 변경
      svg?.setAttribute("fill", nowBookmarked ? "#F8C427" : "none");
    });
  });

  // 북마크 필터링 토글 버튼 (전체 보기/북마크만 보기)
  renderBookmarksBtn?.addEventListener("click", () => {
    isFiltered = !isFiltered;

    changeFill(renderBookmarksBtn, isFiltered); // 필터링 버튼 아이콘 색상 변경

    const cards = document.querySelectorAll("#festivalList > .festivalCard");
    const bookmarks = getBookmarks(); // 현재 북마크 목록 가져오기

    cards.forEach((card) => {
      const title = card.querySelector("h3")?.textContent?.trim();
      const cardE = card as HTMLElement;

      // 필터링 상태에 따라 카드 숨기기 or 보이기
      cardE.style.display =
        !isFiltered || (title && bookmarks.includes(title)) ? "block" : "none";
    });
  });

  // 페이지 로드 시 북마크된 카드 아이콘에 색상 반영하는 함수
  function applyBookmarkFills() {
    const bookmarks = getBookmarks();
    const cards = document.querySelectorAll(".festivalCard");

    cards.forEach((card) => {
      const title = card.querySelector("h3")?.textContent?.trim();
      const svg = card.querySelector(".bookmark-btn svg path");

      if (title && bookmarks.includes(title)) {
        svg?.setAttribute("fill", "#F8C427");
      } else {
        svg?.setAttribute("fill", "none");
      }
    });
  }

  applyBookmarkFills();
}
