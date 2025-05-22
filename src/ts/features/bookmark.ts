import { FestivalItem } from "../api/festivalApi";

// 로컬 스토리지에 저장할 키값 정의
const LOCAL_KEY = "bookmarkedFestivals";
const ID_KEY = "bookmarkedIds";

let isFiltered = false; // 현재 필터링 상태 저장 (true: 북마크된 것만 표시)

// 외부에서 필터링 여부 확인할 수 있는 함수
export function getBookmarkFilterStatus(): boolean {
  return isFiltered;
}
// 외부에서 필터링 여부 변경할 수 있는 함수
export function setBookmarkFilterStatus(value: boolean) {
  isFiltered = value;
}

// 로컬스토리지에서 현재 북마크된 FestivalItem 배열 가져오는 함수
export function getBookmarks(): FestivalItem[] {
  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? JSON.parse(raw) : [];
}

// 북마크한 FestivalItem 배열을 로컬스토리지에 저장하는 함수
function setBookmarks(festivals: FestivalItem[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(festivals));

  const ids = festivals.map((f) => f.contentid);
  localStorage.setItem(ID_KEY, JSON.stringify(ids));
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

// 북마크 아이콘 색상 업데이트 함수
export function updateBookmarkIcon(card: Element, isBookmarked: boolean) {
  const svg = card.querySelector(".bookmark-btn svg");
  if (!svg) return;
  svg.classList.toggle("text-yellow-400", isBookmarked);
  svg.classList.toggle("text-white", !isBookmarked);
}

// 북마크 버튼 클릭 이벤트를 각 버튼에 바인딩하는 함수
export function bindBookmarkButtonEvents() {
  // 이벤트가 아직 바인딩되지 않은 버튼만 선택
  const bookmarkBtns = document.querySelectorAll(
    ".bookmark-btn:not([data-event-bound])"
  );

  bookmarkBtns.forEach((btn) => {
    btn.setAttribute("data-event-bound", "true"); // 중복 방지를 위한 표시

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      const card = btn.closest(".festivalCard");
      const contentId = card?.getAttribute("data-contentid");
      if (!card || !contentId) return;

      const searchResults = JSON.parse(
        localStorage.getItem("searchResults") || "[]"
      );

      const item = searchResults.find(
        (f: FestivalItem) => f.contentid === contentId
      );
      if (!item) return;

      const nowBookmarked = toggleBookmark(item);
      updateBookmarkIcon(card, nowBookmarked);
    });
  });
}

// 페이지 로드 시 북마크된 카드 아이콘에 색상 반영하는 함수
export function applyBookmarkFills() {
  const bookmarks = getBookmarks();
  const cards = document.querySelectorAll(".festivalCard");

  cards.forEach((card) => {
    const contentId = card.getAttribute("data-contentid");
    const isBookmarked = contentId
      ? bookmarks.some((f) => f.contentid === contentId)
      : false;

    updateBookmarkIcon(card, isBookmarked);
  });
}

// 북마크 필터링 상태에 따라 카드 보이기/숨기기
// TODO : 필터링 따라 rendering 하는 걸로 바꿀수도
export function applyFilter() {
  const bookmarks = getBookmarks();
  const cards = document.querySelectorAll(".festivalCard");

  // bookmarkedFestivals
  cards.forEach((card) => {
    const contentId = card.getAttribute("data-contentid");
    const cardE = card as HTMLElement;

    cardE.style.display =
      !isFiltered ||
      (contentId && bookmarks.some((f) => f.contentid === contentId))
        ? "block"
        : "none";
  });

  //   renderFestivals(
  //   items: FestivalItem[],
  //   append: boolean = false,
  //   onRendered?: () => void
  // )  renderFestivals(
  //   items: FestivalItem[],
  //   append: boolean = false,
  //   onRendered?: () => void
  // )
}

// 완료 확인용 함수 TODO: 삭제할 수도 있음
export function getBookmarkCount() {
  return getBookmarks().length;
}

// 현재 화면에 보이는 북마크된 카드 수 계산 TODO: 삭제할 수도 있음
function countVisibleBookmarkedCards(): number {
  const cards = document.querySelectorAll(".festivalCard");
  const bookmarks = getBookmarks();

  return Array.from(cards).filter((card) => {
    const contentId = card.getAttribute("data-contentid");
    return contentId && bookmarks.some((f) => f.contentid === contentId);
  }).length;
}

// 화면에 보이는 카드 수랑 로컬 스토리지의 북마크 데이터 개수를 비교, 없으면 계속 카드 렌더링하게 하는 함수
// TODO : 바로 그리는 걸로 바꾸면 삭제할 수도 있음
export async function ensureAllBookmarksRendered(
  fetchMoreFn: () => Promise<boolean>, // fetch 후 더 가져온 데이터가 있으면 true
  maxAttempts = 10 // 무한 루프 방지를 위한 최대 반복 횟수 지정
) {
  if (!getBookmarkFilterStatus()) return;

  let attempts = 0;

  while (attempts < maxAttempts) {
    const currentCount = countVisibleBookmarkedCards(); // 현재 렌더링 된 북마크 수
    const totalCount = getBookmarkCount(); // 전체 북마크 수

    if (currentCount >= totalCount) break; // 렌더링 완료 시 종료

    const hasMore = await fetchMoreFn(); // 데이터 fetch 후 새 데이터 있는지 판단
    if (!hasMore) break; // 더 가져올 게 없으면 종료

    attempts++;
  }
}
// 북마크 필터 버튼 이벤트 연결
export function bookmark(fetchMoreFn: () => Promise<boolean>) {
  const renderBookmarksBtn = document.querySelector(".render-bookmarks");

  renderBookmarksBtn?.addEventListener("click", () => {
    setBookmarkFilterStatus(!getBookmarkFilterStatus());

    // 필터 버튼 색상 변경
    renderBookmarksBtn.classList.toggle("text-yellow-400", isFiltered);
    renderBookmarksBtn.classList.toggle("text-white", !isFiltered);

    // 현재 필터 적용
    applyFilter();

    // 북마크 카드가 전부 렌더링될 때까지 fetchMore 반복
    ensureAllBookmarksRendered(fetchMoreFn);
  });
}

// 필터 버튼 색상 변경하는 함수
export function updateFilterButtonUI(button: Element, isActive: boolean) {
  button.classList.toggle("text-yellow-400", isActive);
  button.classList.toggle("text-white", !isActive);
}

// // 북마크 기능 전체를 담은 함수
// export function bookmark() {

//   // 🍀 아영 추가 ======== 초기화 버튼 ===================
//   function resetBtnBookmark() {
//     const resetBtn = document.querySelector(".reset-btn");
//     resetBtn?.addEventListener("click", () => {
//       isFiltered = false; // 필터 상태 false로 초기화
//       changeFill(renderBookmarksBtn!, false); // 필터 버튼 색상 원래대로
//     });
//   }
//   resetBtnBookmark();
//   // 🍀 아영 추가 ======== 초기화 버튼 ===================

//   applyBookmarkFills();
// }
