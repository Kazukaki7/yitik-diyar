/* ============ 12-E. YEŞİL DİYAR SÜSLEMESİ (DENEME) ============
   Dünya üretildikten sonra (carveFeatures) tohumlu olarak eklenir; her açılışta aynı sonuç çıkar.
   - Kamptan zindanlara ve göle giden toprak yollar (ağaç ve kayalar yoldan çekilir)
   - Ormanda sık ağaç kümeleri (aralarında açıklıklar kalır)
   - Küçük göletler (içinden geçilmez), çiçek tarlaları, çalılar, kütükler, mantarlar, taş öbekleri */

const V34W = { paths: [], ponds: [], built: false };

function v34PathDist(x, y) {
  let best = 1e9;
  for (const pa of V34W.paths) {
    for (let i = 1; i < pa.pts.length; i++) {
      const [ax, ay] = pa.pts[i - 1], [bx, by] = pa.pts[i];
      const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
      const k = L ? clamp(((x - ax) * dx + (y - ay) * dy) / L, 0, 1) : 0;
      const d = Math.hypot(x - ax - dx * k, y - ay - dy * k);
      if (d < best) best = d;
    }
  }
  return best;
}
function v34InPond(x, y, m = 0) {
  for (const p of V34W.ponds) if (Math.hypot((x - p.x) / (p.rx + m), (y - p.y) / (p.ry + m)) < 1) return true;
  return false;
}
// Varlığı göletlerin dışına iter (elips: önce daireye ölçeklenir)
function v34ResolvePonds(ent) {
  for (const p of V34W.ponds) {
    if (Math.abs(ent.x - p.x) > p.rx + 60 || Math.abs(ent.y - p.y) > p.ry + 60) continue;
    const sx = ent.x - p.x, sy = (ent.y - p.y) * (p.rx / p.ry);
    const d = Math.hypot(sx, sy), min = p.rx + ent.r * 0.6;
    if (d < min) { const k = min / (d || 0.01); ent.x = p.x + sx * k; ent.y = p.y + (sy * k) * (p.ry / p.rx); }
  }
}

function v34Decorate() {
  V34W.paths = []; V34W.ponds = [];
  const rng = mulberry32(90917);
  const R = CONFIG.WORLD_RADIUS, CR = CONFIG.CAMP_RADIUS;
  const cellOf = (x, y) => World.cells.get(cellKey(Math.floor(x / CONFIG.CELL), Math.floor(y / CONFIG.CELL)));
  const nearDungeon = (x, y, m) => dungeonsHere().some(d => Math.hypot(x - d.x, y - d.y) < 170 + m);

  // ---- Yollar: kamptan her zindana ve göle, hafif kıvrılarak ----
  const targets = dungeonsHere().map(d => [d.x, d.y]).concat([[LAKE.x + 200, LAKE.y + 160]]);
  for (const [tx, ty] of targets) {
    const L = Math.hypot(tx, ty), n = Math.max(6, Math.round(L / 260));
    const nx = -ty / L, ny = tx / L, ph = rng() * TAU, amp = 60 + rng() * 70;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n, w = Math.sin(k * Math.PI) * (Math.sin(k * 5 + ph) * amp + (rng() - 0.5) * 30);
      const s = (CR - 30) / L;   // kampın kenarından başla
      const kk = s + (1 - s) * k;
      pts.push([tx * kk + nx * w, ty * kk + ny * w]);
    }
    V34W.paths.push({ pts, w: 26 + rng() * 8 });
  }
  const onPath = (x, y, m) => v34PathDist(x, y) < 34 + m;

  // ---- Göletler ----
  for (let i = 0; i < 60 && V34W.ponds.length < 14; i++) {
    const a = rng() * TAU, d = CR + 450 + rng() * (R - CR - 900);
    const x = Math.cos(a) * d, y = Math.sin(a) * d, rx = 45 + rng() * 55, ry = rx * (0.55 + rng() * 0.15);
    if (inLake(x, y, 260) || nearDungeon(x, y, 120) || onPath(x, y, rx + 20)) continue;
    if (V34W.ponds.some(p => Math.hypot(p.x - x, p.y - y) < 500)) continue;
    const pond = { x, y, rx, ry, rot: 0, lily: [], reeds: [] };
    for (let j = 0; j < 3 + Math.floor(rng() * 4); j++) {
      const la = rng() * TAU, lk = rng() * 0.7;
      pond.lily.push({ x: x + Math.cos(la) * rx * lk, y: y + Math.sin(la) * ry * lk, r: 5 + rng() * 5, a: rng() * TAU, f: rng() < 0.35 });
    }
    for (let j = 0; j < 10; j++) {
      const la = rng() * TAU;
      pond.reeds.push({ x: x + Math.cos(la) * rx * 0.98, y: y + Math.sin(la) * ry * 0.98, h: 10 + rng() * 12, lean: rng() * 0.6 - 0.3 });
    }
    V34W.ponds.push(pond);
  }

  // ---- Mevcut ağaç/kaya/çimenleri yollardan ve göletlerden çek ----
  for (const cell of World.cells.values()) {
    cell.trees = cell.trees.filter(t => !onPath(t.x, t.y, t.r + 14) && !v34InPond(t.x, t.y, t.size * 0.5));
    cell.rocks = cell.rocks.filter(r => !onPath(r.x, r.y, 4) && !v34InPond(r.x, r.y, 8));
    cell.tufts = cell.tufts.filter(t => !onPath(t.x, t.y, -6) && !v34InPond(t.x, t.y, 2));
    cell.v34d = [];
  }

  // ---- Ağaç kümeleri: bölgenin ağaç sıklığına göre ----
  const okTree = (x, y) => {
    const d = Math.hypot(x, y);
    if (d < CR + 130 || d > R - 60) return false;
    if (inLake(x, y, 60) || v34InPond(x, y, 50) || nearDungeon(x, y, 40) || onPath(x, y, 40)) return false;
    let free = true;
    forEachCell(x - 80, y - 80, x + 80, y + 80, c => { if (free && c.trees.some(t => Math.hypot(t.x - x, t.y - y) < 66)) free = false; });
    return free;
  };
  for (let i = 0; i < 900; i++) {
    const a = rng() * TAU, d = CR + 300 + rng() * (R - CR - 400);
    const cx = Math.cos(a) * d, cy = Math.sin(a) * d;
    const zi = zoneIndexAt(cx, cy);
    if (zi < 0) continue;
    const dens = ZONES[zi].trees;
    if (rng() > dens * 0.32) continue;            // ormanda sık, bozkırda seyrek küme
    const n = 3 + Math.floor(rng() * (dens > 2 ? 10 : 5));
    const spread = 90 + rng() * 110;
    for (let j = 0; j < n; j++) {
      const ta = rng() * TAU, td = Math.sqrt(rng()) * spread;
      const x = cx + Math.cos(ta) * td, y = cy + Math.sin(ta) * td;
      if (!okTree(x, y)) continue;
      const cell = cellOf(x, y);
      if (cell) cell.trees.push(makeTree(rng, x, y, zoneIndexAt(x, y)));
    }
  }

  // ---- Süs nesneleri ----
  const okDeco = (x, y, m) => {
    const d = Math.hypot(x, y);
    return d > CR + 40 && d < R - 40 && !inLake(x, y, m) && !v34InPond(x, y, m) && !nearDungeon(x, y, m - 60) && !onPath(x, y, m - 20);
  };
  const add = o => { const c = cellOf(o.x, o.y); if (c) c.v34d.push(o); };
  for (let i = 0; i < 2600; i++) {
    const a = rng() * TAU, d = CR + 60 + Math.sqrt(rng()) * (R - CR - 120);
    const x = Math.cos(a) * d, y = Math.sin(a) * d, zi = zoneIndexAt(x, y);
    if (zi < 0) continue;
    const r = rng();
    // bölgeye göre ne çıkacağı: çayırda çiçek ve çalı, ormanda mantar ve kütük, bozkır/kül'de taş öbekleri
    const pool = [
      [['flowers', 0.34], ['bush', 0.32], ['stones', 0.12], ['log', 0.08], ['mush', 0.14]],
      [['bush', 0.3], ['mush', 0.3], ['log', 0.22], ['stones', 0.08], ['flowers', 0.1]],
      [['stones', 0.38], ['drybush', 0.34], ['log', 0.1], ['bones', 0.18]],
      [['stones', 0.42], ['embers', 0.28], ['log', 0.3]],
      [['shards', 0.55], ['stones', 0.3], ['bush', 0.15]],
    ][Math.min(zi, 4)];
    let acc = 0, kind = pool[0][0];
    for (const [k, w] of pool) { acc += w; if (r < acc) { kind = k; break; } }
    const m = kind === 'flowers' ? 50 : 24;
    if (!okDeco(x, y, m)) continue;
    if (kind === 'flowers') {
      const fl = [], n = 14 + Math.floor(rng() * 22), rad = 40 + rng() * 50, col = ZONES[zi].flower;
      const alt = ['#f2f0e8', '#e8a7c8', '#f0c75e', '#b9a2ee'][Math.floor(rng() * 4)];
      for (let j = 0; j < n; j++) { const fa = rng() * TAU, fd = Math.sqrt(rng()) * rad; fl.push({ x: x + Math.cos(fa) * fd, y: y + Math.sin(fa) * fd * 0.7, c: rng() < 0.7 ? col : alt, s: 0.7 + rng() * 0.6, ph: rng() * 6 }); }
      add({ kind, x, y, fl, rad, ground: true });
    } else if (kind === 'bush' || kind === 'drybush') {
      const n = 1 + Math.floor(rng() * 3);
      for (let j = 0; j < n; j++) add({ kind, x: x + (rng() - 0.5) * 50, y: y + (rng() - 0.5) * 30, s: 12 + rng() * 9, ph: rng() * 6, berries: kind === 'bush' && rng() < 0.3 });
    } else if (kind === 'mush') {
      const ms = [], n = 2 + Math.floor(rng() * 4), red = rng() < 0.4;
      for (let j = 0; j < n; j++) ms.push({ x: x + (rng() - 0.5) * 26, y: y + (rng() - 0.5) * 16, s: 0.6 + rng() * 0.6 });
      add({ kind, x, y, ms, red, ground: true });
    } else if (kind === 'log') {
      add({ kind, x, y, a: (rng() - 0.5) * 0.9, L: 40 + rng() * 30, r: 6 + rng() * 3, charred: zi >= 3, moss: zi === 1 });
    } else if (kind === 'stones') {
      const st = [], n = 2 + Math.floor(rng() * 4), col = ZONES[zi].rock || '#7a7f74';
      for (let j = 0; j < n; j++) st.push({ x: (rng() - 0.5) * 34, y: (rng() - 0.5) * 18, r: 4 + rng() * 6 });
      st.sort((p, q) => p.y - q.y);
      add({ kind, x, y, st, col });
    } else if (kind === 'bones') {
      add({ kind, x, y, a: rng() * TAU, ground: true });
    } else if (kind === 'embers') {
      add({ kind, x, y, ph: rng() * 6, ground: true });
    } else if (kind === 'shards') {
      add({ kind, x, y, n: 2 + Math.floor(rng() * 3), ph: rng() * 6, a: rng() });
    }
  }
  V34W.built = true;
}

/* ---------- Çizim ---------- */
function v34DrawPaths(ctx, vx0, vy0, vx1, vy1) {
  for (const pa of V34W.paths) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const line = () => { ctx.beginPath(); pa.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); };
    ctx.strokeStyle = 'rgba(92,72,44,.22)'; ctx.lineWidth = pa.w * 2.2; line(); ctx.stroke();
    ctx.strokeStyle = 'rgba(122,98,62,.55)'; ctx.lineWidth = pa.w * 1.6; line(); ctx.stroke();
    ctx.strokeStyle = 'rgba(150,124,82,.45)'; ctx.lineWidth = pa.w * 0.9; line(); ctx.stroke();
    // yol üstündeki çakıllar (her parçada sabit konum)
    for (let i = 1; i < pa.pts.length; i++) {
      const [ax, ay] = pa.pts[i - 1], [bx, by] = pa.pts[i];
      if (Math.max(ax, bx) < vx0 - 60 || Math.min(ax, bx) > vx1 + 60 || Math.max(ay, by) < vy0 - 60 || Math.min(ay, by) > vy1 + 60) continue;
      for (let j = 0; j < 10; j++) {
        const k = ((j * 0.618 + i * 0.37) % 1), off = (((j * 7.31 + i * 3.7) % 1) - 0.5) * pa.w * 1.3;
        const L = Math.hypot(bx - ax, by - ay) || 1;
        const x = ax + (bx - ax) * k - (by - ay) / L * off, y = ay + (by - ay) * k + (bx - ax) / L * off;
        ctx.fillStyle = j % 3 ? 'rgba(170,150,112,.7)' : 'rgba(90,72,48,.5)';
        ctx.beginPath(); ctx.ellipse(x, y, 2 + (j % 3), 1.4 + (j % 2), 0, 0, TAU); ctx.fill();
      }
    }
  }
}
function v34DrawPond(ctx, p, t) {
  ctx.save();
  // kıyı: ıslak toprak
  ctx.fillStyle = 'rgba(58,70,40,.55)';
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 3, p.rx + 9, p.ry + 7, 0, 0, TAU); ctx.fill();
  const g = ctx.createRadialGradient(p.x - p.rx * 0.2, p.y - p.ry * 0.3, 4, p.x, p.y, p.rx);
  g.addColorStop(0, '#5f9cab'); g.addColorStop(0.7, '#3d7486'); g.addColorStop(1, '#2c5764');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, TAU); ctx.fill();
  // ön kenarda koyu iç gölge (derinlik)
  ctx.strokeStyle = 'rgba(20,40,46,.45)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.ellipse(p.x, p.y + 1, p.rx - 2, p.ry - 2, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  // yansıma ve dalga halkaları
  ctx.strokeStyle = 'rgba(220,240,245,.35)'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 2; i++) {
    const k = ((t * 0.25 + i * 0.5 + p.x * 0.001) % 1);
    ctx.globalAlpha = 1 - k;
    ctx.beginPath(); ctx.ellipse(p.x + p.rx * 0.2, p.y - p.ry * 0.1, p.rx * 0.25 * (0.3 + k), p.ry * 0.25 * (0.3 + k), 0, 0, TAU); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,.18)';
  ctx.beginPath(); ctx.ellipse(p.x - p.rx * 0.35, p.y - p.ry * 0.4, p.rx * 0.3, p.ry * 0.12, -0.2, 0, TAU); ctx.fill();
  for (const l of p.lily) {
    ctx.fillStyle = '#4f8a3c';
    ctx.beginPath(); ctx.ellipse(l.x, l.y, l.r, l.r * 0.6, 0, l.a + 0.35, l.a + TAU - 0.1); ctx.lineTo(l.x, l.y); ctx.fill();
    if (l.f) { ctx.fillStyle = '#f3d6e6'; ctx.beginPath(); ctx.arc(l.x + 1, l.y - 1.5, 2.6, 0, TAU); ctx.fill(); ctx.fillStyle = '#f0c75e'; ctx.beginPath(); ctx.arc(l.x + 1, l.y - 1.8, 1, 0, TAU); ctx.fill(); }
  }
  ctx.strokeStyle = '#5e7a3a'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
  for (const r of p.reeds) {
    const sw = Math.sin(t * 1.6 + r.x * 0.05) * 2;
    ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.quadraticCurveTo(r.x + r.lean * 6, r.y - r.h * 0.6, r.x + r.lean * r.h + sw, r.y - r.h); ctx.stroke();
  }
  ctx.restore();
}
// Yere yapışık süsler (sıralanmaz)
function v34DecoGround(ctx, o, t) {
  if (v34DecoRealmGround(ctx, o, t)) return;
  if (o.kind === 'flowers') {
    for (const f of o.fl) {
      const sw = Math.sin(t * 1.8 + f.ph) * 1.4;
      ctx.strokeStyle = 'rgba(70,110,50,.8)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x + sw, f.y - 6 * f.s); ctx.stroke();
      ctx.fillStyle = f.c;
      ctx.beginPath(); ctx.arc(f.x + sw, f.y - 6.5 * f.s, 2.4 * f.s, 0, TAU); ctx.fill();
    }
  } else if (o.kind === 'mush') {
    for (const m of o.ms) {
      ctx.fillStyle = 'rgba(10,16,8,.25)'; ctx.beginPath(); ctx.ellipse(m.x + 1, m.y + 0.5, 4 * m.s, 1.6 * m.s, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#e9dfc8'; ctx.fillRect(m.x - 1.3 * m.s, m.y - 5 * m.s, 2.6 * m.s, 5 * m.s);
      ctx.fillStyle = o.red ? '#c9432f' : '#a87b52';
      ctx.beginPath(); ctx.ellipse(m.x, m.y - 5 * m.s, 4.5 * m.s, 3.2 * m.s, 0, Math.PI, TAU); ctx.fill();
      if (o.red) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(m.x - 1.5 * m.s, m.y - 6.5 * m.s, 0.8 * m.s, 0, TAU); ctx.arc(m.x + 1.6 * m.s, m.y - 5.8 * m.s, 0.7 * m.s, 0, TAU); ctx.fill(); }
    }
  } else if (o.kind === 'bones') {
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.a);
    ctx.strokeStyle = '#ddd3bb'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.moveTo(-4, -6); ctx.lineTo(6, 5); ctx.stroke();
    ctx.fillStyle = '#e9e1cc'; ctx.beginPath(); ctx.arc(14, -3, 5, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3a3226'; ctx.beginPath(); ctx.arc(15.5, -4, 1.2, 0, TAU); ctx.arc(12.5, -4, 1.2, 0, TAU); ctx.fill();
    ctx.restore();
  } else if (o.kind === 'embers') {
    ctx.fillStyle = 'rgba(30,22,20,.6)'; ctx.beginPath(); ctx.ellipse(o.x, o.y, 16, 8, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const k = 0.5 + 0.5 * Math.sin(t * 3 + o.ph + i * 1.7);
      ctx.fillStyle = `rgba(255,${110 + i * 20},40,${0.35 + 0.4 * k})`;
      ctx.beginPath(); ctx.arc(o.x + (i - 1.5) * 6, o.y + Math.sin(i * 2.1) * 3, 1.5 + k, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}
// Boylu süsler (y'ye göre sıralanır)
function v34DecoProp(ctx, o, t) {
  if (v34DecoRealmProp(ctx, o, t)) return;
  if (o.kind === 'bush' || o.kind === 'drybush') {
    const s = o.s, sw = Math.sin(t * 1.4 + o.ph) * 1.2;
    v34Shadow(ctx, o.x, o.y, s * 1.05, s * 0.38, s, 0.28);
    const sp = v34Sprite('bush' + o.x + ',' + o.y, s * 3 + 8, s * 2.4 + 8, s * 1.5 + 4, s * 2 + 4, x => {
      const rng = mulberry32(Math.floor(o.x * 7.7 + o.y * 3.1) | 0);
      if (o.kind === 'drybush') {
        x.lineCap = 'round';
        for (let i = 0; i < 13; i++) {
          const a = -Math.PI / 2 + (rng() - 0.5) * 2.4, L = s * (0.8 + rng() * 0.7);
          x.strokeStyle = rng() < 0.5 ? '#8a7a52' : '#a8955f'; x.lineWidth = 1.2 + rng();
          const mx = Math.cos(a) * L * 0.55, my = Math.sin(a) * L * 0.55;
          x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(mx * 0.8, my, Math.cos(a) * L, Math.sin(a) * L); x.stroke();
          x.beginPath(); x.moveTo(mx, my); x.lineTo(mx + Math.cos(a + 0.6) * L * 0.3, my + Math.sin(a + 0.6) * L * 0.3); x.stroke();
        }
        return;
      }
      const pal = ['#24492a', '#336b33', '#4f8f45', '#7db864'];
      const clump = (cx, cy, r, col) => {
        x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r * 0.8, 0, TAU); x.fill();
        for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + rng() * 0.4; x.beginPath(); x.arc(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.68, r * (0.25 + rng() * 0.1), 0, TAU); x.fill(); }
      };
      const spots = [[0, -s * 0.6, s * 0.75], [-s * 0.55, -s * 0.45, s * 0.55], [s * 0.55, -s * 0.45, s * 0.55], [-s * 0.15, -s * 1.0, s * 0.5], [s * 0.3, -s * 0.95, s * 0.45]];
      for (const [cx, cy, r] of spots) clump(cx, cy + s * 0.06, r, '#1a3a20');
      for (const [cx, cy, r] of spots) clump(cx, cy, r * 0.94, pal[0]);
      for (const [cx, cy, r] of spots) clump(cx - r * 0.15, cy - r * 0.2, r * 0.7, pal[1]);
      for (const [cx, cy, r] of spots) if (cy < -s * 0.5) clump(cx - r * 0.3, cy - r * 0.35, r * 0.38, pal[2]);
      x.globalCompositeOperation = 'source-atop';
      for (let i = 0; i < 18; i++) {
        x.fillStyle = rng() < 0.5 ? pal[3] : '#16331c'; x.globalAlpha = 0.55;
        x.beginPath(); x.ellipse((rng() - 0.5) * s * 2, -rng() * s * 1.4, 1.6 + rng(), 1 + rng() * 0.6, rng() * 3, 0, TAU); x.fill();
      }
      x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      if (o.berries) {
        for (let i = 0; i < 7; i++) {
          const bx = (rng() - 0.5) * s * 1.6, by = -s * (0.3 + rng() * 0.8);
          x.fillStyle = '#c4384a'; x.beginPath(); x.arc(bx, by, 1.8, 0, TAU); x.fill();
          x.fillStyle = 'rgba(255,220,220,.7)'; x.beginPath(); x.arc(bx - 0.5, by - 0.6, 0.6, 0, TAU); x.fill();
        }
      }
    });
    v34Blit(ctx, sp, o.x + sw * 0.6, o.y);
  } else if (o.kind === 'log') {
    const { x, y, a, L, r } = o;
    v34Shadow(ctx, x, y + 1, L * 0.55, r * 0.7, r * 1.5, 0.28);
    ctx.save(); ctx.translate(x, y);
    const cx = Math.cos(a) * L / 2, cy = Math.sin(a) * L / 2 * 0.45;
    const bark = o.charred ? '#2f2522' : '#5a3d27', top = o.charred ? '#463733' : '#7c5737';
    ctx.strokeStyle = bark; ctx.lineWidth = r * 2; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(-cx, -cy - r); ctx.lineTo(cx, cy - r); ctx.stroke();
    ctx.strokeStyle = top; ctx.lineWidth = r * 0.8;
    ctx.beginPath(); ctx.moveTo(-cx, -cy - r * 1.45); ctx.lineTo(cx, cy - r * 1.45); ctx.stroke();
    if (o.frozen) { ctx.strokeStyle = '#f4f8fb'; ctx.lineWidth = r * 0.7; ctx.beginPath(); ctx.moveTo(-cx * 0.9, -cy * 0.9 - r * 1.8); ctx.lineTo(cx * 0.9, cy * 0.9 - r * 1.8); ctx.stroke(); }
    if (o.moss) { ctx.strokeStyle = 'rgba(110,160,70,.8)'; ctx.lineWidth = r * 0.5; ctx.beginPath(); ctx.moveTo(-cx * 0.6, -cy * 0.6 - r * 1.75); ctx.lineTo(cx * 0.2, cy * 0.2 - r * 1.75); ctx.stroke(); }
    ctx.fillStyle = o.charred ? '#5a4842' : '#c99a62';
    ctx.beginPath(); ctx.ellipse(cx, cy - r, r * 0.55, r, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = o.charred ? '#2a201d' : '#8a6440'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy - r, r * 0.28, r * 0.5, 0, 0, TAU); ctx.stroke();
    ctx.restore();
  } else if (o.kind === 'stones') {
    for (const s of o.st) {
      const sx = o.x + s.x, sy = o.y + s.y, h = s.r * 1.1;
      v34Shadow(ctx, sx, sy, s.r * 1.1, s.r * 0.4, h, 0.25);
      ctx.fillStyle = shadeColor(o.col, -0.25);
      ctx.beginPath(); ctx.ellipse(sx, sy - h * 0.45, s.r, h * 0.6, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = o.snow ? '#eef5f9' : o.col;
      ctx.beginPath(); ctx.ellipse(sx - s.r * 0.12, sy - h * 0.68, s.r * 0.78, h * 0.34, 0, 0, TAU); ctx.fill();
    }
  } else if (o.kind === 'shards') {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `rgba(140,220,240,${0.12 + 0.06 * Math.sin(t * 2 + o.ph)})`;
    ctx.beginPath(); ctx.arc(o.x, o.y - 8, 22, 0, TAU); ctx.fill();
    ctx.restore();
    for (let i = 0; i < o.n; i++) {
      const bx = o.x + (i - (o.n - 1) / 2) * 8, h = 12 + ((i * 5 + o.a * 10) % 9), w = 3.5;
      ctx.fillStyle = o.ice ? (i % 2 ? '#bfe6ff' : '#e6f6ff') : (i % 2 ? '#7fd3d6' : '#9a86ee');
      ctx.beginPath(); ctx.moveTo(bx - w, o.y); ctx.lineTo(bx - w * 0.8, o.y - h * 0.8); ctx.lineTo(bx, o.y - h); ctx.lineTo(bx + w * 0.8, o.y - h * 0.8); ctx.lineTo(bx + w, o.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.beginPath(); ctx.moveTo(bx - w, o.y); ctx.lineTo(bx - w * 0.8, o.y - h * 0.8); ctx.lineTo(bx, o.y - h); ctx.lineTo(bx, o.y); ctx.closePath(); ctx.fill();
    }
  }
}
