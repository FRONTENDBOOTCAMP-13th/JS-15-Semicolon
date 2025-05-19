function bookmark() {
  const renderBookmarksBtn = document.querySelector(".render-bookmarks"); // 즐겨찾기 모아보는 버튼
  const addBookmarkBtn = document.querySelectorAll(".bookmark-btn"); // 즐겨찾기 추가 버튼
  const cards = document.querySelectorAll("#festivalList > div");
  let isFiltered = false; // 즐겨찾기 필터링 (초기값 false)

  // 별 버튼 클릭 시 토글
  addBookmarkBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      let card = btn.parentNode as HTMLElement; // 혹은 btn.closet("div");
      let svg = btn.querySelector("svg");

      if (!svg) return;
      if (!card) return;

      let isBookmarked = card.getAttribute("data-starred") === "true";

      if (isBookmarked) {
        // 별 해제
        svg.setAttribute("fill", "none"); // 기본 색으로 (필요에 따라 변경)
        card.setAttribute("data-starred", "false");
      } else {
        // 별 표시
        svg.setAttribute("fill", "white"); // 별 표시 색
        card.setAttribute("data-starred", "true");
      }
    });
  });

  // 필터 버튼 클릭 시 토글
  renderBookmarksBtn?.addEventListener("click", () => {
    isFiltered = !isFiltered;

    cards.forEach((card) => {
      const isBookmarked = card.getAttribute("data-starred") === "true";
      const cardE = card as HTMLElement;

      if (isFiltered) {
        // 별표된 카드만 보이기
        cardE.style.display = isBookmarked ? "block" : "none";
      } else {
        // 전체 카드 보이기
        cardE.style.display = "block";
      }
    });
  });
}
bookmark();
