import "/src/style.css";
import axios from "axios";

const script = document.createElement("script");
script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
  import.meta.env.VITE_KAKAO_MAP_API_KEY
}&autoload=false&libraries=services`;
script.defer = true;
document.head.appendChild(script);

script.onload = () => {
  window.kakao.maps.load(() => {
    initKakaoMap(); // 이 함수 안에 기존 초기화 코드 다 들어있으면 됨
  });
};

// ts용 파일 없는 카카오api 쓰기 위해 직접 전역(global) 타입 선언
declare global {
  interface Window {
    // Window에 kakao(any) 속성을 추가
    kakao: any;
  }

  const kakao: any;
}

export {}; // 빈 객체를 export 선언해서 모듈로 인식하게 함

// 위도(lat)와 경도(lng)를 나타내는 좌표 타입
interface Position {
  lat: number;
  lng: number;
}

// 전역 변수
let map: typeof window.kakao.maps.Map; // 지도 객체
const markers: (typeof window.kakao.maps.Marker)[] = []; // 마커 초기화를 위한 배열
const polylines: (typeof window.kakao.maps.Polyline)[] = []; // 폴리라인 초기화를 위한 배열

// DOM 요소
const myPosition = document.querySelector("#userPosition"); // 사용자 위치 좌표로 받아서 텍스트로 표시
const getRoutebtn = document.querySelector("#getRoute"); // 누르면 경로를 띄워주는 버튼
// (TODO_API로 받아온 축제 장소 주소 입력)
const changeOriginbtn = document.querySelector("#changeOrigin"); // 도착지 입력된 카카오 길찾기 새 창 띄워주는 버튼

// Kakao 지도 SDK 로딩 후 실행
window.kakao.maps.load(() => {
  initKakaoMap();
});

// 지도 초기화 및 이벤트 등록
function initKakaoMap() {
  // 지도에 위치 표시
  const container = document.getElementById("map") as HTMLElement; //지도를 담을 영역의 DOM 레퍼런스
  const position: Position = { lat: 37.571174, lng: 126.978899 }; // 초기 영역 (TODO_축제 장소로 변경 필요)
  const options = {
    center: new kakao.maps.LatLng(position.lat, position.lng),
    level: 3,
  };
  map = new kakao.maps.Map(container, options);
  showMarker(position); // 지도에 마커 표시

  // 버튼 이벤트 등록
  getRoutebtn?.addEventListener("click", getRoute);
  changeOriginbtn?.addEventListener("click", () => {
    // (TODO_축제 장소로 변경 필요)
    openKakaoMapDirectionsTo(
      "서울특별시 송파구 양재대로 932 가락몰 3층 하늘공원"
    );
  });

  // 초기 사용자 위치 표시
  getUserPosition().then((position) => {
    if (myPosition instanceof HTMLElement) {
      showPosition(position, myPosition);
    }
  });
}

// 사용자 위치 좌표 받아오는 함수
function getUserPosition(): Promise<Position> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (currentPosition) => {
        const position: Position = {
          lat: currentPosition.coords.latitude,
          lng: currentPosition.coords.longitude,
        };
        resolve(position); // 위치 resolve로 넘김 : 반환
      },
      (error) => {
        console.error("위치 가져오기 실패:", error);
        reject(error); // 실패한 경우 reject 처리
      },
      {
        enableHighAccuracy: true,
      }
    );
  });
}

// 입력된 좌표 정보를 지도에 표시하고, 주소로 변환하여 targetElement의 텍스트로 표시하는 함수
async function showPosition(position: Position, targetElement: HTMLElement) {
  panTo(position);
  showMarker(position);

  try {
    const address = await getAddressFromCoords(position);
    targetElement.textContent = address;
  } catch (err) {
    console.error("주소 가져오기 실패:", err);
    targetElement.textContent = "주소를 찾을 수 없습니다";
  }
}

// 좌표를 받아서 법정동 주소로 반환하는 함수
type AddressResult = {
  address?: { address_name: string };
  road_address?: { address_name: string };
};
function getAddressFromCoords(position: Position): Promise<string> {
  return new Promise((resolve, reject) => {
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.coord2Address(
      position.lng,
      position.lat,
      (result: AddressResult[], status: string) => {
        if (status === kakao.maps.services.Status.OK) {
          const address = result[0].address?.address_name;
          if (address) {
            resolve(address);
          } else {
            reject("주소 정보 없음");
          }
        } else {
          reject(`텍스트 주소 가져오기 실패: ${status}`);
        }
      }
    );
  });
}

// 주소를 받아서 좌표로 변환하는 함수 (TODO_축제 위치 받을 때 사용)
type CoordResult = {
  y?: number;
  x?: number;
};
function getCoordsFromAddress(address: string): Promise<Position> {
  return new Promise((resolve, reject) => {
    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result: CoordResult[], status: string) => {
      if (status === kakao.maps.services.Status.OK) {
        if (result.length > 0 && result[0].x && result[0].y) {
          const coords: Position = { lat: result[0].y, lng: result[0].x };

          if (coords) {
            resolve(coords);
          } else {
            reject("주소 정보 없음");
          }
        }
      } else {
        reject(`텍스트 주소 가져오기 실패: ${status}`);
      }
    });
  });
}

// 도착지 입력한 카카오 길찾기 새 창 띄워주는 함수
async function openKakaoMapDirectionsTo(address: string) {
  const coords = await getCoordsFromAddress(address); // 주소를 좌표로 변환해서 coords에 저장
  const url = `https://map.kakao.com/link/to/${address},${coords.lat},${coords.lng}`; // 이름,위도,경도 전달
  window.open(url, "_blank");
}

// 입력된 좌표로 지도 이동하는 함수
function panTo(position: Position) {
  const moveLatLng = new window.kakao.maps.LatLng(position.lat, position.lng);
  map.panTo(moveLatLng);
}

// 입력된 좌표 위치에 마커 표시하는 함수
function showMarker(position: Position) {
  const imageSrc =
    "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png"; // 빨강색 마커 사용
  const imageSize = new kakao.maps.Size(35, 40);
  const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

  const marker = new window.kakao.maps.Marker({
    position: new window.kakao.maps.LatLng(position.lat, position.lng),
    image: markerImage,
  });
  marker.setMap(map);
  markers.push(marker); // 배열에 저장
}

// 마커 초기화 함수
function clearMarkers() {
  markers.forEach((marker) => marker.setMap(null)); // 지도에서 제거
  markers.length = 0; // 배열 초기화
}

// 폴리라인 초기화 함수
function clearPolylines() {
  polylines.forEach((line) => line.setMap(null)); // 지도에서 제거
  polylines.length = 0;
}

// 길찾기 API 요청 함수
async function getRoute() {
  const REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const url = "https://apis-navi.kakaomobility.com/v1/directions";

  // 현재위치 찾는 함수
  const userPosition: Position = await getUserPosition();

  // 화면에 사용자 위치 주소 텍스트로 표시
  if (myPosition instanceof HTMLElement) {
    showPosition(userPosition, myPosition);
  }
  const origin = { lat: userPosition.lat, lng: userPosition.lng }; // 사용자 위치
  const destination = { lat: 37.508929, lng: 126.891217 }; // 산본이마트 : TODO_축제 위치로 수정

  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `KakaoAK ${REST_API_KEY}`,
      },
      params: {
        origin: `${origin.lng},${origin.lat}`,
        destination: `${destination.lng},${destination.lat}`,
        priority: "RECOMMEND",
      },
    });

    drawRouteOnMap(res.data);
  } catch (err) {
    console.error("길찾기 실패:", err);
  }
}

// 경로의 vertexes를 LatLng 배열로 변환하는 함수
function extractPolylineCoords(vertexes: number[]) {
  const coords = [];
  for (let i = 0; i < vertexes.length; i += 2) {
    const lng = vertexes[i];
    const lat = vertexes[i + 1];
    coords.push(new kakao.maps.LatLng(lat, lng));
  }
  return coords;
}

// 지도에 경로 및 마커 그리는 함수
function drawRouteOnMap(data: any) {
  // 기존 마커 및 폴리라인 제거
  clearMarkers();
  clearPolylines();

  const route = data.routes[0];
  const section = route.sections[0];

  // 출발지 마커
  const origin = route.summary.origin;
  const originPoint: Position = { lat: origin.y, lng: origin.x };
  showMarker(originPoint);

  // 도착지 마커
  const destination = route.summary.destination;
  const destinationPoint: Position = { lat: destination.y, lng: destination.x };
  showMarker(destinationPoint);

  // 경로 전체 영역 계산을 위한 bounds 객체 생성
  const bounds = new kakao.maps.LatLngBounds();
  bounds.extend(new kakao.maps.LatLng(origin.y, origin.x));
  bounds.extend(new kakao.maps.LatLng(destination.y, destination.x));

  // 지도 중심 이동(bounds로 변경)
  // map.setCenter(new kakao.maps.LatLng(origin.y, origin.x));

  // 각 road의 vertexes를 Polyline으로 그리기
  section.roads.forEach((road: any) => {
    const path = extractPolylineCoords(road.vertexes);

    // bounds 안에 모든 경로 좌표 포함시키기
    path.forEach((latlng) => bounds.extend(latlng));

    const polyline = new kakao.maps.Polyline({
      path,
      strokeWeight: 5,
      strokeColor: "#E6333F",
      strokeOpacity: 0.8,
      strokeStyle: "solid",
    });
    polyline.setMap(map);
  });
  // 계산된 bounds를 기반으로 지도 영역 조정
  map.setBounds(bounds);
}
