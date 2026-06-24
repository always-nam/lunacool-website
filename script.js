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
// 기본 홍보 영상 (관리자에서 별도 등록 안 했을 때 사용)
const DEFAULT_VIDEO_ID = 'umttGaTyZMI';
function openVideoModal(e) {
  if (e) e.preventDefault();
  // localStorage에 등록된 영상이 있으면 우선 사용, 없으면 기본 영상
  const videoUrl = localStorage.getItem('lunacool_video_url') || '';
  const player = document.getElementById('vmPlayer');
  if (player) {
    if (!videoUrl) {
      // 기본 유튜브 영상
      player.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${DEFAULT_VIDEO_ID}?autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="border-radius:8px;"></iframe>`;
    } else if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const ytId = videoUrl.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1];
      if (ytId) player.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="border-radius:8px;"></iframe>`;
    } else {
      player.innerHTML = `<video controls autoplay style="width:100%;height:100%;border-radius:8px;background:#000;"><source src="${videoUrl}" type="video/mp4">브라우저가 영상을 지원하지 않습니다.</video>`;
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
