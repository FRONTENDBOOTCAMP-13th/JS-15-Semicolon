// 축제 검색 및 필터링
import "./style.css";
import { FestivalFilter, FilterOptions } from "./ts/features/filter";
import { FestivalApi, FestivalItem } from "./ts/api/festivalApi";
import { FestivalRenderer } from "./ts/render/festivalRenderer";
import {
  getBookmarkFilterStatus,
  setBookmarkFilterStatus,
  getBookmarks,
  updateFilterButtonUI,
  bindBookmarkButtonEvents,
  applyBookmarkFills,
} from "./ts/features/bookmark";

// 환경 변수 로드
const API_KEY = import.meta.env.VITE_TOUR_API_KEY;
const BASE_URL =
  "https://apis.data.go.kr/api/B551011/KorService2/searchFestival2";

// 상태 변수
let currentPage = 1;
let isFetching = false;

// API 클래스 인스턴스 생성
const festivalApi = new FestivalApi(API_KEY, BASE_URL);

// 축제 카드 클릭 핸들러
const handleCardClick = (item: FestivalItem) => {
  localStorage.setItem("selectedFestival", JSON.stringify(item));
  window.location.href = "/src/components/detail.html";
};

// 렌더러 인스턴스 생성
const festivalRenderer = new FestivalRenderer("festivalList", handleCardClick);

// 필터 상태에 따라 렌더링하는 함수 추가
function renderFilteredFestivals() {
  const allData: FestivalItem[] = JSON.parse(
    localStorage.getItem("searchResults") || "[]"
  );
  const isFiltered = getBookmarkFilterStatus();

  const filtered = isFiltered
    ? allData.filter((item) =>
        getBookmarks().some((b) => b.contentid === item.contentid)
      )
    : allData;

  festivalRenderer.renderFestivals(filtered, false, () => {
    applyBookmarkFills();
    bindBookmarkButtonEvents();
  });
}

// 필터 변경 핸들러
const handleFilterChange = async (filters: FilterOptions) => {
  try {
    currentPage = 1;
    festivalRenderer.showLoading();

    const items = await festivalApi.searchFestivals(filters, currentPage);

    festivalRenderer.hideLoading();

    // 검색 결과 저장
    localStorage.setItem("searchResults", JSON.stringify(items));
    renderFilteredFestivals();
  } catch (error) {
    console.error("검색 중 오류 발생:", error);
    festivalRenderer.hideLoading();
    festivalRenderer.showError("데이터를 불러오는 데 실패했습니다.");
  }
};

// 필터 인스턴스 생성
const festivalFilter = new FestivalFilter({
  onFilterChange: handleFilterChange,
});

// 더 많은 축제 불러오기
async function fetchMoreFestivals() {
  if (isFetching || getBookmarkFilterStatus()) return;

  isFetching = true;

  // 🍀 아영 추가: 로딩 타이머 설정 (0.5초 후에 로딩 표시)
  const loadingTimeout = setTimeout(() => {
    festivalRenderer.showLoading();
  }, 500);

  currentPage++;

  try {
    const filters = festivalFilter.getFilters();
    const items = await festivalApi.searchFestivals(filters, currentPage);

    // 검색 결과 저장
    const beforeItems = JSON.parse(
      localStorage.getItem("searchResults") || "[]"
    );
    localStorage.setItem(
      "searchResults",
      JSON.stringify(beforeItems.concat(items))
    );

    // 콜백 추가해서 북마크 반영 및 버튼 이벤트 바인딩
    festivalRenderer.renderFestivals(items, true, () => {
      applyBookmarkFills();
      bindBookmarkButtonEvents();
    });
  } catch (error) {
    console.error("무한 스크롤 중 오류 발생:", error);
  } finally {
    clearTimeout(loadingTimeout); //🍀 아영 추가
    festivalRenderer.hideLoading(); // 🍀 아영 추가
    isFetching = false;
  }
}

// 무한 스크롤 이벤트 리스너
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const bodyHeight = document.body.offsetHeight;

  if (scrollTop + windowHeight >= bodyHeight - 100 && !isFetching) {
    fetchMoreFestivals();
  }
});

// 북마크 필터 버튼 이벤트
const renderBookmarksBtn = document.querySelector(".render-bookmarks");

renderBookmarksBtn?.addEventListener("click", () => {
  const loginStatus = localStorage.getItem("loggedInUser");
  if (loginStatus === null) {
    alert("로그인 사용자에게만 제공하는 기능입니다.");
  } else {
    const newState = !getBookmarkFilterStatus();
    setBookmarkFilterStatus(newState);
    updateFilterButtonUI(renderBookmarksBtn, newState);

    renderFilteredFestivals();
  }
});

// 리셋 버튼 이벤트 추가
const resetBtn = document.querySelector(".reset-btn");

resetBtn?.addEventListener("click", () => {
  setBookmarkFilterStatus(false);
  updateFilterButtonUI(renderBookmarksBtn!, false);
  renderFilteredFestivals();
});

// 초기 로딩
document.addEventListener("DOMContentLoaded", async () => {
  // 🍀 아영 추가: 로딩 타이머 설정 (0.5초 후에 로딩 표시)
  const loadingTimeout = setTimeout(() => {
    festivalRenderer.showLoading();
  }, 500);

  try {
    let items: FestivalItem[] = [];

    const savedResults = localStorage.getItem("searchResults");

    if (savedResults) {
      // 저장된 검색 결과가 있으면 파싱
      items = JSON.parse(savedResults);
    } else {
      // 오늘 날짜 기준 축제 가져오기
      items = await festivalApi.getTodayFestivals();
    }

    // 무조건 최신 데이터로 저장 (초기화면 동기화 보장)
    localStorage.setItem("searchResults", JSON.stringify(items));

    // 북마크 필터 상태에 따라 렌더링 (최종 단계)
    renderFilteredFestivals();
  } catch (error) {
    console.error("초기 로딩 중 오류 발생:", error);
    festivalRenderer.showError("초기 데이터를 불러오지 못했습니다.");
  } finally {
    clearTimeout(loadingTimeout);
    festivalRenderer.hideLoading();
  }
});
