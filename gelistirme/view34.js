/* ============ 12-D. 3/4 GÖRÜNÜM (DENEME) ============
   Dünya mantığı aynı kalır (x, y = nesnenin yere bastığı nokta). Sadece çizim değişir:
   nesneler yerden yukarı doğru "boylu" çizilir, hepsi y'ye göre sıralanır, güneş sol üstten vurur
   ve gölgeler sağ alta düşer. Şimdilik yeşil diyar ve okçu için; diğerleri eski çizimle devam eder. */

const V34 = {
  on: true,
  sun: { dx: 0.55, dy: 0.32 },     // gölgenin yere düştüğü yön (boyla çarpılır)
};
const v34Green = () => V34.on && !G.area && REALM.id === 'green';

// Yere düşen yumuşak gölge: nesnenin tabanından sağ alta doğru, boyuna göre uzar
function v34Shadow(ctx, x, y, rx, ry, h = 0, a = 0.3) {
  // taban gölgesi (koyu) + boyla sağa uzayan yumuşak kuyruk
  ctx.fillStyle = `rgba(10,16,8,${a})`;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill();
  if (h > 4) {
    const L = h * V34.sun.dx * 0.45;
    ctx.fillStyle = `rgba(10,16,8,${a * 0.55})`;
    ctx.beginPath(); ctx.ellipse(x + L * 0.6, y + ry * 0.15, rx * 0.8 + L * 0.6, ry * 0.85, 0.08, 0, TAU); ctx.fill();
  }
}

/* ---------- Zemin dokusu: hücre başına birkaç açık/koyu yumuşak leke ---------- */
function v34GroundPatches(ctx, cell) {
  if (!cell.v34g) {
    const fr = v => v - Math.floor(v);
    cell.v34g = cell.tufts.slice(0, 5).map((tf, i) => ({
      x: tf.x + (fr(tf.y * 0.37) - 0.5) * 60, y: tf.y + (fr(tf.x * 0.29) - 0.5) * 60,
      rx: 45 + fr(tf.x * 0.13 + i) * 80, k: fr(tf.y * 0.71 + tf.x * 0.17), rot: fr(tf.x * 0.05) * 3,
    }));
  }
  for (const b of cell.v34g) {
    // iç içe üç katman: kenarlar yumuşak geçsin
    for (const k of [1, 0.72, 0.45]) {
      ctx.fillStyle = b.k < 0.5 ? `rgba(20,34,12,${0.018 + b.k * 0.025})` : `rgba(200,220,140,${0.01 + (b.k - 0.5) * 0.025})`;
      ctx.beginPath(); ctx.ellipse(b.x, b.y, b.rx * k, b.rx * 0.55 * k, b.rot, 0, TAU); ctx.fill();
    }
  }
}

/* ---------- Çimen: rüzgârda sallanan yapraklar ---------- */
function v34Tuft(ctx, tf, t) {
  const zc = tf.zi < 0 ? null : ZONES[tf.zi];
  const s = tf.s, sway = Math.sin(t * 1.7 + tf.x * 0.013 + tf.y * 0.007) * 2.2 * s;
  if (tf.f) {
    ctx.strokeStyle = zc ? zc.tuft : REALM.camp.tuft; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tf.x, tf.y); ctx.quadraticCurveTo(tf.x, tf.y - 4 * s, tf.x + sway * 0.6, tf.y - 7 * s); ctx.stroke();
    ctx.fillStyle = zc ? zc.flower : '#e9d99a';
    ctx.beginPath(); ctx.arc(tf.x + sway * 0.6, tf.y - 7.5 * s, 2.3 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.beginPath(); ctx.arc(tf.x + sway * 0.6 - 0.6, tf.y - 8.1 * s, 0.8 * s, 0, TAU); ctx.fill();
    return;
  }
  const base = zc ? zc.tuft : REALM.camp.tuft;
  ctx.fillStyle = 'rgba(10,20,8,.18)';
  ctx.beginPath(); ctx.ellipse(tf.x + 1.5, tf.y + 0.5, 5 * s, 1.6 * s, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = base;
  for (const [ox, h, k] of [[-3.5, 6, -1], [0, 9, 0.3], [3.5, 6.5, 1]]) {
    const bx = tf.x + ox * s, tip = sway + k * 1.6 * s;
    ctx.beginPath();
    ctx.moveTo(bx - 1.3 * s, tf.y);
    ctx.quadraticCurveTo(bx + tip * 0.3, tf.y - h * 0.55 * s, bx + tip, tf.y - h * s);
    ctx.quadraticCurveTo(bx + tip * 0.3 + 0.6, tf.y - h * 0.5 * s, bx + 1.3 * s, tf.y);
    ctx.closePath(); ctx.fill();
  }
}

/* ---------- Kaya: üst yüzü aydınlık, ön yüzü gölgeli bir yumru ---------- */
function v34Rock(ctx, rk) {
  const col = (rk.zi >= 0 && ZONES[rk.zi].rock) || '#7a7f74';
  const r = rk.r, h = r * (0.75 + rk.sq * 0.5), w = r * 1.05;
  v34Shadow(ctx, rk.x, rk.y, w * 1.05, r * 0.38, h, 0.32);
  ctx.save(); ctx.translate(rk.x, rk.y);
  const skew = Math.sin(rk.rot) * r * 0.25;
  // gövde
  ctx.fillStyle = shadeColor(col, -0.28);
  ctx.beginPath();
  ctx.moveTo(-w, 0);
  ctx.quadraticCurveTo(-w * 1.02, -h * 0.75, -w * 0.35 + skew, -h);
  ctx.quadraticCurveTo(w * 0.45 + skew, -h * 1.05, w, -h * 0.35);
  ctx.quadraticCurveTo(w * 1.05, -h * 0.05, w * 0.85, 0);
  ctx.quadraticCurveTo(0, r * 0.28, -w, 0);
  ctx.fill();
  // aydınlık üst yüz
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(-w * 0.92, -h * 0.35);
  ctx.quadraticCurveTo(-w * 0.95, -h * 0.85, -w * 0.35 + skew, -h);
  ctx.quadraticCurveTo(w * 0.45 + skew, -h * 1.05, w * 0.9, -h * 0.4);
  ctx.quadraticCurveTo(0, -h * 0.2, -w * 0.92, -h * 0.35);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  ctx.beginPath(); ctx.ellipse(-w * 0.3 + skew * 0.5, -h * 0.78, w * 0.32, h * 0.13, -0.2, 0, TAU); ctx.fill();
  ctx.restore();
}

/* ---------- Ağaçlar ---------- */
// Ağacın ekrandaki boyu (gölge, saydamlaşma ve sıralama için)
function v34TreeHeight(tr) {
  const s = tr.size;
  return tr.kind === 'pine' ? s * 2.7 : tr.kind === 'leaf' ? s * 2.25 : tr.kind === 'crystal' ? s * 1.5 : s * 1.9;
}
// Oyuncu ağacın arkasındaysa (ekranda tepesinin altında kalıyorsa) ağaç yarı saydam olur
function v34TreeFade(tr, p) {
  if (!p || p.dead) return false;
  const h = v34TreeHeight(tr), s = tr.size;
  return p.y < tr.y - 2 && p.y > tr.y - h - 10 && Math.abs(p.x - tr.x) < s * 1.05;
}
function v34Tree(ctx, tr, t, faded) {
  const s = tr.size, h = v34TreeHeight(tr);
  const sway = Math.sin(t * 1.1 + tr.x * 0.004 + tr.y * 0.003) * s * 0.045;
  v34Shadow(ctx, tr.x, tr.y, s * 0.7, s * 0.28, h, 0.3);
  ctx.save();
  ctx.translate(tr.x, tr.y);
  if (faded) ctx.globalAlpha = 0.42;
  const trunk = (w, th, c1, c2) => {
    ctx.fillStyle = c2;
    ctx.beginPath(); ctx.ellipse(0, 0, w * 0.75, w * 0.3, 0, 0, TAU); ctx.fill();
    // gövde: koyu taban + aydınlık sol yarı (renk geçişi yerine iki düz renk, daha hızlı)
    ctx.fillStyle = c2;
    ctx.beginPath();
    ctx.moveTo(-w * 0.62, 0); ctx.quadraticCurveTo(-w * 0.4, -th * 0.5, -w * 0.38, -th);
    ctx.lineTo(w * 0.38, -th); ctx.quadraticCurveTo(w * 0.4, -th * 0.5, w * 0.62, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = c1;
    ctx.beginPath();
    ctx.moveTo(-w * 0.62, 0); ctx.quadraticCurveTo(-w * 0.4, -th * 0.5, -w * 0.38, -th);
    ctx.lineTo(w * 0.02, -th); ctx.lineTo(w * 0.08, 0);
    ctx.closePath(); ctx.fill();
  };
  if (tr.kind === 'leaf') {
    const th = s * 0.95, cy = -th - s * 0.62, tw = Math.max(7, tr.r * 0.85);
    // kök çıkıntıları
    ctx.fillStyle = '#4a3220';
    for (const k of [-1, 1]) { ctx.beginPath(); ctx.ellipse(k * tw * 0.55, -1, tw * 0.45, tw * 0.22, k * 0.4, 0, TAU); ctx.fill(); }
    trunk(tw, th + 6, '#7a5636', '#3e2a1a');
    // kabuk çizgileri
    ctx.strokeStyle = 'rgba(30,18,10,.45)'; ctx.lineWidth = 1; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const bx = (i - 1) * tw * 0.22;
      ctx.beginPath(); ctx.moveTo(bx, -th * 0.12 - i * 3); ctx.quadraticCurveTo(bx + 1.5, -th * 0.45, bx - 0.5, -th * 0.75 + i * 2); ctx.stroke();
    }
    // tepeye uzanan dallar
    ctx.strokeStyle = '#4e3522'; ctx.lineWidth = Math.max(2.5, tw * 0.28);
    ctx.beginPath(); ctx.moveTo(0, -th * 0.85); ctx.quadraticCurveTo(-s * 0.2, -th - s * 0.1, -s * 0.42, cy + s * 0.15);
    ctx.moveTo(0, -th * 0.9); ctx.quadraticCurveTo(s * 0.18, -th - s * 0.12, s * 0.38, cy + s * 0.08); ctx.stroke();
    ctx.translate(sway, 0);
    const spr = v34LeafSprite(tr);
    ctx.drawImage(spr.cv, -spr.ox, cy - spr.oy, spr.w, spr.h);  } else if (tr.kind === 'pine') {
    trunk(Math.max(6, tr.r * 0.7), s * 0.55, '#6a4a2e', '#33231a');
    ctx.translate(sway, 0);
    const tiers = [['#173a24', 1.0, 0.45], ['#21492e', 0.8, 1.05], ['#2c5a39', 0.58, 1.6], ['#3a6e47', 0.36, 2.1]];
    for (const [col, k, yk] of tiers) {
      const w = s * k * 1.05, by = -s * yk, ty = by - s * 0.95 * (0.6 + k * 0.4);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(-w, by); ctx.quadraticCurveTo(-w * 0.35, by - (by - ty) * 0.35, 0, ty);
      ctx.quadraticCurveTo(w * 0.35, by - (by - ty) * 0.35, w, by);
      ctx.quadraticCurveTo(0, by + s * 0.16, -w, by);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.07)';
      ctx.beginPath(); ctx.moveTo(-w * 0.9, by - 1); ctx.lineTo(0, ty); ctx.lineTo(-w * 0.15, by); ctx.closePath(); ctx.fill();
    }
  } else if (tr.kind === 'dead' || tr.kind === 'charred') {
    const col = tr.kind === 'dead' ? '#7a6248' : '#332a27', dk = shadeColor(tr.kind === 'dead' ? '#7a6248' : '#4a3d39', -0.35);
    const th = s * 1.25;
    trunk(Math.max(6, tr.r * 0.9), th, col, dk);
    ctx.strokeStyle = col; ctx.lineCap = 'round';
    tr.branches.forEach((b, i) => {
      const L = s * b.l * 0.85, side = i % 2 ? 1 : -1;
      const sy = -th * (0.55 + (i % 3) * 0.18), a = -Math.PI / 2 + side * (0.5 + (b.a % 1 + 1) % 1 * 0.6);
      const mx = Math.cos(a) * L * 0.55, my = sy + Math.sin(a) * L * 0.55;
      ctx.lineWidth = 4.5;
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(mx, my); ctx.lineTo(mx + Math.cos(a - side * 0.4) * L * 0.5, my + Math.sin(a - side * 0.4) * L * 0.5); ctx.stroke();
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(a + side * 0.7) * L * 0.3, my + Math.sin(a + side * 0.7) * L * 0.3); ctx.stroke();
    });
    if (tr.kind === 'charred') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(232,118,63,${0.35 + 0.15 * Math.sin(t * 3 + tr.x)})`;
      ctx.beginPath(); ctx.ellipse(1, -th * 0.35, tr.r * 0.28, tr.r * 0.5, 0, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
  } else if (tr.kind === 'crystal') {
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(0, -s * 0.6, 2, 0, -s * 0.6, s * 1.2);
    glow.addColorStop(0, `rgba(140,220,240,${0.25 + 0.07 * Math.sin(t * 2 + tr.shade * 6)})`);
    glow.addColorStop(1, 'rgba(140,220,240,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, -s * 0.6, s * 1.2, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.38 + Math.sin(tr.rot + i) * 0.1, L = s * (0.7 + ((i * 7) % 3) * 0.3);
      const bx = (i - 2) * s * 0.17;
      ctx.save(); ctx.translate(bx, 0); ctx.rotate(a + Math.PI / 2);
      const w = s * 0.17;
      ctx.fillStyle = i % 2 ? '#6fc4cf' : '#8a76e0';
      ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(-w, -L * 0.8); ctx.lineTo(0, -L); ctx.lineTo(w, -L * 0.8); ctx.lineTo(w, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(-w, -L * 0.8); ctx.lineTo(0, -L); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

/* ---------- Yapraklı ağacın tepesi: bir kez çizilip saklanır ----------
   Tırtıklı kenarlı yaprak kümeleri, güneşli üst yüz, gölgeli alt, yaprak dokusu, bazılarında elma. */
const V34_LEAF = new Map();
const V34_LEAF_PAL = [
  ['#24492a', '#336b33', '#4f8f45', '#7db864', '#1a3a20'],   // klasik yeşil
  ['#2d4d22', '#44702c', '#66953e', '#9cc463', '#203a18'],   // sarımsı
  ['#1f4433', '#2f6347', '#48865e', '#78b48a', '#16352a'],   // mavimsi
];
function v34LeafSprite(tr) {
  const sc = Math.min(3, (G.dpr || 1) * (G.cam.zoom || 1));
  const key = tr.x + ',' + tr.y + ',' + sc.toFixed(2);
  let c = V34_LEAF.get(key);
  if (c) return c;
  const s = tr.size, pad = 6, W = s * 2.3 + pad * 2, H = s * 1.95 + pad * 2;
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(W * sc); cv.height = Math.ceil(H * sc);
  const x = cv.getContext('2d');
  x.scale(sc, sc); x.translate(W / 2, H / 2 + s * 0.05);
  const rng = mulberry32(Math.floor(tr.x * 13.7 + tr.y * 7.3) | 0);
  const [dark, mid, lite, top, deep] = V34_LEAF_PAL[Math.floor(tr.shade * 3) % 3];
  // tırtıklı yaprak kümesi: dairenin kenarına küçük kabarcıklar
  const clump = (cx, cy, r, col) => {
    x.fillStyle = col;
    x.beginPath(); x.arc(cx, cy, r * 0.82, 0, TAU); x.fill();
    const n = 9 + Math.floor(r / 6);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + rng() * 0.3, br = r * (0.22 + rng() * 0.12);
      x.beginPath(); x.arc(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.72, br, 0, TAU); x.fill();
    }
  };
  // kümelerin yerleri: ağacın kendi kabarcıkları + çevrede birkaç tane
  const spots = [[0, 0.1, 0.62]];
  for (const b of tr.blobs) spots.push([Math.cos(b.a) * b.d * 1.4, Math.sin(b.a) * b.d * 0.9, b.s * 0.85]);
  for (let i = 0; i < 4; i++) { const a = (i / 4) * TAU + rng(); spots.push([Math.cos(a) * 0.5, Math.sin(a) * 0.35 + 0.05, 0.38 + rng() * 0.1]); }
  // 1) en koyu taban ve alttaki gölge
  for (const [dx, dy, r] of spots) clump(dx * s, dy * s + s * 0.08, r * s, deep);
  // 2) ana yaprak kütlesi
  for (const [dx, dy, r] of spots) clump(dx * s, dy * s, r * s * 0.94, dark);
  // 3) güneş alan üst yüzler (sol üstten ışık)
  for (const [dx, dy, r] of spots) clump(dx * s - r * s * 0.16, dy * s - r * s * 0.2, r * s * 0.7, mid);
  for (const [dx, dy, r] of spots) if (dy < 0.25) clump(dx * s - r * s * 0.3, dy * s - r * s * 0.38, r * s * 0.4, lite);
  // 4) yaprak dokusu: küçük açık ve koyu lekeler (sadece yaprakların üstüne, dışarı taşmaz)
  x.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 46; i++) {
    const a = rng() * TAU, d = Math.sqrt(rng()) * s * 0.85, px = Math.cos(a) * d, py = Math.sin(a) * d * 0.75;
    const up = py < -s * 0.05;
    x.fillStyle = up && rng() < 0.6 ? top : (rng() < 0.5 ? deep : dark);
    x.globalAlpha = 0.55;
    x.beginPath(); x.ellipse(px, py, 2 + rng() * 2.2, 1.2 + rng() * 1.2, rng() * TAU, 0, TAU); x.fill();
  }
  x.globalAlpha = 1;
  // 5) en üstte parlak birkaç yaprak
  for (let i = 0; i < 6; i++) {
    const px = -s * 0.45 + rng() * s * 0.6, py = -s * 0.55 + rng() * s * 0.35;
    x.fillStyle = top;
    x.beginPath(); x.ellipse(px, py, 3 + rng() * 2, 1.8, -0.5 + rng() * 0.4, 0, TAU); x.fill();
  }
  x.globalCompositeOperation = 'source-over';
  // 6) az sayıda ağaçta elma
  if (tr.shade > 0.9) {
    for (let i = 0; i < 6; i++) {
      const a = rng() * TAU, d = s * (0.3 + rng() * 0.45), px = Math.cos(a) * d, py = Math.sin(a) * d * 0.7;
      x.fillStyle = '#b8302a'; x.beginPath(); x.arc(px, py, 2.6, 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,230,210,.7)'; x.beginPath(); x.arc(px - 0.8, py - 0.9, 0.8, 0, TAU); x.fill();
    }
  }
  c = { cv, w: W, h: H, ox: W / 2, oy: H / 2 + s * 0.05 };
  if (V34_LEAF.size > 400) V34_LEAF.delete(V34_LEAF.keys().next().value);
  V34_LEAF.set(key, c);
  return c;
}

/* ---------- Kamp ---------- */
const V34_TENTS = [[-125, -40, '#a88a58'], [110, -78, '#7f6c8e'], [70, 125, '#8f6d4e']];
const V34_LOGS = [[-58, 42, 0.45], [58, 32, -0.4], [0, -60, 0]];
// Zemin katmanı: toprak, taş çember, ateş ışığı (sıralanmaz, en altta)
function v34CampGround(ctx, t) {
  const R = CONFIG.CAMP_RADIUS;
  const g = ctx.createRadialGradient(0, 0, 20, 0, 0, R);
  g.addColorStop(0, 'rgba(126,98,64,.45)'); g.addColorStop(0.75, 'rgba(126,98,64,.28)'); g.addColorStop(1, 'rgba(126,98,64,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  // ateşin etrafında kararmış toprak
  ctx.fillStyle = 'rgba(40,26,16,.35)';
  ctx.beginPath(); ctx.ellipse(0, 4, 30, 18, 0, 0, TAU); ctx.fill();
}
// Sıralanan kamp nesneleri: çadırlar, kütükler, ateş ve çember taşları
function v34CampProps(list) {
  for (const [x, y, c] of V34_TENTS) list.push({ y, k: 'tent', o: { x, y, c } });
  for (const [x, y, a] of V34_LOGS) list.push({ y: y + 4, k: 'log', o: { x, y, a } });
  list.push({ y: 6, k: 'fire', o: null });
  const R = CONFIG.CAMP_RADIUS;
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * TAU, j = Math.sin(i * 12.9898) * 0.5 + 0.5;
    list.push({ y: Math.sin(a) * R, k: 'stone', o: { x: Math.cos(a) * R, y: Math.sin(a) * R, r: 5 + j * 4, j } });
  }
}
function v34Stone(ctx, s) {
  const h = s.r * (0.9 + s.j * 0.6);
  v34Shadow(ctx, s.x, s.y, s.r * 1.1, s.r * 0.4, h, 0.28);
  ctx.fillStyle = '#6f7266';
  ctx.beginPath(); ctx.ellipse(s.x, s.y - h * 0.45, s.r, h * 0.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#9a9c8d';
  ctx.beginPath(); ctx.ellipse(s.x - s.r * 0.15, s.y - h * 0.7, s.r * 0.75, h * 0.32, 0, 0, TAU); ctx.fill();
}
function v34Tent(ctx, o) {
  const { x, y, c } = o, w = 66, h = 48, d = 34;
  v34Shadow(ctx, x + 6, y - 6, w * 0.62, d * 0.55, h, 0.3);
  ctx.save(); ctx.translate(x, y);
  const p = G.player;   // arkasındaki karakter görünsün
  if (p && !p.dead && p.y + 10 < y && p.y > y - h - d - 30 && Math.abs(p.x - x) < w * 0.6) ctx.globalAlpha = 0.45;
  // arka tarafa doğru uzanan iki çatı yüzü
  ctx.fillStyle = shadeColor(c, -0.12);
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(0, -h); ctx.lineTo(0, -h - d); ctx.lineTo(-w / 2, -d); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shadeColor(c, -0.32);
  ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(0, -h); ctx.lineTo(0, -h - d); ctx.lineTo(w / 2, -d); ctx.closePath(); ctx.fill();
  // dikiş çizgileri
  ctx.strokeStyle = 'rgba(30,20,10,.25)'; ctx.lineWidth = 1;
  for (const k of [0.33, 0.66]) {
    ctx.beginPath(); ctx.moveTo(-w / 2 * k, -h * (1 - k)); ctx.lineTo(-w / 2 * k, -h * (1 - k) - d); ctx.stroke();
  }
  // ön üçgen ve kapı
  const g = ctx.createLinearGradient(0, -h, 0, 0);
  g.addColorStop(0, shadeColor(c, 0.12)); g.addColorStop(1, c);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(0, -h); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2a1d12';
  ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(0, -h * 0.55); ctx.lineTo(11, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shadeColor(c, -0.2);
  ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(0, -h * 0.55); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fill();
  // direk ucu ve ipler
  ctx.strokeStyle = '#4a3422'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(0, -h - 7); ctx.stroke();
  ctx.strokeStyle = 'rgba(220,200,160,.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2 - 10, 6); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2 + 10, 6); ctx.stroke();
  ctx.restore();
}
function v34Log(ctx, o) {
  const { x, y, a } = o, L = 40, r = 6.5;
  v34Shadow(ctx, x, y + 2, L * 0.55, 5, 8, 0.28);
  ctx.save(); ctx.translate(x, y);
  const cx = Math.cos(a) * L / 2, cy = Math.sin(a) * L / 2 * 0.5;
  ctx.strokeStyle = '#5a3d27'; ctx.lineWidth = r * 2; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(-cx, -cy - r); ctx.lineTo(cx, cy - r); ctx.stroke();
  ctx.strokeStyle = '#7c5737'; ctx.lineWidth = r * 0.8;
  ctx.beginPath(); ctx.moveTo(-cx, -cy - r * 1.45); ctx.lineTo(cx, cy - r * 1.45); ctx.stroke();
  ctx.fillStyle = '#c99a62';
  ctx.beginPath(); ctx.ellipse(cx, cy - r, r * 0.55, r, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#8a6440'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(cx, cy - r, r * 0.28, r * 0.5, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}
function v34Fire(ctx, t) {
  const fl = 0.85 + 0.15 * Math.sin(t * 9) + 0.08 * Math.sin(t * 23);
  // ocak taşları
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU;
    const x = Math.cos(a) * 22, y = Math.sin(a) * 12 + 2;
    ctx.fillStyle = '#5b5c53';
    ctx.beginPath(); ctx.ellipse(x, y - 3, 6, 4.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#85867a';
    ctx.beginPath(); ctx.ellipse(x - 1, y - 5, 4, 2.2, 0, 0, TAU); ctx.fill();
  }
  // odunlar
  ctx.strokeStyle = '#3f2919'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-15, 2); ctx.lineTo(13, -6); ctx.moveTo(-13, -6); ctx.lineTo(15, 2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,120,40,.55)';
  ctx.beginPath(); ctx.ellipse(0, -1, 10, 4, 0, 0, TAU); ctx.fill();
  // alevler: yukarı uzanan damla biçimleri
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const flame = (ox, w, hh, col, ph) => {
    const k = hh * fl * (0.9 + 0.12 * Math.sin(t * 11 + ph)), sw = Math.sin(t * 7 + ph) * 2.5;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(ox - w, -2);
    ctx.quadraticCurveTo(ox - w * 1.1, -k * 0.5, ox + sw, -k);
    ctx.quadraticCurveTo(ox + w * 1.1, -k * 0.5, ox + w, -2);
    ctx.quadraticCurveTo(ox, 3, ox - w, -2);
    ctx.fill();
  };
  flame(-5, 7, 26, 'rgba(217,72,42,.85)', 0);
  flame(5, 7, 24, 'rgba(217,72,42,.85)', 2);
  flame(0, 8, 34, 'rgba(243,154,50,.85)', 1);
  flame(0, 4.5, 22, 'rgba(255,224,138,.9)', 3);
  ctx.restore();
  if (!G.panel && Math.random() < 0.35) {
    G.particles.push({ x: rand(-6, 6), y: rand(-26, -14), vx: rand(-12, 12), vy: rand(-55, -28), life: 1.2, max: 1.2, size: rand(1.5, 3), color: '#ffb347', glow: true, rise: 10 });
  }
}
// Ateşin ışığı nesnelerin üstüne vurur (sıralamadan sonra çizilir)
function v34FireGlow(ctx, t) {
  const fl = 0.85 + 0.15 * Math.sin(t * 9) + 0.08 * Math.sin(t * 23);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(0, -14, 4, 0, -14, 190 * fl);
  glow.addColorStop(0, 'rgba(255,170,80,.34)');
  glow.addColorStop(0.35, 'rgba(255,120,50,.1)');
  glow.addColorStop(1, 'rgba(255,120,50,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, -14, 190 * fl, 0, TAU); ctx.fill();
  ctx.restore();
}

/* ---------- Okçu: dört yönlü, yürüyen, yay geren karakter ----------
   Orijin karakterin ayakları arasındaki nokta. Boy ~46 birim. */
const V34_SKIN = '#e8c39a', V34_SKIN_D = '#c99a72', V34_HAIR = '#4a3020';
function v34Dir(a) {
  const c = Math.cos(a), s = Math.sin(a);
  if (Math.abs(s) > Math.abs(c) * 0.85) return s > 0 ? 'down' : 'up';
  return 'side';
}
// Kahramanın yönü: hareket ediyorsa yürüdüğü yön, saldırırken nişan aldığı yön
function v34HeroAngle(p, t) {
  const shooting = t - (p.bowPull || -9) < 0.45 || p.aiming || (typeof input !== 'undefined' && input.attackHeld && p === G.player);
  if (!shooting && (p.moveVec && (p.moveVec.x || p.moveVec.y))) return Math.atan2(p.moveVec.y, p.moveVec.x);
  return p.facing;
}

function v34Archer(ctx, p, t, tint) {
  const eq = p.equip || PREVIEW_EQUIP, c = p.cls;
  const moving = !!(p.moveVec && (p.moveVec.x || p.moveVec.y));
  const bodyA = v34HeroAngle(p, t), dir = v34Dir(bodyA);
  const flip = dir === 'side' && Math.cos(bodyA) < 0;
  const ph = p.walk || 0, step = moving ? Math.sin(ph) : 0;
  const bob = moving ? Math.abs(Math.cos(ph)) * -1.8 : Math.sin(t * 2.2) * 0.6;
  const C = col => tint || col;
  const leather = eq.chest ? LOOK.leather[eq.chest.rarity] : null;
  const tunic = eq.chest ? [c.light, c.color, c.dark] : ['#d8cdb4', '#a99c82', '#6e6450'];
  const pants = eq.legs ? LOOK.leather[eq.legs.rarity][1] : '#5c4a36';
  const boots = eq.feet ? LOOK.leather[eq.feet.rarity][1] : '#3b2a1c';
  const gloves = eq.hands ? LOOK.leather[eq.hands.rarity][0] : null;
  const hood = eq.head ? LOOK.leather[eq.head.rarity] : null;
  const rarCol = r => RARITY[r].color;

  ctx.save();
  if (flip) ctx.scale(-1, 1);
  // ---- Bacaklar ----
  const leg = (x, sw, back) => {
    ctx.save(); ctx.translate(x, -14 + bob * 0.3);
    ctx.rotate(dir === 'side' ? sw * 0.5 : 0);
    const lift = dir === 'side' ? 0 : Math.max(0, sw) * 3;
    ctx.fillStyle = C(back ? shadeColor(pants, -0.2) : pants);
    ctx.beginPath(); ctx.roundRect(-3.2, 0, 6.4, 11 - lift, 2.5); ctx.fill();
    ctx.fillStyle = C(back ? shadeColor(boots, -0.2) : boots);
    ctx.beginPath(); ctx.roundRect(-3.6, 9 - lift, dir === 'side' ? 8.5 : 7.2, 5, [2, 3, 2, 2]); ctx.fill();
    if (eq.feet && eq.feet.rarity !== 'common' && !tint) { ctx.fillStyle = rarCol(eq.feet.rarity); ctx.fillRect(-3.6, 9 - lift, 7.2, 1.3); }
    ctx.restore();
  };
  if (dir === 'side') { leg(-1, -step, true); leg(1, step, false); }
  else { leg(-4, step, false); leg(4, -step, false); }

  const by = -14 + bob;   // gövdenin alt kenarı
  // ---- Sadak (arkada) ----
  const quiver = () => {
    ctx.save();
    ctx.translate(dir === 'side' ? -6 : dir === 'up' ? 3 : 6, by - 22);
    ctx.rotate(dir === 'side' ? -0.35 : dir === 'up' ? 0.25 : -0.25);
    ctx.fillStyle = C('#5a3b22');
    ctx.beginPath(); ctx.roundRect(-3.5, 0, 7, 17, 2); ctx.fill();
    ctx.fillStyle = C('#3c2716'); ctx.fillRect(-3.5, 4, 7, 2);
    for (let i = -1; i <= 1; i++) {
      ctx.strokeStyle = C('#d9c7a0'); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(i * 1.8, 0); ctx.lineTo(i * 1.8, -5); ctx.stroke();
      ctx.fillStyle = C(i ? '#c94a3a' : '#e8e0cc');
      ctx.beginPath(); ctx.moveTo(i * 1.8 - 1.5, -3); ctx.lineTo(i * 1.8, -7); ctx.lineTo(i * 1.8 + 1.5, -3); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };
  if (dir !== 'up') quiver();

  // ---- Gövde (tunik) ----
  const tw = dir === 'side' ? 13 : 16;
  const g = ctx.createLinearGradient(-tw / 2, 0, tw / 2, 0);
  g.addColorStop(0, C(tunic[0])); g.addColorStop(0.5, C(tunic[1])); g.addColorStop(1, C(tunic[2]));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-tw / 2 - 1.5, by + 2);
  ctx.lineTo(-tw / 2 + 0.5, by - 17);
  ctx.quadraticCurveTo(0, by - 21, tw / 2 - 0.5, by - 17);
  ctx.lineTo(tw / 2 + 1.5, by + 2);
  ctx.quadraticCurveTo(0, by + 4, -tw / 2 - 1.5, by + 2);
  ctx.fill();
  // deri yelek ve kemer
  if (leather && !tint) {
    ctx.fillStyle = leather[1];
    ctx.beginPath(); ctx.roundRect(-tw / 2 + 1.5, by - 16, tw - 3, 12, 3); ctx.fill();
    if (eq.chest.rarity !== 'common') { ctx.strokeStyle = rarCol(eq.chest.rarity); ctx.lineWidth = 1; ctx.stroke(); }
  }
  ctx.fillStyle = C('#3a2616'); ctx.fillRect(-tw / 2 - 0.5, by - 5, tw + 1, 3);
  ctx.fillStyle = C('#c9a35a'); ctx.fillRect(-1.5, by - 5, 3, 3);
  if (dir === 'up') quiver();

  // ---- Kafa ----
  const hy = by - 27;
  const head = () => {
    if (hood) {
      ctx.fillStyle = C(hood[1]);
      ctx.beginPath(); ctx.ellipse(0, hy + 1, 10.5, 10.5, 0, 0, TAU); ctx.fill();
      // pelerin ucu omuzlara iner
      ctx.beginPath(); ctx.moveTo(-10, hy + 3); ctx.lineTo(-9, hy + 12); ctx.lineTo(9, hy + 12); ctx.lineTo(10, hy + 3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C(hood[0]);
      ctx.beginPath(); ctx.ellipse(-1.5, hy - 2.5, 7.5, 6, -0.2, 0, TAU); ctx.fill();
      if (dir === 'up') {
        ctx.fillStyle = C(shadeColor(hood[1], -0.15));
        ctx.beginPath(); ctx.moveTo(0, hy - 10); ctx.lineTo(-3, hy + 6); ctx.lineTo(3, hy + 6); ctx.closePath(); ctx.fill();
      } else {
        const fx = dir === 'side' ? 4 : 0, fw = dir === 'side' ? 5.5 : 7;
        ctx.fillStyle = C('#1d2414');
        ctx.beginPath(); ctx.ellipse(fx, hy + 2, fw, 6.5, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = C(V34_SKIN);
        ctx.beginPath(); ctx.ellipse(fx + (dir === 'side' ? 1 : 0), hy + 3, fw - 1.8, 4.6, 0, 0, TAU); ctx.fill();
        if (!tint) {
          ctx.fillStyle = '#1b1410';
          if (dir === 'side') { ctx.fillRect(fx + 2.5, hy + 1.5, 1.6, 2); }
          else { ctx.fillRect(-3, hy + 1.8, 1.6, 2); ctx.fillRect(1.4, hy + 1.8, 1.6, 2); }
        }
      }
      if (eq.head.rarity !== 'common' && !tint) {
        ctx.strokeStyle = rarCol(eq.head.rarity); ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.ellipse(0, hy + 1, 10.5, 10.5, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      }
    } else {
      ctx.fillStyle = C(V34_SKIN);
      ctx.beginPath(); ctx.ellipse(0, hy + 1, 8.5, 9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = C(V34_HAIR);
      if (dir === 'up') { ctx.beginPath(); ctx.ellipse(0, hy, 8.8, 9, 0, 0, TAU); ctx.fill(); }
      else {
        ctx.beginPath(); ctx.ellipse(dir === 'side' ? -2 : 0, hy - 3, 9, 6.5, 0, Math.PI, TAU); ctx.fill();
        if (dir === 'side') { ctx.beginPath(); ctx.ellipse(-4, hy, 5, 7, 0, 0, TAU); ctx.fill(); }
        if (!tint) {
          ctx.fillStyle = '#1b1410';
          if (dir === 'side') ctx.fillRect(4, hy + 1, 1.6, 2);
          else { ctx.fillRect(-3.4, hy + 1, 1.6, 2); ctx.fillRect(1.8, hy + 1, 1.6, 2); }
          ctx.fillStyle = V34_SKIN_D; ctx.fillRect(dir === 'side' ? 6 : -0.8, hy + 3.5, 1.6, 1.4);
        }
      }
    }
  };
  ctx.restore();   // yansıtmayı bırak: yay gerçek nişan açısıyla çizilir

  // ---- Kollar ve yay: omuzdan nişan açısına doğru ----
  const sinceShot = t - (p.bowPull || -9);
  const charging = !!(p.aiming || (p === G.player && typeof input !== 'undefined' && input.attackHeld));
  const combat = charging || sinceShot < 0.5;          // atışta: yay nişan yönünde kalkar
  // Rahat duruşta yay elde, ucu yere dönük; atışta nişan açısına döner
  const restA = dir === 'side' ? (flip ? Math.PI - 1.25 : 1.25) : dir === 'up' ? 1.95 : 1.2;
  const aim = combat ? p.facing : restA;
  const sx0 = combat ? 0 : (dir === 'side' ? (flip ? -3 : 3) : dir === 'up' ? -7 : 7), sy0 = by - (combat ? 13 : 12);
  // kiriş gerginliği: basılı tutarken gergin, atıştan hemen sonra boşalır
  const draw = charging ? (sinceShot < 0.12 ? sinceShot / 0.12 : 1) : combat ? clamp(1 - sinceShot / 0.15, 0, 1) * 0.3 : 0;
  const bowBehind = combat ? Math.sin(aim) < -0.35 : dir === 'up';
  const drawBow = () => {
    ctx.save();
    ctx.translate(sx0, sy0);
    ctx.rotate(aim);
    const r = eq.weapon ? eq.weapon.rarity : 'common', bx = combat ? 15 : 8;
    // arka kol (kirişi çeken)
    const nx = bx - 7 - draw * 7;
    ctx.lineCap = 'round';
    if (combat) {
      ctx.strokeStyle = C(tunic[2]); ctx.lineWidth = 4.2;
      ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(nx, 0); ctx.stroke();
    }
    // ön kol (yayı tutan)
    ctx.strokeStyle = C(tunic[1]); ctx.lineWidth = 4.2;
    ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(bx - 1, 0); ctx.stroke();
    ctx.fillStyle = C(gloves || V34_SKIN);
    ctx.beginPath(); ctx.arc(bx - 1, 0, 2.5, 0, TAU); ctx.fill();
    if (combat) { ctx.beginPath(); ctx.arc(nx, 0, 2.3, 0, TAU); ctx.fill(); }
    if (eq.weapon && (r === 'rare' || r === 'legendary') && !tint) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = hexA(RARITY[r].color, r === 'legendary' ? 0.5 + 0.25 * Math.sin(t * 6) : 0.3);
      ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(bx - 8, 0, 16, -1.05, 1.05); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
    if (eq.weapon) {
      ctx.strokeStyle = C(LOOK.bow[r]); ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(bx - 8, 0, 16, -1.05, 1.05); ctx.stroke();
      const ex = bx - 8 + Math.cos(1.05) * 16, ey = Math.sin(1.05) * 16;
      ctx.strokeStyle = C('#efe6d0'); ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(ex, -ey); ctx.lineTo(combat ? nx : ex, 0); ctx.lineTo(ex, ey); ctx.stroke();
      if (charging) {
        ctx.strokeStyle = C('#d9c7a0'); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(nx, 0); ctx.lineTo(bx + 12, 0); ctx.stroke();
        ctx.fillStyle = C('#c8ced4');
        ctx.beginPath(); ctx.moveTo(bx + 15, 0); ctx.lineTo(bx + 10, -2.4); ctx.lineTo(bx + 10, 2.4); ctx.closePath(); ctx.fill();
      }
    }
    ctx.restore();
  };
  if (bowBehind) drawBow();
  ctx.save(); if (flip) ctx.scale(-1, 1); head(); ctx.restore();
  if (!bowBehind) drawBow();
}

// Okçu dışındaki sınıflar şimdilik eski çizimle (ayakları yere bassın diye biraz yukarıda)
function v34Hero(ctx, p, t) {
  if (p.classId !== 'archer') { drawHero(ctx, p, t); return; }
  const moving = !!(p.moveVec && (p.moveVec.x || p.moveVec.y));
  // yere bağlı kısımlar
  v34Shadow(ctx, p.x, p.y + 10, 12, 4.5, 30, 0.34);
  // adım tozu: her adımda (yürüme döngüsünün yarısı) ayağın altından küçük bir bulut
  const stepK = Math.floor((p.walk || 0) / Math.PI);
  if (moving && stepK !== p._v34step && !G.panel) {
    p._v34step = stepK;
    for (let i = 0; i < 3; i++) G.particles.push({ x: p.x + rand(-4, 4), y: p.y + 11, vx: -p.moveVec.x * 18 + rand(-10, 10), vy: rand(-10, -3), life: 0.5, max: 0.5, size: rand(3, 5), color: 'rgba(190,170,130,.45)', round: true });
  }
  ctx.save();
  ctx.translate(p.x, p.y + 10);
  if (p.dash && p.dash.roll) {
    const k = clamp((t - p.dash.start) / p.dash.dur, 0, 1);
    ctx.translate(0, -16); ctx.rotate(k * TAU * (Math.cos(p.facing) < 0 ? -1 : 1)); ctx.translate(0, 16);
  }
  v34Archer(ctx, p, t, null);
  if (t - p.hurtAt < 0.12) { ctx.globalAlpha = 0.65; v34Archer(ctx, p, t, '#ff6a5a'); ctx.globalAlpha = 1; }
  // kolye/yüzük ışıltısı
  const eq = p.equip || PREVIEW_EQUIP;
  const jewel = [eq.neck, eq.ring].filter(Boolean).sort((x, y) => RARITY_ORDER.indexOf(y.rarity) - RARITY_ORDER.indexOf(x.rarity))[0];
  if (jewel) {
    const ang = t * 2.2, jx = Math.cos(ang) * 17, jy = -22 + Math.sin(ang) * 6;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = hexA(RARITY[jewel.rarity].color, 0.45 + 0.35 * Math.sin(t * 5));
    ctx.beginPath(); ctx.arc(jx, jy, 2.2, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  if (t < p.invulnUntil) {
    ctx.globalAlpha = 0.3 + 0.2 * Math.sin(t * 40);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, -22, 18, 28, 0, 0, TAU); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
