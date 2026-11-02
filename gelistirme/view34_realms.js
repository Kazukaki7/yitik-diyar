/* ============ 12-J. AYAZ VE KIZIL KUM DÜNYASI (DENEME) ============
   Ağaç türleri, kamplar (Buz Karakolu, Vaha Kervansarayı) ve diyara özel süsler. */

const V34_REALM_TREES = { snowpine: 1, frostdead: 1, icespire: 1, cactus: 1, deadbush: 1, mesa: 1, bones: 1, palm: 1 };
function v34RealmTreeHeight(tr) {
  const s = tr.size;
  return { snowpine: s * 2.95, frostdead: s * 1.8, icespire: s * 1.7, cactus: s * 1.6, deadbush: s * 0.8, mesa: s * 1.5, bones: s * 1.1, palm: s * 2.4 }[tr.kind] || s * 1.8;
}
function v34RealmTree(ctx, tr, t, faded) {
  const s = tr.size, h = v34RealmTreeHeight(tr);
  const sway = Math.sin(t * 1.1 + tr.x * 0.004 + tr.y * 0.003) * s * 0.04;
  v34Shadow(ctx, tr.x, tr.y, s * (tr.kind === 'mesa' ? 0.9 : 0.6), s * 0.26, h, 0.3);
  ctx.save(); ctx.translate(tr.x, tr.y);
  if (faded) ctx.globalAlpha = 0.42;
  const rng = mulberry32(Math.floor(tr.x * 5.3 + tr.y * 8.1) | 0);
  if (tr.kind === 'snowpine') {
    ctx.fillStyle = '#3b2a1c'; ctx.fillRect(-tr.r * 0.32, -s * 0.62, tr.r * 0.64, s * 0.64);
    ctx.translate(sway, 0);
    const sp = v34PineSprite(tr);
    ctx.drawImage(sp.cv, -sp.ox, -sp.oy, sp.w, sp.h);
  } else if (tr.kind === 'frostdead' || tr.kind === 'deadbush') {
    const dry = tr.kind === 'deadbush', col = dry ? '#8a6a44' : '#7f8a96', snow = !dry;
    const th = dry ? s * 0.35 : s * 1.15, L0 = dry ? 0.55 : 0.85;
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-3, -th); ctx.lineTo(3, -th); ctx.lineTo(5, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = col; ctx.lineCap = 'round';
    const n = dry ? 9 : tr.branches.length;
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1, sy = -th * (dry ? 0.5 : 0.5 + (i % 3) * 0.2);
      const a = -Math.PI / 2 + side * (0.35 + rng() * 0.7), L = s * L0 * (0.6 + rng() * 0.5);
      const mx = Math.cos(a) * L * 0.55, my = sy + Math.sin(a) * L * 0.55, ex = mx + Math.cos(a - side * 0.3) * L * 0.45, ey = my + Math.sin(a - side * 0.3) * L * 0.45;
      ctx.lineWidth = dry ? 1.6 : 3.6; ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(mx, my); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.lineWidth = dry ? 1 : 1.8; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(a + side * 0.7) * L * 0.3, my + Math.sin(a + side * 0.7) * L * 0.3); ctx.stroke();
      if (snow) { ctx.strokeStyle = '#f4f8fb'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(mx, my - 1.5); ctx.lineTo(ex, ey - 1.5); ctx.stroke(); ctx.strokeStyle = col; }
    }
    if (snow) { ctx.fillStyle = '#f4f8fb'; ctx.beginPath(); ctx.ellipse(0, -1, 9, 3, 0, Math.PI, TAU); ctx.fill(); }
  } else if (tr.kind === 'icespire') {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha *= 0.4; const spr = v34LightSprite('150,210,255'); ctx.drawImage(spr, -s * 1.1, -s * 1.6, s * 2.2, s * 2.2);
    ctx.restore();
    for (let i = 0; i < 5; i++) {
      const bx = (i - 2) * s * 0.2, L = s * (0.8 + ((i * 7) % 3) * 0.35) * (i === 2 ? 1.25 : 1), w = s * 0.16, lean = (i - 2) * 0.12;
      ctx.save(); ctx.translate(bx, 0); ctx.rotate(lean);
      ctx.fillStyle = i % 2 ? '#a9d8f2' : '#d8f0ff';
      ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(-w * 0.8, -L * 0.8); ctx.lineTo(0, -L); ctx.lineTo(w * 0.8, -L * 0.8); ctx.lineTo(w, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(90,150,200,.45)';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -L); ctx.lineTo(w * 0.8, -L * 0.8); ctx.lineTo(w, 0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(-w * 0.55, -L * 0.75, w * 0.25, L * 0.5);
      ctx.restore();
    }
  } else if (tr.kind === 'cactus') {
    const w = s * 0.22, H = s * 1.5;
    const col = '#4f8a48', dk = '#35643a', lt = '#7ab866';
    const column = (x, y0, hh, ww) => {
      ctx.fillStyle = dk; ctx.beginPath(); ctx.roundRect(x - ww, y0 - hh, ww * 2, hh, ww); ctx.fill();
      ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - ww, y0 - hh, ww * 1.3, hh, ww); ctx.fill();
      ctx.strokeStyle = lt; ctx.lineWidth = 1;
      for (const k of [-0.45, 0, 0.45]) { ctx.beginPath(); ctx.moveTo(x + ww * k, y0 - hh + ww * 0.6); ctx.lineTo(x + ww * k, y0 - 2); ctx.stroke(); }
      ctx.fillStyle = '#f2ecd8';
      for (let i = 0; i < 6; i++) { ctx.fillRect(x - ww - 1.5 + (i % 2) * (ww * 2 + 1.5), y0 - hh + 6 + i * hh / 7, 1.5, 1); }
    };
    column(0, 0, H, w);
    const armL = s * (0.45 + rng() * 0.2), armR = s * (0.35 + rng() * 0.25);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.roundRect(-w - s * 0.3, -H * 0.5 - w * 0.6, s * 0.32, w * 1.2, w * 0.6); ctx.fill();
    column(-w - s * 0.22, -H * 0.5 + w * 0.6, armL, w * 0.7);
    if (rng() < 0.7) { ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(w - 2, -H * 0.38 - w * 0.5, s * 0.28, w, w * 0.5); ctx.fill(); column(w + s * 0.18, -H * 0.38 + w * 0.5, armR, w * 0.65); }
    if (tr.shade > 0.7) { ctx.fillStyle = '#e8506a'; ctx.beginPath(); ctx.arc(0, -H, 3.5, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffd06a'; ctx.beginPath(); ctx.arc(0, -H, 1.3, 0, TAU); ctx.fill(); }
  } else if (tr.kind === 'mesa') {
    const col = (tr.zi >= 0 && ZONES[tr.zi].rock) || '#8d4a2e', w = s * 0.85, H = s * 1.45;
    ctx.fillStyle = shadeColor(col, -0.3);
    ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(-w * 0.85, -H * 0.85); ctx.lineTo(-w * 0.55, -H); ctx.lineTo(w * 0.6, -H * 0.97); ctx.lineTo(w * 0.85, -H * 0.8); ctx.lineTo(w, 0); ctx.quadraticCurveTo(0, s * 0.2, -w, 0); ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(-w, 0); ctx.lineTo(-w * 0.85, -H * 0.85); ctx.lineTo(-w * 0.55, -H); ctx.lineTo(-w * 0.05, -H * 0.98); ctx.lineTo(-w * 0.1, s * 0.12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = shadeColor(col, 0.25);
    ctx.beginPath(); ctx.moveTo(-w * 0.85, -H * 0.85); ctx.lineTo(-w * 0.55, -H); ctx.lineTo(w * 0.6, -H * 0.97); ctx.lineTo(w * 0.85, -H * 0.8); ctx.quadraticCurveTo(0, -H * 0.88, -w * 0.85, -H * 0.85); ctx.fill();
    // katman çizgileri
    ctx.strokeStyle = shadeColor(col, -0.45); ctx.lineWidth = 1.4;
    for (let i = 1; i < 5; i++) { const y = -H * i / 5.5; ctx.beginPath(); ctx.moveTo(-w * 0.95 + i * 2, y); ctx.quadraticCurveTo(0, y + 3 - rng() * 4, w * 0.95 - i * 2, y + 1); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,230,200,.18)'; ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) { const y = -H * i / 5.5 - 2; ctx.beginPath(); ctx.moveTo(-w * 0.9, y); ctx.lineTo(-w * 0.2, y + 1); ctx.stroke(); }
  } else if (tr.kind === 'bones') {
    // dev kaburga kafesi: kumdan yükselen kavisler
    ctx.strokeStyle = '#e4d8bc'; ctx.lineCap = 'round';
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-s * 0.9, -s * 0.1); ctx.quadraticCurveTo(0, -s * 0.25, s * 0.9, -s * 0.05); ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const x = -s * 0.7 + i * s * 0.35, hh = s * (0.7 + Math.sin((i / 4) * Math.PI) * 0.4);
      ctx.lineWidth = 3.4;
      ctx.beginPath(); ctx.moveTo(x, -s * 0.15); ctx.quadraticCurveTo(x - s * 0.25, -hh * 0.8, x + s * 0.05, -hh); ctx.stroke();
      ctx.strokeStyle = 'rgba(120,100,70,.5)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x + 1.5, -s * 0.15); ctx.quadraticCurveTo(x - s * 0.22, -hh * 0.8, x + s * 0.07, -hh); ctx.stroke(); ctx.strokeStyle = '#e4d8bc';
    }
    ctx.fillStyle = 'rgba(190,150,90,.6)'; ctx.beginPath(); ctx.ellipse(0, 0, s * 1.0, s * 0.18, 0, 0, TAU); ctx.fill();
  } else if (tr.kind === 'palm') {
    v34Palm(ctx, 0, 0, s, t);
  }
  ctx.restore();
}
// Hurma: kıvrık, halkalı gövde ve tepede sarkan yapraklar
function v34Palm(ctx, x, y, s, t) {
  const H = s * 2.1, bend = s * 0.35;
  ctx.save(); ctx.translate(x, y);
  for (let i = 0; i < 12; i++) {
    const k = i / 11, px = Math.sin(k * 1.4) * bend, py = -k * H;
    ctx.fillStyle = i % 2 ? '#7a5634' : '#8e6a42';
    ctx.beginPath(); ctx.ellipse(px, py, s * (0.13 - k * 0.03), s * 0.09, 0, 0, TAU); ctx.fill();
  }
  const tx = Math.sin(1.4) * bend, ty = -H, sw = Math.sin(t * 1.2 + x) * 0.05;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU + sw, dx = Math.cos(a), dy = Math.sin(a) * 0.5;
    const L = s * 1.05;
    ctx.fillStyle = i % 2 ? '#3f7a3a' : '#5a9a48';
    ctx.beginPath(); ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + dx * L * 0.5, ty + dy * L * 0.5 - s * 0.35, tx + dx * L, ty + dy * L + s * 0.3);
    ctx.quadraticCurveTo(tx + dx * L * 0.45, ty + dy * L * 0.45 - s * 0.1, tx, ty + 2);
    ctx.fill();
  }
  ctx.fillStyle = '#6b3a1a';
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(tx + (i - 1.5) * 3, ty + 4, 2.6, 0, TAU); ctx.fill(); }
  ctx.restore();
}

/* ---------- Diyar kampları ---------- */
const V34_CAMPS = {
  frost: { tents: [[-125, -40, '#7b8fa6'], [120, -70, '#8c7a63'], [95, 110, '#6f7e8f']], snow: true },
  desert: { tents: [[-110, 40, '#a8573a'], [110, -70, '#c48a3a']], palms: [[-150, -60], [140, 40], [-60, 150], [90, -150]], well: [70, 100] },
};
function v34RealmCampGround(ctx, t) {
  const R = CONFIG.CAMP_RADIUS, frost = REALM.id === 'frost';
  const g = ctx.createRadialGradient(0, 0, 20, 0, 0, R);
  const c = frost ? '245,249,252' : '236,214,170';
  g.addColorStop(0, `rgba(${c},.6)`); g.addColorStop(0.8, `rgba(${c},.4)`); g.addColorStop(1, `rgba(${c},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(40,26,16,.3)'; ctx.beginPath(); ctx.ellipse(0, 4, 30, 18, 0, 0, TAU); ctx.fill();
  drawRealmPortal(ctx, FROST_PORTAL.x, FROST_PORTAL.y, t, REALM.portal.rgb, REALM.portal.label);
}
function v34RealmCampProps(list) {
  const cfg = V34_CAMPS[REALM.id], R = CONFIG.CAMP_RADIUS;
  if (!cfg) return;
  for (const [x, y, c] of cfg.tents) list.push({ y, k: 'tent', o: { x, y, c, snow: cfg.snow } });
  list.push({ y: 6, k: 'fire', o: null });
  if (REALM.id === 'frost') {
    for (let i = 0; i < 56; i++) {
      const a = (i / 56) * TAU;
      if (Math.abs(angDiff(a, Math.PI / 2)) < 0.22) continue;
      list.push({ y: Math.sin(a) * R, k: 'stake', o: { x: Math.cos(a) * R, y: Math.sin(a) * R, h: 20 + ((i * 7) % 5) * 2 } });
    }
  } else {
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * TAU;
      if (Math.abs(angDiff(a, Math.PI / 2)) < 0.3) continue;
      // her duvar parçası, çember boyunca dizilmiş kerpiç bloklardan oluşur (her yönde kalın görünür)
      for (let j = -2; j <= 2; j++) {
        const aa = a + j * 0.06, x = Math.cos(aa) * R, y = Math.sin(aa) * R;
        list.push({ y, k: 'wall', o: { x, y, j } });
      }
    }
    for (const [x, y] of cfg.palms) list.push({ y, k: 'palm', o: { x, y } });
    list.push({ y: cfg.well[1], k: 'well', o: { x: cfg.well[0], y: cfg.well[1] } });
  }
}
function v34Stake(ctx, o) {
  v34Shadow(ctx, o.x, o.y, 6, 2.5, o.h, 0.28);
  ctx.fillStyle = '#4e3522'; ctx.fillRect(o.x - 3.5, o.y - o.h, 7, o.h);
  ctx.fillStyle = '#6b4a2e'; ctx.fillRect(o.x - 3.5, o.y - o.h, 3.5, o.h);
  ctx.fillStyle = '#4e3522'; ctx.beginPath(); ctx.moveTo(o.x - 3.5, o.y - o.h); ctx.lineTo(o.x, o.y - o.h - 5); ctx.lineTo(o.x + 3.5, o.y - o.h); ctx.fill();
  ctx.fillStyle = '#f4f8fb'; ctx.beginPath(); ctx.ellipse(o.x, o.y - o.h - 1, 4.5, 2.5, 0, 0, TAU); ctx.fill();
}
function v34Wall(ctx, o) {
  const W = 17, H = 22, D = 9, x = o.x, y = o.y;
  v34Shadow(ctx, x, y, W * 0.7, 5, H, 0.22);
  ctx.fillStyle = '#b98d5a'; ctx.fillRect(x - W / 2, y - H, W, H);                       // ön yüz
  ctx.fillStyle = '#a07648'; ctx.fillRect(x + W / 2 - 3, y - H, 3, H);                   // sağ kenar gölgesi
  ctx.fillStyle = '#dcb47c'; ctx.fillRect(x - W / 2, y - H - D * 0.6, W, D * 0.6);       // üst yüz
  ctx.strokeStyle = 'rgba(110,80,46,.4)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x - W / 2, y - H / 3); ctx.lineTo(x + W / 2, y - H / 3); ctx.moveTo(x - W / 2, y - H * 2 / 3); ctx.lineTo(x + W / 2, y - H * 2 / 3);
  const off = (o.j & 1) ? 4 : -3;
  ctx.moveTo(x + off, y); ctx.lineTo(x + off, y - H / 3); ctx.moveTo(x - off, y - H / 3); ctx.lineTo(x - off, y - H * 2 / 3); ctx.moveTo(x + off, y - H * 2 / 3); ctx.lineTo(x + off, y - H); ctx.stroke();
}
function v34Well(ctx, o) {
  const { x, y } = o;
  v34Shadow(ctx, x, y + 4, 24, 8, 16, 0.28);
  ctx.fillStyle = '#7a5a3a'; ctx.beginPath(); ctx.ellipse(x, y, 21, 9, 0, 0, Math.PI); ctx.lineTo(x - 21, y - 14); ctx.ellipse(x, y - 14, 21, 9, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9a7450'; ctx.beginPath(); ctx.ellipse(x, y - 14, 21, 9, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2e5c74'; ctx.beginPath(); ctx.ellipse(x, y - 14, 14, 6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.ellipse(x - 4, y - 16, 5, 1.6, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#5a3d27'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - 18, y - 14); ctx.lineTo(x - 18, y - 44); ctx.moveTo(x + 18, y - 14); ctx.lineTo(x + 18, y - 44); ctx.moveTo(x - 20, y - 44); ctx.lineTo(x + 20, y - 44); ctx.stroke();
  ctx.strokeStyle = '#c9b48a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y - 44); ctx.lineTo(x, y - 24); ctx.stroke();
  ctx.fillStyle = '#6b4a2e'; ctx.fillRect(x - 4, y - 26, 8, 6);
}

/* ---------- Diyar süsleri: Ayaz'da kar yığınları, buz kristalleri, donmuş kütükler; çölde kemikler, taşlar, çalılar ---------- */
function v34DecorateRealm() {
  const rng = mulberry32(REALM.id === 'frost' ? 51177 : 61199);
  const R = CONFIG.WORLD_RADIUS, CR = CONFIG.CAMP_RADIUS;
  const cellOf = (x, y) => World.cells.get(cellKey(Math.floor(x / CONFIG.CELL), Math.floor(y / CONFIG.CELL)));
  const near = (x, y, m) => realmFires().some(fi => Math.hypot(x - fi.x, y - fi.y) < fi.r + 90 + m) || dungeonsHere().some(d => Math.hypot(x - d.x, y - d.y) < 170 + m);
  for (const cell of World.cells.values()) cell.v34d = [];
  const frost = REALM.id === 'frost';
  for (let i = 0; i < 3200; i++) {
    const a = rng() * TAU, d = CR + 80 + Math.sqrt(rng()) * (R - CR - 160);
    const x = Math.cos(a) * d, y = Math.sin(a) * d, zi = zoneIndexAt(x, y);
    if (zi < 0 || near(x, y, 30)) continue;
    const pool = frost
      ? [['drift', 0.34], ['stones', 0.22], ['shards', 0.18], ['log', 0.12], ['drybush', 0.14]]
      : [['stones', 0.3], ['drybush', 0.3], ['bones', 0.22], ['skull', 0.1], ['pot', 0.08]];
    let r = rng(), acc = 0, kind = pool[0][0];
    for (const [k, w] of pool) { acc += w; if (r < acc) { kind = k; break; } }
    const c = cellOf(x, y); if (!c) continue;
    const col = ZONES[zi].rock || '#8a8a80';
    if (kind === 'drift') c.v34d.push({ kind, x, y, w: 30 + rng() * 50, ground: true, ph: rng() });
    else if (kind === 'stones') { const st = []; for (let j = 0; j < 2 + Math.floor(rng() * 4); j++) st.push({ x: (rng() - 0.5) * 34, y: (rng() - 0.5) * 18, r: 4 + rng() * 6 }); st.sort((p, q) => p.y - q.y); c.v34d.push({ kind, x, y, st, col, snow: frost }); }
    else if (kind === 'shards') c.v34d.push({ kind, x, y, n: 2 + Math.floor(rng() * 3), ph: rng() * 6, a: rng(), ice: true });
    else if (kind === 'log') c.v34d.push({ kind, x, y, a: (rng() - 0.5) * 0.9, L: 40 + rng() * 30, r: 6 + rng() * 3, frozen: true });
    else if (kind === 'drybush') c.v34d.push({ kind, x, y, s: 10 + rng() * 8, ph: rng() * 6 });
    else if (kind === 'bones') c.v34d.push({ kind, x, y, a: rng() * TAU, ground: true });
    else if (kind === 'skull') c.v34d.push({ kind, x, y, s: 10 + rng() * 6, horn: rng() < 0.6 });
    else if (kind === 'pot') c.v34d.push({ kind, x, y, s: 7 + rng() * 4, broken: rng() < 0.5 });
  }
}
// Ek süs çizimleri (v34DecoGround / v34DecoProp'ta tanınmayan türler)
function v34DecoRealmGround(ctx, o, t) {
  if (o.kind === 'drift') {
    ctx.fillStyle = 'rgba(160,180,200,.35)'; ctx.beginPath(); ctx.ellipse(o.x + 3, o.y + 2, o.w, o.w * 0.28, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#eef4f8'; ctx.beginPath(); ctx.ellipse(o.x, o.y, o.w, o.w * 0.26, 0, Math.PI, TAU); ctx.ellipse(o.x, o.y, o.w, o.w * 0.12, 0, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(o.x - o.w * 0.2, o.y - o.w * 0.12, o.w * 0.5, o.w * 0.08, 0, 0, TAU); ctx.fill();
    return true;
  }
  return false;
}
function v34DecoRealmProp(ctx, o, t) {
  if (o.kind === 'skull') {
    const s = o.s; v34Shadow(ctx, o.x, o.y, s, s * 0.35, s, 0.25);
    ctx.fillStyle = '#e4d8bc'; ctx.beginPath(); ctx.ellipse(o.x, o.y - s * 0.6, s, s * 0.7, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#d0c2a0'; ctx.beginPath(); ctx.ellipse(o.x + s * 0.7, o.y - s * 0.35, s * 0.55, s * 0.35, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3a2e20'; ctx.beginPath(); ctx.arc(o.x + s * 0.2, o.y - s * 0.7, s * 0.2, 0, TAU); ctx.fill();
    if (o.horn) { ctx.strokeStyle = '#cbb894'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(o.x - s * 0.3, o.y - s * 1.1); ctx.quadraticCurveTo(o.x - s * 1.2, o.y - s * 1.6, o.x - s * 1.4, o.y - s * 0.9); ctx.stroke(); }
    return true;
  }
  if (o.kind === 'pot') {
    const s = o.s; v34Shadow(ctx, o.x, o.y, s, s * 0.35, s * 1.6, 0.25);
    ctx.fillStyle = '#a85a32'; ctx.beginPath(); ctx.ellipse(o.x, o.y - s * 0.9, s, s * 0.95, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#c8784a'; ctx.beginPath(); ctx.ellipse(o.x - s * 0.3, o.y - s * 1.1, s * 0.45, s * 0.6, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#6a3a1e'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(o.x, o.y - s * 0.9, s * 0.95, s * 0.25, 0, 0, Math.PI); ctx.stroke();
    if (o.broken) { ctx.fillStyle = '#3a2214'; ctx.beginPath(); ctx.moveTo(o.x - s * 0.6, o.y - s * 1.75); ctx.lineTo(o.x + s * 0.2, o.y - s * 1.4); ctx.lineTo(o.x + s * 0.6, o.y - s * 1.75); ctx.closePath(); ctx.fill(); }
    else { ctx.fillStyle = '#8a4426'; ctx.fillRect(o.x - s * 0.35, o.y - s * 2, s * 0.7, s * 0.3); }
    return true;
  }
  return false;
}
