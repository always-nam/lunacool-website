// ─────────────────────────────────────────
//  영상 목록 (메인 · 루나온 · 영상 페이지 공용)
//  저장: Firebase settings/site.videos = [{ id, brand: 'lunacool'|'lunaon', url, title }]
//  - 유튜브(일반·쇼츠) 또는 사이트 안 mp4
//  - 등록된 영상이 없으면 브랜드별 기본 영상 1개
// ─────────────────────────────────────────
import { Board as B, esc } from './board.js';

export const VIDEO_FALLBACK = {
  lunacool: [{ id: 'default-lc', brand: 'lunacool', url: 'https://youtu.be/umttGaTyZMI', title: '루나쿨 제품 영상', isDefault: true }],
  lunaon: [{ id: 'default-lo', brand: 'lunaon', url: 'assets/lunaon/video/lunaon-test.mp4', title: '루나온 소개 (테스트 영상)', poster: 'assets/lunaon/video/lunaon-test-poster.jpg', isDefault: true }]
};

export function ytId(url) {
  const m = String(url || '').match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : '';
}
export const isShort = url => /youtube\.com\/shorts\//.test(String(url || ''));
export const isMp4 = u => /\.mp4(\?.*)?$/i.test(u) && (/^https:\/\//.test(u) || /^assets\/[\w\-./]+\.mp4$/.test(u));
export const isValidVideoUrl = u => !!ytId(u) || isMp4(u);

let _settings = null;
export async function loadSettings(force) {
  if (_settings && !force) return _settings;
  try { _settings = B.enabled ? await B.getSettings() : {}; } catch (e) { _settings = {}; }
  return _settings;
}

// 브랜드별 영상 목록 (등록 순서 그대로). 예전 단일 주소(videoUrl / videoUrlLunaon)도 인식
export function videosFor(settings, brand) {
  let list = Array.isArray(settings.videos) ? settings.videos.filter(v => v && v.brand === brand && isValidVideoUrl(v.url)) : [];
  if (!list.length) {
    const legacy = brand === 'lunaon' ? settings.videoUrlLunaon : settings.videoUrl;
    if (legacy && isValidVideoUrl(legacy)) list = [{ id: 'legacy-' + brand, brand, url: legacy, title: '' }];
  }
  return list.length ? list : VIDEO_FALLBACK[brand];
}

function thumbOf(v) {
  const id = ytId(v.url);
  if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  return v.poster || '';
}

export function cardHTML(v) {
  const vertical = isShort(v.url);
  const th = thumbOf(v);
  const brandName = v.brand === 'lunaon' ? '루나온' : '루나쿨';
  return `<button type="button" class="vg-card ${vertical ? 'vg-short' : 'vg-wide'} vg-${esc(v.brand)}" data-url="${esc(v.url)}" data-vertical="${vertical ? 1 : 0}" aria-label="${esc(v.title || brandName + ' 영상')} 재생">
    <span class="vg-thumb">${th ? `<img src="${esc(th)}" alt="" loading="lazy">` : `<video src="${esc(v.url)}#t=0.5" muted playsinline preload="metadata"></video>`}<span class="vg-play" aria-hidden="true">▶</span>${vertical ? '<span class="vg-badge">Shorts</span>' : ''}</span>
    ${v.title ? `<span class="vg-title">${esc(v.title)}</span>` : ''}
  </button>`;
}

export const GALLERY_CSS = `
.vg-grid { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 8px; align-items: flex-start; }
.vg-card { flex: 0 0 auto; scroll-snap-align: start; border: 0; padding: 0; background: none; cursor: pointer; text-align: left; color: inherit; font: inherit; display: grid; gap: 8px; }
.vg-wide { width: min(78vw, 420px); } .vg-short { width: min(46vw, 210px); }
.vg-thumb { position: relative; display: block; border-radius: 12px; overflow: hidden; background: #111; }
.vg-wide .vg-thumb { aspect-ratio: 16/9; } .vg-short .vg-thumb { aspect-ratio: 9/16; }
.vg-thumb img, .vg-thumb video { width: 100%; height: 100%; object-fit: cover; display: block; }
.vg-play { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 54px; height: 54px; border-radius: 50%; display: grid; place-items: center; font-size: 18px; background: rgba(255,255,255,.92); color: #2B333C; }
.vg-lunaon .vg-play { background: linear-gradient(120deg, #F2703C, #FF9A3D 52%, #FFD08A); color: #3a2414; }
.vg-badge { position: absolute; left: 10px; top: 10px; font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; background: rgba(0,0,0,.6); color: #fff; }
.vg-title { font-size: 14.5px; font-weight: 600; line-height: 1.4; }
.vg-card:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; border-radius: 12px; }
.video-modal.vm-vertical { width: min(92vw, 52vh); }
.video-modal.vm-vertical .vm-player { aspect-ratio: 9/16; }
`;

export function injectCSS() {
  if (document.getElementById('vg-style')) return;
  const st = document.createElement('style'); st.id = 'vg-style'; st.textContent = GALLERY_CSS; document.head.appendChild(st);
}

// 카드를 누르면 사이트 공용 영상 창(script.js의 playVideoUrl)으로 재생
export function bindPlay(root) {
  root.addEventListener('click', e => {
    const c = e.target.closest('.vg-card'); if (!c) return;
    if (typeof window.playVideoUrl === 'function') window.playVideoUrl(c.dataset.url, c.dataset.vertical === '1');
  });
}

// data-video-gallery="lunacool|lunaon" 인 요소를 채움
export async function mountGalleries(rootDoc = document) {
  injectCSS();
  const els = rootDoc.querySelectorAll('[data-video-gallery]');
  if (!els.length) return;
  const s = await loadSettings();
  els.forEach(el => {
    const list = videosFor(s, el.dataset.videoGallery);
    const max = Number(el.dataset.max || 0);
    el.innerHTML = `<div class="vg-grid">${(max ? list.slice(0, max) : list).map(cardHTML).join('')}</div>`;
    bindPlay(el);
  });
}
