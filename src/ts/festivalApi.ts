import "../style.css";

const API_KEY = import.meta.env.VITE_TOUR_API_KEY;
const BASE_URL = "/api/B551011/KorService2/searchFestival2";

const form = document.getElementById("filterForm");
// TODO : 임시로 as HTMLSelectElement 세팅
const locationFilter = document.getElementById(
  "locationFilter"
) as HTMLSelectElement;
// TODO : 임시로 as HTMLInputElement 세팅
const startDateInput = document.getElementById("startDate") as HTMLInputElement;
const endDateInput = document.getElementById("endDate") as HTMLInputElement;
const festivalList = document.getElementById("festivalList")!;

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const areaCode = locationFilter.value;
  const startDate = startDateInput.value.replace(/-/g, "");
  const endDate = endDateInput.value.replace(/-/g, "");

  const query = [
    `serviceKey=${API_KEY}`,
    "MobileApp=AppTest",
    "MobileOS=ETC",
    "_type=json",
    "numOfRows=30",
    "pageNo=1",
    "arrange=A",
    startDate && `eventStartDate=${startDate}`,
    endDate && `eventEndDate=${endDate}`,
    areaCode && `areaCode=${areaCode}`,
  ]
    .filter(Boolean)
    .join("&");

  const url = `${BASE_URL}?${query}`;

  try {
    const res = await fetch(url);
    const json = await res.json();
    const items = json.response?.body?.items?.item || [];

    renderFestivalList(items);
  } catch (err) {
    console.error("❌ API 에러:", err);
    festivalList.innerHTML = `<p style="color:red;">데이터를 불러오는 데 실패했습니다.</p>`;
  }
});

function renderFestivalList(items: any[]) {
  festivalList.innerHTML = "";

  if (items.length === 0) {
    festivalList.innerHTML = "<p>📭 해당 조건에 맞는 축제가 없습니다.</p>";
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "festivalCard";
    const image =
      item.firstimage || "https://via.placeholder.com/300x200?text=No+Image";
    card.innerHTML = `
      <div class="w-full flex flex-col bg-white rounded-[1rem] overflow-hidden shadow border border-gray-300">
        <img src="${image}" alt="축제 이미지" class="w-full h-[200px] object-cover rounded-[1rem]" />
        <div class="p-3">
          <h3 class="font-bold text-[1rem] text-black truncate whitespace-nowrap overflow-hidden text-ellipsis">${item.title}</h3>
          <p class="text-gray-500 text-sm truncate whitespace-nowrap overflow-hidden text-ellipsis">📍 ${item.addr1 || "지역 정보 없음"}</p>
          <p class="text-gray-500 text-sm truncate whitespace-nowrap overflow-hidden text-ellipsis">🗓️ ${item.eventstartdate} ~ ${item.eventenddate}</p>
        </div>
      </div>
    `;
    festivalList.appendChild(card);
  });
}
