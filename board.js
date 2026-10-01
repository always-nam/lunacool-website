// ─────────────────────────────────────────
//  실시간 문의 · 후기 · 관리자 (Firebase Firestore)
//  - 화면은 GitHub Pages, 저장은 Firebase. 서버 없이 보안 규칙(firestore.rules)으로 보호.
//  - 비밀글: 내용을 별도 문서에 저장하고, 문서 이름을 「문의번호 + 비밀번호」로 만든 암호화 값으로 정함.
//    → 비밀번호를 아는 사람(글쓴이)과 관리자만 내용을 찾을 수 있음.
// ─────────────────────────────────────────
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
  getFirestore, collection, doc, writeBatch, getDocs, getDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

const cfg = window.LUNA_FIREBASE_CONFIG || {};
const enabled = !!(cfg.apiKey && cfg.projectId);

let db = null, auth = null;
if (enabled) {
  const app = initializeApp(cfg);
  db = getFirestore(app);
  auth = getAuth(app);
}

// ── 공통 도우미 ──
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
export function fmtDate(ts) {
  const d = ts && ts.toDate ? ts.toDate() : (ts instanceof Date ? ts : null);
  if (!d) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}
export function maskName(name) {
  const n = String(name || '').trim();
  if (n.length <= 1) return n + '*';
  return n[0] + '*'.repeat(Math.min(n.length - 1, 2));
}

// 사진: 화면에 넣기 전 형식 확인 (JPEG data URL만 허용)
export function isSafePhoto(s) {
  return typeof s === 'string' && s.length < 400000 && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(s);
}

// 사진 줄이기: 긴 변 1000px, JPEG 품질 0.72부터 낮춰가며 약 180KB 이하로
export async function shrinkPhoto(file, maxSide = 1000, maxBytes = 180000) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  let q = 0.72, url = c.toDataURL('image/jpeg', q);
  while (url.length * 0.75 > maxBytes && q > 0.4) { q -= 0.08; url = c.toDataURL('image/jpeg', q); }
  return url;
}

// 비밀번호 → 비밀글 문서 이름 (PBKDF2-SHA256, 10만 회 반복으로 무작위 대입을 느리게)
async function secretKey(inquiryId, password) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode('lunafamily:' + inquiryId), iterations: 100000, hash: 'SHA-256' }, base, 256);
  return [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export const Board = {
  enabled,

  // ── 상품문의 ──
  async listInquiries() {
    if (!enabled) return [];
    const snap = await getDocs(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), limit(300)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async createInquiry({ cat, product, name, title, content, secret, password }) {
    if (!enabled) throw new Error('disabled');
    const ref = doc(collection(db, 'inquiries'));
    const batch = writeBatch(db);
    batch.set(ref, {
      cat, product: product || '', name: maskName(name), secret: !!secret,
      title: secret ? '' : title, content: secret ? '' : content,
      status: 'wait', createdAt: serverTimestamp()
    });
    if (secret) {
      const key = await secretKey(ref.id, password);
      batch.set(doc(db, 'inquiry_secrets', key), {
        inquiryId: ref.id, title, content, name: maskName(name), createdAt: serverTimestamp()
      });
    }
    await batch.commit();
    return ref.id;
  },

  // 비밀글 열기: 맞는 비밀번호면 내용(+답변) 반환, 틀리면 null
  async openSecret(inquiryId, password) {
    if (!enabled) return null;
    const key = await secretKey(inquiryId, password);
    const snap = await getDoc(doc(db, 'inquiry_secrets', key));
    return snap.exists() ? { key, ...snap.data() } : null;
  },

  // ── 후기 ──
  async listApprovedReviews() {
    if (!enabled) return [];
    // 복합 색인이 필요 없도록 정렬은 화면에서 처리
    const snap = await getDocs(query(collection(db, 'reviews'), where('status', '==', 'approved'), limit(500)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  },

  // photos: shrinkPhoto()로 줄인 JPEG data URL 배열 (최대 3장)
  async createReview({ product, name, rating, text, photos = [] }) {
    if (!enabled) throw new Error('disabled');
    const ref = doc(collection(db, 'reviews'));
    const list = photos.slice(0, 3);
    const batch = writeBatch(db);
    batch.set(ref, { product, name: maskName(name), rating: Number(rating), text, photoCount: list.length, status: 'pending', createdAt: serverTimestamp() });
    list.forEach((data, idx) => batch.set(doc(db, 'review_photos', `${ref.id}_${idx}`), { reviewId: ref.id, idx, data }));
    await batch.commit();
    return ref.id;
  },

  // 후기 사진 불러오기 (승인된 후기 또는 관리자만 읽기 가능)
  async getReviewPhotos(reviewId, count) {
    if (!enabled || !count) return [];
    const snaps = await Promise.all([...Array(Math.min(count, 3)).keys()].map(i => getDoc(doc(db, 'review_photos', `${reviewId}_${i}`))));
    return snaps.filter(s => s.exists()).map(s => s.data().data).filter(isSafePhoto);
  },

  // ── 사이트 설정 (홍보 영상 주소) ──
  async getSettings() {
    if (!enabled) return {};
    const snap = await getDoc(doc(db, 'settings', 'site'));
    return snap.exists() ? snap.data() : {};
  },

  // ── 관리자 ──
  onAuth(cb) { if (enabled) onAuthStateChanged(auth, cb); else cb(null); },
  login(email, pw) { return signInWithEmailAndPassword(auth, email, pw); },
  logout() { return signOut(auth); },
  // 관리자 확인: 관리자만 볼 수 있는 비밀글 목록을 1건 조회해 보고, 허용되면 관리자
  async isAdmin(uid) {
    try { await getDocs(query(collection(db, 'inquiry_secrets'), limit(1))); return true; }
    catch (e) { return false; }
  },
  async adminListSecrets() {
    const snap = await getDocs(collection(db, 'inquiry_secrets'));
    return snap.docs.map(d => ({ key: d.id, ...d.data() }));
  },
  async adminAnswer(inq, answer, secretKeyId) {
    const batch = writeBatch(db);
    const status = answer.trim() ? 'done' : 'wait';
    if (inq.secret) {
      batch.update(doc(db, 'inquiries', inq.id), { status, answeredAt: serverTimestamp() });
      if (secretKeyId) batch.update(doc(db, 'inquiry_secrets', secretKeyId), { answer, answeredAt: serverTimestamp() });
    } else {
      batch.update(doc(db, 'inquiries', inq.id), { status, answer, answeredAt: serverTimestamp() });
    }
    await batch.commit();
  },
  async adminDeleteInquiry(inq, secretKeyId) {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'inquiries', inq.id));
    if (secretKeyId) batch.delete(doc(db, 'inquiry_secrets', secretKeyId));
    await batch.commit();
  },
  async adminListReviews() {
    const snap = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(500)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  adminSetReview(id, data) { return updateDoc(doc(db, 'reviews', id), data); },
  async adminDeleteReview(id, photoCount = 0) {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'reviews', id));
    for (let i = 0; i < Math.min(photoCount, 3); i++) batch.delete(doc(db, 'review_photos', `${id}_${i}`));
    await batch.commit();
  },
  adminSaveSettings(data) { return setDoc(doc(db, 'settings', 'site'), data, { merge: true }); }
};

Board.shrinkPhoto = shrinkPhoto;
Board.isSafePhoto = isSafePhoto;
window.LunaBoard = Board;
window.dispatchEvent(new Event('lunaboard:ready'));
