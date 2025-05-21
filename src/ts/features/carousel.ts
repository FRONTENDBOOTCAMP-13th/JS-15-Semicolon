import "/src/style.css";
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import img1 from "/src/assets/img/hero-carousel-image1.webp";
import img2 from "/src/assets/img/hero-carousel-image2.webp";
import img3 from "/src/assets/img/hero-carousel-image3.webp";
import img4 from "/src/assets/img/hero-carousel-image4.webp";
import img5 from "/src/assets/img/hero-carousel-image5.webp";
import img6 from "/src/assets/img/hero-carousel-image6.webp";

import { Navigation, Pagination, Autoplay } from "swiper/modules";

// 이미지 경로 배열 : 원하는 이미지 경로 추가하면 slide 추가 됨
// const imageList: string[] = [img1, img2, img3, img4, img5, img6];
const slideData = [
  {
    src: img1,
    upperText: "축제 정보를 한곳에서,",
    lowerText: "여기갈래",
  },
  {
    src: img2,
    upperText: "다양한 행사 정보를",
    lowerText: "쉽게 확인하세요",
  },
  {
    src: img3,
    upperText: "가볼 만한 곳을 찾는다면?",
    lowerText: "여기갈래가 정답!",
  },
  {
    src: img4,
    upperText: "지금 뜨는 축제부터",
    lowerText: "놓치지 마세요",
  },
  {
    src: img5,
    upperText: "축제 정보, 날씨, 길찾기",
    lowerText: "한 눈에 스마트하게 즐기기",
  },
  {
    src: img6,
    upperText: "봄에는 어디?",
    lowerText: "여기 갈래!",
  },
];

// DOM 로드된 이후에 실행
document.addEventListener("DOMContentLoaded", () => {
  // 객체들을 모두 추가시킬 부모요소 : swiper-wrapper
  const wrapper = document.getElementById("swiper-wrapper");
  if (!wrapper) {
    console.error("swiper-wrapper 엘리먼트를 찾을 수 없습니다.");
    return;
  }

  // 상단에 정의한 이미지 경로 배열을 담은 슬라이드 객체 세트 생성 후 wrapper에 추가
  slideData.forEach((slideInfo, i) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide relative";

    const img = document.createElement("img");
    img.src = slideInfo.src;
    img.alt = `여기갈래 히어로 이미지${i + 1}`;
    img.className = "w-full h-full object-cover object-center";

    const filter = document.createElement("div");
    filter.className = "absolute inset-0 bg-black/40";

    // const text = document.createElement("div");
    // text.className =
    //   "absolute inset-0 flex flex-col justify-end text-2xl text-white p-6 font-bold z-10 lg:items-start md:justify-start md:px-28 md:pt-16 md:text-5xl xl:px-40 xl:pt-24 xl:text-6xl";

    const positionMap = [
      "justify-end items-start", // 좌하
      "justify-start items-end", // 우상
      "justify-start items-start", // 좌상
      "justify-end items-end", // 우하
    ];
    const positionClass = positionMap[i % positionMap.length];

    const text = document.createElement("div");
    text.className =
      `absolute inset-0 flex flex-col text-2xl text-white p-6 font-bold z-10 
   md:text-5xl xl:text-6xl md:px-28 md:pt-16 xl:px-40 xl:pt-24 leading-snug ` +
      positionClass;

    text.innerHTML = `<p>${slideInfo.upperText}</p><p>${slideInfo.lowerText}</p>`;

    slide.appendChild(img);
    slide.appendChild(filter);
    slide.appendChild(text);

    wrapper.appendChild(slide);
  });

  const heroSwiper = new Swiper(".swiper", {
    modules: [Navigation, Pagination, Autoplay],
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    // navigation: {
    //   nextEl: ".swiper-button-next",
    //   prevEl: ".swiper-button-prev",
    // },
  });
});
