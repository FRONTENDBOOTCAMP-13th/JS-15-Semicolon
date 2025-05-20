function topBtn() {
  let topBtn = document.querySelector(".top-btn") as HTMLElement | null;
  if (!topBtn) {
    return;
  }

  window.addEventListener("scroll", function () {
    if (this.scrollY > 20) {
      topBtn.style.display = "block";
    } else {
      topBtn.style.display = "none";
    }
  });

  topBtn.addEventListener("click", (e) => {
    e.preventDefault();

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
topBtn();
