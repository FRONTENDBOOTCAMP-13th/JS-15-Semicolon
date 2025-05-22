// 축제 검색 및 필터링

import "./style.css";

// main.ts
import { FestivalFilter, FilterOptions } from "./ts/features/filter";
import { FestivalApi, FestivalItem } from "./ts/api/festivalApi";
import { FestivalRenderer } from "./ts/render/festivalRenderer";
import { bookmark, getBookmarkFilterStatus } from "./ts/features/bookmark";

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

// 필터 변경 핸들러
const handleFilterChange = async (filters: FilterOptions) => {
  try {
    currentPage = 1;
    festivalRenderer.showLoading();

    const items = await festivalApi.searchFestivals(filters, currentPage);

    festivalRenderer.hideLoading();
    festivalRenderer.renderFestivals(items);

    // 검색 결과 저장
    localStorage.setItem("searchResults", JSON.stringify(items));

    // 북마크 기능 초기화
    bookmark();
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
  if (isFetching || getBookmarkFilterStatus()) return; // ✅ 필터링 중이면 막기

  isFetching = true;

  // 🍀 아영 추가: 로딩 타이머 설정 (0.5초 후에 로딩 표시)
  const loadingTimeout = setTimeout(() => {
    festivalRenderer.showLoading();
  }, 500);

  currentPage++;

  try {
    const filters = festivalFilter.getFilters();
    const items = await festivalApi.searchFestivals(filters, currentPage);

    festivalRenderer.renderFestivals(items, true);
    bookmark();
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

// 초기 로딩
document.addEventListener("DOMContentLoaded", async () => {
  // 🍀 아영 추가: 로딩 타이머 설정 (0.5초 후에 로딩 표시)
  const loadingTimeout = setTimeout(() => {
    festivalRenderer.showLoading();
  }, 500);

  try {
    const savedResults = localStorage.getItem("searchResults");

    if (savedResults) {
      // 저장된 검색 결과가 있으면 렌더링
      const items = JSON.parse(savedResults);
      festivalRenderer.renderFestivals(items);
    } else {
      // 오늘 날짜 기준 축제 가져오기
      const items = await festivalApi.getTodayFestivals();
      festivalRenderer.renderFestivals(items);
    }

    // 북마크 기능 초기화
    bookmark();
  } catch (error) {
    console.error("초기 로딩 중 오류 발생:", error);
    festivalRenderer.showError("초기 데이터를 불러오지 못했습니다.");
  } finally {
    //🍀 아영 추가가
    clearTimeout(loadingTimeout);
    festivalRenderer.hideLoading();
  }
});
