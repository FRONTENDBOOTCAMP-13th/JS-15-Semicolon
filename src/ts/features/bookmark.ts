const LOCAL_KEY = "bookmarkedFestivalTitles";

let isFiltered = false; // 현재 필터링 상태 저장 (true: 북마크된 것만 표시)

export function getBookmarkFilterStatus() {
  return isFiltered; // 외부에서 이걸 통해 접근 가능
}
// 로컬스토리지에서 현재 북마크 되어있는 제목 배열 가져오는 함수
function getBookmarks(): string[] {
  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? JSON.parse(raw) : [];
}
// 클릭한 축제 이름 배열을 받아서 로컬스토리지에 저장
function setBookmarks(titles: string[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(titles));
}
export function getBookmarkCount() {
  return getBookmarks().length;
}
// 축제 이름을 받아서 북마크 추가/제거 후 추가 시 true, 제거 시 false를 반환하는 함수
export function toggleBookmark(title: string): boolean {
  const current = getBookmarks();
  const exists = current.includes(title); // 로컬스토리지에 축제 이름이 있는 지 확인
  const updated = exists
    ? current.filter((t) => t !== title)
    : [...current, title]; // 제목이 같지 않은 것만 모은 배열 반환, 기존의 배열에 새로운 제목 추가
  setBookmarks(updated);
  return !exists;
}

// 카드에 있는 북마크 버튼에 클릭 이벤트 넣는 부분
export function bindBookmarkButtons() {
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
      const title = card?.querySelector("h3")?.textContent?.trim(); // 카드 제목 추출
      const svg = btn.querySelector("svg path");

      if (!card || !title || !svg) return;

      const nowBookmarked = toggleBookmark(title);
      // 아이콘 색상 변경
      svg.setAttribute("fill", nowBookmarked ? "#F8C427" : "none");
    });
  });
}

// 페이지 로드 시 북마크된 카드 아이콘에 색상 반영하는 함수
export function applyBookmarkFills() {
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

export function applyFilter() {
  const bookmarks = getBookmarks(); // 현재 북마크 목록 가져오기
  const cards = document.querySelectorAll(".festivalCard");

  cards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent?.trim();
    const cardE = card as HTMLElement;

    // 필터링 상태에 따라 카드 숨기기 or 보이기
    cardE.style.display =
      !isFiltered || (title && bookmarks.includes(title)) ? "block" : "none";
  });
}

function countVisibleBookmarkedCards(): number {
  const cards = document.querySelectorAll(".festivalCard");
  const bookmarks = getBookmarks();

  return Array.from(cards).filter((card) => {
    const title = card.querySelector("h3")?.textContent?.trim();
    return title && bookmarks.includes(title);
  }).length;
}

export function ensureAllBookmarksRendered(fetchMoreFn: () => Promise<void>) {
  if (!getBookmarkFilterStatus()) return;

  const currentCount = countVisibleBookmarkedCards();
  const totalCount = getBookmarkCount();

  if (currentCount < totalCount) {
    fetchMoreFn().then(() => {
      setTimeout(() => ensureAllBookmarksRendered(fetchMoreFn), 300);
    });
  }
}

export function bookmark(fetchMoreFn: () => Promise<void>) {
  const renderBookmarksBtn = document.querySelector(".render-bookmarks");
  // 북마크 필터링 토글 버튼 (전체 보기/북마크만 보기)
  renderBookmarksBtn?.addEventListener("click", () => {
    isFiltered = !isFiltered;
    // 필터링 버튼 아이콘 색상 변경
    renderBookmarksBtn.classList.toggle("text-yellow-400", isFiltered);
    renderBookmarksBtn.classList.toggle("text-white", !isFiltered);

    applyFilter();
    ensureAllBookmarksRendered(fetchMoreFn);
  });
}
// // 🍀 아영 추가 ======== 초기화 버튼 ===================
// function resetBtnBookmark(BookmarksFilterBtn: HTMLElement) {
//   const resetBtn = document.querySelector(".reset-btn");
//   resetBtn?.addEventListener("click", () => {
//     isFiltered = false; // 필터 상태 false로 초기화
//     console.log("isFiltered false로");
//     // 필터 버튼 색상 원래대로
//     BookmarksFilterBtn.classList.toggle("text-white", true);
//     console.log("바껴");
//   });
// }
// resetBtnBookmark(document.querySelector(".render-bookmarks")!);
// // 🍀 아영 추가 ======== 초기화 버튼 ===================

// applyBookmarkFills();
