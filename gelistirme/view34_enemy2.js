/* ============ 12-I. AYAZ VE KIZIL KUM DÜŞMANLARI (DENEME) ============
   Ortak kalıplar: insansı (yeti, şövalye, büyücü, mumya), ruh (cin, hayalet, ifrit, buz ruhu),
   kurt, örümcek, akrep, akbaba, solucan. Her tür bir kalıba renk ve parça seçimiyle bağlanır. */

const V34_HUMAN = {
  yeti:        { skin: '#e9eef2', skin2: '#c7d1da', face: '#7d8fa3', eye: '#2b9fe0', fur: true, arms: 'claw', bulk: 1.25 },
  frostknight: { skin: '#9fb8cc', skin2: '#6f8aa3', face: '#1c2a38', eye: '#8fe0ff', helm: true, weapon: 'sword', shield: '#7fa6c4', bulk: 1.05, metal: ['#dbe9f5', '#7f9bb5', '#bfe6ff'] },
  frostmage:   { skin: '#cfe6f5', skin2: '#2f4f6f', face: '#cfe6f5', eye: '#2b9fe0', robe: '#2f4f6f', robe2: '#476f93', weapon: 'staff', orb: '170,225,255', hood: true, bulk: 0.9 },
  mummy:       { skin: '#d8c9a4', skin2: '#a9966d', face: '#3a2a18', eye: '#7fff9a', wrap: true, arms: 'reach', bulk: 1.1 },
};
const V34_SPIRIT = {
  frostcin:  { core: '#9ab8ff', body: '#3a4c7a', glow: '150,190,255', eye: '#ffffff', size: 1.0 },
  icesprite: { core: '#e6f6ff', body: '#8fd3ff', glow: '190,235,255', eye: '#1a3050', size: 0.7, orb: true },
  sandghost: { core: '#e8d2a6', body: '#a88a5a', glow: '232,210,166', eye: '#2a1a08', size: 1.0 },
  ifrit:     { core: '#ffd27a', body: '#d9481f', glow: '255,140,50', eye: '#fff6c8', size: 1.05, fire: true },
};
let V34_ENEMY2 = { icewolf: 'wolf', yeti: 'human', frostknight: 'human', frostmage: 'human', mummy: 'human', frostcin: 'spirit', icesprite: 'spirit', sandghost: 'spirit', ifrit: 'spirit', icespider: 'spider', scorpion: 'scorpion', scorpling: 'scorpion', vulture: 'bird', sandworm: 'worm' };
Object.assign(V34_ENEMY, Object.fromEntries(Object.keys(V34_ENEMY2).map(k => [k, 1])));
const V34_TOP2 = { wolf: 2.1, human: 3.2, spirit: 3.0, spider: 1.6, scorpion: 1.7, bird: 3.6, worm: 3.0 };

// v34Enemy içinden çağrılır (eski dört tür dışındakiler)
let v34Enemy2 = function (ctx, e, t, tint, frozen, recoil) {
  const kind = V34_ENEMY2[e.type];
  if (kind === 'wolf') return v34Wolf(ctx, e, t, tint, frozen, 1, recoil, WOLF_ICE);
  if (kind === 'human') return v34Human(ctx, e, t, tint, frozen, recoil, V34_HUMAN[e.type]);
  if (kind === 'spirit') return v34Spirit(ctx, e, t, tint, V34_SPIRIT[e.type]);
  if (kind === 'spider') return v34Spider(ctx, e, t, tint, frozen, recoil);
  if (kind === 'scorpion') return v34Scorpion(ctx, e, t, tint, frozen, recoil);
  if (kind === 'bird') return v34Bird(ctx, e, t, tint, recoil);
  if (kind === 'worm') return v34Worm(ctx, e, t, tint, recoil);
};
const WOLF_ICE = { back: '#a9b9c9', front: '#c9d6e2', top: '#eef4f8', bot: '#a5b5c5', belly: '#ffffff', head: '#dfe8ef', snout: '#f4f8fb', ear: '#8ea3b8', tail: '#c9d6e2', eye: '#7fe0ff' };

/* ---- İnsansı ---- */
function v34Human(ctx, e, t, tint, frozen, recoil, o) {
  const C = c => tint || c, s = e.r / 20, f = v34Face(e);
  const walk = e.moving && !frozen ? Math.sin(t * 7 + e.phase) : 0;
  ctx.save(); ctx.scale(s, s);
  if (f.flip) ctx.scale(-1, 1);
  ctx.translate(-recoil * 5, 0);
  const B = o.bulk || 1;
  // kol/silah hazırlığı ve vuruş
  let armA = -0.4;
  if (e.windupUntil) armA = -0.4 - clamp((t - e.windupStart) / (e.windupUntil - e.windupStart), 0, 1) * 1.8;
  else if (t - e.attackAt < 0.2) armA = -2.2 + ((t - e.attackAt) / 0.2) * 2.6;
  // bacaklar (cüppede gizli)
  if (!o.robe) for (const [lx, k] of [[-6 * B, 1], [6 * B, -1]]) {
    ctx.save(); ctx.translate(lx, -20); ctx.rotate(walk * k * 0.35);
    ctx.fillStyle = C(o.skin2); ctx.beginPath(); ctx.roundRect(-4.5 * B, 0, 9 * B, 19, 3); ctx.fill();
    if (o.wrap) { ctx.strokeStyle = C('#efe3c4'); ctx.lineWidth = 1.2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-4.5 * B, 4 + i * 5); ctx.lineTo(4.5 * B, 6 + i * 5); ctx.stroke(); } }
    ctx.restore();
  }
  // gövde
  const tw = 15 * B;
  if (o.robe) {
    const sw = e.moving && !frozen ? Math.sin(t * 7 + e.phase) * 2 : 0;
    ctx.fillStyle = C(o.robe);
    ctx.beginPath(); ctx.moveTo(-9, -46); ctx.quadraticCurveTo(0, -50, 9, -46); ctx.lineTo(14 + sw, 0); ctx.quadraticCurveTo(0, 3, -14 + sw, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C(o.robe2); ctx.beginPath(); ctx.moveTo(-3, -44); ctx.lineTo(3, -44); ctx.lineTo(4 + sw * 0.5, -1); ctx.lineTo(-4 + sw * 0.5, -1); ctx.closePath(); ctx.fill();
  } else {
    const g = ctx.createLinearGradient(-tw, 0, tw, 0);
    g.addColorStop(0, C(o.metal ? o.metal[0] : o.skin)); g.addColorStop(1, C(o.metal ? o.metal[1] : o.skin2));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-tw, -20); ctx.quadraticCurveTo(-tw * 1.15, -42, -tw * 0.5, -48); ctx.lineTo(tw * 0.5, -48); ctx.quadraticCurveTo(tw * 1.15, -42, tw, -20); ctx.closePath(); ctx.fill();
    if (o.fur && !tint) {   // kürk tutamları
      ctx.fillStyle = o.skin2;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(-tw * 0.7 + i * tw * 0.28, -22 - (i % 2) * 3, 3, 5, 0.3, 0, TAU); ctx.fill(); }
    }
    if (o.wrap && !tint) {  // sargı bezleri
      ctx.strokeStyle = '#efe3c4'; ctx.lineWidth = 1.4;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-tw, -24 - i * 4); ctx.lineTo(tw, -21 - i * 4 - (i % 2) * 2); ctx.stroke(); }
      ctx.strokeStyle = '#8a7650'; ctx.lineWidth = 0.8;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-tw * 0.8, -27 - i * 7); ctx.lineTo(tw * 0.6, -25 - i * 7); ctx.stroke(); }
    }
    if (o.metal) { ctx.fillStyle = C('#3a4a5a'); ctx.fillRect(-tw, -24, tw * 2, 4); }
  }
  // kafa
  const hy = -56;
  ctx.fillStyle = C(o.hood ? o.robe : o.skin);
  ctx.beginPath(); ctx.ellipse(2, hy, 9.5 * (o.fur ? 1.15 : 1), 9.5, 0, 0, TAU); ctx.fill();
  if (o.helm) {
    ctx.fillStyle = C(o.metal[0]); ctx.beginPath(); ctx.ellipse(2, hy - 1, 10, 10, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = C(o.metal[2]); ctx.beginPath(); ctx.moveTo(-4, hy - 9); ctx.lineTo(2, hy - 20); ctx.lineTo(7, hy - 9); ctx.closePath(); ctx.fill();   // buz boynuzu
  }
  if (!f.up) {
    ctx.fillStyle = C(o.face);
    if (o.helm) ctx.fillRect(-2, hy - 1, 11, 3);
    else if (o.hood) { ctx.beginPath(); ctx.ellipse(4, hy + 1, 6, 6.5, 0, 0, TAU); ctx.fill(); }
    else if (o.fur) { ctx.beginPath(); ctx.ellipse(5, hy + 2, 6, 5, 0, 0, TAU); ctx.fill(); }
    if (!tint) {
      ctx.fillStyle = e.aggro ? o.eye : '#1a1a1a';
      if (o.helm) { ctx.fillRect(1, hy - 0.5, 2.4, 1.6); ctx.fillRect(5.5, hy - 0.5, 2.4, 1.6); }
      else { ctx.beginPath(); ctx.arc(f.down ? -0.5 : 3, hy - 0.5, 1.6, 0, TAU); ctx.arc(f.down ? 5.5 : 8, hy - 0.5, 1.6, 0, TAU); ctx.fill(); }
      if (o.wrap) { ctx.strokeStyle = '#efe3c4'; ctx.lineWidth = 1.2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-7, hy - 6 + i * 5); ctx.lineTo(11, hy - 4 + i * 5); ctx.stroke(); } }
    }
  }
  // silah kolu
  ctx.save(); ctx.translate(11 * B, -42); ctx.rotate(armA);
  ctx.strokeStyle = C(o.robe || o.skin2); ctx.lineWidth = 6 * B; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(o.arms === 'reach' ? 16 : 11, 4); ctx.stroke();
  if (o.weapon === 'sword') {
    ctx.fillStyle = C('#3a4a5a'); ctx.fillRect(10, 1, 5, 6);
    ctx.fillStyle = C(o.metal[2]);
    ctx.beginPath(); ctx.moveTo(14, 2); ctx.lineTo(36, 0); ctx.lineTo(40, 3.5); ctx.lineTo(36, 7); ctx.lineTo(14, 6); ctx.closePath(); ctx.fill();
  } else if (o.weapon === 'staff') {
    ctx.strokeStyle = C('#4a6a8a'); ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(-6, 6); ctx.lineTo(30, 2); ctx.stroke();
    if (!tint) {
      ctx.globalCompositeOperation = 'lighter';
      const pull = e.windupUntil ? clamp((t - e.windupStart) / (e.windupUntil - e.windupStart), 0, 1) : 0;
      const R = 7 + pull * 8;
      const g = ctx.createRadialGradient(32, 2, 1, 32, 2, R);
      g.addColorStop(0, `rgba(${o.orb},.95)`); g.addColorStop(1, `rgba(${o.orb},0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(32, 2, R, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
  } else if (o.arms === 'claw') {
    ctx.fillStyle = C('#f4f8fb');
    for (const k of [-3, 0, 3]) { ctx.beginPath(); ctx.moveTo(11, 4 + k); ctx.lineTo(17, 3 + k * 1.3); ctx.lineTo(11, 5.5 + k); ctx.closePath(); ctx.fill(); }
  }
  ctx.restore();
  // kalkan (ön kol)
  if (o.shield) {
    ctx.fillStyle = C(o.shield); ctx.beginPath(); ctx.moveTo(-14, -42); ctx.lineTo(-2, -42); ctx.lineTo(-3, -24); ctx.lineTo(-8, -18); ctx.lineTo(-13, -24); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = C('#dbe9f5'); ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = C('#bfe6ff'); ctx.beginPath(); ctx.arc(-8, -33, 2.2, 0, TAU); ctx.fill();
  } else if (o.fur || o.wrap) {
    ctx.save(); ctx.translate(-10 * B, -42); ctx.rotate(o.wrap ? -0.2 : 0.5 + walk * 0.3);
    ctx.strokeStyle = C(o.skin2); ctx.lineWidth = 6 * B; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(o.wrap ? 15 : 8, 12); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

/* ---- Ruh: yerde değil, havada süzülür; altta kuyruk, yerde gölge ---- */
function v34Spirit(ctx, e, t, tint, o) {
  const C = c => tint || c, s = (e.r / 16) * o.size, f = v34Face(e);
  const hover = -10 - Math.sin(t * 3 + e.phase) * 3;
  if (e.stealth && !tint) ctx.globalAlpha *= 0.18;
  ctx.save(); ctx.scale(s, s); ctx.translate(0, hover);
  if (!tint) {
    ctx.globalCompositeOperation = 'lighter';
    const spr = v34LightSprite(o.glow);
    ctx.globalAlpha *= 0.45; ctx.drawImage(spr, -26, -56, 52, 52); ctx.globalAlpha /= 0.45;
    ctx.globalCompositeOperation = 'source-over';
  }
  if (o.orb) {
    ctx.fillStyle = C(o.body); ctx.beginPath(); ctx.arc(0, -26, 9, 0, TAU); ctx.fill();
    ctx.fillStyle = C(o.core); ctx.beginPath(); ctx.arc(-2, -28, 5, 0, TAU); ctx.fill();
  } else {
    // kuyruk: dalgalanan duman
    const w = Math.sin(t * 5 + e.phase) * 4;
    ctx.fillStyle = C(o.body);
    ctx.beginPath();
    ctx.moveTo(-11, -30); ctx.quadraticCurveTo(-12, -14, -4 + w, -6); ctx.quadraticCurveTo(w * 1.5, 2, 3 + w, -4);
    ctx.quadraticCurveTo(12, -14, 11, -30); ctx.closePath(); ctx.fill();
    // gövde ve kafa
    const g = ctx.createRadialGradient(-3, -40, 2, 0, -34, 16);
    g.addColorStop(0, C(o.core)); g.addColorStop(1, C(o.body));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(0, -34, 12, 13, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -50, 8, 0, TAU); ctx.fill();
    // kollar: hazırlıkta kalkar
    const lift = e.windupUntil ? clamp((t - e.windupStart) / (e.windupUntil - e.windupStart), 0, 1) : 0;
    ctx.strokeStyle = C(o.body); ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, -38); ctx.quadraticCurveTo(-18, -30 - lift * 14, -16, -24 - lift * 22); ctx.moveTo(10, -38); ctx.quadraticCurveTo(18, -30 - lift * 14, 16, -24 - lift * 22); ctx.stroke();
    if (o.fire && !tint) {   // başında alev
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) {
        const k = Math.sin(t * 9 + i * 2) * 2;
        ctx.fillStyle = ['rgba(255,90,30,.8)', 'rgba(255,160,50,.8)', 'rgba(255,230,140,.8)'][i];
        ctx.beginPath(); ctx.moveTo(-6 + i * 2, -54); ctx.quadraticCurveTo(-4 + k, -64 - i * 3, i + k, -70 + i * 4); ctx.quadraticCurveTo(4 + k, -62, 6 - i * 2, -54); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  if (!f.up && !tint) {
    ctx.fillStyle = o.eye;
    const ex = f.down ? 0 : (f.flip ? -2 : 2), ey = o.orb ? -27 : -51;
    ctx.beginPath(); ctx.ellipse(ex - 3, ey, 1.6, 2.2, 0, 0, TAU); ctx.ellipse(ex + 3, ey, 1.6, 2.2, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

/* ---- Buz örümceği: sekiz bacak, karın altında beklerken sadece gözler ---- */
function v34Spider(ctx, e, t, tint, frozen, recoil, P = { body: '#cfe2ef', head: '#a9c7dc', leg: '#5f7a92', mark: '#8fb7d3', eye: '#ff5a6a' }) {
  const C = c => tint || c, s = e.r / 17, f = v34Face(e);
  if (e.stealth && !tint) {   // karın altında: küçük bir tümsek ve iki göz
    ctx.fillStyle = 'rgba(230,240,248,.9)'; ctx.beginPath(); ctx.ellipse(0, -3, e.r, e.r * 0.45, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = '#7fe0ff'; ctx.beginPath(); ctx.arc(-3, -4, 1.4, 0, TAU); ctx.arc(3, -4, 1.4, 0, TAU); ctx.fill();
    return;
  }
  ctx.save(); ctx.scale(s, s);
  if (f.flip) ctx.scale(-1, 1);
  ctx.translate(-recoil * 4, 0);
  const run = e.moving && !frozen;
  ctx.strokeStyle = C(P.leg); ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < 4; i++) for (const side of [-1, 1]) {
    const ph = run ? Math.sin(t * 16 + i * 1.6 + (side > 0 ? Math.PI : 0)) * 3 : 0;
    const bx = -6 + i * 4, kx = bx + side * 0 + (i - 1.5) * 6, ky = -20 + ph;
    ctx.beginPath(); ctx.moveTo(bx, -12); ctx.lineTo(kx * 1.2 + (side > 0 ? 3 : -3), ky); ctx.lineTo(kx * 1.6 + (side > 0 ? 6 : -6), 0); ctx.stroke();
  }
  ctx.fillStyle = C(P.body); ctx.beginPath(); ctx.ellipse(-8, -13, 11, 9, 0, 0, TAU); ctx.fill();     // karın
  ctx.fillStyle = C(P.mark); ctx.beginPath(); ctx.ellipse(-10, -16, 6, 4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C(P.head); ctx.beginPath(); ctx.ellipse(6, -12, 7, 6, 0, 0, TAU); ctx.fill();      // baş
  if (!tint) {
    ctx.fillStyle = e.aggro ? P.eye : '#1c2a38';
    for (const [x, y] of [[9, -14], [11, -12], [8, -11], [12, -15]]) { ctx.beginPath(); ctx.arc(x, y, 1.1, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#e6f6ff'; ctx.beginPath(); ctx.moveTo(11, -8); ctx.lineTo(13, -4); ctx.lineTo(14, -8); ctx.fill();
  }
  ctx.restore();
}

/* ---- Akrep: yandan görünüş, kıskaçlar ve kıvrık kuyruk ---- */
function v34Scorpion(ctx, e, t, tint, frozen, recoil) {
  const C = c => tint || c, small = e.type === 'scorpling', s = e.r / 18, f = v34Face(e);
  const body = small ? '#c08a4a' : '#8a5a2a', dark = small ? '#8a5a2a' : '#5a3818';
  ctx.save(); ctx.scale(s, s);
  if (f.flip) ctx.scale(-1, 1);
  ctx.translate(-recoil * 4, 0);
  const run = e.moving && !frozen;
  ctx.strokeStyle = C(dark); ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const ph = run ? Math.sin(t * 15 + i * 1.4) * 2.5 : 0;
    ctx.beginPath(); ctx.moveTo(-6 + i * 5, -8); ctx.lineTo(-9 + i * 5 + ph, -2); ctx.lineTo(-11 + i * 5 + ph, 0); ctx.stroke();
  }
  // gövde parçaları
  for (let i = 0; i < 4; i++) { ctx.fillStyle = C(i % 2 ? body : shadeColor(body, 0.12)); ctx.beginPath(); ctx.ellipse(-8 + i * 6, -9, 6, 5, 0, 0, TAU); ctx.fill(); }
  // kuyruk: hazırlıkta öne kıvrılır
  const strike = e.windupUntil ? clamp((t - e.windupStart) / (e.windupUntil - e.windupStart), 0, 1) : t - e.attackAt < 0.25 ? 1 : 0;
  const tw = Math.sin(t * 3 + e.phase) * 0.15;
  const pts = [[-12, -10], [-20, -16], [-22, -27], [-16, -36], [-6 + strike * 10, -39 + strike * 4]];
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i]; ctx.fillStyle = C(i % 2 ? body : dark);
    ctx.beginPath(); ctx.arc(x + Math.sin(tw * i) * 2, y, 4.2 - i * 0.4, 0, TAU); ctx.fill();
  }
  const [sx, sy] = pts[pts.length - 1];
  ctx.fillStyle = C('#d9ff7a'); ctx.beginPath(); ctx.moveTo(sx + 2, sy - 2); ctx.lineTo(sx + 8, sy + 3); ctx.lineTo(sx + 1, sy + 3); ctx.closePath(); ctx.fill();
  // kıskaçlar
  const pinch = Math.sin(t * 6 + e.phase) * 0.2;
  for (const [y, k] of [[-12, 1], [-6, -1]]) {
    ctx.save(); ctx.translate(12, y); ctx.rotate(-0.2 * k);
    ctx.strokeStyle = C(body); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(8, -2); ctx.stroke();
    ctx.fillStyle = C(dark); ctx.beginPath(); ctx.ellipse(11, -2, 4, 3, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = C(dark); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(13, -3); ctx.lineTo(18, -6 - pinch * 8); ctx.moveTo(13, -1); ctx.lineTo(18, 1 + pinch * 8); ctx.stroke();
    ctx.restore();
  }
  if (!tint) { ctx.fillStyle = e.aggro ? '#ff4a3a' : '#1a1008'; ctx.beginPath(); ctx.arc(11, -11, 1.2, 0, TAU); ctx.arc(13, -10, 1.2, 0, TAU); ctx.fill(); }
  ctx.restore();
}

/* ---- Akbaba: havada kanat çırpar, saldırırken pike yapar ---- */
function v34Bird(ctx, e, t, tint, recoil) {
  const C = c => tint || c, s = e.r / 14, f = v34Face(e);
  const dive = t - e.attackAt < 0.25 ? 1 - (t - e.attackAt) / 0.25 : e.windupUntil ? 0.5 : 0;
  const alt = 36 - dive * 22 + Math.sin(t * 2 + e.phase) * 3;
  ctx.save(); ctx.scale(s, s); ctx.translate(0, -alt);
  if (f.flip) ctx.scale(-1, 1);
  ctx.translate(-recoil * 4, 0);
  const flap = Math.sin(t * (e.moving ? 12 : 6) + e.phase);
  ctx.fillStyle = C('#3a2c22');
  for (const k of [-1, 1]) {   // kanatlar (arka biraz koyu)
    ctx.save(); ctx.scale(1, k);
    ctx.beginPath(); ctx.moveTo(-2, 0); ctx.quadraticCurveTo(-10, -12 - flap * 8, -22, -6 - flap * 12); ctx.lineTo(-18, -2 - flap * 6); ctx.lineTo(-14, -3 - flap * 4); ctx.quadraticCurveTo(-8, 0, -2, 2); ctx.fill();
    ctx.restore();
    if (k < 0) ctx.fillStyle = C('#4a3a2c');
  }
  ctx.fillStyle = C('#5a4636'); ctx.beginPath(); ctx.ellipse(-2, 0, 11, 5, -0.1, 0, TAU); ctx.fill();
  ctx.fillStyle = C('#d9c8b0'); ctx.beginPath(); ctx.ellipse(8, -2, 3.2, 3, 0, 0, TAU); ctx.fill();          // yaka tüyü
  ctx.fillStyle = C('#c98a7a'); ctx.beginPath(); ctx.arc(12, -3, 3, 0, TAU); ctx.fill();                      // çıplak baş
  ctx.fillStyle = C('#e8d28a'); ctx.beginPath(); ctx.moveTo(14, -4); ctx.lineTo(19, -1); ctx.lineTo(14, -1); ctx.closePath(); ctx.fill();
  if (!tint) { ctx.fillStyle = e.aggro ? '#ff4a3a' : '#1a1008'; ctx.beginPath(); ctx.arc(12.5, -4, 0.9, 0, TAU); ctx.fill(); }
  ctx.restore();
}

/* ---- Kum solucanı: altta tümsek, çıkınca kumdan yükselen halkalı gövde ---- */
function v34Worm(ctx, e, t, tint, recoil) {
  const C = c => tint || c, R = e.r;
  if (e.burrowed) {
    ctx.fillStyle = 'rgba(170,135,80,.9)'; ctx.beginPath(); ctx.ellipse(0, -2, R * 1.2, R * 0.5, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(200,170,110,.8)'; ctx.beginPath(); ctx.ellipse(-R * 0.2, -R * 0.35, R * 0.6, R * 0.2, 0, 0, TAU); ctx.fill();
    return;
  }
  const f = v34Face(e), sway = Math.sin(t * 4 + e.phase) * R * 0.25;
  const rise = 1 - clamp(1 - (t - (e.surfacedAt || -9)) / 0.4, 0, 1);
  // kum halkası
  ctx.fillStyle = C('#a88550'); ctx.beginPath(); ctx.ellipse(0, 0, R * 1.3, R * 0.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C('#6a4e2a'); ctx.beginPath(); ctx.ellipse(0, -1, R * 0.9, R * 0.32, 0, 0, TAU); ctx.fill();
  const lunge = t - e.attackAt < 0.25 ? Math.sin(((t - e.attackAt) / 0.25) * Math.PI) : 0;
  const n = 6;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1), y = -k * R * 2.6 * rise, x = Math.sin(k * 2.2) * sway + (f.flip ? -1 : 1) * k * k * R * (0.5 + lunge * 0.9);
    ctx.fillStyle = C(i % 2 ? '#9a7348' : '#b58a58');
    ctx.beginPath(); ctx.ellipse(x - recoil * 4 * k, y, R * (0.62 - k * 0.12), R * 0.42, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = C('#6e5030'); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, y + R * 0.2, R * (0.5 - k * 0.1), R * 0.15, 0, 0, Math.PI); ctx.stroke();
    if (i === n - 1) {
      ctx.fillStyle = C('#3a1a10'); ctx.beginPath(); ctx.ellipse(x + (f.flip ? -1 : 1) * R * 0.25, y, R * 0.32, R * 0.34, 0, 0, TAU); ctx.fill();
      if (!tint) {
        ctx.fillStyle = '#efe0c0';
        for (let j = 0; j < 6; j++) { const a = (j / 6) * TAU; ctx.beginPath(); ctx.arc(x + (f.flip ? -1 : 1) * R * 0.25 + Math.cos(a) * R * 0.26, y + Math.sin(a) * R * 0.28, 1.4, 0, TAU); ctx.fill(); }
      }
    }
  }
}
