window.addEventListener("DOMContentLoaded", () => {
  const API_KEY = import.meta.env.VITE_TOUR_API_KEY;
  const BASE_URL = "/api/B551011/KorService2/searchFestival2";

  const festivalList = document.querySelector(
    "#festivalList"
  ) as HTMLElement | null;
  if (!festivalList) {
    console.error("❌ festivalList 요소가 HTML에 없습니다.");
    return;
  }

  (async function fetchFestivalList() {
    const startDate = "20250401";
    const endDate = "20251231";

    const query = [
      `serviceKey=${API_KEY}`,
      "MobileApp=AppTest",
      "MobileOS=ETC",
      "_type=json",
      "numOfRows=10",
      "pageNo=1",
      "arrange=A",
      `eventStartDate=${startDate}`,
      `eventEndDate=${endDate}`,
    ].join("&");

    const url = `${BASE_URL}?${query}`;

    try {
      const res = await fetch(url);
      const json = await res.json();
      const items = json.response?.body?.items?.item || [];

      if (items.length === 0) {
        festivalList.innerHTML = "<p>🎉 해당 기간에 축제가 없습니다.</p>";
        return;
      }

      items.forEach((item: any) => {
        const card = document.createElement("div");
        card.className = "festuvalCaard";
        const image =
          item.firstimage ||
          "https://via.placeholder.com/300x200?text=No+Image";
        card.innerHTML = `  
        <div class="w-[18.75rem] h-[12.5rem] bg-itc-gray300 rounded-[1rem] overflow-hidden">
          <img src="${image}" alt="축제 이미지" width="300" height="200"/>
          <h3>${item.title}</h3>
          <p>${item.addr1 || "주소 없음"}</p>
          <p>🗓️ ${item.eventstartdate} ~ ${item.eventenddate}</p>
        </div>`;
        festivalList.appendChild(card);
      });
    } catch (err) {
      console.error("❌ API 에러:", err);
      festivalList.innerHTML = `<p style="color:red;">데이터를 불러오는 데 실패했습니다.</p>`;
    }
  })();
});
