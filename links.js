// ─────────────────────────────────────────
//  구매처 링크 — 여기 두 줄만 고치면 전 페이지 버튼에 반영됩니다.
//  (각 HTML에도 같은 주소가 적혀 있지만, 이 파일 값이 우선 적용됨)
// ─────────────────────────────────────────
window.STORE_LINKS = {
  smartstore: 'https://smartstore.naver.com/terran/products/13431840534',
  coupang: 'https://www.coupang.com/'   // TODO: 쿠팡 상품 링크가 생성되면 이 주소만 교체
};

document.querySelectorAll('[data-store]').forEach(function (a) {
  var url = window.STORE_LINKS[a.dataset.store];
  if (url) a.href = url;
});
