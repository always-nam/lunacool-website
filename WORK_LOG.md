# 루나쿨 홈페이지 작업 로그

## 사이트 정보
- **URL**: https://always-nam.github.io/lunacool-website/
- **저장소**: https://github.com/always-nam/lunacool-website
- **회사**: (주)테란 | 대표자: 남대현 | 사업자: 517-87-0057
- **고객센터**: 070-7717-5231 | 평일 09:00 ~ 18:00
- **주소**: 고양시 일산동구 은마길185번길 26
- **로컬 서버**: `python -m http.server 3000` (포트 3000)

---

## 파일 구조

```
루나쿨홈페이지제작/
├── index.html          메인 홈페이지
├── products.html       전체 상품 페이지
├── about.html          브랜드 소개 (인증서 포함)
├── reviews.html        구매후기
├── inquiry.html        상품문의 게시판
├── admin.html          관리자 페이지
├── detail-pad.html     냉감 패드 상세페이지
├── detail-blanket.html 냉감 차렵이불 상세페이지
├── detail-sofa.html    냉감 소파패드 상세페이지
├── detail-cushion.html 냉감 방석 상세페이지
├── detail-pillow.html  냉감 베개커버 상세페이지
├── style.css           전체 공통 스타일
├── script.js           공통 스크립트
├── inquiry-data.js     상품문의 기본 데이터 (87건)
├── reviews-data.js     후기 데이터
├── 루나쿨_상세이미지/  제품 상세 이미지 (분할이미지 각 10장)
│   ├── 루나쿨_냉감패드/분할이미지/
│   ├── 루나쿨_냉감이불/분할이미지/
│   ├── 루나쿨_냉감소파패드/분할이미지/
│   ├── 루나쿨_냉감방석/분할이미지/
│   └── 루나쿨_냉감배게커버/분할이미지/
├── 루나쿨 상품 이미지/ 상품 카드 이미지
├── 인증서/             PDF 인증서 6개
└── 루나쿨_로고/        로고 파일
```

---

## 현재 상품 목록 (products.html)

| 카테고리 | 상품명 | 상세페이지 |
|---|---|---|
| 냉감 패드 | 루나쿨 냉감 패드 퀸 | detail-pad.html |
| 냉감 패드 | 루나쿨 냉감 패드 싱글 | detail-pad.html |
| 냉감 차렵이불 | 루나쿨 냉감 차렵이불 퀸 | detail-blanket.html |
| 냉감 차렵이불 | 루나쿨 냉감 차렵이불 싱글 | detail-blanket.html |
| 냉감 소파패드 | 루나쿨 냉감 소파패드 (2인용) | detail-sofa.html |
| 냉감 소파패드 | 루나쿨 냉감 소파패드 라지 (4인용) | detail-sofa.html |
| 냉감 방석 | 루나쿨 냉감 방석 (아이보리) | detail-cushion.html |
| 냉감 방석 | 루나쿨 냉감 방석 2P 세트 | detail-cushion.html |
| 냉감 베개커버 | 루나쿨 냉감 베개커버 (아이보리) | detail-pillow.html |
| 냉감 베개커버 | 루나쿨 냉감 베개커버 2P | detail-pillow.html |

> 제거된 상품: 그레이 컬러 전 제품, 프리미엄 라인, 베개커버 그레이, 소파패드 3인용 라지

---

## 완료된 작업 목록

### 공통
- [x] 헤더/푸터 로고 전부 제거 (`display: none !important`)
- [x] 헤더 우측 정렬 (`justify-content: flex-end`)
- [x] 표준 네비게이션: 홈 / 전체 상품 / 구매후기 / 상품문의 / 브랜드 / 스마트스토어 구매
- [x] 푸터 회사정보 왼쪽 컬럼 배치 (ft-biz-inline)
- [x] 전 페이지 표준 footer 적용

### index.html
- [x] 히어로 연도 2025 → 2026 수정
- [x] "냉감 패드 보러가기 →" 링크 → detail-pad.html 연결

### products.html
- [x] 가격 전부 제거
- [x] 카테고리별 스토리/특징 섹션 추가 (카테고리 인트로 배너)
- [x] 카테고리 시각적 구분 (흰색/회색 교차 배경)
- [x] 상품명 "바이오쿨" → "루나쿨" 전체 수정
- [x] "흡습속건" → "땀 흡수·빠른 건조" / "통기성 우수" 로 변경
- [x] 그레이·프리미엄 상품 전부 제거
- [x] 소파패드 3인용 → 4인용으로 변경, 라지만 유지
- [x] 버튼 "스마트스토어에서 구매 →" → "제품 상세 보기 →" 로 변경
- [x] 각 버튼 → 해당 상세페이지(detail-*.html) 연결

### detail-*.html (5개 신규 생성)
- [x] detail-pad.html — 냉감 패드 상세 (분할이미지 10장)
- [x] detail-blanket.html — 차렵이불 상세
- [x] detail-sofa.html — 소파패드 상세
- [x] detail-cushion.html — 방석 상세
- [x] detail-pillow.html — 베개커버 상세
- [x] 상세이미지 GitHub 업로드 완료

### about.html
- [x] 구버전 헤더 → 표준 헤더로 교체
- [x] 전체 레이아웃 재설계 (섹션 중앙정렬, 배경 교차)
- [x] 브랜드 스토리 로고 이미지 제거
- [x] "바이오쿨" 표현 전부 "루나쿨"로 수정
- [x] 인증 현황: 이모지 카드 → 실제 PDF 임베드 (6개)
- [x] 인증서 PDF 6개 GitHub 업로드
- [x] "인증서 전체 보기" 링크 제거

### inquiry.html (신규 생성)
- [x] 상품문의 게시판 전체 구현
- [x] 카테고리 필터 탭
- [x] 글쓰기 모달
- [x] 비밀글 잠금 기능
- [x] inquiry-data.js — 기본 문의 87건 시드 데이터

### admin.html
- [x] 문의 관리 섹션 추가 (필터/검색/답변/삭제)

---

## 미완료 / 추후 작업

- [ ] **스마트스토어 URL 교체**: 현재 `https://smartstore.naver.com` → 실제 스토어 URL로 변경
- [ ] **모바일 최적화** 점검 (사용자가 확인 요청했으나 아직 미진행)
- [ ] **제품 홍보 영상** 업로드 (admin.html에서 관리 가능)

---

## 주요 CSS 변수 (style.css)

```css
--blue: #3B82F6;
--blue-dk: #2563EB;
--dark: #1A2B3C;
--mid: #64748B;
--border: #E2E8F0;
--light: #EFF6FF;
```

## 주의사항
- 스마트스토어 URL이 플레이스홀더 상태 — 개설 후 전체 치환 필요
- `.gitignore`에 `인증서/` 가 있었음 → `-f` 옵션으로 강제 추가함
- 상세이미지 경로: `루나쿨_상세이미지/루나쿨_냉감패드/분할이미지/lunacool_냉감패드_상세페이지_01.jpg`
