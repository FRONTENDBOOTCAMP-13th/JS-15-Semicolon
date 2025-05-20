import "/src/style.css";
import Swiper from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Navigation, Pagination, Autoplay } from "swiper/modules";

// 이미지 경로 배열 : 원하는 이미지 경로 추가하면 slide 추가 됨
const imageList: string[] = [
  "../assets/img/hero-carousel-image1.webp",
  "../assets/img/hero-carousel-image2.webp",
  "../assets/img/hero-carousel-image3.webp",
  "../assets/img/hero-carousel-image4.webp",
  "../assets/img/hero-carousel-image5.webp",
  "../assets/img/hero-carousel-image6.webp",
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
  imageList.forEach((src, i) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide relative";

    const img = document.createElement("img");
    img.src = src;
    img.alt = `여기갈래 히어로 이미지${i + 1}`;
    img.className = "w-full h-full object-cover object-center";

    const filter = document.createElement("div");
    filter.className = "absolute inset-0 bg-black/40";

    const text = document.createElement("div");
    text.className =
      "absolute inset-0 flex flex-col justify-end text-2xl text-white p-6 font-bold z-10 lg:items-start md:justify-start md:px-28 md:pt-16 md:text-5xl xl:px-40 xl:pt-24 xl:text-6xl";

    text.innerHTML = `<p>축제 정보를 한곳에서,</p><p>여기갈래</p>`;

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
