function bookmark() {
  const renderBookmarksBtn = document.querySelector(".render-bookmarks");
  const addBookmarkBtns = document.querySelectorAll(".bookmark-btn");
  const cards = document.querySelectorAll("#festivalList > div");
  let isFiltered = false;

  // ✅ 로컬스토리지에서 즐겨찾기 ID 리스트 가져오기
  let bookmarkedIds = JSON.parse(
    localStorage.getItem("bookmarkedFestivals") || "[]"
  );

  // ✅ 카드에 data-id 자동 부여
  cards.forEach((card, index) => {
    if (!card.getAttribute("data-id")) {
      card.setAttribute("data-id", `festival${index}`);
    }
  });

  // ✅ 초기 상태 반영 (로컬스토리지 기반으로 별 표시)
  cards.forEach((card) => {
    const id = card.getAttribute("data-id");
    const svg = card.querySelector(".bookmark-btn svg");

    if (!id || !svg) return;

    if (bookmarkedIds.includes(id)) {
      svg.setAttribute("fill", "white");
      card.setAttribute("data-starred", "true");
    } else {
      svg.setAttribute("fill", "none");
      card.setAttribute("data-starred", "false");
    }
  });

  // ✅ 즐겨찾기 버튼 클릭 시 토글
  addBookmarkBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest("div") as HTMLElement;
      const svg = btn.querySelector("svg");

      if (!card || !svg) return;

      const id = card.getAttribute("data-id");
      const isBookmarked = card.getAttribute("data-starred") === "true";

      if (!id) return;

      if (isBookmarked) {
        svg.setAttribute("fill", "none");
        card.setAttribute("data-starred", "false");
        bookmarkedIds = bookmarkedIds.filter(
          (savedId: string) => savedId !== id
        ); // 제거
      } else {
        svg.setAttribute("fill", "white");
        card.setAttribute("data-starred", "true");
        bookmarkedIds.push(id); // 추가
      }

      // ✅ 로컬스토리지에 저장
      localStorage.setItem(
        "bookmarkedFestivals",
        JSON.stringify(bookmarkedIds)
      );
    });
  });

  // ✅ 즐겨찾기 모아보기 버튼 클릭 시 필터링
  renderBookmarksBtn?.addEventListener("click", () => {
    isFiltered = !isFiltered;

    cards.forEach((card) => {
      const isBookmarked = card.getAttribute("data-starred") === "true";
      const cardEl = card as HTMLElement;

      cardEl.style.display = isFiltered
        ? isBookmarked
          ? "block"
          : "none"
        : "block";
    });
  });
}

bookmark();
