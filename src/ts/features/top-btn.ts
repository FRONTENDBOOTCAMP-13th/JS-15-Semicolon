function topBtn() {
  let topBtn = document.querySelector(".top-btn") as HTMLElement | null;
  if (!topBtn) {
    return;
  }

  window.addEventListener("scroll", function () {
    if (this.scrollY > 20) {
      topBtn.classList.remove("opacity-0", "pointer-events-none");
    } else {
      topBtn.classList.add("opacity-0", "pointer-events-none");
    }
  });

  topBtn.addEventListener("click", (e) => {
    e.preventDefault();

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
topBtn();
