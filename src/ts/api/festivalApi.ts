// 검색 조건에 따라 축제 정보를 가져오는 파일

import { FilterOptions } from "../features/filter";

// 축제 정보에 대한 타입을 정의하는 인터페이스
export interface FestivalItem {
  title: string;
  addr1: string;
  eventstartdate: string;
  eventenddate: string;
  firstimage: string;
  contentid: string;
  [key: string]: any;
}

// 축제 API 호출 키
export class FestivalApi {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  // 축제 검색 API 호출
  async searchFestivals(
    filters: FilterOptions,
    page: number = 1,
    numOfRows: number = 20
  ): Promise<FestivalItem[]> {
    const { areaCode, startDate, endDate } = filters;

    const query = [
      `serviceKey=${this.apiKey}`,
      "MobileApp=AppTest",
      "MobileOS=ETC",
      "_type=json",
      `numOfRows=${numOfRows}`,
      `pageNo=${page}`,
      "arrange=A",
      startDate && `eventStartDate=${startDate}`,
      endDate && `eventEndDate=${endDate}`,
      areaCode && `areaCode=${areaCode}`,
    ]
      .filter(Boolean)
      .join("&");

    // const proxy = window.location.hostname === "localhost" ? "" : "/api";
    // const url = `${proxy}?${query}`;
    const proxy = window.location.hostname === "localhost" ? "" : "/api";
    const url = `${proxy}/B551011/KorService2/searchFestival2?${query}`;

    try {
      const response = await fetch(url); // 서버에 축제 정보 요청
      const data = await response.json(); // 응답 JSON 변환
      // 응답에서 축제 목록 추출, 없으면 빈 배열[]
      return data.response?.body?.items?.item || [];
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
      throw error;
    }
  }

  // 오늘 날짜 기준으로 축제 목록 가져오기
  async getTodayFestivals(numOfRows: number = 20): Promise<FestivalItem[]> {
    const today = new Date();
    // 서버에서 20250520 형식으로 날짜를 요구하여 형식 변환
    const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");

    const query = [
      `serviceKey=${this.apiKey}`,
      "MobileApp=AppTest",
      "MobileOS=ETC",
      "_type=json",
      `numOfRows=${numOfRows}`,
      "pageNo=1",
      "arrange=R", // 최신순
      `eventStartDate=${formattedDate}`,
    ].join("&");

    const proxy = window.location.hostname === "localhost" ? "" : "/api/";
    const url = `${proxy}?${query}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.response?.body?.items?.item || [];
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
      throw error;
    }
  }
}
