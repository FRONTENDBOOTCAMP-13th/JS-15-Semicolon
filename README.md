###### Likelion Front-end Bootcamp

# 축제 정보 공유 서비스앱, 여기갈래? 
> https://likelion-develop.netlify.app/

![004](https://github.com/user-attachments/assets/8cacb012-e2fe-46c3-b182-ed72b477deea)

<br/>

## 🗨️ 프로젝트 소개
- 전국공연행사정보표준데이터를 활용해 사용자가 선택한 지역과 날짜를 기반으로 **맞춤형 지역 행사**를 추천해주는 서비스
- 카카오 API를 활용해 각 행사 상세 페이지에서 해당 지역의 **길찾기 기능**를 제공
- 기상청 API를 활용해 **7일간 날씨 정보**을 통해 사용자의 현위치에서 행사장까지의 경로를 안내

<br/>
  
## 🍀 팀원 소개

| 이훈진                                                                                    | 임지윤                                                                                    | 장아영                                                                                    |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| <img src="https://github.com/user-attachments/assets/223f97bd-be99-4eb2-a4b0-f37569172b0b" style="width: 580px"> | <img src="https://github.com/user-attachments/assets/262727e2-39d8-49fc-a4c2-a2a10742aceb" style="width: 595px"> | <img src="https://github.com/user-attachments/assets/6ddb5e91-8fc7-4e18-854d-7eabdad25a00" style="width: 540px"> |
| hunivers0523@naver.com                                                                       | parksw003@gmail.com                                                                       | fern3eh@gmail.com                                                                         |
| gnswls3945@gmail.com                                                            | wildcat0426@naver.com                                                          | https://github.com/cay0716                                                                |
| <img src="https://img.shields.io/badge/@huiivers-E4405F?style=flat-square&logo=Instagram&logoColor=white"/>                              |  <img src="https://img.shields.io/badge/@jlim_why -E4405F?style=flat-square&logo=Instagram&logoColor=white"/>                                                         |                             <img src="https://img.shields.io/badge/@fern3eh -E4405F?style=flat-square&logo=Instagram&logoColor=white"/> 
<br/>


## 📆 진행 일정

- **05.09 - 05.12**: 기획 및 프로젝트 셋업
- **05.13 - 05.16**: 페이지 마크업 및 API 연동
- **05.17 - 05.22**: 기능 구현 및 최종 디버깅, 배포

<br/>

## ✨ 기술 스택

| 카테고리             | 기술 스택                                                                                                                                                                             |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **개발 환경**        | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) |
| **UI / 스타일링**    | ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white) |
| **배포**             | ![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat&logo=netlify&logoColor=white)                                                                                       |
| **버전 관리**        | ![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white) ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)      |

<br/>



## 🍄 팀 역할 분배

| 이름     | 역할                         | 주요 기여 기능                                                                 |
|----------|------------------------------|--------------------------------------------------------------------------------|
| **이훈진** | 팀장 · 스크럼마스터             | 지역/날짜 기반 축제 필터링 및 렌더링, 상세 페이지 데이터 연결, 로그인/회원가입 구현, 뒤로가기 버튼 구현              |
| **임지윤** | 프론트엔드 개발                | 메인 히어로 섹션 구성, 행사 위치 기반 카카오맵 길찾기 기능, 행사 북마크 기능 구현       |
| **장아영** | 프론트엔드 개발               | 지역 기반 날씨 정보 제공, 헤더/푸터 UI 구성, 탑 버튼 구현, 렌더링 초기화 기능 구현         |


<br/>

## 🧶 프로젝트 구조

```
📦 project-root
├── 📂 src
│   ├── 📂 assets
│   │   ├── 📂 icon 
│   │   ├── 📂 img
│   │   ├── 📂 style
│   │   ├── 📂 ts
│   ├── 📂 components   
│   ├── 📂 pages  
│   ├── 📂 ts    
│   │   ├── 📂 api
│   │   ├── 📂 auth
│   │   ├── 📂 features
│   │   ├── 📂 render
├── ├── 📜 main.js
├── ├── 📜 main.ts
├── ├── 📜 style.css
├── 📜 .gitignore
├── 📜 eslint.config.js
├── 📜 index.html
├── 📜 netify.toml
├── 📜 package-lock.json
├── 📜 package.json
├── 📜 README.md
├── 📜 tsconfig.json
├── 📜 vite-env.d.ts
└── 📜 vite.config.js
```

<br/>

## MVP 유저 플로우차트
![진행 소개](https://github.com/user-attachments/assets/1a0ad62b-392f-4ae4-8215-a7e3d448db66)

<br/>

## 📷 프로젝트 이미지
### 메인 페이지
#### 1. 히어로 섹션
- 일정 시간 간격으로 이미지가 자동으로 전환
- 드래그로 직접 이미지 넘기는 기능

<img src="https://github.com/user-attachments/assets/9682e457-625e-4400-a832-684839a3f2f1"  style="width: 580px;">

#### 2. 무한 스크롤
- 스크롤이 하단에 도달하면 카드가 동적으로 렌더링되며, 렌더링 개수를 제어하여 성능을 고려
- 상단으로 이동할 수 있는 ‘Top’ 버튼을 제공
  
<img src="https://github.com/user-attachments/assets/cdd47d6f-995a-434d-b539-7e06e3460db4"  style="width: 580px;">


#### 3. 날짜/지역 필터링
- 사용자가 입력한 날짜와 지역값에 해당하는 축제 카드만 필터링하여 렌더링
  
<img src="https://github.com/user-attachments/assets/054c3646-00ce-4c03-b3d9-d5a905b32b53" style="width: 580px">


#### 4. 필터링/렌더링 초기화
- form에 입력된 값과 렌더링된 상태를 초기화
<img src="https://github.com/user-attachments/assets/cf2adc6b-a1e3-4e84-b51e-b6be69155dca" style="width: 580px">


<br/>

### 상세 페이지
- 선택한 지역 축제의 행사명, 기간, 장소, 문의처 등의 상세 정보 제공
- 축제 장소를 기준으로 일주일간의 날씨 예보를 제공

<img src="https://github.com/user-attachments/assets/d9286c31-83a9-42a3-a338-444952711ce3" style="width: 580px">

- 현재 위치에서 축제 장소까지의 경로 안내 기능(길찾기 기능)
- 카카오맵으로 이동하여 출발지 변경 가능
- ‘돌아가기’ 버튼을 통해 쉽게 이전 페이지로 이동

<img src="https://github.com/user-attachments/assets/4719fcf4-7753-4f4f-8574-bdc21d8561e3" style="width: 580px">

<br/>

### 회원 관리 기능
- 로그인, 로그아웃, 회원가입 기능 구현
- 사용자 정보는 로컬 스토리지에 저장하여 인증 상태 유지
  
#### 로그인
<img src="https://github.com/user-attachments/assets/cb361097-5b80-4c9e-a8ae-dfaf8675951d" style="width: 580px">

#### 로그아웃
<img src="https://github.com/user-attachments/assets/a860adcb-39de-4c33-b8cf-fca2e522b46a" style="width: 580px">

#### 회원가입
1. 이메일 입력 
<img src="https://github.com/user-attachments/assets/b8e763b8-ff69-46fe-aab4-92430ce2264f" style="width: 580px">

2. 이메일로 인증 번호가 전송되었다는 alert
<img src="https://github.com/user-attachments/assets/2a80c68e-c122-44be-9f7a-38fcd4b74fcc" style="width: 580px">

3. 메일로 온 인증번호를
<img src="https://github.com/user-attachments/assets/8cae7a52-9c74-4388-8a93-1d37e5de9c3c" style="width: 580px">

4. 일치하게 작성하고 확인 버튼을 누르면 인증에 성공했다는 alert
<img src="https://github.com/user-attachments/assets/bee75bb1-d8b8-4d73-8052-0db40586ea24" style="width: 580px">

5. 비밀번호 작성 후 회원가입 버튼 > 로그인 페이지로 리다이렉트
<img src="https://github.com/user-attachments/assets/dca9b037-b4dd-446a-b41a-666aceeb3f8b" style="width: 580px">

<br/>

### 반응형 디자인
![모바일](https://github.com/user-attachments/assets/f547ae5b-9fb1-44e3-9068-c306107d6b5b)
![데스크탑](https://github.com/user-attachments/assets/5430114e-c2a3-4490-b470-f42ac05b03d2)



<br/>

## 디벨롭 예정 작업 내용
- 페이지 넘길 때 값을 기억하는 방식으로 변경
- 상세API로 교체
- SNS 공유하기  추가
- 전국 축제 지도 추가
- 축제 안내 달력
- 백엔드 서버 구축

<br/>

## 🛠️ 설치 및 실행 방법

```bash
# 프로젝트 클론
git clone https://github.com/FRONTENDBOOTCAMP-13th/JS-15-Semicolon.git
```

```bash
# 프로젝트 폴더로 이동
cd your-repo
```

```bash
# 패키지 설치
npm install
```

```bash
# 개발 서버 실행
npm run dev
```

<br/>

## 🔗 사용 API
- [전국공연행사정보표준데이터](https://www.data.go.kr/data/15013106/standard.do)
- [카카오모빌리티](https://developers.kakaomobility.com/docs/navi-api/directions/)
- [카카오맵](https://apis.map.kakao.com/)
- [기상청단기예보조회](https://www.data.go.kr/data/15084084/openapi.do)
- [기상청중기예보조회](https://www.data.go.kr/data/15059468/openapi.do)

