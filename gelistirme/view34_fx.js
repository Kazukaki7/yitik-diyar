/* ============ 12-G. VURUŞ HİSSİ VE GECE-GÜNDÜZ (DENEME) ============ */

/* ---- Vuruş hissi ----
   - Kritik vuruşta oyun bir anlığına durur (isabet duraklaması) ve ekran hafifçe sarsılır
   - Ölen düşman parçalara ayrılır: yere düşüp seken parçacıklar ve yükselen bir ruh ışığı
   Sarsıntı ayarlardan kapatılabilir (settings.screenShake). */
function v34OnHit(e, dmg, crit) {
  if (crit) { G.hitStop = Math.max(G.hitStop || 0, 0.055); shake(3.5); }
}
function v34OnDeath(e) {
  const col = e.type === 'slime' ? SLIME_TINTS[e.zi] : e.type === 'skeleton' ? '#efe8d4' : e.type === 'orc' ? '#7f9a4a' : e.type === 'wolf' ? '#9b958e' : '#c9c2b8';
  const fy = typeof v34Feet === 'function' && V34_ENEMY[e.type] ? v34Feet(e) : e.y;
  const n = e.elite ? 22 : 12;
  for (let i = 0; i < n; i++) {
    const a = rand(-Math.PI, 0), sp = rand(60, 190);
    G.particles.push({ x: e.x + rand(-6, 6), y: fy - e.r * rand(0.4, 1.4), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, grav: 520, gy: fy + rand(-6, 6), life: rand(0.7, 1.1), max: 1.1, size: rand(3, 6), color: col, round: e.type === 'slime' });
  }
  for (let i = 0; i < (e.elite ? 10 : 5); i++) {
    G.particles.push({ x: e.x + rand(-8, 8), y: fy - e.r, vx: rand(-15, 15), vy: rand(-50, -30), rise: 20, life: rand(0.8, 1.3), max: 1.3, size: rand(2, 3.5), color: 'rgba(230,245,255,.8)', glow: true, round: true });
  }
  shake(e.elite ? 5 : 2);
}

/* ---- Gece-gündüz döngüsü ----
   Bir gün 20 dakika: 12 dk gündüz, 2 dk akşam, 4 dk gece, 2 dk şafak. Sadece görsel; oyunu etkilemez.
   Saat, oyun içi zamanla ilerler (duraklatınca durur) ve sabah 2. dakikadan başlar. */
const DAY = { len: 1200, day: 720, dusk: 120, night: 240, dawn: 120 };
G.dayClock = 120;
// k: karanlık (0 gündüz, 1 gece ortası), tint: ekrana karışan renk
function v34DayState(c = G.dayClock) {
  const { day, dusk, night } = DAY;
  if (c < day) return { phase: 'Gündüz', dark: 0, warm: 0 };
  if (c < day + dusk) { const k = (c - day) / dusk; return { phase: 'Akşam', dark: k * 0.9, warm: Math.sin(k * Math.PI) }; }
  if (c < day + dusk + night) return { phase: 'Gece', dark: 0.9 + 0.1 * Math.sin(((c - day - dusk) / night) * Math.PI), warm: 0 };
  const k = (c - day - dusk - night) / DAY.dawn;
  return { phase: 'Şafak', dark: (1 - k) * 0.9, warm: Math.sin(k * Math.PI) * 0.8, dawn: true };
}

// Önceden çizilmiş yumuşak ışık lekesi (her karede renk geçişi oluşturmamak için)
const V34_SPR = {};
function v34LightSprite(rgb = '0,0,0') {
  if (V34_SPR[rgb]) return V34_SPR[rgb];
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(0.55, `rgba(${rgb},.55)`); g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return (V34_SPR[rgb] = c);
}
// Işık katmanı: ekranın 1/3 çözünürlüğünde bir tuval; karanlık boyanır, ışıklar oyulur
const V34L = { cv: null, ctx: null, w: 0, h: 0 };
// Karanlık katmanı oyun tuvalinin üstünde ayrı bir tuval: tarayıcı onu grafik işlemcisinde büyütür
function v34LightLayer(show) {
  if (!V34L.cv) {
    V34L.cv = document.createElement('canvas'); V34L.ctx = V34L.cv.getContext('2d');
    V34L.cv.setAttribute('aria-hidden', 'true');
    V34L.cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;display:none';
    const cv = document.getElementById('cv'); cv.after(V34L.cv);
  }
  if (V34L.shown !== show) { V34L.cv.style.display = show ? 'block' : 'none'; V34L.shown = show; }
}
function v34Lights(ctx, W, H) {
  const st = v34DayState();
  if (G.area || st.dark < 0.01) v34LightLayer(false);
  if (G.area) return;                         // zindanların kendi karanlığı var
  if (st.dark < 0.01 && st.warm < 0.01) return;
  // akşam/şafak renk tonu
  if (st.warm > 0.01) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = st.dawn ? `rgba(255,150,170,${0.45 * st.warm})` : `rgba(255,140,60,${0.55 * st.warm})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (st.dark < 0.01) return;
  const S = 3, w = Math.ceil(W / S), h = Math.ceil(H / S);
  v34LightLayer(true);
  if (V34L.w !== w || V34L.h !== h) { V34L.cv.width = V34L.w = w; V34L.cv.height = V34L.h = h; }
  const L = V34L.ctx, z = G.cam.zoom;
  L.globalCompositeOperation = 'source-over';
  L.clearRect(0, 0, w, h);
  L.fillStyle = `rgba(8,14,40,${0.62 * st.dark})`;
  L.fillRect(0, 0, w, h);
  // ışıklar: dünya koordinatından ışık tuvaline
  const toL = (x, y) => [((x - G.cam.x) * z + W / 2) / S, ((y - G.cam.y) * z + H / 2) / S];
  L.globalCompositeOperation = 'destination-out';
  const spr = v34LightSprite();
  const light = (x, y, r, k = 1) => {
    const [lx, ly] = toL(x, y), lr = (r * z) / S;
    if (lx < -lr || ly < -lr || lx > w + lr || ly > h + lr) return;
    L.globalAlpha = Math.min(1, k);
    L.drawImage(spr, lx - lr, ly - lr, lr * 2, lr * 2);
  };
  const t = G.time, fl = 0.92 + 0.08 * Math.sin(t * 9) + 0.04 * Math.sin(t * 23);
  const p = G.player;
  if (p && !p.dead) light(p.x, p.y - 10, 170, 0.75);
  if (REALM.id === 'green') light(0, -10, 330 * fl, 1);
  for (const fi of realmFires()) light(fi.x, fi.y, (fi.r || 120) + 160 * fl, 0.95);
  for (const pr of G.projectiles) light(pr.x, pr.y, pr.kind === 'arrow' ? 40 : 90, pr.kind === 'arrow' ? 0.35 : 0.8);
  for (const zn of G.zones) light(zn.x, zn.y, (zn.radius || 60) * 1.3, 0.7);
  for (const f of G.effects) if (f.x !== undefined && G.time - f.start < f.dur) light(f.x, f.y, (f.radius || 60) * 1.2, 0.6);
  for (const l of G.loot) if (l.it.rarity === 'rare' || l.it.rarity === 'legendary') light(l.x, l.y, 90, 0.7);
  for (const d of dungeonsHere()) if (G.player && dungeonOpen(G.player, d)) light(d.x, d.y, 200, 0.6);
  if (REALM.id === 'green' && LAKE) light(LAKE.x, LAKE.y, 120, 0.25);   // göl ay ışığını yansıtır
  L.globalAlpha = 1;
  ctx.save();
  // ışık kaynaklarının sıcak parıltısı (karanlığın üstüne)
  ctx.globalCompositeOperation = 'lighter';
  const warm = v34LightSprite('255,150,60');
  const glow = (x, y, r, a) => {
    const sx = (x - G.cam.x) * z + W / 2, sy = (y - G.cam.y) * z + H / 2, sr = r * z;
    if (sx < -sr || sy < -sr || sx > W + sr || sy > H + sr) return;
    ctx.globalAlpha = a; ctx.drawImage(warm, sx - sr, sy - sr, sr * 2, sr * 2); ctx.globalAlpha = 1;
  };
  if (REALM.id === 'green') glow(0, -14, 220 * fl, 0.22 * st.dark);
  for (const fi of realmFires()) glow(fi.x, fi.y, 160 * fl, 0.2 * st.dark);
  ctx.restore();
  // gece yıldız ışığı: hafif mavi parıltılar (ateş böcekleri)
  if (st.dark > 0.5 && REALM.id === 'green') {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) {
      const sx = ((i * 137.5 + t * 12 * (i % 3 + 1)) % (W + 40)) - 20, sy = ((i * 89.3 + Math.sin(t * 0.7 + i) * 30) % H + H) % H;
      const k = (0.5 + 0.5 * Math.sin(t * 2.3 + i * 1.7)) * (st.dark - 0.5) * 2;
      ctx.fillStyle = `rgba(210,255,140,${0.55 * k})`;
      ctx.beginPath(); ctx.arc(sx, sy, 1.8, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}

// Gece: can çubukları, isimler ve hasar sayıları karanlığın üstündeki tam çözünürlüklü katmana çizilir
const V34U = { cv: null, ctx: null, on: false };
function v34UiCtx(ctx) {
  const dark = !G.area && v34DayState().dark >= 0.01;
  if (!V34U.cv) {
    V34U.cv = document.createElement('canvas'); V34U.ctx = V34U.cv.getContext('2d');
    V34U.cv.setAttribute('aria-hidden', 'true');
    V34U.cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;display:none';
    v34LightLayer(false);
    V34L.cv.after(V34U.cv);
  }
  if (V34U.on !== dark) { V34U.cv.style.display = dark ? 'block' : 'none'; V34U.on = dark; }
  if (!dark) return ctx;
  const c = V34U.cv, u = V34U.ctx;
  if (c.width !== ctx.canvas.width || c.height !== ctx.canvas.height) { c.width = ctx.canvas.width; c.height = ctx.canvas.height; }
  u.setTransform(1, 0, 0, 1, 0, 0);
  u.clearRect(0, 0, c.width, c.height);
  u.setTransform(ctx.getTransform());
  return u;
}
