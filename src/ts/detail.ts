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

  let imageHTML = "";

  if (selectedFestival.firstimage) {
    imageHTML = `<img src="${selectedFestival.firstimage}" alt="${selectedFestival.title}" class="mx-auto rounded-[0.625rem]" />`;
  } else {
    imageHTML = `<div class="mx-auto w-full h-[400px] bg-ga-gray300 flex items-center justify-center rounded-[0.625rem] text-ga-gray300 text-lg">
    축제 이미지가 없습니다
  </div>`;
  }
  // 축제 상세 정보 표시
  console.log("렌더 시작");
  festivalDetail.innerHTML = `
  <div class="max-w-[58.5rem] mx-auto px-4">
    ${imageHTML}
    <div class="space-y-4 text-left">
      <h1 class="text-3xl font-bold my-4">${selectedFestival.title || "제목 없음"}</h1>
      <div>
        <h2 class="text-xl font-bold mb-2">🗓️ 축제 기간</h2>
        <p>${formatDate(selectedFestival.eventstartdate)} ~ ${formatDate(selectedFestival.eventenddate)}</p>
      </div>
      <div>
        <h2 class="text-xl font-bold mb-2">📍 축제 장소</h2>
        <p>${selectedFestival.addr1 || "장소 정보가 없습니다"}</p>
        ${
          selectedFestival.addr2
            ? `<p class="text-sm text-gray-500 mt-1">${selectedFestival.addr2}</p>`
            : ""
        }
      </div>

      ${
        selectedFestival.tel
          ? `
      <div>
        <h2 class="text-xl font-bold mb-2">📞 문의처</h2>
        <p>${selectedFestival.tel}</p>
      </div>
      `
          : ""
      }
    </div>
  </div>
`;
  document.title = `${selectedFestival.title || "축제 정보"} - 상세 정보`;
});
