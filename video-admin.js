// ─────────────────────────────────────────
//  홍보 영상 관리 (admin.html · admin-live.html 공용)
//  - 브랜드별로 「지금 방문자에게 재생되는 영상」과 미리보기를 보여줌
//  - 저장 위치: Firebase settings/site (videoUrl = 루나쿨, videoUrlLunaon = 루나온)
// ─────────────────────────────────────────
import { Board as B, esc } from './board.js';

// 관리자 칸이 비었을 때 재생되는 영상 (script.js와 같은 값)
export const VIDEO_DEFAULTS = {
  lunacool: { key: 'videoUrl', name: '루나쿨', url: 'https://youtu.be/umttGaTyZMI', label: '기본 영상 (코드에 들어 있는 영상)' },
  lunaon: { key: 'videoUrlLunaon', name: '루나온', url: 'assets/lunaon/video/lunaon-test.mp4', label: '테스트 영상 (제품 사진으로 만든 13초 영상)', poster: 'assets/lunaon/video/lunaon-test-poster.jpg' }
};

function ytId(url) {
  const m = String(url || '').match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : '';
}
const isMp4 = u => /\.mp4(\?.*)?$/i.test(u) && (/^https:\/\//.test(u) || /^assets\/[\w\-./]+\.mp4$/.test(u));
export const isValidVideoUrl = u => !u || !!ytId(u) || isMp4(u);

function preview(url, poster) {
  const id = ytId(url);
  if (id) return `<a href="https://youtu.be/${esc(id)}" target="_blank" rel="noopener" class="va-thumb"><img src="https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg" alt="유튜브 미리보기"><span>▶ 유튜브에서 보기</span></a>`;
  if (isMp4(url)) return `<video class="va-video" src="${esc(url)}" ${poster ? `poster="${esc(poster)}"` : ''} controls playsinline preload="metadata"></video>`;
  return '<div class="va-empty">미리보기 없음</div>';
}

const CSS = `
.va { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.va-card { background: #fff; border: 1px solid #E3E5E8; border-radius: 12px; padding: 20px; display: grid; gap: 10px; }
.va-card h3 { font-size: 16px; display: flex; gap: 8px; align-items: center; }
.va-badge { font-size: 12px; padding: 2px 10px; border-radius: 999px; font-weight: 600; }
.va-badge.set { background: #E7F4EC; color: #2E8B57; } .va-badge.def { background: #F1F2F4; color: #5C6670; }
.va-now { font-size: 13.5px; color: #5C6670; word-break: break-all; }
.va-now b { color: #2B333C; }
.va-thumb { position: relative; display: block; border-radius: 8px; overflow: hidden; }
.va-thumb img, .va-video { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px; background: #000; display: block; }
.va-thumb span { position: absolute; left: 10px; bottom: 10px; background: rgba(0,0,0,.65); color: #fff; font-size: 12.5px; padding: 4px 10px; border-radius: 999px; }
.va-empty { aspect-ratio: 16/9; display: grid; place-items: center; background: #F4F5F6; border-radius: 8px; color: #5C6670; font-size: 13px; }
.va-card input { padding: 10px 12px; border: 1.5px solid #E3E5E8; border-radius: 8px; font: inherit; width: 100%; }
.va-acts { display: flex; gap: 8px; flex-wrap: wrap; }
.va-acts button { border: 0; border-radius: 999px; padding: 9px 16px; font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer; }
.va-save { background: #2B333C; color: #fff; } .va-reset { background: #fff; box-shadow: inset 0 0 0 1.5px #E3E5E8; color: #2B333C; }
.va-hint { font-size: 12.5px; color: #5C6670; line-height: 1.6; }
@media (max-width: 800px) { .va { grid-template-columns: 1fr; } }`;

export async function mountVideoAdmin(container, toast = msg => alert(msg)) {
  if (!document.getElementById('va-style')) {
    const st = document.createElement('style'); st.id = 'va-style'; st.textContent = CSS; document.head.appendChild(st);
  }
  let settings = {};
  try { settings = await B.getSettings(); } catch (e) { console.error(e); }

  const render = () => {
    container.innerHTML = '<div class="va">' + Object.entries(VIDEO_DEFAULTS).map(([brand, d]) => {
      const saved = (settings[d.key] || '').trim();
      const now = saved || d.url;
      return `<div class="va-card" data-brand="${brand}">
        <h3>${d.name} 영상 ${saved ? '<span class="va-badge set">관리자 등록</span>' : '<span class="va-badge def">기본값</span>'}</h3>
        <div class="va-now">지금 방문자에게 재생: <b>${saved ? '관리자가 등록한 영상' : esc(d.label)}</b><br>${esc(now)}</div>
        ${preview(now, saved ? '' : d.poster)}
        <input type="url" placeholder="유튜브 주소 (https://youtu.be/… / 쇼츠 주소도 가능)" value="${esc(saved)}">
        <div class="va-acts">
          <button type="button" class="va-save">저장</button>
          ${saved ? '<button type="button" class="va-reset">기본값으로 되돌리기</button>' : ''}
        </div>
        <p class="va-hint">유튜브에 올린 뒤 주소를 붙여넣고 저장하면 방문자 화면에 바로 반영됩니다.</p>
      </div>`;
    }).join('') + '</div>';
  };
  render();

  container.addEventListener('click', async e => {
    const card = e.target.closest('.va-card'); if (!card) return;
    const d = VIDEO_DEFAULTS[card.dataset.brand];
    let val;
    if (e.target.classList.contains('va-save')) val = card.querySelector('input').value.trim();
    else if (e.target.classList.contains('va-reset')) val = '';
    else return;
    if (!isValidVideoUrl(val)) { toast('유튜브 주소(https://youtu.be/… 또는 https://www.youtube.com/…)를 넣어주세요.'); return; }
    e.target.disabled = true;
    try {
      await B.adminSaveSettings({ [d.key]: val });
      settings[d.key] = val;
      toast(val ? `${d.name} 영상을 저장했습니다. 방문자 화면에 바로 반영됩니다.` : `${d.name} 영상을 기본값으로 되돌렸습니다.`);
      render();
    } catch (err) { console.error(err); toast('저장하지 못했습니다.'); e.target.disabled = false; }
  });
}
