// festivalApi.ts
import { FilterOptions } from "../features/filter";

// 축제에 들어가는 인터페이스 정의
export interface FestivalItem {
  title: string; // 축제 이름
  addr1: string; // 주소
  eventstartdate: string;
  eventenddate: string;
  firstimage: string;
  contentid: string;
  [key: string]: any;
}

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

    const url = `${this.baseUrl}?${query}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data.response?.body?.items?.item || [];
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
      throw error;
    }
  }

  // 오늘 날짜 기준 축제 가져오기
  async getTodayFestivals(numOfRows: number = 20): Promise<FestivalItem[]> {
    const today = new Date();
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

    const url = `${this.baseUrl}?${query}`;

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
