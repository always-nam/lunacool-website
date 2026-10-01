// Header scroll
const hdr = document.getElementById('hdr');
if (hdr) {
  window.addEventListener('scroll', () => {
    hdr.classList.toggle('solid', window.scrollY > 50);
  }, { passive: true });
}

// Mobile menu
function toggleMenu() {
  document.getElementById('mNav')?.classList.toggle('open');
}

// Scroll appear
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.appear').forEach(el => io.observe(el));

// Video modal
// 기본 홍보 영상 (유튜브 — 저장소 용량/대역폭 부담 없음)
const DEFAULT_VIDEO_ID = 'umttGaTyZMI';
// 루나온: 관리자 칸이 비었을 때 재생되는 테스트 영상 (video-admin.js와 같은 값)
const DEFAULT_LUNAON_VIDEO = 'assets/lunaon/video/lunaon-test.mp4';
// 유튜브 임베드 URL 생성 (이탈 최소화: 관련영상 숨김 + 로고 축소 + 쿠키리스)
function ytEmbed(id) {
  return `<iframe width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="border-radius:8px;"></iframe>`;
}
// 유튜브 주소에서 영상 ID 추출 (watch?v= / youtu.be / shorts / embed / live 모두 지원)
function ytIdFrom(url) {
  const m = String(url || '').match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : '';
}
function openVideoModal(e, brand) {
  if (e) e.preventDefault();
  // 루나온 영상: 실시간 관리에서 저장한 루나온 주소만 사용
  // 루나쿨 영상: 실시간 관리 주소 → 이 브라우저에 저장된 주소 → 기본 영상
  const videoUrl = brand === 'lunaon'
    ? (window.LIVE_VIDEO_URL_LUNAON || DEFAULT_LUNAON_VIDEO)
    : (window.LIVE_VIDEO_URL || localStorage.getItem('lunacool_video_url') || '');
  const player = document.getElementById('vmPlayer');
  if (player) {
    if (!videoUrl) {
      // 기본 유튜브 영상
      player.innerHTML = ytEmbed(DEFAULT_VIDEO_ID);
    } else if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const ytId = ytIdFrom(videoUrl);
      if (ytId) player.innerHTML = ytEmbed(ytId);
    } else {
      player.innerHTML = `<video controls autoplay playsinline style="width:100%;height:100%;border-radius:8px;background:#000;"><source src="${videoUrl}" type="video/mp4">브라우저가 영상을 지원하지 않습니다.</video>`;
    }
  }
  document.getElementById('videoModalBg')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeVideoModal(e) {
  if (e && e.target !== document.getElementById('videoModalBg') && e.type !== 'click') return;
  const bg = document.getElementById('videoModalBg');
  if (!bg) return;
  bg.classList.remove('open');
  document.body.style.overflow = '';
  const player = document.getElementById('vmPlayer');
  if (player) player.innerHTML = ''; // iframe/video 제거 → 재생 완전 정지
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideoModal({type:'click',target:document.getElementById('videoModalBg')}); });

// Products filter (products.html)
function filterProducts(cat, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.product-card').forEach(card => {
    card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
  });
}
