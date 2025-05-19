function bookmark() {
  const renderBookmarksBtn = document.querySelector(".render-bookmarks");
  const addBookmarkBtn = document.querySelectorAll(".bookmark-btn");
  let isFiltered = false;
  let isBookmarked = false;

  addBookmarkBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      let starSvg = btn.querySelector("svg");

      isBookmarked = !isBookmarked;

      if (!starSvg) {
        return;
      }

      if (!isBookmarked) {
        starSvg.style.fill = "white";
      } else {
        starSvg.style.fill = "none";
      }
    });
  });

  renderBookmarksBtn?.addEventListener("click", () => {
    isFiltered = !isFiltered;

    if (isFiltered) {
    }
  });
}
bookmark();
