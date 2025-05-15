document.addEventListener("DOMContentLoaded", () => {
  const festivalDetail = document.getElementById("festivalDetail");

  interface Festival {
    title?: string;
    firstimage?: string;
    addr1?: string;
    addr2?: string;
    eventstartdate?: string;
    eventenddate?: string;
    overview?: string;
    tel?: string;
    homepage?: string;
  }

  const rawData = localStorage.getItem("selectedFestival");

  if (!rawData || !festivalDetail) {
    festivalDetail!.innerHTML = `
      <div class="info-box text-center">
        <h2 class="text-xl font-bold text-red-500">😥 축제 정보를 찾을 수 없습니다</h2>
        <p class="mt-2">목록으로 돌아가서 다시 시도해주세요.</p>
      </div>
    `;
    return;
  }

  const selectedFestival: Festival = JSON.parse(rawData);
  console.log("rawData:", rawData); // 추가

  // 날짜 형식 변환 함수
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "";
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}년 ${month}월 ${day}일`;
  };

  const image =
    selectedFestival.firstimage ||
    "https://via.placeholder.com/800x400?text=축제+이미지가+없습니다";

  // 축제 상세 정보 표시
  festivalDetail.innerHTML = `
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-center my-4">${selectedFestival.title || "제목 없음"}</h1>
      <img src="${image}" alt="${selectedFestival.title}" class="festival-image">
    </div>

    <div class="info-box">
      <h2 class="text-xl font-bold mb-2">🗓️ 축제 기간</h2>
      <p>${formatDate(selectedFestival.eventstartdate)} ~ ${formatDate(selectedFestival.eventenddate)}</p>
    </div>

    <div class="info-box">
      <h2 class="text-xl font-bold mb-2">📍 축제 장소</h2>
      <p>${selectedFestival.addr1 || "장소 정보가 없습니다"}</p>
      ${
        selectedFestival.addr2
          ? `<p class="text-sm text-gray-500 mt-1">${selectedFestival.addr2}</p>`
          : ""
      }
    </div>

    <div class="info-box">
      <h2 class="text-xl font-bold mb-2">📝 축제 정보</h2>
      <p>${selectedFestival.overview || "상세 정보가 없습니다"}</p>
    </div>

    ${
      selectedFestival.tel
        ? `
    <div class="info-box">
      <h2 class="text-xl font-bold mb-2">📞 문의처</h2>
      <p>${selectedFestival.tel}</p>
    </div>
    `
        : ""
    }
  `;

  document.title = `${selectedFestival.title || "축제 정보"} - 상세 정보`;
});
