// ─────────────────────────────────────────
//  홍보 영상 관리 (통합 관리 페이지)
//  - 브랜드별로 영상을 여러 개 등록 (유튜브 일반·쇼츠)
//  - 순서 바꾸기 · 제목 수정 · 삭제, 저장 즉시 방문자 화면에 반영
//  저장: settings/site.videos = [{ id, brand, url, title }]
// ─────────────────────────────────────────
import { Board as B, esc } from './board.js';
import { VIDEO_FALLBACK, ytId, isShort, isValidVideoUrl, loadSettings, videosFor } from './video-gallery.js';

const BRANDS = { lunaon: '루나온', lunacool: '루나쿨' };

const CSS = `
.va-wrap { display: grid; gap: 18px; }
.va-add { background: #fff; border: 1px solid #E3E5E8; border-radius: 12px; padding: 18px 20px; display: grid; gap: 10px; }
.va-add .row { display: grid; grid-template-columns: 140px 1fr 1fr auto; gap: 8px; }
.va-add select, .va-add input { padding: 10px 12px; border: 1.5px solid #E3E5E8; border-radius: 8px; font: inherit; background: #fff; min-width: 0; }
.va-btn { border: 0; border-radius: 999px; padding: 9px 16px; font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer; background: #2B333C; color: #fff; white-space: nowrap; }
.va-btn.line { background: #fff; color: #2B333C; box-shadow: inset 0 0 0 1.5px #E3E5E8; }
.va-btn.bad { background: #fff; color: #D64545; box-shadow: inset 0 0 0 1.5px #F1C6C6; }
.va-hint { font-size: 12.5px; color: #5C6670; line-height: 1.6; }
.va-brand { background: #fff; border: 1px solid #E3E5E8; border-radius: 12px; padding: 18px 20px; }
.va-brand h3 { font-size: 16px; margin-bottom: 4px; }
.va-list { display: grid; gap: 10px; margin-top: 12px; }
.va-item { display: grid; grid-template-columns: 96px 1fr auto; gap: 12px; align-items: center; padding: 10px; border: 1px solid #EEF0F2; border-radius: 10px; }
.va-item img, .va-item .ph { width: 96px; height: 64px; object-fit: cover; border-radius: 6px; background: #111; display: block; }
.va-item.short img { width: 54px; height: 96px; margin: 0 21px; }
.va-item input { width: 100%; padding: 7px 10px; border: 1.5px solid #E3E5E8; border-radius: 8px; font: inherit; }
.va-item .url { font-size: 12px; color: #5C6670; word-break: break-all; margin-top: 4px; }
.va-item .ops { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.va-tag { font-size: 11.5px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #F1F2F4; color: #5C6670; margin-left: 6px; }
@media (max-width: 760px) { .va-add .row { grid-template-columns: 1fr; } .va-item { grid-template-columns: 1fr; } .va-item .ops { justify-content: flex-start; } }`;

export async function mountVideoAdmin(container, toast = msg => alert(msg)) {
  if (!document.getElementById('va-style')) {
    const st = document.createElement('style'); st.id = 'va-style'; st.textContent = CSS; document.head.appendChild(st);
  }
  const settings = await loadSettings(true);
  // 예전 단일 주소만 있으면 목록으로 옮겨서 시작
  let videos = Array.isArray(settings.videos) ? settings.videos.slice() : [];
  if (!Array.isArray(settings.videos)) {
    ['lunacool', 'lunaon'].forEach(b => {
      const legacy = b === 'lunaon' ? settings.videoUrlLunaon : settings.videoUrl;
      if (legacy && isValidVideoUrl(legacy)) videos.push({ id: 'v' + Date.now() + b, brand: b, url: legacy, title: '' });
    });
  }

  const save = async (msg) => {
    await B.adminSaveSettings({ videos, videoUrl: '', videoUrlLunaon: '' });
    settings.videos = videos.slice();
    toast(msg); render();
  };

  const itemHTML = (v, i, list) => {
    const id = ytId(v.url), sh = isShort(v.url);
    const th = id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : (v.poster || '');
    return `<div class="va-item ${sh ? 'short' : ''}" data-id="${esc(v.id)}">
      ${th ? `<img src="${esc(th)}" alt="">` : '<span class="ph"></span>'}
      <div><input class="va-title" value="${esc(v.title || '')}" placeholder="제목 (선택)" maxlength="60">
        <div class="url">${sh ? '<b>쇼츠</b> · ' : ''}${esc(v.url)}</div></div>
      <div class="ops">
        <button type="button" class="va-btn line" data-op="up" ${i === 0 ? 'disabled' : ''}>▲</button>
        <button type="button" class="va-btn line" data-op="down" ${i === list.length - 1 ? 'disabled' : ''}>▼</button>
        <button type="button" class="va-btn line" data-op="title">제목 저장</button>
        <button type="button" class="va-btn bad" data-op="del">삭제</button>
      </div>
    </div>`;
  };

  const render = () => {
    container.innerHTML = `<div class="va-wrap">
      <div class="va-add">
        <b>영상 추가</b>
        <div class="row">
          <select id="vaBrand"><option value="lunaon">루나온</option><option value="lunacool">루나쿨</option></select>
          <input id="vaUrl" placeholder="유튜브 주소 (https://youtube.com/shorts/… 또는 https://youtu.be/…)">
          <input id="vaTitle" placeholder="제목 (선택)" maxlength="60">
          <button type="button" class="va-btn" id="vaAdd">추가</button>
        </div>
        <p class="va-hint">여러 개 등록할 수 있습니다. 쇼츠는 세로 카드로, 일반 영상은 가로 카드로 나옵니다. 위에 있는 영상이 먼저 보입니다.</p>
      </div>
      ${Object.entries(BRANDS).map(([b, name]) => {
        const list = videos.filter(v => v.brand === b);
        const shown = videosFor({ videos }, b);
        return `<div class="va-brand">
          <h3>${name} 영상 <span class="va-tag">${list.length ? list.length + '개 등록' : '등록 없음'}</span></h3>
          ${list.length ? '' : `<p class="va-hint">지금 방문자에게는 기본 영상이 보입니다: <b>${esc(shown[0].title)}</b> (${esc(shown[0].url)})</p>`}
          <div class="va-list">${list.map((v, i) => itemHTML(v, i, list)).join('')}</div>
        </div>`;
      }).join('')}
    </div>`;
  };
  render();

  container.addEventListener('click', async e => {
    const t = e.target;
    try {
      if (t.id === 'vaAdd') {
        const url = container.querySelector('#vaUrl').value.trim();
        if (!ytId(url)) { toast('유튜브 주소(https://youtube.com/shorts/… 또는 https://youtu.be/…)를 넣어주세요.'); return; }
        const brand = container.querySelector('#vaBrand').value;
        videos.unshift({ id: 'v' + Date.now(), brand, url, title: container.querySelector('#vaTitle').value.trim() });
        t.disabled = true;
        await save(`${BRANDS[brand]} 영상을 추가했습니다. 방문자 화면에 바로 보입니다.`);
        return;
      }
      const op = t.dataset.op; if (!op) return;
      const row = t.closest('.va-item'); const v = videos.find(x => x.id === row.dataset.id); if (!v) return;
      const same = videos.filter(x => x.brand === v.brand);
      const pos = same.indexOf(v);
      if (op === 'del') {
        if (!confirm('이 영상을 목록에서 뺄까요? (유튜브 영상 자체는 지워지지 않습니다)')) return;
        videos = videos.filter(x => x !== v); await save('삭제했습니다.');
      } else if (op === 'title') {
        v.title = row.querySelector('.va-title').value.trim(); await save('제목을 저장했습니다.');
      } else if (op === 'up' || op === 'down') {
        const other = same[op === 'up' ? pos - 1 : pos + 1]; if (!other) return;
        const a = videos.indexOf(v), b = videos.indexOf(other);
        [videos[a], videos[b]] = [videos[b], videos[a]];
        await save('순서를 바꿨습니다.');
      }
    } catch (err) { console.error(err); toast('저장하지 못했습니다.'); }
  });
}

export { VIDEO_FALLBACK };
