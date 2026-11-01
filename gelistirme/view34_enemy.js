/* ============ 12-F. 3/4 DÜŞMANLAR (DENEME) ============
   Balçık, kurt, iskelet okçu ve ork ayakta duran figürler olarak çizilir.
   Orijin: yere bastığı nokta (e.x, e.y + ayak payı). tint verilirse tüm parçalar o renkte çizilir (vurulma parlaması). */

const V34_ENEMY = { slime: 1, wolf: 1, skeleton: 1, orc: 1 };
const v34EnemyOn = e => V34.on && V34_ENEMY[e.type];
const v34Feet = e => e.y + e.r * 0.55;                // sıralama ve gölge için ayak hizası
// Figürün kafasının ekrandaki yüksekliği (can çubuğu ve işaretler bunun üstüne)
function v34EnemyTop(e) {
  const sc = e.elite ? 1.45 : 1;
  const h = { slime: e.r * 1.5, wolf: e.r * 2.1, skeleton: e.r * 3.25, orc: e.r * 3.1 }[e.type] || e.r * 2;
  return v34Feet(e) - h;
}

function v34Enemy(ctx, e, t) {
  const frozen = t < e.freezeUntil, stunned = t < e.stunUntil;
  const sc = e.elite ? 1.45 : 1;
  const fx = e.x, fy = v34Feet(e);
  // vuruş hazırlığı uyarısı yerde kalır
  if (e.windupUntil && !e.T.ranged) {
    const k = clamp((t - e.windupStart) / (e.windupUntil - e.windupStart), 0, 1);
    const reach = e.r + 16 + e.T.reach;
    ctx.strokeStyle = `rgba(255,80,60,${0.25 + k * 0.5})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(e.x, e.y, reach * (0.4 + 0.6 * k), reach * (0.4 + 0.6 * k) * 0.8, 0, 0, TAU); ctx.stroke();
    ctx.fillStyle = `rgba(255,80,60,${k * 0.15})`;
    ctx.beginPath(); ctx.ellipse(e.x, e.y, reach, reach * 0.8, 0, 0, TAU); ctx.fill();
  }
  const sh = { slime: 1.05, wolf: 1.25, skeleton: 0.75, orc: 1.0 }[e.type] * e.r;
  v34Shadow(ctx, fx, fy, sh, sh * 0.36, e.r * 2, 0.32);

  // vurulunca geri sekme (görsel): vuruşun tersine kısa bir eğilme
  const hitK = clamp(1 - (t - e.hitAt) / 0.16, 0, 1);
  const recoil = hitK * hitK;
  ctx.save();
  ctx.translate(fx, fy);
  const draw = tint => {
    if (e.type === 'slime') v34Slime(ctx, e, t, tint, frozen, recoil);
    else if (e.type === 'wolf') v34Wolf(ctx, e, t, tint, frozen, sc, recoil);
    else if (e.type === 'skeleton') v34Skeleton(ctx, e, t, tint, frozen, sc, recoil);
    else v34Orc(ctx, e, t, tint, frozen, sc, recoil);
  };
  draw(null);
  if (hitK > 0.3) { ctx.globalAlpha = 0.85 * hitK; draw('#ffffff'); ctx.globalAlpha = 1; }
  if (frozen) { ctx.globalAlpha = 0.45; draw('#bfe9ff'); ctx.globalAlpha = 1; }
  ctx.restore();

  const top = v34EnemyTop(e);
  if (stunned && !frozen) {
    for (let i = 0; i < 3; i++) {
      const a = t * 5 + (i * TAU) / 3;
      ctx.fillStyle = '#ffe48a';
      ctx.beginPath(); ctx.arc(e.x + Math.cos(a) * e.r * 0.7, top - 4 + Math.sin(a) * 3, 2.2, 0, TAU); ctx.fill();
    }
  } else if (t < e.slowUntil && !frozen) {
    ctx.strokeStyle = 'rgba(141,181,255,.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(e.x, fy, e.r * 1.1, e.r * 0.45, 0, 0, TAU); ctx.stroke();
  }
  if (t < (e.markUntil || 0)) {
    ctx.strokeStyle = '#ff4b3e'; ctx.lineWidth = 2.5;
    const y = top - 22, s2 = 9;
    ctx.beginPath(); ctx.arc(e.x, y, s2, 0, TAU); ctx.moveTo(e.x - s2 - 4, y); ctx.lineTo(e.x + s2 + 4, y); ctx.moveTo(e.x, y - s2 - 4); ctx.lineTo(e.x, y + s2 + 4); ctx.stroke();
  }
  if (e.elite) {
    ctx.strokeStyle = `rgba(246,213,146,${0.55 + 0.25 * Math.sin(t * 4)})`; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(e.x, fy, e.r * 1.6, e.r * 0.6, 0, 0, TAU); ctx.stroke();
  }
}

// Bakış: sağ/sol (yandan görünüm) ve aşağı/yukarı için ön/arka işaret
const v34Face = e => ({ flip: Math.cos(e.face) < 0, down: Math.sin(e.face) > 0.55, up: Math.sin(e.face) < -0.55 });

/* ---- Balçık: zıplayarak ilerleyen jöle ---- */
function v34Slime(ctx, e, t, tint, frozen, recoil) {
  const col = SLIME_TINTS[e.zi] || '#7cc56b', C = c => tint || c;
  const r = e.r;
  // zıplama döngüsü: hareket ederken yükselir, yere inince basılır
  const ph = frozen ? 0 : (t * 3.2 + e.phase) % 1;
  const hop = e.moving && !frozen ? Math.sin(ph * Math.PI) : 0;
  const squash = e.moving && !frozen ? (ph < 0.12 || ph > 0.9 ? 0.18 : -hop * 0.12) : Math.sin(t * 4 + e.phase) * 0.05;
  const atk = clamp(1 - (t - e.attackAt) / 0.25, 0, 1);
  const rx = r * (1.05 + squash + atk * 0.15 + recoil * 0.2), ry = r * (0.95 - squash - recoil * 0.15);
  const lift = hop * r * 0.9;
  ctx.save();
  ctx.translate(0, -lift);
  const g = ctx.createRadialGradient(-rx * 0.3, -ry * 1.3, 2, 0, -ry * 0.8, rx * 1.2);
  g.addColorStop(0, C(shadeColor(col, 0.35))); g.addColorStop(0.6, C(col)); g.addColorStop(1, C(shadeColor(col, -0.35)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-rx, 0);
  ctx.bezierCurveTo(-rx, -ry * 1.35, rx, -ry * 1.35, rx, 0);
  ctx.quadraticCurveTo(0, ry * 0.22, -rx, 0);
  ctx.fill();
  if (!tint) {
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.beginPath(); ctx.ellipse(-rx * 0.38, -ry * 0.95, rx * 0.22, ry * 0.14, -0.5, 0, TAU); ctx.fill();
    // iç kabarcıklar
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.beginPath(); ctx.arc(rx * 0.3, -ry * 0.35, r * 0.12, 0, TAU); ctx.arc(-rx * 0.1, -ry * 0.25, r * 0.07, 0, TAU); ctx.fill();
    const f = v34Face(e);
    if (!f.up) {
      const ex = Math.cos(e.face) * rx * 0.3;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(ex - r * 0.28, -ry * 0.62, r * 0.17, r * 0.21, 0, 0, TAU); ctx.ellipse(ex + r * 0.28, -ry * 0.62, r * 0.17, r * 0.21, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = e.aggro ? '#5a1010' : '#152015';
      ctx.beginPath(); ctx.arc(ex - r * 0.25 + Math.cos(e.face) * 1.5, -ry * 0.6, r * 0.09, 0, TAU); ctx.arc(ex + r * 0.31 + Math.cos(e.face) * 1.5, -ry * 0.6, r * 0.09, 0, TAU); ctx.fill();
      if (e.aggro) { ctx.strokeStyle = '#152015'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(ex - r * 0.45, -ry * 0.88); ctx.lineTo(ex - r * 0.12, -ry * 0.78); ctx.moveTo(ex + r * 0.45, -ry * 0.88); ctx.lineTo(ex + r * 0.12, -ry * 0.78); ctx.stroke(); }
    }
  }
  ctx.restore();
}

/* ---- Kurt: yandan görünen, koşan dört ayaklı ---- */
function v34Wolf(ctx, e, t, tint, frozen, sc, recoil) {
  const C = c => tint || c, r = e.r, f = v34Face(e);   // e.r elitte zaten büyük
  ctx.save();
  if (f.flip) ctx.scale(-1, 1);
  let lunge = 0;
  if (t - e.attackAt < 0.18) lunge = Math.sin(((t - e.attackAt) / 0.18) * Math.PI) * 10;
  ctx.translate(lunge - recoil * 6, 0);
  const run = e.moving && !frozen, ph = t * 14 + e.phase;
  const legs = (back) => {
    const pairs = [[-r * 0.75, 0], [r * 0.6, Math.PI]];
    for (const [lx, off] of pairs) {
      const sw = run ? Math.sin(ph + off + (back ? 0.9 : 0)) * 0.7 : 0;
      ctx.save(); ctx.translate(lx + (back ? -2 : 2), -r * 0.75);
      ctx.rotate(sw);
      ctx.strokeStyle = C(back ? '#55514c' : '#6e6a65'); ctx.lineWidth = r * 0.26; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, r * 0.72); ctx.stroke();
      ctx.restore();
    }
  };
  legs(true);
  const bob = run ? Math.sin(ph * 2) * 1.5 : Math.sin(t * 2 + e.phase) * 0.6;
  // kuyruk
  const tw = Math.sin(t * (run ? 12 : 3) + e.phase) * 0.3;
  ctx.strokeStyle = C('#6f6b66'); ctx.lineWidth = r * 0.3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 1.0, -r * 1.05 + bob); ctx.quadraticCurveTo(-r * 1.6, -r * (1.2 + tw), -r * 1.85, -r * (0.85 + tw)); ctx.stroke();
  // gövde
  const g = ctx.createLinearGradient(0, -r * 1.5, 0, -r * 0.6);
  g.addColorStop(0, C('#a29e98')); g.addColorStop(1, C('#6c6863'));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(-r * 0.1, -r * 1.02 + bob, r * 1.15, r * 0.48, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C('#c9c2b8');
  ctx.beginPath(); ctx.ellipse(r * 0.25, -r * 0.85 + bob, r * 0.55, r * 0.25, 0, 0, TAU); ctx.fill();
  legs(false);
  // kafa
  const hx = r * 1.0, hy = -r * 1.3 + bob + (e.windupUntil ? r * 0.15 : 0);
  ctx.fillStyle = C('#9a968f');
  ctx.beginPath(); ctx.ellipse(hx, hy, r * 0.5, r * 0.42, -0.15, 0, TAU); ctx.fill();
  ctx.fillStyle = C('#b9b2a8');
  ctx.beginPath(); ctx.ellipse(hx + r * 0.45, hy + r * 0.12, r * 0.36, r * 0.2, 0.1, 0, TAU); ctx.fill();
  ctx.fillStyle = C('#2a2624');
  ctx.beginPath(); ctx.arc(hx + r * 0.8, hy + r * 0.08, r * 0.08, 0, TAU); ctx.fill();
  // kulaklar
  ctx.fillStyle = C('#5d5954');
  ctx.beginPath(); ctx.moveTo(hx - r * 0.25, hy - r * 0.25); ctx.lineTo(hx - r * 0.18, hy - r * 0.75); ctx.lineTo(hx + r * 0.08, hy - r * 0.3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(hx + 0, hy - r * 0.3); ctx.lineTo(hx + r * 0.12, hy - r * 0.78); ctx.lineTo(hx + r * 0.32, hy - r * 0.28); ctx.fill();
  if (!tint) {
    ctx.fillStyle = e.aggro ? '#ffcf4a' : '#2a2a2a';
    ctx.beginPath(); ctx.arc(hx + r * 0.2, hy - r * 0.06, r * 0.09, 0, TAU); ctx.fill();
    if (e.aggro || t - e.attackAt < 0.25) {   // hırlarken dişler
      ctx.fillStyle = '#f2ece0';
      ctx.beginPath(); ctx.moveTo(hx + r * 0.5, hy + r * 0.28); ctx.lineTo(hx + r * 0.56, hy + r * 0.42); ctx.lineTo(hx + r * 0.62, hy + r * 0.28); ctx.fill();
    }
  }
  ctx.restore();
}

/* ---- İskelet okçu: kemik insan, yay gerer ---- */
function v34Skeleton(ctx, e, t, tint, frozen, sc, recoil) {
  const C = c => tint || c, s = e.r / 15, f = v34Face(e);
  const walk = e.moving && !frozen ? Math.sin(t * 9 + e.phase) : 0;
  const bone = C('#e6dfcb'), dark = C('#9d9580');
  ctx.save();
  ctx.scale(s, s);
  ctx.rotate(-recoil * 0.15 * (f.flip ? -1 : 1));
  // bacaklar
  ctx.strokeStyle = bone; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
  for (const [lx, k] of [[-3.5, 1], [3.5, -1]]) {
    ctx.beginPath(); ctx.moveTo(lx * 0.6, -17); ctx.lineTo(lx + walk * k * 3, -8); ctx.lineTo(lx + walk * k * 2, 0); ctx.stroke();
  }
  // leğen, omurga, kaburgalar
  ctx.fillStyle = dark; ctx.beginPath(); ctx.ellipse(0, -18, 5.5, 2.5, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = bone; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, -34); ctx.stroke();
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) { const y = -31 + i * 3.4, w = 7 - i * 0.6; ctx.beginPath(); ctx.ellipse(0, y, w, 1.8, 0, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke(); }
  // kafatası
  const hx = f.flip ? -1 : 1;
  ctx.fillStyle = bone;
  ctx.beginPath(); ctx.ellipse(0, -41, 6.5, 6.8, 0, 0, TAU); ctx.fill();
  ctx.fillRect(-3.5, -36, 7, 3.5);
  if (!f.up && !tint) {
    ctx.fillStyle = '#1a1612';
    const ox = f.down ? 0 : hx * 2;
    ctx.beginPath(); ctx.arc(ox - 2.4, -41.5, 1.7, 0, TAU); ctx.arc(ox + 2.4, -41.5, 1.7, 0, TAU); ctx.fill();
    if (e.aggro) { ctx.fillStyle = '#ff5a3c'; ctx.beginPath(); ctx.arc(ox - 2.4, -41.5, 0.7, 0, TAU); ctx.arc(ox + 2.4, -41.5, 0.7, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#3a3226'; ctx.fillRect(ox - 2, -35.5, 4, 1);
  }
  // kollar ve yay: nişan açısına doğru
  let pull = 0;
  if (e.windupUntil) pull = clamp((t - e.windupStart) / (e.windupUntil - e.windupStart), 0, 1);
  ctx.save();
  ctx.translate(0, -29);
  ctx.rotate(e.face);
  ctx.strokeStyle = bone; ctx.lineWidth = 1.8;
  const bx = 11, nx = bx - 5 - pull * 7;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(bx, 0); ctx.moveTo(0, 1); ctx.lineTo(nx, 0.5); ctx.stroke();
  ctx.strokeStyle = C('#8a7458'); ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.arc(bx - 7, 0, 12, -1.0, 1.0); ctx.stroke();
  const ex = bx - 7 + Math.cos(1.0) * 12, ey = Math.sin(1.0) * 12;
  ctx.strokeStyle = C('#ddd5c2'); ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(ex, -ey); ctx.lineTo(pull > 0 ? nx : ex, 0); ctx.lineTo(ex, ey); ctx.stroke();
  if (pull > 0) { ctx.strokeStyle = C('#cfc6af'); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(nx, 0); ctx.lineTo(bx + 9, 0); ctx.stroke(); }
  ctx.restore();
  ctx.restore();
}

/* ---- Ork: iri yeşil savaşçı, sopasını kaldırıp indirir ---- */
function v34Orc(ctx, e, t, tint, frozen, sc, recoil) {
  const C = c => tint || c, s = e.r / 22, f = v34Face(e);
  const walk = e.moving && !frozen ? Math.sin(t * 7 + e.phase) : 0;
  ctx.save();
  ctx.scale(s, s);
  if (f.flip) ctx.scale(-1, 1);
  ctx.translate(-recoil * 5, 0);
  // bacaklar
  for (const [lx, k] of [[-7, 1], [7, -1]]) {
    ctx.fillStyle = C('#4f6a2a');
    ctx.save(); ctx.translate(lx, -22); ctx.rotate(walk * k * 0.35);
    ctx.beginPath(); ctx.roundRect(-4.5, 0, 9, 19, 3); ctx.fill();
    ctx.fillStyle = C('#3b2a1a'); ctx.beginPath(); ctx.roundRect(-5.5, 16, 12, 6, 2); ctx.fill();
    ctx.restore();
  }
  // gövde
  const g = ctx.createLinearGradient(-16, 0, 16, 0);
  g.addColorStop(0, C('#9bb35c')); g.addColorStop(1, C('#56702c'));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(-15, -22); ctx.quadraticCurveTo(-18, -44, -8, -50); ctx.lineTo(8, -50); ctx.quadraticCurveTo(18, -44, 15, -22); ctx.closePath(); ctx.fill();
  // deri kemer ve etek
  ctx.fillStyle = C('#6a4a2c'); ctx.fillRect(-15, -26, 30, 6);
  ctx.fillStyle = C('#5a3d24');
  ctx.beginPath(); ctx.moveTo(-14, -21); ctx.lineTo(-10, -12); ctx.lineTo(-4, -20); ctx.lineTo(2, -12); ctx.lineTo(8, -20); ctx.lineTo(13, -12); ctx.lineTo(14, -21); ctx.closePath(); ctx.fill();
  ctx.fillStyle = C('#c9a35a'); ctx.fillRect(-2.5, -25.5, 5, 5);
  // omuzluk
  ctx.fillStyle = C('#5f6468');
  ctx.beginPath(); ctx.ellipse(-12, -46, 7, 5, -0.3, 0, TAU); ctx.fill();
  // kafa
  const hy = -58;
  ctx.fillStyle = C('#86a24c');
  ctx.beginPath(); ctx.ellipse(2, hy, 10, 9.5, 0, 0, TAU); ctx.fill();
  if (!f.up) {
    ctx.fillStyle = C('#6f8b3c'); ctx.beginPath(); ctx.ellipse(5, hy + 4, 7, 4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C('#f1ead8');
    ctx.beginPath(); ctx.moveTo(1, hy + 4); ctx.lineTo(2, hy - 1); ctx.lineTo(3.5, hy + 4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(7, hy + 4); ctx.lineTo(8.5, hy - 1); ctx.lineTo(9.5, hy + 4); ctx.fill();
    if (!tint) {
      ctx.fillStyle = e.aggro ? '#ff4a3a' : '#1d1d12';
      ctx.beginPath(); ctx.arc(f.down ? -1.5 : 3, hy - 2.5, 1.6, 0, TAU); ctx.arc(f.down ? 5.5 : 9, hy - 2.5, 1.6, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#2a3412'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(-1, hy - 6); ctx.lineTo(5, hy - 4.5); ctx.moveTo(11, hy - 6); ctx.lineTo(7, hy - 4.5); ctx.stroke();
    }
  }
  // kulaklar
  ctx.fillStyle = C('#7e9b46');
  ctx.beginPath(); ctx.moveTo(-7, hy - 2); ctx.lineTo(-15, hy - 6); ctx.lineTo(-7, hy + 3); ctx.fill();
  // sopa: hazırlıkta yukarı kalkar, vuruşta iner
  let clubA = -0.5;
  if (e.windupUntil) clubA = -0.5 - clamp((t - e.windupStart) / (e.windupUntil - e.windupStart), 0, 1) * 1.9;
  else if (t - e.attackAt < 0.2) clubA = -2.4 + ((t - e.attackAt) / 0.2) * 2.9;
  ctx.save();
  ctx.translate(12, -42);
  ctx.rotate(clubA);
  ctx.strokeStyle = C('#86a24c'); ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, 6); ctx.stroke();
  ctx.strokeStyle = C('#5b3a22'); ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(10, 8); ctx.lineTo(30, 4); ctx.stroke();
  ctx.fillStyle = C('#6d4a2c');
  ctx.beginPath(); ctx.ellipse(34, 3, 9, 7, -0.2, 0, TAU); ctx.fill();
  ctx.fillStyle = C('#a7aca5');
  ctx.beginPath(); ctx.arc(38, -2, 1.8, 0, TAU); ctx.arc(39, 7, 1.8, 0, TAU); ctx.arc(30, -3, 1.6, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.restore();
}
