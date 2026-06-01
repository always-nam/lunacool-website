// 기본 후기 데이터 — 관리자에서 추가/수정/삭제 가능
const DEFAULT_REVIEWS = [
  {
    id: 1,
    product: 'pad',
    name: '김**',
    location: '서울 강남구',
    rating: 5,
    text: '진짜 신기할 정도로 차갑네요. 여름에 이불 없이 자도 발이 닿으면 시원한 느낌이 나요. 다른 냉감 패드랑 비교가 안 돼요. 세탁 후에도 냉감이 그대로 유지됩니다.',
    photos: ['루나쿨 상품 이미지/냉감 패드 퀸 8.jpg'],
    date: '2025.06.01'
  },
  {
    id: 2,
    product: 'pad',
    name: '최**',
    location: '인천 연수구',
    rating: 5,
    text: 'OEKO-TEX 인증이라 아이한테 써도 걱정 없어요. 냉감 효과도 정말 좋고 세탁 후에도 유지가 잘 되네요. 친정엄마한테도 선물했더니 너무 좋아하셨어요!',
    photos: ['루나쿨 상품 이미지/냉감 패드 싱글 4.jpg', '루나쿨 상품 이미지/냉감 패드 싱글 6.jpg'],
    date: '2025.05.22'
  },
  {
    id: 3,
    product: 'pad',
    name: '윤**',
    location: '서울 마포구',
    rating: 5,
    text: '냉감 제품 여러 개 써봤는데 이게 제일 오래 시원함이 유지돼요. 에어컨 없이 자기 어려운 날에도 이 패드 하나면 훨씬 수월해요. 포장도 꼼꼼하고 배송도 빨랐어요!',
    photos: [],
    date: '2025.05.15'
  },
  {
    id: 4,
    product: 'pad',
    name: '신**',
    location: '서울 송파구',
    rating: 5,
    text: '더위를 많이 타는 편인데 이 패드 깔고 자니까 정말 시원해요. 예전엔 밤에 몇 번씩 깼는데 요즘은 한 번도 안 깨고 자요. 수면의 질이 정말 달라졌어요.',
    photos: ['루나쿨 상품 이미지/냉감 패드 퀸 12.jpg'],
    date: '2025.05.08'
  },
  {
    id: 5,
    product: 'blanket',
    name: '이**',
    location: '경기 수원시',
    rating: 5,
    text: '아이가 너무 더워서 잠을 못 잤는데 이 이불 쓰고 훨씬 잘 자요. OEKO-TEX 인증이라 아이한테 써도 안심되고 촉감도 정말 부드러워요. 강력 추천!',
    photos: ['루나쿨 상품 이미지/냉감 차렵이불 싱글 8.jpg'],
    date: '2025.05.28'
  },
  {
    id: 6,
    product: 'blanket',
    name: '조**',
    location: '경기 성남시',
    rating: 5,
    text: '여름 이불로 완벽해요. 얇고 가볍지만 냉감 충전재가 들어있어서 차가운 느낌이 좋아요. 땀 흡수도 잘 되고 아침에 일어나도 축축하지 않아요.',
    photos: ['루나쿨 상품 이미지/냉감 차렵이불 퀸 24.jpg', '루나쿨 상품 이미지/냉감 차렵이불 퀸 17.jpg'],
    date: '2025.05.12'
  },
  {
    id: 7,
    product: 'sofa',
    name: '박**',
    location: '부산 해운대구',
    rating: 5,
    text: '여름에 소파에 앉으면 땀이 엄청 차였는데 이 패드 깔고 나서 완전히 달라졌어요. 미끄럼 방지 처리도 잘 되어 있어서 움직여도 밀리지 않아요. 재구매 의사 100%!',
    photos: ['루나쿨 상품 이미지/냉감 소파패드 24.jpg'],
    date: '2025.05.25'
  },
  {
    id: 8,
    product: 'sofa',
    name: '강**',
    location: '경남 창원시',
    rating: 5,
    text: '3인 소파에 딱 맞게 들어왔어요. 아이들이 소파에서 뒹굴어도 미끄러지지 않아서 안전해요. 여름에 소파에 있으면 등이 땀에 젖어서 불편했는데 이 패드로 완전 해결됐어요.',
    photos: [],
    date: '2025.05.10'
  },
  {
    id: 9,
    product: 'cushion',
    name: '정**',
    location: '대구 수성구',
    rating: 5,
    text: '사무실 의자에 깔고 써요. 여름에 앉아있으면 엉덩이가 너무 더웠는데 이 방석 하나로 해결됐어요. 가지고 다닐 수 있게 끈도 달려있어서 편리해요. 선물용으로도 좋아요.',
    photos: ['루나쿨 상품 이미지/냉감 방석 15.jpg'],
    date: '2025.05.20'
  },
  {
    id: 10,
    product: 'pillow',
    name: '한**',
    location: '광주 서구',
    rating: 5,
    text: '베개가 뜨거워서 잠들기 힘들었는데 루나쿨 베개커버 하나로 해결! 시원한 면을 계속 찾지 않아도 돼서 정말 편해요. 2개 세트로 구매했는데 가격도 합리적이에요.',
    photos: ['루나쿨 상품 이미지/냉감 베개커버 11.jpg'],
    date: '2025.05.18'
  }
];

// localStorage에 기본 데이터가 없으면 세팅
(function initReviews() {
  if (!localStorage.getItem('lunacool_reviews')) {
    localStorage.setItem('lunacool_reviews', JSON.stringify(DEFAULT_REVIEWS));
  }
})();
