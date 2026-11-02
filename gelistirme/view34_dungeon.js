/* ============ 12-K. ZİNDANLAR (DENEME) ============
   Oda zemini taş döşeme, kuzey duvarlarının ön yüzü görünür (tuğla), üst kenardaki meşaleler duvara asılı,
   alt kenardakiler ayaklı mangal. Zindan düşmanları ve bosslar ortak kalıplara bağlanır. */

// ---- Zindan düşmanları ve bosslar ----
Object.assign(V34_ENEMY2, { rabid: 'wolf', shadow: 'wolf', pup: 'wolf', cub: 'wolf', boru: 'wolf', akpence: 'wolf',
  knight: 'human', hrimgar: 'human', frostqueen: 'human', queenmirror: 'human', mummyking: 'human',
  eye: 'spirit', voidlord: 'spirit', ifritlord: 'spirit', bug: 'spider', scorpqueen: 'scorpion', sandwyrm: 'worm' });
Object.assign(V34_ENEMY, Object.fromEntries(Object.keys(V34_ENEMY2).map(k => [k, 1])));
const mkWolf = (top, bot, belly, head, snout, ear, eye) => ({ back: shadeColor(bot, -0.2), front: bot, top, bot, belly, head, snout, ear, tail: bot, eye });
const V34_WOLF_PAL = {
  icewolf: WOLF_ICE,
  rabid: mkWolf('#8e5a40', '#5a3424', '#c9a28a', '#86523a', '#c9a28a', '#4e2c1e', '#ff3a2a'),
  shadow: mkWolf('#3a3448', '#1c1824', '#5a5070', '#332c40', '#5a5070', '#15121c', '#b98aff'),
  pup: WOLF_GREY,
  cub: mkWolf('#8a6a4a', '#5a4030', '#b8946c', '#7a5a3e', '#c4a27c', '#4a3424', '#2a1a10'),
  boru: mkWolf('#2a2423', '#120e0d', '#4a3e3a', '#2a2423', '#4a3e3a', '#0e0c0b', '#ff2a1a'),
  akpence: mkWolf('#f4f6f8', '#c9d2da', '#ffffff', '#eef2f5', '#ffffff', '#b9c4ce', '#2a3a4a'),
};
Object.assign(V34_HUMAN, {
  knight:      { skin: '#4a4458', skin2: '#2a2534', face: '#0e0c12', eye: '#b98aff', helm: true, weapon: 'sword', shield: '#3a3448', bulk: 1.05, metal: ['#5a5470', '#2a2534', '#b98aff'] },
  hrimgar:     { skin: '#a9cfe6', skin2: '#6f9cbf', face: '#3a6a8e', eye: '#e6f6ff', fur: true, arms: 'claw', bulk: 1.35 },
  frostqueen:  { skin: '#e6f2fa', skin2: '#3a5a8a', face: '#e6f2fa', eye: '#8fe0ff', robe: '#3a5a8a', robe2: '#8fb8e6', weapon: 'staff', orb: '190,235,255', bulk: 1, crown: '#dff4ff' },
  queenmirror: { skin: '#e6f2fa', skin2: '#3a5a8a', face: '#e6f2fa', eye: '#8fe0ff', robe: '#3a5a8a', robe2: '#8fb8e6', weapon: 'staff', orb: '190,235,255', bulk: 1, crown: '#dff4ff' },
  mummyking:   { skin: '#d8c9a4', skin2: '#a9966d', face: '#3a2a18', eye: '#7fff9a', wrap: true, arms: 'reach', bulk: 1.15, crown: '#f0c75e' },
});
Object.assign(V34_SPIRIT, {
  eye:       { core: '#e6d6ff', body: '#5a3a8a', glow: '185,138,255', eye: '#ff3a6a', size: 1.0, orb: true },
  voidlord:  { core: '#b98aff', body: '#2a1a44', glow: '150,90,255', eye: '#ff3a6a', size: 1.0 },
  ifritlord: { core: '#fff0a0', body: '#c0301a', glow: '255,120,40', eye: '#ffffff', size: 1.0, fire: true },
});
// kurt ve insansı kalıpların renk/parça seçimi
const _v34Enemy2 = v34Enemy2;
v34Enemy2 = function (ctx, e, t, tint, frozen, recoil) {
  const kind = V34_ENEMY2[e.type];
  if (e.stealth && kind === 'wolf' && !tint) ctx.globalAlpha *= 0.16;    // gölge kurt görünmezken
  if (kind === 'wolf') return v34Wolf(ctx, e, t, tint, frozen, 1, recoil, V34_WOLF_PAL[e.type] || WOLF_GREY);
  if (e.type === 'bug') return v34Spider(ctx, e, t, tint, frozen, recoil, { body: '#3a2a54', head: '#5a3a8a', leg: '#2a1a44', mark: '#b98aff', eye: '#ff3a6a' });
  if (kind === 'human' && V34_HUMAN[e.type].crown) {
    v34Human(ctx, e, t, tint, frozen, recoil, V34_HUMAN[e.type]);
    const s = e.r / 20, f = v34Face(e);   // taç
    ctx.save(); ctx.scale(s * (f.flip ? -1 : 1), s);
    ctx.fillStyle = tint || V34_HUMAN[e.type].crown;
    ctx.beginPath(); ctx.moveTo(-6, -64); for (let i = 0; i <= 4; i++) ctx.lineTo(-6 + i * 4, i % 2 ? -68 : -74); ctx.lineTo(10, -64); ctx.closePath(); ctx.fill();
    ctx.restore();
    return;
  }
  return _v34Enemy2(ctx, e, t, tint, frozen, recoil);
};

// ---- Oda görünümü ----
const V34D = { faceH: 34 };
function v34InFloor(A, x, y) { for (const f of A.floors) if (x >= f.x && x <= f.x + f.w && y >= f.y && y <= f.y + f.h) return true; return false; }
function v34PrepArea(A) {
  if (A.v34) return A.v34;
  const step = 16, north = [], south = [];
  for (const f of A.floors) {
    let run = null;
    for (let x = f.x; x <= f.x + f.w; x += step) {
      const open = !v34InFloor(A, x + step / 2, f.y - 6);
      if (open && !run) run = { x0: x, y: f.y };
      if (run && (!open || x + step > f.x + f.w)) { run.x1 = Math.min(f.x + f.w, open ? x + step : x); north.push(run); run = null; }
    }
    let s2 = null;
    for (let x = f.x; x <= f.x + f.w; x += step) {
      const open = !v34InFloor(A, x + step / 2, f.y + f.h + 6);
      if (open && !s2) s2 = { x0: x, y: f.y + f.h };
      if (s2 && (!open || x + step > f.x + f.w)) { s2.x1 = Math.min(f.x + f.w, open ? x + step : x); south.push(s2); s2 = null; }
    }
  }
  const rng = mulberry32(7171);
  const cracks = [];
  for (const f of A.floors) for (let i = 0; i < Math.floor((f.w * f.h) / 26000); i++) cracks.push({ x: f.x + rng() * f.w, y: f.y + rng() * f.h, a: rng() * TAU, l: 10 + rng() * 22, moss: rng() < 0.35 });
  return (A.v34 = { north, south, cracks });
}
function v34DrawArea(ctx, t, vx0, vy0, vx1, vy1) {
  const A = G.area, th = A.def.theme, V = v34PrepArea(A), H = V34D.faceH;
  ctx.fillStyle = shadeColor(th.wall, -0.25);
  for (const f of A.floors) ctx.fillRect(f.x - 22, f.y - 22 - H, f.w + 44, f.h + 44 + H);
  ctx.fillStyle = th.floor;
  for (const f of A.floors) ctx.fillRect(f.x, f.y, f.w, f.h);
  // taş döşeme: kaydırmalı sıralar, her taşın tonu biraz farklı
  ctx.save();
  ctx.beginPath(); for (const f of A.floors) ctx.rect(f.x, f.y, f.w, f.h); ctx.clip();
  const s = 64, x0 = Math.floor(vx0 / s) * s, y0 = Math.floor(vy0 / s) * s;
  for (let y = y0; y < vy1; y += s) {
    const off = (Math.floor(y / s) & 1) * (s / 2);
    for (let x = x0 - s; x < vx1 + s; x += s) {
      const h = Math.sin((x + off) * 12.9898 + y * 78.233) * 43758.5453, k = h - Math.floor(h);
      ctx.fillStyle = k < 0.5 ? `rgba(0,0,0,${0.04 + k * 0.08})` : `rgba(255,255,255,${(k - 0.5) * 0.08})`;
      ctx.fillRect(x + off + 2, y + 2, s - 4, s - 4);
    }
    ctx.strokeStyle = th.grid; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(vx0, y); ctx.lineTo(vx1, y); ctx.stroke();
    for (let x = x0 - s; x < vx1 + s; x += s) { ctx.beginPath(); ctx.moveTo(x + off, y); ctx.lineTo(x + off, y + s); ctx.stroke(); }
  }
  // çatlaklar ve yosun
  ctx.lineCap = 'round';
  for (const c of V.cracks) {
    if (c.x < vx0 - 40 || c.x > vx1 + 40 || c.y < vy0 - 40 || c.y > vy1 + 40) continue;
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + Math.cos(c.a) * c.l * 0.5, c.y + Math.sin(c.a) * c.l * 0.5); ctx.lineTo(c.x + Math.cos(c.a + 0.5) * c.l, c.y + Math.sin(c.a + 0.5) * c.l); ctx.stroke();
    if (c.moss) { ctx.fillStyle = 'rgba(90,120,70,.22)'; ctx.beginPath(); ctx.ellipse(c.x, c.y, 10, 5, c.a, 0, TAU); ctx.fill(); }
  }
  // kuzey duvarının dibine düşen gölge
  for (const n of V.north) {
    const g = ctx.createLinearGradient(0, n.y, 0, n.y + 26);
    g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(n.x0, n.y, n.x1 - n.x0, 26);
  }
  ctx.restore();
  // kuzey duvarlarının ön yüzü: tuğla sıraları
  const face = shadeColor(th.wall, 0.12), brick = shadeColor(th.wall, -0.15);
  for (const n of V.north) {
    if (n.x1 < vx0 - 30 || n.x0 > vx1 + 30 || n.y < vy0 - 60 || n.y - H > vy1) continue;
    ctx.fillStyle = face; ctx.fillRect(n.x0, n.y - H, n.x1 - n.x0, H);
    ctx.strokeStyle = brick; ctx.lineWidth = 1.5;
    for (let r = 0; r < 3; r++) {
      const yy = n.y - H + r * (H / 3);
      ctx.beginPath(); ctx.moveTo(n.x0, yy); ctx.lineTo(n.x1, yy); ctx.stroke();
      for (let x = n.x0 + (r & 1) * 14; x < n.x1; x += 28) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x, yy + H / 3); ctx.stroke(); }
    }
    ctx.fillStyle = shadeColor(th.wall, 0.3); ctx.fillRect(n.x0, n.y - H - 3, n.x1 - n.x0, 3);   // üst kenar
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(n.x0, n.y - 3, n.x1 - n.x0, 3);
  }
  // güney kenarında duvarın üstü görünür (ince ışıklı kenar)
  ctx.fillStyle = shadeColor(th.wall, 0.22);
  for (const sN of V.south) ctx.fillRect(sN.x0, sN.y, sN.x1 - sN.x0, 3);
  // kemikler / kırık taşlar (yerde)
  ctx.strokeStyle = th.decor; ctx.lineWidth = 2.5;
  for (const d of A.decor) {
    if (d.x < vx0 || d.x > vx1 || d.y < vy0 || d.y > vy1) continue;
    ctx.globalAlpha = 0.6;
    ctx.beginPath(); ctx.moveTo(d.x - Math.cos(d.a) * 9 * d.s, d.y - Math.sin(d.a) * 4 * d.s); ctx.lineTo(d.x + Math.cos(d.a) * 9 * d.s, d.y + Math.sin(d.a) * 4 * d.s); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(d.x + Math.cos(d.a) * 9 * d.s, d.y + Math.sin(d.a) * 4 * d.s - 1, 3, 2.4, 0, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // duvar meşaleleri (üst kenardakiler) ve ışıkları
  for (const tc of A.torches) {
    if (tc.x < vx0 - 160 || tc.x > vx1 + 160 || tc.y < vy0 - 160 || tc.y > vy1 + 160) continue;
    const fl = 0.85 + 0.15 * Math.sin(t * 9 + tc.x);
    const wallTorch = V.north.some(n => tc.x >= n.x0 && tc.x <= n.x1 && Math.abs(tc.y - 10 - n.y) < 4);
    const lx = tc.x, ly = wallTorch ? tc.y - 10 - H * 0.55 : tc.y - 26;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.42; const spr = v34LightSprite(th.torch); ctx.drawImage(spr, lx - 160 * fl, ly - 160 * fl + 20, 320 * fl, 320 * fl);
    ctx.restore();
    if (wallTorch) {
      ctx.fillStyle = '#3a2a1c'; ctx.fillRect(lx - 2, ly, 4, 12);
      ctx.fillStyle = '#5a4a3a'; ctx.fillRect(lx - 5, ly - 2, 10, 4);
      v34Flame(ctx, lx, ly - 1, 1, t + tc.x, th.torch);
    }
  }
  for (const ic of A.ice || []) drawIce(ctx, ic);
  for (const pa of A.patches || []) if (pa.x > vx0 - 200 && pa.x < vx1 + 200 && pa.y > vy0 - 200 && pa.y < vy1 + 200) drawPatch(ctx, pa, t);
  for (const tr of A.traps || []) if (tr.x > vx0 - 50 && tr.x < vx1 + 50 && tr.y > vy0 - 50 && tr.y < vy1 + 50) drawTrap(ctx, tr, t);
  drawPortal(ctx, A.entryPortal.x, A.entryPortal.y, t, '150,200,255');
  if (A.exitPortal) drawPortal(ctx, A.exitPortal.x, A.exitPortal.y, t, '255,220,140');
}
// ayaklı mangallar (alt kenardaki meşaleler) sıralı listeye girer
function v34AreaProps(list) {
  const A = G.area, V = v34PrepArea(A);
  for (const tc of A.torches) {
    const wallTorch = V.north.some(n => tc.x >= n.x0 && tc.x <= n.x1 && Math.abs(tc.y - 10 - n.y) < 4);
    if (!wallTorch) list.push({ y: tc.y, k: 'brazier', o: tc });
  }
}
function v34Brazier(ctx, tc, t) {
  const x = tc.x, y = tc.y, th = G.area.def.theme;
  v34Shadow(ctx, x, y, 9, 3.5, 26, 0.3);
  ctx.strokeStyle = '#3a3028'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x - 2, y - 18); ctx.moveTo(x + 6, y); ctx.lineTo(x + 2, y - 18); ctx.moveTo(x, y + 1); ctx.lineTo(x, y - 18); ctx.stroke();
  ctx.fillStyle = '#4a4038'; ctx.beginPath(); ctx.ellipse(x, y - 20, 9, 4, 0, 0, Math.PI); ctx.lineTo(x - 9, y - 23); ctx.ellipse(x, y - 23, 9, 3.5, 0, Math.PI, 0, true); ctx.fill();
  ctx.fillStyle = '#ff7a2a'; ctx.beginPath(); ctx.ellipse(x, y - 23, 7, 2.6, 0, 0, TAU); ctx.fill();
  v34Flame(ctx, x, y - 22, 1.3, t + x, th.torch);
}
function v34Flame(ctx, x, y, k, t, rgb) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const f = 0.9 + 0.12 * Math.sin(t * 11);
  const layer = (w, hh, a) => {
    ctx.fillStyle = `rgba(${rgb},${a})`;
    ctx.beginPath(); ctx.moveTo(x - w * k, y);
    ctx.quadraticCurveTo(x - w * k, y - hh * k * f * 0.5, x + Math.sin(t * 7) * 1.5, y - hh * k * f);
    ctx.quadraticCurveTo(x + w * k, y - hh * k * f * 0.5, x + w * k, y); ctx.fill();
  };
  layer(5, 15, 0.7); layer(3.2, 11, 0.85);
  ctx.fillStyle = 'rgba(255,240,190,.9)'; ctx.beginPath(); ctx.ellipse(x, y - 3 * k, 1.8 * k, 3 * k, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
