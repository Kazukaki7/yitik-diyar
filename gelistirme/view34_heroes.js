/* ============ 12-H. SAVAŞÇI VE BÜYÜCÜ (DENEME) ============
   Okçu ile aynı düzen: orijin ayakların arası, 4 yön, yürüme döngüsü, eşyaya göre renk.
   Savaşçı: miğfer, zırh, kalkan, kılıç (savurma ve dönme animasyonu).
   Büyücü: uzun cüppe, sivri şapka, parlayan küreli asa (büyü yaparken nişana kalkar). */

// Ortak: bacaklar ve ayakkabılar
function v34Legs(ctx, dir, step, bob, pants, boots, C, bootTrim) {
  const leg = (x, sw, back) => {
    ctx.save(); ctx.translate(x, -14 + bob * 0.3);
    ctx.rotate(dir === 'side' ? sw * 0.5 : 0);
    const lift = dir === 'side' ? 0 : Math.max(0, sw) * 3;
    ctx.fillStyle = C(back ? shadeColor(pants, -0.2) : pants);
    ctx.beginPath(); ctx.roundRect(-3.4, 0, 6.8, 11 - lift, 2.5); ctx.fill();
    ctx.fillStyle = C(back ? shadeColor(boots, -0.2) : boots);
    ctx.beginPath(); ctx.roundRect(-3.8, 9 - lift, dir === 'side' ? 9 : 7.6, 5, [2, 3, 2, 2]); ctx.fill();
    if (bootTrim) { ctx.fillStyle = C(bootTrim); ctx.fillRect(-3.8, 9 - lift, 7.6, 1.3); }
    ctx.restore();
  };
  if (dir === 'side') { leg(-1, -step, true); leg(1, step, false); }
  else { leg(-4.2, step, false); leg(4.2, -step, false); }
}

/* ---------------- Savaşçı ---------------- */
function v34Warrior(ctx, p, t, tint) {
  const eq = p.equip || PREVIEW_EQUIP, c = p.cls, C = col => tint || col;
  const moving = !!(p.moveVec && (p.moveVec.x || p.moveVec.y));
  const bodyA = v34HeroAngle(p, t), dir = v34Dir(bodyA);
  const flip = dir === 'side' && Math.cos(bodyA) < 0;
  const ph = p.walk || 0, step = moving ? Math.sin(ph) : 0;
  const bob = moving ? Math.abs(Math.cos(ph)) * -1.8 : Math.sin(t * 2.2) * 0.6;
  const rar = r => RARITY[r].color;
  const metal = r => LOOK.metal[r];
  const pants = eq.legs ? metal(eq.legs.rarity)[1] : '#4d4a44';
  const boots = eq.feet ? metal(eq.feet.rarity)[1] : '#3b2a1c';
  const by = -14 + bob;

  // ---- kılıç açısı: rahatta aşağı, savururken yay boyunca, dönerken tam tur ----
  let swordA = null, trail = null;
  if (p.spin && t - p.spin.start < p.spin.dur) swordA = p.facing + ((t - p.spin.start) / p.spin.dur) * TAU, trail = 'spin';
  else if (p.swing && t - p.swing.start < p.swing.dur) {
    const k = (t - p.swing.start) / p.swing.dur;
    swordA = p.swing.angle - p.swing.arc / 2 + p.swing.arc * easeOut(k); trail = k;
  } else if (p === G.player && typeof input !== 'undefined' && input.attackHeld) swordA = p.facing - 0.9;
  const combat = swordA !== null;
  const restA = dir === 'side' ? (flip ? Math.PI - 1.35 : 1.35) : dir === 'up' ? 1.9 : 1.25;
  const sa = combat ? swordA : restA;
  const shX = combat ? 0 : (dir === 'side' ? (flip ? -4 : 4) : dir === 'up' ? -8 : 8), shY = by - 14;

  const drawSword = () => {
    const r = eq.weapon ? eq.weapon.rarity : 'common';
    ctx.save(); ctx.translate(shX, shY); ctx.rotate(sa);
    // kol
    ctx.strokeStyle = C(eq.chest ? metal(eq.chest.rarity)[1] : '#b9ad92'); ctx.lineWidth = 4.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(9, 0); ctx.stroke();
    ctx.fillStyle = C(eq.hands ? metal(eq.hands.rarity)[1] : V34_SKIN);
    ctx.beginPath(); ctx.arc(10, 0, 2.8, 0, TAU); ctx.fill();
    if (eq.weapon) {
      if ((r === 'rare' || r === 'legendary') && !tint) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = hexA(RARITY[r].color, r === 'legendary' ? 0.5 + 0.25 * Math.sin(t * 6) : 0.32);
        ctx.lineWidth = 7;
        ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(34, 0); ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.fillStyle = C('#4a2f1d'); ctx.fillRect(7, -1.6, 6, 3.2);            // kabza
      ctx.fillStyle = C(metal(r)[2]); ctx.fillRect(12.5, -5.5, 3, 11);         // siper
      ctx.fillStyle = C(metal(r)[0]);
      ctx.beginPath(); ctx.moveTo(15.5, -2.2); ctx.lineTo(32, -2.2); ctx.lineTo(36, 0); ctx.lineTo(32, 2.2); ctx.lineTo(15.5, 2.2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = C(metal(r)[1]);
      ctx.beginPath(); ctx.moveTo(15.5, 0.3); ctx.lineTo(32, 0.3); ctx.lineTo(36, 0); ctx.lineTo(32, 2.2); ctx.lineTo(15.5, 2.2); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // savurma izi
    if (trail !== null && !tint) {
      ctx.save(); ctx.translate(shX, shY);
      ctx.globalCompositeOperation = 'lighter';
      const a0 = trail === 'spin' ? sa - 2.2 : p.swing.angle - p.swing.arc / 2;
      ctx.strokeStyle = 'rgba(255,240,210,.35)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, 28, Math.min(a0, sa), Math.max(a0, sa)); ctx.stroke();
      ctx.restore();
    }
  };
  // kalkan: ön yüzde gövdenin önünde, arkadan bakarken sırtta
  const drawShield = () => {
    const x = dir === 'side' ? (flip ? -1 : 1) * 3 : dir === 'up' ? 6 : -9, y = by - 10;
    const w = dir === 'side' ? 6 : 9;
    ctx.fillStyle = C('#5a3b26');
    ctx.beginPath(); ctx.ellipse(x, y, w, 10, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = C('#c9a35a'); ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C('#8a6a3a');
    ctx.beginPath(); ctx.ellipse(x - w * 0.2, y - 3, w * 0.45, 4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C('#d9c08a');
    ctx.beginPath(); ctx.arc(x, y, 2, 0, TAU); ctx.fill();
  };

  const swordBehind = combat ? Math.sin(sa) < -0.35 : dir === 'up';
  ctx.save();
  if (flip) ctx.scale(-1, 1);
  v34Legs(ctx, dir, step, bob, pants, boots, C, eq.feet && eq.feet.rarity !== 'common' && !tint ? rar(eq.feet.rarity) : null);
  if (dir === 'up') drawShield();
  ctx.restore();
  if (swordBehind) drawSword();
  ctx.save();
  if (flip) ctx.scale(-1, 1);

  // ---- gövde: zırh ya da gömlek ----
  const tw = dir === 'side' ? 15 : 19;
  if (eq.chest) {
    const m = metal(eq.chest.rarity);
    const g = ctx.createLinearGradient(-tw / 2, 0, tw / 2, 0);
    g.addColorStop(0, C(m[0])); g.addColorStop(1, C(m[1]));
    ctx.fillStyle = g;
  } else ctx.fillStyle = C('#cfc4a8');
  ctx.beginPath();
  ctx.moveTo(-tw / 2 - 1, by + 2); ctx.lineTo(-tw / 2, by - 18);
  ctx.quadraticCurveTo(0, by - 23, tw / 2, by - 18); ctx.lineTo(tw / 2 + 1, by + 2);
  ctx.quadraticCurveTo(0, by + 4, -tw / 2 - 1, by + 2); ctx.fill();
  if (eq.chest && dir !== 'up') {     // önde sınıf renginde arma kumaşı
    ctx.fillStyle = C(c.color);
    ctx.beginPath(); ctx.moveTo(-4, by - 16); ctx.lineTo(4, by - 16); ctx.lineTo(5, by + 4); ctx.lineTo(0, by + 7); ctx.lineTo(-5, by + 4); ctx.closePath(); ctx.fill();
    if (!tint && eq.chest.rarity !== 'common') { ctx.strokeStyle = rar(eq.chest.rarity); ctx.lineWidth = 1; ctx.stroke(); }
  }
  ctx.fillStyle = C('#3a2616'); ctx.fillRect(-tw / 2 - 0.5, by - 5, tw + 1, 3);
  ctx.fillStyle = C('#c9a35a'); ctx.fillRect(-2, by - 5.5, 4, 4);
  // omuzluklar
  if (eq.chest) {
    const m = metal(eq.chest.rarity);
    for (const sx of dir === 'side' ? [-2] : [-tw / 2 - 1, tw / 2 + 1]) {
      ctx.fillStyle = C(m[1]); ctx.beginPath(); ctx.ellipse(sx, by - 18, 5.5, 4, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = C(m[0]); ctx.beginPath(); ctx.ellipse(sx - 1, by - 19.5, 3.5, 2, 0, 0, TAU); ctx.fill();
    }
  }
  // ---- kafa: miğfer ya da çıplak baş ----
  const hy = by - 29;
  if (eq.head) {
    const r = eq.head.rarity, m = metal(r);
    ctx.fillStyle = C(LOOK.plume[r]);    // tüy
    ctx.beginPath(); ctx.moveTo(-1, hy - 9); ctx.quadraticCurveTo(-9, hy - 16, -12, hy - 3); ctx.quadraticCurveTo(-6, hy - 9, 2, hy - 8); ctx.fill();
    const g = ctx.createLinearGradient(-9, 0, 9, 0);
    g.addColorStop(0, C(m[0])); g.addColorStop(1, C(m[1]));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(0, hy, 9.5, 10, 0, 0, TAU); ctx.fill();
    ctx.fillRect(-9.5, hy, 19, 6);
    if (dir !== 'up') {
      ctx.fillStyle = C('#1c1f22');
      if (dir === 'side') ctx.fillRect(2, hy - 1, 8, 2.2);
      else { ctx.fillRect(-6, hy - 1, 12, 2.4); ctx.fillRect(-1, hy - 1, 2, 7); }
    }
    if (!tint && (r === 'rare' || r === 'legendary')) { ctx.strokeStyle = m[2]; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, hy, 9.5, 10, 0, Math.PI, TAU); ctx.stroke(); }
  } else {
    ctx.fillStyle = C(V34_SKIN);
    ctx.beginPath(); ctx.ellipse(0, hy + 1, 8.5, 9, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C('#5a3a22');
    if (dir === 'up') { ctx.beginPath(); ctx.ellipse(0, hy, 8.8, 9, 0, 0, TAU); ctx.fill(); }
    else {
      ctx.beginPath(); ctx.ellipse(dir === 'side' ? -2 : 0, hy - 3.5, 9, 6, 0, Math.PI, TAU); ctx.fill();
      // sakal
      ctx.beginPath(); ctx.ellipse(dir === 'side' ? 3 : 0, hy + 6, dir === 'side' ? 4 : 6, 3.5, 0, 0, Math.PI); ctx.fill();
      if (!tint) {
        ctx.fillStyle = '#1b1410';
        if (dir === 'side') ctx.fillRect(4, hy + 1, 1.6, 2);
        else { ctx.fillRect(-3.4, hy + 1, 1.6, 2); ctx.fillRect(1.8, hy + 1, 1.6, 2); }
      }
    }
  }
  if (dir !== 'up') drawShield();
  ctx.restore();
  if (!swordBehind) drawSword();
}

/* ---------------- Büyücü ---------------- */
function v34Mage(ctx, p, t, tint) {
  const eq = p.equip || PREVIEW_EQUIP, c = p.cls, C = col => tint || col;
  const moving = !!(p.moveVec && (p.moveVec.x || p.moveVec.y));
  const bodyA = v34HeroAngle(p, t), dir = v34Dir(bodyA);
  const flip = dir === 'side' && Math.cos(bodyA) < 0;
  const ph = p.walk || 0, step = moving ? Math.sin(ph) : 0;
  const bob = moving ? Math.abs(Math.cos(ph)) * -1.6 : Math.sin(t * 2) * 0.7;
  const rar = r => RARITY[r].color;
  const robe = eq.chest ? LOOK.cloth[eq.chest.rarity] : ['#3d4256', '#565c78', '#7a80a0'];
  const boots = eq.feet ? LOOK.cloth[eq.feet.rarity][0] : '#2e2620';
  const by = -14 + bob;
  const sinceCast = t - (p.staffGlow || -9);
  const combat = sinceCast < 0.45 || (p === G.player && typeof input !== 'undefined' && input.attackHeld);
  const glowK = clamp(1 - sinceCast / 0.3, 0, 1);

  // asa: rahatta dik, büyü yaparken nişan yönüne eğilir
  const restA = -Math.PI / 2 + (dir === 'side' ? (flip ? -0.12 : 0.12) : 0.08);
  const aim = combat ? p.facing : restA;
  const hx = dir === 'side' ? (flip ? -5 : 5) : dir === 'up' ? -9 : 9, hy0 = by - 11;
  const drawStaff = () => {
    const r = eq.weapon ? eq.weapon.rarity : 'common', oc = LOOK.orb[r];
    ctx.save(); ctx.translate(hx, hy0);
    ctx.rotate(combat ? aim : restA);
    // tutan el
    ctx.fillStyle = C(V34_SKIN); ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, TAU); ctx.fill();
    if (eq.weapon) {
      ctx.strokeStyle = C(r === 'legendary' ? '#3a2418' : '#6e4a2b'); ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(26, 0); ctx.stroke();
      ctx.strokeStyle = C('#4e3420'); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(24, -3); ctx.quadraticCurveTo(30, -6, 31, 0); ctx.quadraticCurveTo(30, 6, 24, 3); ctx.stroke();
      if (!tint) {
        const big = r === 'legendary' ? 6 : r === 'rare' ? 3 : 0, R = 11 + big + glowK * 12;
        ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(30, 0, 1, 30, 0, R);
        g.addColorStop(0, `rgba(${oc},${0.6 + glowK * 0.4})`); g.addColorStop(1, `rgba(${oc},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(30, 0, R, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.fillStyle = C(`rgb(${oc})`); ctx.beginPath(); ctx.arc(30, 0, 4.5, 0, TAU); ctx.fill();
      if (!tint) { ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.beginPath(); ctx.arc(29, -1.2, 1.6, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  };
  const staffBehind = combat ? Math.sin(aim) < -0.35 && dir === 'up' : dir === 'up';

  if (staffBehind) drawStaff();
  ctx.save();
  if (flip) ctx.scale(-1, 1);
  // ayaklar cüppenin altından görünür
  for (const [x, k] of dir === 'side' ? [[-1, -1], [2, 1]] : [[-4, 1], [4, -1]]) {
    ctx.fillStyle = C(boots);
    ctx.beginPath(); ctx.roundRect(x - 3.5 + step * k * (dir === 'side' ? 3 : 0), -4 - Math.max(0, step * k) * 2, dir === 'side' ? 8.5 : 7, 4.5, 2); ctx.fill();
  }
  // ---- cüppe: omuzdan yere kadar, eteği yürürken salınır ----
  const sw = moving ? Math.sin(ph) * 2.2 : Math.sin(t * 1.5) * 0.6;
  const top = by - 18, hem = -2, wt = dir === 'side' ? 7 : 8.5, wb = dir === 'side' ? 10 : 13;
  const g = ctx.createLinearGradient(-wb, 0, wb, 0);
  g.addColorStop(0, C(robe[2])); g.addColorStop(0.5, C(robe[1])); g.addColorStop(1, C(robe[0]));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-wt, top);
  ctx.quadraticCurveTo(0, top - 4, wt, top);
  ctx.quadraticCurveTo(wb * 0.9, top + 12, wb + sw, hem);
  ctx.quadraticCurveTo(0, hem + 3 + Math.abs(sw) * 0.3, -wb + sw, hem);
  ctx.quadraticCurveTo(-wb * 0.9, top + 12, -wt, top);
  ctx.fill();
  // etek kenarı ve ön şerit
  ctx.strokeStyle = C(eq.chest && eq.chest.rarity !== 'common' ? rar(eq.chest.rarity) : '#c9a35a'); ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-wb + sw, hem); ctx.quadraticCurveTo(0, hem + 3, wb + sw, hem); ctx.stroke();
  if (dir === 'down') { ctx.beginPath(); ctx.moveTo(0, top + 2); ctx.lineTo(sw * 0.5, hem + 1); ctx.stroke(); }
  // kuşak
  ctx.fillStyle = C(robe[0]); ctx.fillRect(-wt - 1.5, by - 9, (wt + 1.5) * 2, 3);
  ctx.fillStyle = C('#c9a35a'); ctx.beginPath(); ctx.arc(0, by - 7.5, 1.8, 0, TAU); ctx.fill();
  // kollar (yenler)
  if (dir !== 'up') {
    ctx.fillStyle = C(robe[1]);
    ctx.beginPath(); ctx.ellipse(-wt - 1, by - 12, 3.5, 6, 0.25, 0, TAU); ctx.fill();
  }
  // ---- kafa: yüz, sakal, şapka ----
  const hy = by - 27;
  ctx.fillStyle = C(V34_SKIN);
  ctx.beginPath(); ctx.ellipse(0, hy + 1, 8, 8.5, 0, 0, TAU); ctx.fill();
  if (dir !== 'up') {
    ctx.fillStyle = C('#e9e4d8');      // ak sakal
    ctx.beginPath(); ctx.moveTo(dir === 'side' ? -1 : -6, hy + 3); ctx.quadraticCurveTo(dir === 'side' ? 3 : 0, hy + 15, dir === 'side' ? 8 : 6, hy + 3); ctx.closePath(); ctx.fill();
    if (!tint) {
      ctx.fillStyle = '#1b1410';
      if (dir === 'side') ctx.fillRect(4, hy, 1.6, 2);
      else { ctx.fillRect(-3.4, hy, 1.6, 2); ctx.fillRect(1.8, hy, 1.6, 2); }
    }
  } else { ctx.fillStyle = C('#e9e4d8'); ctx.beginPath(); ctx.ellipse(0, hy + 2, 8, 7, 0, 0, TAU); ctx.fill(); }
  if (eq.head) {
    const [brim, crown, tipc] = LOOK.cloth[eq.head.rarity];
    const lean = moving ? -Math.cos(ph) * 1.2 : Math.sin(t * 1.3) * 0.6;
    ctx.fillStyle = C(brim);
    ctx.beginPath(); ctx.ellipse(0, hy - 4, 14, 4.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C(crown);
    ctx.beginPath(); ctx.moveTo(-8, hy - 5); ctx.quadraticCurveTo(-3, hy - 16, 3 + lean * 3, hy - 26); ctx.quadraticCurveTo(2, hy - 14, 8, hy - 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C(tipc);
    ctx.beginPath(); ctx.moveTo(-7.5, hy - 6); ctx.lineTo(7.5, hy - 6); ctx.lineTo(7, hy - 8.5); ctx.lineTo(-7, hy - 8.5); ctx.closePath(); ctx.fill();
    if (!tint) {
      ctx.fillStyle = eq.head.rarity === 'common' ? '#f6d592' : rar(eq.head.rarity);
      ctx.beginPath(); ctx.arc(-1, hy - 13, 1.6, 0, TAU); ctx.fill();
    }
  } else {
    ctx.fillStyle = C('#d9d4c8');
    ctx.beginPath(); ctx.ellipse(0, hy - 3, 8.5, 5.5, 0, Math.PI, TAU); ctx.fill();
  }
  ctx.restore();
  if (!staffBehind) drawStaff();
}
