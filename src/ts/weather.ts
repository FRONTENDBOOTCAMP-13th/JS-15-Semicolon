export function xScroll() {
  const scrollContainer = document.querySelector(
    ".weather-container-wrap"
  ) as HTMLElement;

  let isDown = false;
  let startX: number;
  let scrollLeft: number;

  // 마우스 이벤트
  scrollContainer?.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
  });

  scrollContainer?.addEventListener("mouseleave", () => {
    isDown = false;
  });

  scrollContainer?.addEventListener("mouseup", () => {
    isDown = false;
  });

  scrollContainer?.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainer.scrollLeft = scrollLeft - walk;
  });

  // 터치 이벤트
  scrollContainer.addEventListener("touchstart", (e: TouchEvent) => {
    isDown = true;
    startX = e.touches[0].pageX - scrollContainer.offsetLeft;
    scrollLeft = scrollContainer.scrollLeft;
  });

  scrollContainer.addEventListener("touchend", () => {
    isDown = false;
  });

  scrollContainer.addEventListener("touchmove", (e: TouchEvent) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - scrollContainer.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainer.scrollLeft = scrollLeft - walk;
  });
}
