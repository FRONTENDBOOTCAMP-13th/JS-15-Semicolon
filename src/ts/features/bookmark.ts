import { FestivalItem } from "../api/festivalApi";

const LOCAL_KEY = "bookmarkedFestivals";

let isFiltered = false; // 현재 필터링 상태 저장 (true: 북마크된 것만 표시)

export function getBookmarkFilterStatus() {
  return isFiltered; // 외부에서 이걸 통해 접근 가능
}

// 로컬스토리지에서 현재 북마크된 FestivalItem 배열 가져오는 함수
function getBookmarks(): FestivalItem[] {
  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? JSON.parse(raw) : [];
}

// 북마크된 FestivalItem 배열을 로컬스토리지에 저장하는 함수
function setBookmarks(festivals: FestivalItem[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(festivals));
}

export function getBookmarkCount() {
  return getBookmarks().length;
}

// 축제 정보를 받아서 북마크 추가/제거 후 상태 반환
export function toggleBookmark(item: FestivalItem): boolean {
  const current = getBookmarks();
  const exists = current.some((f) => f.contentid === item.contentid);
  const updated = exists
    ? current.filter((f) => f.contentid !== item.contentid)
    : [...current, item];

  setBookmarks(updated);
  return !exists;
}

// 카드에 있는 북마크 버튼 클릭 이벤트 바인딩
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
      if (!card || !title) return;

      const searchResults = JSON.parse(
        localStorage.getItem("searchResults") || "[]"
      );
      const item = searchResults.find((f: FestivalItem) => f.title === title);
      if (!item) return;

      const svg = btn.querySelector("svg path");
      const nowBookmarked = toggleBookmark(item);

      // 아이콘 색상 변경
      svg?.setAttribute("fill", nowBookmarked ? "#F8C427" : "none");
    });
  });
}

// 페이지 로드 시 북마크된 카드 아이콘에 색상 반영하는 함수
export function applyBookmarkFills() {
  const bookmarks = getBookmarks();
  const cards = document.querySelectorAll(".festivalCard");

  cards.forEach((card) => {
    const contentId = card.getAttribute("data-contentid");
    const svg = card.querySelector(".bookmark-btn svg path");

    if (contentId && bookmarks.some((f) => f.contentid === contentId)) {
      svg?.setAttribute("fill", "#F8C427");
    } else {
      svg?.setAttribute("fill", "none");
    }
  });
}

// 북마크 필터링 상태에 따라 카드 보이기/숨기기
export function applyFilter() {
  const bookmarks = getBookmarks();
  const cards = document.querySelectorAll(".festivalCard");

  cards.forEach((card) => {
    const contentId = card.getAttribute("data-contentid");
    const cardE = card as HTMLElement;

    cardE.style.display =
      !isFiltered ||
      (contentId && bookmarks.some((f) => f.contentid === contentId))
        ? "block"
        : "none";
  });
}

// 현재 화면에 보이는 북마크된 카드 수 계산
function countVisibleBookmarkedCards(): number {
  const cards = document.querySelectorAll(".festivalCard");
  const bookmarks = getBookmarks();

  return Array.from(cards).filter((card) => {
    const contentId = card.getAttribute("data-contentid");
    return contentId && bookmarks.some((f) => f.contentid === contentId);
  }).length;
}

// 필터링된 북마크 카드가 전부 렌더링될 때까지 추가 로드
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

// 북마크 필터 버튼 이벤트 연결
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
