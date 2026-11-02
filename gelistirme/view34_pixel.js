/* ============ 12-L. PİKSEL KAHRAMANLAR (DENEME) ============
   Üç sınıf, 56x56'lık küçük bir ızgarada piksel piksel çizilir ve keskin büyütülür.
   İri kafa, geniş omuz, belirgin kaş/göz/ağız; ifadeler: normal, öfkeli (saldırı), acı (hasar), yorgun (can azken), göz kırpma.
   Her kare (sınıf + eşya + yön + adım + silah açısı + ifade) bir kez çizilip saklanır. */

V34.pixel = true;
const PXK = 1.6;                 // bir piksel kaç dünya birimi
const PX_W = 56, PX_H = 64, PX_TOP = 8, PX_BASE = 52 + 8;   // ızgara boyutu, üst pay ve ayak hizası
const V34PX = new Map();

function pxThick(x, x0, y0, x1, y1, w, col) {
  x.fillStyle = col;
  const L = Math.max(1, Math.hypot(x1 - x0, y1 - y0)), n = Math.ceil(L * 2);
  for (let i = 0; i <= n; i++) {
    const k = i / n, px = Math.round(x0 + (x1 - x0) * k - w / 2), py = Math.round(y0 + (y1 - y0) * k - w / 2);
    x.fillRect(px, py, w, w);
  }
}
// Kenara koyu çerçeve: saydam olup dolu bir komşusu olan her piksele
function pxOutline(cv) {
  const x = cv.getContext('2d'), W = cv.width, H = cv.height;
  const im = x.getImageData(0, 0, W, H), d = im.data, src = new Uint8ClampedArray(d);
  for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) {
    const o = (y * W + i) * 4;
    if (src[o + 3] > 40) continue;
    const solid = (a, b) => a >= 0 && b >= 0 && a < W && b < H && src[(b * W + a) * 4 + 3] > 120;
    if (solid(i - 1, y) || solid(i + 1, y) || solid(i, y - 1) || solid(i, y + 1)) { d[o] = 28; d[o + 1] = 20; d[o + 2] = 14; d[o + 3] = 215; }
  }
  x.putImageData(im, 0, 0);
}

// Sınıf, eşya ve duruma göre bir kareyi çizer
function pxPaint(x, S) {
  const { cls, eq, dir, wf, expr, combat, ang, draw, glow } = S;
  const R = s => (eq[s] ? eq[s].rarity : null);
  const P = (X, Y, W, H, c) => { x.fillStyle = c; x.fillRect(X, Y, W, H); };
  const SKIN = '#f0c49a', SKIN_D = '#c98e66', HAIR = cls === 'mage' ? '#e9e4d8' : cls === 'warrior' ? '#6a3a1e' : '#4a2e1a';
  const side = dir === 'side', up = dir === 'up';
  // ---- renkler ----
  let tun, tunD, pants, boots;
  if (cls === 'warrior') {
    const m = R('chest') ? LOOK.metal[R('chest')] : null;
    tun = m ? m[1] : '#c9b88e'; tunD = m ? shadeColor(m[1], -0.3) : '#8f7f5c';
    pants = R('legs') ? LOOK.metal[R('legs')][1] : '#5a4a3a'; boots = R('feet') ? LOOK.metal[R('feet')][1] : '#3b2a1c';
  } else if (cls === 'archer') {
    const l = R('chest') ? LOOK.leather[R('chest')] : null;
    tun = l ? l[0] : '#7a9a4a'; tunD = l ? l[1] : '#4e6a2c';
    pants = R('legs') ? LOOK.leather[R('legs')][1] : '#5c4a36'; boots = R('feet') ? LOOK.leather[R('feet')][1] : '#3b2a1c';
  } else {
    const c = R('chest') ? LOOK.cloth[R('chest')] : null;
    tun = c ? c[1] : '#4a5a9a'; tunD = c ? c[0] : '#2e3866';
    pants = tunD; boots = R('feet') ? LOOK.cloth[R('feet')][0] : '#2e2620';
  }
  const trim = r => (r && r !== 'common' ? RARITY[r].color : null);
  const wide = cls === 'warrior' ? 1 : 0;
  // yürüme: 4 kare; 1 ve 3'te bir ayak kalkar
  const liftL = wf === 1 ? 1 : 0, liftR = wf === 3 ? 1 : 0;
  const bob = wf === 1 || wf === 3 ? -1 : 0;

  // ---- silah (arkada kalacaksa önce çizilir) ----
  const shoulder = up ? [17, 30 + bob] : side ? [27, 30 + bob] : [32 + wide, 30 + bob];
  const da = Math.cos(ang), db = Math.sin(ang);
  const hand = combat ? [shoulder[0] + da * 7, shoulder[1] + db * 7] : up ? [16, 38 + bob] : side ? [28, 38 + bob] : [33 + wide, 38 + bob];
  const weaponBack = combat ? db < -0.35 || up : up;
  const weapon = () => {
    const [hx, hy] = hand, wr = R('weapon');
    if (!eq.weapon) return;
    if (cls === 'warrior') {
      const a = combat ? ang : -1.25, ca = Math.cos(a), sa = Math.sin(a);
      const m = LOOK.metal[wr];
      pxThick(x, hx - ca * 2, hy - sa * 2, hx + ca * 1, hy + sa * 1, 2, '#5a3a22');      // kabza
      pxThick(x, hx + ca * 1 - sa * 3, hy + sa * 1 + ca * 3, hx + ca * 1 + sa * 3, hy + sa * 1 - ca * 3, 2, m[2]);   // siper
      pxThick(x, hx + ca * 2, hy + sa * 2, hx + ca * 15, hy + sa * 15, 3, m[1]);
      pxThick(x, hx + ca * 2, hy + sa * 2, hx + ca * 14, hy + sa * 14, 1, m[0]);
      if (wr === 'rare' || wr === 'legendary') pxThick(x, hx + ca * 16, hy + sa * 16, hx + ca * 16, hy + sa * 16, 2, RARITY[wr].color);
    } else if (cls === 'archer') {
      const a = combat ? ang : (side ? 1.35 : 1.25), ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
      const bowC = LOOK.bow[wr];
      const pts = [];
      for (let s = -9; s <= 9; s++) { const back = (s * s) / 22; pts.push([hx + ca * (1 - back) + px * s, hy + sa * (1 - back) + py * s]); }
      for (let i = 1; i < pts.length; i++) pxThick(x, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 2, bowC);
      const nk = combat ? 2 + draw * 3 : 0, nx = hx - ca * nk, ny = hy - sa * nk;
      const t0 = pts[0], t1 = pts[pts.length - 1];
      pxThick(x, t0[0], t0[1], nx, ny, 1, '#efe6d0'); pxThick(x, nx, ny, t1[0], t1[1], 1, '#efe6d0');
      if (combat && draw > 0) {
        pxThick(x, nx, ny, hx + ca * 9, hy + sa * 9, 1, '#d9c7a0');
        pxThick(x, hx + ca * 9, hy + sa * 9, hx + ca * 11, hy + sa * 11, 2, '#c8ced4');
      }
    } else {
      const a = combat ? ang : -Math.PI / 2 + (side ? 0.12 : 0.06), ca = Math.cos(a), sa = Math.sin(a);
      const oc = LOOK.orb[wr];
      pxThick(x, hx - ca * 8, hy - sa * 8, hx + ca * 13, hy + sa * 13, 2, wr === 'legendary' ? '#3a2418' : '#7a5232');
      const ox = hx + ca * 15, oy = hy + sa * 15;
      if (glow) { x.fillStyle = `rgba(${oc},.35)`; x.beginPath(); x.arc(Math.round(ox), Math.round(oy), 6, 0, TAU); x.fill(); }
      P(Math.round(ox) - 2, Math.round(oy) - 2, 4, 4, `rgb(${oc})`);
      P(Math.round(ox) - 1, Math.round(oy) - 2, 1, 1, '#ffffff');
    }
    // silahı tutan kol ve el
    if (combat) {
      pxThick(x, shoulder[0], shoulder[1], hx, hy, 3, cls === 'mage' ? tun : tunD);
      P(Math.round(hx) - 1, Math.round(hy) - 1, 3, 3, eq.hands ? (cls === 'warrior' ? LOOK.metal[R('hands')][1] : cls === 'archer' ? LOOK.leather[R('hands')][0] : LOOK.cloth[R('hands')][1]) : SKIN);
    }
  };
  if (weaponBack) weapon();

  // ---- sırttaki parçalar ----
  if (cls === 'archer' && (up || side)) {   // sadak
    const qx = up ? 30 : 19;
    P(qx, 27 + bob, 4, 11, '#6a4526'); P(qx, 30 + bob, 4, 1, '#3c2716');
    P(qx, 24 + bob, 1, 3, '#e8e0cc'); P(qx + 2, 23 + bob, 1, 4, '#e8e0cc'); P(qx + 1, 22 + bob, 1, 2, '#c94a3a'); P(qx + 3, 23 + bob, 1, 2, '#c94a3a');
  }
  if (cls === 'warrior' && up && eq.chest) P(19, 30 + bob, 10, 9, '#5a3b26');   // sırttaki kalkan

  // ---- bacaklar / cüppe ----
  if (cls === 'mage') {
    const rows = 17;
    for (let i = 0; i < rows; i++) {
      const w = 10 + Math.floor(i / 3) * 1 + (side ? -1 : 0), yy = 29 + bob + i;
      P(28 - Math.ceil(w / 2) - (side ? 0 : 1), yy, w + (side ? 0 : 2), 1, i % 5 === 4 ? tunD : tun);
    }
    const tr = trim(R('chest')) || '#d9b45a';
    P(side ? 22 : 20, 45, side ? 12 : 16, 1, tr);
    if (!side && !up) P(27, 30 + bob, 2, 15, tunD);
    P(side ? 26 + (wf === 1 ? 1 : wf === 3 ? -1 : 0) : 22 + liftL, 46 - liftL, 4, 2, boots);
    P(side ? 23 + (wf === 1 ? -1 : wf === 3 ? 1 : 0) : 30 - liftR, 46 - liftR, 4, 2, boots);
  } else if (side) {
    const fw = wf === 1 ? 2 : wf === 3 ? -2 : 0;
    P(24 - fw, 38 + bob, 3, 6, shadeColor(pants, -0.25)); P(24 - fw, 44, 4, 3, shadeColor(boots, -0.25));
    P(27 + fw, 38 + bob, 3, 6, pants); P(27 + fw, 44, 5, 3, boots);
  } else {
    P(23 - wide, 38 + bob, 4, 6 - liftL, pants); P(23 - wide, 44 - liftL, 4, 3, boots);
    P(29 + wide, 38 + bob, 4, 6 - liftR, pants); P(29 + wide, 44 - liftR, 4, 3, boots);
    const bt = trim(R('feet')); if (bt) { P(23 - wide, 44 - liftL, 4, 1, bt); P(29 + wide, 44 - liftR, 4, 1, bt); }
  }

  // ---- gövde ----
  const tx = side ? 23 : 22 - wide, tw = side ? 9 : 12 + wide * 2, ty = 29 + bob;
  if (cls !== 'mage') {
    P(tx, ty, tw, 9, tun);
    P(tx + tw - 2, ty, 2, 9, tunD);                     // sağ kenar gölgesi
    P(tx, ty + 7, tw, 2, cls === 'warrior' ? '#3a2616' : '#4a3020');   // kemer
    P(tx + Math.floor(tw / 2) - 1, ty + 7, 2, 2, '#d9b45a');
    if (cls === 'warrior' && eq.chest && !up) {          // arma kumaşı
      P(tx + Math.floor(tw / 2) - 2, ty + 1, 4, 6, PXCOL.warrior);
      const tr = trim(R('chest')); if (tr) P(tx + Math.floor(tw / 2) - 2, ty + 1, 4, 1, tr);
    }
    if (cls === 'archer' && !up) { pxThick(x, tx + 1, ty + 1, tx + tw - 2, ty + 6, 1, '#4a3020'); const tr = trim(R('chest')); if (tr) P(tx + 2, ty, tw - 4, 1, tr); }
  } else {
    P(23, ty + 6, 10, 2, tunD); P(27, ty + 6, 2, 2, '#d9b45a');   // kuşak
  }
  // omuzluk (savaşçı)
  if (cls === 'warrior' && eq.chest) {
    const m = LOOK.metal[R('chest')];
    if (side) P(23, ty - 1, 5, 4, m[1]);
    else { P(tx - 3, ty - 1, 5, 4, m[1]); P(tx + tw - 2, ty - 1, 5, 4, m[1]); P(tx - 2, ty - 1, 3, 1, m[0]); P(tx + tw - 1, ty - 1, 3, 1, m[0]); }
  }
  // boştaki kollar
  const armC = cls === 'mage' ? tun : tunD;
  if (!side) {
    const hc = SKIN;
    if (!(combat && up)) { P(tx - 3, ty + 1, 3, 7, armC); P(tx - 3, ty + 8, 3, 2, hc); }
    if (!(combat && !up)) { P(tx + tw, ty + 1, 3, 7, armC); P(tx + tw, ty + 8, 3, 2, hc); }
  } else if (!combat) { P(26, ty + 1, 3, 7, armC); P(26, ty + 8, 3, 2, SKIN); }
  // kalkan (savaşçı, önde)
  if (cls === 'warrior' && !up) {
    const sx = side ? 20 : tx - 6, sw2 = side ? 4 : 6;
    P(sx, ty + 1, sw2, 9, '#6a4428'); P(sx, ty + 1, sw2, 1, '#d9b45a'); P(sx, ty + 9, sw2, 1, '#d9b45a');
    P(sx, ty + 1, 1, 9, '#d9b45a'); P(sx + sw2 - 1, ty + 1, 1, 9, '#d9b45a');
    P(sx + Math.floor(sw2 / 2) - 1, ty + 4, 2, 2, '#e8d08a');
  }

  // ---- kafa: 12x12, iri ----
  const hx = side ? 22 : 22, hy = 17 + bob, HW = 12;
  P(hx, hy + 2, HW, 10, SKIN);
  P(hx, hy + 10, HW, 2, SKIN_D);
  // saç (arka / üst)
  if (!eq.head || cls === 'mage') {
    P(hx - 1, hy, HW + 2, 4, HAIR);
    if (up) P(hx - 1, hy, HW + 2, 11, HAIR);
    if (side) P(hx - 1, hy, 5, 9, HAIR);
  }
  // yüz
  if (!up) {
    const ex1 = side ? hx + 7 : hx + 3, ex2 = hx + 7, ey = hy + 5;
    const eye = (ex) => {
      if (expr === 'blink' || expr === 'pain') { P(ex, ey + 1, 2, 1, '#2a1a10'); return; }
      if (expr === 'tired') { P(ex, ey + 1, 2, 1, '#2a1a10'); P(ex, ey, 2, 1, SKIN_D); return; }
      P(ex, ey, 2, 2, '#1e1410'); P(ex, ey, 1, 1, '#ffffff');
    };
    eye(ex1); if (!side) eye(ex2);
    // kaşlar: öfkede içe doğru çatık
    const browC = cls === 'mage' ? '#d9d4c8' : HAIR;
    const brow = (bx, inner) => {
      if (expr === 'angry') { P(bx, ey - 2, 3, 1, browC); P(inner ? bx + 2 : bx, ey - 1, 1, 1, browC); }
      else if (expr === 'pain') { P(bx, ey - 1, 3, 1, browC); P(inner ? bx + 2 : bx, ey - 2, 1, 1, browC); }
      else P(bx, ey - 2, 3, 1, browC);
    };
    if (side) brow(ex1 - 1, false); else { brow(ex1 - 1, true); brow(ex2 - 0, false); }
    // ağız
    const mx = side ? hx + 8 : hx + 5, my = hy + 9;
    if (expr === 'angry') { P(mx - 1, my, 4, 1, '#5a2a1a'); P(mx, my, 2, 1, '#f2ece0'); }
    else if (expr === 'pain') { P(mx, my - 1, 2, 2, '#5a2a1a'); }
    else if (expr === 'tired') { P(mx, my, 2, 1, '#8a4a3a'); P(hx + (side ? 10 : 11), hy + 3, 1, 2, '#8fd3ff'); }
    else { P(mx, my, 2, 1, '#8a4a3a'); }
    if (side) P(hx + 12, hy + 7, 1, 2, SKIN_D);   // burun
    // yanak
    if (!side) { P(hx + 1, hy + 8, 2, 1, '#e8a07a'); P(hx + 9, hy + 8, 2, 1, '#e8a07a'); }
  }
  // sakal
  if (cls === 'warrior' && !up) {
    const bc = HAIR;
    if (side) { P(hx + 5, hy + 9, 7, 4, bc); P(hx + 6, hy + 13, 5, 1, bc); }
    else { P(hx, hy + 8, 2, 4, bc); P(hx + 10, hy + 8, 2, 4, bc); P(hx + 1, hy + 10, 10, 3, bc); P(hx + 3, hy + 13, 6, 1, bc); P(hx + 4, hy + 9, 4, 1, bc); }
    if (expr === 'angry') P(hx + 4, hy + 10, 4, 1, '#f2ece0');
  }
  if (cls === 'mage' && !up) {
    const bc = '#eeeae0';
    if (side) { P(hx + 6, hy + 9, 6, 4, bc); P(hx + 7, hy + 13, 4, 4, bc); P(hx + 8, hy + 17, 2, 2, bc); }
    else { P(hx + 1, hy + 9, 10, 4, bc); P(hx + 2, hy + 13, 8, 4, bc); P(hx + 3, hy + 17, 6, 3, bc); P(hx + 5, hy + 20, 2, 2, bc); P(hx + 4, hy + 9, 4, 1, '#cfc8b8'); }
  }
  // ---- başlık ----
  if (cls === 'warrior' && eq.head) {
    const m = LOOK.metal[R('head')], pl = LOOK.plume[R('head')];
    P(hx - 1, hy - 1, HW + 2, 6, m[0]); P(hx + HW - 2, hy - 1, 3, 6, m[1]);
    if (up) P(hx - 1, hy - 1, HW + 2, 13, m[1]);   // arkadan: miğfer ensenin tamamını örter
    if (!up) {
      P(side ? hx + 6 : hx + 5, hy + 4, 2, 4, m[1]);          // burun koruması
      if (!side) { P(hx - 1, hy + 4, 2, 5, m[1]); P(hx + HW - 1, hy + 4, 2, 5, m[1]); }
      else P(hx - 1, hy + 4, 3, 5, m[1]);
    } else P(hx - 1, hy + 4, HW + 2, 6, m[1]);
    P(hx + 4, hy - 5, 4, 4, pl); P(hx + 1, hy - 4, 3, 3, pl); P(hx - 1, hy - 2, 2, 3, pl);   // tüy
    const tr = trim(R('head')); if (tr) P(hx - 1, hy + 4, HW + 2, 1, tr);
  } else if (cls === 'archer' && eq.head) {
    const [l, d] = LOOK.leather[R('head')];
    P(hx - 2, hy - 2, HW + 4, 5, d); P(hx + 3, hy - 4, 6, 2, d); P(hx + 5, hy - 5, 2, 1, d);
    P(hx - 2, hy + 3, 3, 10, d); P(hx + HW - 1, hy + 3, 3, 10, d);
    if (up) P(hx - 2, hy - 2, HW + 4, 15, d);
    else if (side) P(hx - 2, hy - 2, 7, 14, d);
    P(hx - 1, hy - 1, HW + 2, 2, l);
    P(hx - 3, hy + 11, HW + 6, 3, d);    // omuz pelerini
    const tr = trim(R('head')); if (tr) P(hx - 2, hy + 2, HW + 4, 1, tr);
  } else if (cls === 'mage' && eq.head) {
    const [brim, crown, tipc] = LOOK.cloth[R('head')];
    // sivri, ucu arkaya kıvrılan şapka
    P(hx, hy - 3, HW, 4, crown);
    P(hx + 1, hy - 7, 10, 4, crown); P(hx + 2, hy - 11, 8, 4, crown); P(hx + 3, hy - 14, 6, 3, crown);
    P(hx + 4, hy - 17, 4, 3, crown); P(hx + 5, hy - 19, 3, 2, crown); P(hx + 7, hy - 21, 3, 2, crown); P(hx + 9, hy - 22, 2, 2, crown);
    P(hx + 8, hy - 14, 2, 11, shadeColor(crown, -0.25));        // gölgeli yan
    P(hx - 5, hy + 1, HW + 10, 2, brim); P(hx - 4, hy + 3, HW + 8, 1, shadeColor(brim, -0.3));
    P(hx, hy, HW, 1, tipc);
    const st = R('head') === 'common' ? '#f6d592' : RARITY[R('head')].color;
    P(hx + 4, hy - 8, 2, 2, st); P(hx + 3, hy - 7, 1, 1, st); P(hx + 6, hy - 7, 1, 1, st);
  }
  if (!weaponBack) weapon();
}
const PXCOL = { warrior: '#b5242c' };

// Kahramanın durumundan kare anahtarı ve çizim
function v34PixelHero(ctx, p, t, tint) {
  const cls = p.classId, eq = p.equip || PREVIEW_EQUIP;
  const moving = !!(p.moveVec && (p.moveVec.x || p.moveVec.y));
  const bodyA = v34HeroAngle(p, t), dir = v34Dir(bodyA);
  const flip = dir === 'side' && Math.cos(bodyA) < 0;
  const wf = moving ? Math.floor((((p.walk || 0) % TAU) + TAU) % TAU / TAU * 4) : 0;
  const charging = p === G.player && typeof input !== 'undefined' && input.attackHeld;
  let combat = false, ang = 0, draw = 0, glow = false;
  if (cls === 'archer') {
    const since = t - (p.bowPull || -9);
    combat = charging || p.aiming || since < 0.5; ang = p.facing;
    draw = charging || p.aiming ? 2 : since < 0.12 ? 1 : 0;
  } else if (cls === 'warrior') {
    if (p.spin && t - p.spin.start < p.spin.dur) { combat = true; ang = p.facing + ((t - p.spin.start) / p.spin.dur) * TAU; }
    else if (p.swing && t - p.swing.start < p.swing.dur) { combat = true; const k = (t - p.swing.start) / p.swing.dur; ang = p.swing.angle - p.swing.arc / 2 + p.swing.arc * easeOut(k); }
    else if (charging) { combat = true; ang = p.facing - 0.9; }
  } else {
    const since = t - (p.staffGlow || -9);
    combat = charging || since < 0.45; ang = p.facing; glow = since < 0.3;
  }
  if (flip) ang = Math.PI - ang;
  const ai = ((Math.round(ang / (TAU / 16)) % 16) + 16) % 16;
  const sAng = ai * (TAU / 16);
  const hpK = p.stats ? p.hp / p.stats.maxHp : 1;
  const expr = t - p.hurtAt < 0.35 ? 'pain' : combat ? 'angry' : hpK < 0.3 ? 'tired' : ((t + (p.x || 0) * 0.01) % 3.7) < 0.13 ? 'blink' : 'normal';
  const sig = ['head', 'chest', 'legs', 'feet', 'hands', 'weapon'].map(s => (eq[s] ? eq[s].rarity[0] : '-')).join('');
  const key = [cls, sig, dir, wf, combat ? ai : 'r', draw, glow ? 1 : 0, expr, tint || ''].join('|');
  let cv = V34PX.get(key);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = PX_W; cv.height = PX_H;
    const x = cv.getContext('2d');
    x.translate(0, PX_TOP);
    pxPaint(x, { cls, eq, dir, wf, expr, combat, ang: sAng, draw, glow });
    pxOutline(cv);
    if (tint) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = tint; x.globalAlpha = 0.6; x.setTransform(1, 0, 0, 1, 0, 0); x.fillRect(0, 0, PX_W, PX_H); }
    if (V34PX.size > 700) V34PX.delete(V34PX.keys().next().value);
    V34PX.set(key, cv);
  }
  ctx.save();
  if (flip) ctx.scale(-1, 1);
  const prev = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(cv, -28 * PXK, -PX_BASE * PXK, PX_W * PXK, PX_H * PXK);
  ctx.imageSmoothingEnabled = prev;
  ctx.restore();
}
