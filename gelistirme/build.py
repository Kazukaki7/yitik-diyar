# Deneme (3/4 görünüm) sürümünü asıl oyundan üretir: python3 build.py
# Asıl dosyaya dokunmaz; çıktı: /home/claude/deneme/deneme.html ve site/deneme/index.html
import os, re
SRC = '/home/claude/yitik-diyar.html'
HERE = os.path.dirname(os.path.abspath(__file__))
s = open(SRC, encoding='utf-8').read()

def rep(a, b, cnt=1):
    global s
    n = s.count(a)
    assert n == cnt, f'{n} kez bulundu: {a[:70]!r}'
    s = s.replace(a, b)

# --- Kayıtlar asıl oyundan ayrı; ilk açılışta asıl oyundaki karakterler kopyalanır ---
rep("SLOTS_KEY: 'yitik-diyar-karakterler-v2',", "SLOTS_KEY: 'yitik-diyar-deneme34-v1', MAIN_SLOTS_KEY: 'yitik-diyar-karakterler-v2',")
rep("OLD_SAVE_KEY: 'yitik-diyar-kayit-v1',", "OLD_SAVE_KEY: 'yitik-diyar-deneme34-yok',")
rep("const REDUCED_MOTION =", """// Deneme: kendi kaydı yoksa asıl oyundaki karakterleri bir kez kopyala (asıl kayıt değişmez)
try {
  if (!localStorage.getItem(CONFIG.SLOTS_KEY)) {
    const main = localStorage.getItem(CONFIG.MAIN_SLOTS_KEY);
    if (main) localStorage.setItem(CONFIG.SLOTS_KEY, main);
  }
} catch (_) { /* depolama kapalı */ }
const REDUCED_MOTION =""")
rep('<p class="eyebrow">Sürüm 0.12 · Kızıl Kum Diyarı</p>',
    '<p class="eyebrow">Deneme · 3/4 görünüm · sürüm D13</p>')
rep('<title>Yitik Diyar</title>', '<title>Yitik Diyar · Deneme</title>')
rep("""      Ana tema ekrana ilk dokunuşta başlar.""",
    """      <b>Bu bir deneme sürümüdür:</b> karakterlerin asıl oyundan kopyalandı, burada yaptıkların asıl oyunu etkilemez. Yeni görünüm şimdilik yeşil diyarda ve okçuda.
      Ana tema ekrana ilk dokunuşta başlar.""")

# --- Yeni çizim modülü ---
mod = '\n\n'.join(open(os.path.join(HERE, f), encoding='utf-8').read() for f in ['view34.js', 'view34_world.js', 'view34_enemy.js', 'view34_enemy2.js', 'view34_fx.js', 'view34_heroes.js', 'view34_realms.js', 'view34_dungeon.js', 'view34_pixel.js'])
rep("/* ============ 12. ÇİZİM ============ */", mod + "\n\n/* ============ 12. ÇİZİM ============ */")

# --- render(): yeşil diyarda zemin nesneleri sıralı listeye girer ---
rep("""  const trees = [];
  if (G.area) drawArea(ctx, t, vx0, vy0, vx1, vy1);""", """  const trees = [], props = [];
  const v34 = v34Green();
  if (G.area) drawArea(ctx, t, vx0, vy0, vx1, vy1);""")
rep("""    forEachCell(vx0, vy0, vx1, vy1, cell => {
      for (const tf of cell.tufts) if (inView(tf.x, tf.y)) drawTuft(ctx, tf);
      for (const rk of cell.rocks) if (inView(rk.x, rk.y)) drawRock(ctx, rk);
      for (const tr of cell.trees) if (inView(tr.x, tr.y, 60)) trees.push(tr);
    });
    if (inView(0, 0, 320)) { if (green) drawCamp(ctx, t);""", """    if (v34) forEachCell(vx0 - 80, vy0 - 80, vx1 + 80, vy1 + 80, cell => v34GroundPatches(ctx, cell));
    forEachCell(vx0, vy0, vx1, vy1, cell => {
      if (v34) {
        for (const tf of cell.tufts) if (inView(tf.x, tf.y)) v34Tuft(ctx, tf, t);
        for (const rk of cell.rocks) if (inView(rk.x, rk.y, 30)) props.push({ y: rk.y, k: 'rock', o: rk });
        for (const tr of cell.trees) if (inView(tr.x, tr.y, tr.size * 1.2) || inView(tr.x, tr.y - v34TreeHeight(tr), tr.size * 1.2)) trees.push(tr);
        return;
      }
      for (const tf of cell.tufts) if (inView(tf.x, tf.y)) drawTuft(ctx, tf);
      for (const rk of cell.rocks) if (inView(rk.x, rk.y)) drawRock(ctx, rk);
      for (const tr of cell.trees) if (inView(tr.x, tr.y, 60)) trees.push(tr);
    });
    if (inView(0, 0, 320)) { if (green && v34) { v34CampGround(ctx, t); v34CampProps(props); } else if (green) drawCamp(ctx, t);""")
rep("""  for (const tr of trees) list.push({ y: tr.y + 6, k: 't', o: tr });
  const p = G.player;
  if (p && !p.dead) list.push({ y: p.y, k: 'p', o: p });
  list.sort((a, b) => a.y - b.y);
  for (const it of list) {
    if (it.k === 'e') drawEnemy(ctx, it.o, t);
    else if (it.k === 'p') drawHero(ctx, it.o, t);
    else drawTree(ctx, it.o, p && !p.dead && dist(p.x, p.y, it.o.x, it.o.y) < it.o.size * 0.95 && p.y < it.o.y + 10);
  }""", """  for (const tr of trees) list.push({ y: tr.y + 6, k: 't', o: tr });
  for (const pr of props) list.push(pr);
  const p = G.player;
  if (p && !p.dead) list.push({ y: p.y + (V34.on ? 10 : 0), k: 'p', o: p });
  list.sort((a, b) => a.y - b.y);
  for (const it of list) {
    if (it.k === 'e') drawEnemy(ctx, it.o, t);
    else if (it.k === 'p') { if (V34.on) v34Hero(ctx, it.o, t); else drawHero(ctx, it.o, t); }
    else if (it.k === 'rock') v34Rock(ctx, it.o);
    else if (it.k === 'tent') v34Tent(ctx, it.o);
    else if (it.k === 'log') v34Log(ctx, it.o);
    else if (it.k === 'stone') v34Stone(ctx, it.o);
    else if (it.k === 'fire') v34Fire(ctx, t);
    else if (v34) v34Tree(ctx, it.o, t, v34TreeFade(it.o, p));
    else drawTree(ctx, it.o, p && !p.dead && dist(p.x, p.y, it.o.x, it.o.y) < it.o.size * 0.95 && p.y < it.o.y + 10);
  }
  if (v34 && inView(0, 0, 400)) v34FireGlow(ctx, t);""")
# yuvarlak parçacık desteği (toz bulutu)
rep("""    const s = q.size * (0.5 + 0.5 * a);
    ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);""", """    const s = q.size * (0.5 + 0.5 * a);
    if (q.round) { ctx.beginPath(); ctx.arc(q.x, q.y, s / 2 * (1.6 - a * 0.6), 0, TAU); ctx.fill(); }
    else ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);""")

# --- Süsleme: dünya üretiminden sonra yollar, göletler, ağaç kümeleri, süsler ---
rep("""      if (!inLake(x, y, 6)) LAKE.reeds.push({ x, y, h: 8 + rng() * 9, lean: rng() * 0.6 - 0.3 });
    }
  }
}""", """      if (!inLake(x, y, 6)) LAKE.reeds.push({ x, y, h: 8 + rng() * 9, lean: rng() * 0.6 - 0.3 });
    }
  }
  if (V34.on) v34Decorate();
}""")
rep("function inLake(x, y, m = 0) { return REALM.id === 'green' && LAKE.circles.some(c => Math.hypot(x - c.x, y - c.y) < c.r + m); }",
    "function inLake(x, y, m = 0) { return REALM.id === 'green' && (LAKE.circles.some(c => Math.hypot(x - c.x, y - c.y) < c.r + m) || (V34W.built && v34InPond(x, y, m))); }")
rep("""function resolveLake(ent) {
  if (REALM.id !== 'green') return;""", """function resolveLake(ent) {
  if (REALM.id !== 'green') return;
  if (V34W.built) v34ResolvePonds(ent);""")
# zemin: yollar ve göletler, hücrelerdeki süsler
rep("""    if (v34) forEachCell(vx0 - 80, vy0 - 80, vx1 + 80, vy1 + 80, cell => v34GroundPatches(ctx, cell));""",
"""    if (v34) {
      forEachCell(vx0 - 80, vy0 - 80, vx1 + 80, vy1 + 80, cell => v34GroundPatches(ctx, cell));
      v34DrawPaths(ctx, vx0, vy0, vx1, vy1);
      for (const pd of V34W.ponds) if (inView(pd.x, pd.y, pd.rx + 30)) v34DrawPond(ctx, pd, t);
    }""")
rep("""        for (const rk of cell.rocks) if (inView(rk.x, rk.y, 30)) props.push({ y: rk.y, k: 'rock', o: rk });""",
"""        for (const rk of cell.rocks) if (inView(rk.x, rk.y, 30)) props.push({ y: rk.y, k: 'rock', o: rk });
        if (cell.v34d) for (const o of cell.v34d) if (inView(o.x, o.y, 70)) { if (o.ground) v34DecoGround(ctx, o, t); else props.push({ y: o.y, k: 'deco', o }); }""")
rep("""    else if (it.k === 'fire') v34Fire(ctx, t);""", """    else if (it.k === 'fire') v34Fire(ctx, t);
    else if (it.k === 'deco') v34DecoProp(ctx, it.o, t);""")
# düşmanlar
rep("""  for (const e of G.enemies) if (!e.dead && inView(e.x, e.y, 40)) list.push({ y: e.y, k: 'e', o: e });""",
    """  for (const e of G.enemies) if (!e.dead && inView(e.x, e.y, 80)) list.push({ y: v34EnemyOn(e) ? v34Feet(e) : e.y, k: 'e', o: e });""")
rep("""    if (it.k === 'e') drawEnemy(ctx, it.o, t);""", """    if (it.k === 'e') { if (v34EnemyOn(it.o)) v34Enemy(ctx, it.o, t); else drawEnemy(ctx, it.o, t); }""")
rep("""  const x = e.x - w / 2, y = e.y - e.r - (e.elite ? 20 : 14);""",
    """  const x = e.x - w / 2, y = (v34EnemyOn(e) ? v34EnemyTop(e) + 6 : e.y - e.r) - (e.elite ? 20 : 14);""")
# vuruş hissi
rep("""    Sfx.play(crit ? 'crit' : 'hit', { x: this.x, y: this.y });""", """    Sfx.play(crit ? 'crit' : 'hit', { x: this.x, y: this.y });
    if (V34.on) v34OnHit(this, dmg, crit);""")
rep("""    burst(this.x, this.y, this.elite ? 34 : 18, col, 220, 0.6, 3.5);""", """    burst(this.x, this.y, this.elite ? 34 : 18, col, 220, 0.6, 3.5);
    if (V34.on) v34OnDeath(this);""")
rep("""    if (!G.panel) update(dt);""", """    if (!G.panel) { if (G.hitStop > 0) G.hitStop -= dt; else update(dt); }""")
rep("""  G.time += dt;
  const p = G.player;""", """  G.time += dt;
  G.dayClock = ((G.dayClock || 0) + dt) % DAY.len;
  const p = G.player;""")
rep("""    if (q.rise) q.vy -= q.rise * dt;""", """    if (q.rise) q.vy -= q.rise * dt;
    if (q.grav) { q.vy += q.grav * dt; if (q.y > q.gy && q.vy > 0) { q.y = q.gy; q.vy *= -0.35; q.vx *= 0.55; } }""")
rep("""  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (G.area) { drawDarkness""", """  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (V34.on) v34Lights(ctx, W, H);
  if (G.area) { drawDarkness""")
# ekran sarsıntısı ayarı
rep("""  { id: 'music', type: 'toggle', def: true,""", """  { id: 'screenShake', type: 'toggle', def: true,
    label: 'Ekran sarsıntısı', desc: 'Kritik vuruşlarda ve düşman öldüğünde ekran kısa bir an sarsılır.' },
  { id: 'music', type: 'toggle', def: true,""")
rep("""  if (REDUCED_MOTION) return;
  G.cam.shake""", """  if (REDUCED_MOTION || !settings.screenShake) return;
  G.cam.shake""")
# günün evresi bölge bilgisinde
rep("""  setText(ui.zoneSub, zl === 0 ? 'Güvenli bölge' : `Tehlike seviyesi ${zl}`);""",
    """  setText(ui.zoneSub, (zl === 0 ? 'Güvenli bölge' : `Tehlike seviyesi ${zl}`) + (G.area ? '' : ' · ' + v34DayState().phase));""")

# gece: çubuk/isim/sayılar karanlığın üstünde
rep("""  for (const e of G.enemies) if (!e.dead && inView(e.x, e.y, 40)) drawEnemyBar(ctx, e, t);""",
    """  const uctx = V34.on ? v34UiCtx(ctx) : ctx;
  for (const e of G.enemies) if (!e.dead && inView(e.x, e.y, 80)) drawEnemyBar(uctx, e, t);""")
rep("""  if (p && !p.dead && G.state === 'play' && settings.showName) drawNameTag(ctx, p);
  drawTexts(ctx, t);""", """  if (p && !p.dead && G.state === 'play' && settings.showName) drawNameTag(uctx, p);
  drawTexts(uctx, t);""")

# kamera: fareli cihazlarda (bilgisayar) %10 daha yakın; dokunmatik cihazlar aynı kalır
rep("""  G.cam.zoom = clamp(Math.sqrt(G.vw * G.vh) / 820, 0.62, 1.25);""",
    """  const pcZoom = matchMedia('(pointer: coarse)').matches ? 1 : 1.1;
  G.cam.zoom = clamp(Math.sqrt(G.vw * G.vh) / 820, 0.62, 1.25) * pcZoom;""")

# --- tüm diyarlarda 3/4 dünya ---
rep("""  const v34 = v34Green();""", """  const v34 = V34.on && !G.area;""")
rep("""      v34DrawPaths(ctx, vx0, vy0, vx1, vy1);
      for (const pd of V34W.ponds) if (inView(pd.x, pd.y, pd.rx + 30)) v34DrawPond(ctx, pd, t);""",
"""      if (REALM.id === 'green') {
        v34DrawPaths(ctx, vx0, vy0, vx1, vy1);
        for (const pd of V34W.ponds) if (inView(pd.x, pd.y, pd.rx + 30)) v34DrawPond(ctx, pd, t);
      }""")
rep("""    if (inView(0, 0, 320)) { if (green && v34) { v34CampGround(ctx, t); v34CampProps(props); } else if (green) drawCamp(ctx, t);""",
"""    if (inView(0, 0, 320)) { if (v34) { if (green) { v34CampGround(ctx, t); v34CampProps(props); } else { v34RealmCampGround(ctx, t); v34RealmCampProps(props); } } else if (green) drawCamp(ctx, t);""")
rep("""    else if (it.k === 'deco') v34DecoProp(ctx, it.o, t);""", """    else if (it.k === 'deco') v34DecoProp(ctx, it.o, t);
    else if (it.k === 'stake') v34Stake(ctx, it.o);
    else if (it.k === 'wall') v34Wall(ctx, it.o);
    else if (it.k === 'well') v34Well(ctx, it.o);
    else if (it.k === 'palm') { v34Shadow(ctx, it.o.x, it.o.y, 14, 5, 70, 0.28); v34Palm(ctx, it.o.x, it.o.y, 34, t); }""")
rep("""    else if (v34) v34Tree(ctx, it.o, t, v34TreeFade(it.o, p));""",
    """    else if (v34) { if (V34_REALM_TREES[it.o.kind]) v34RealmTree(ctx, it.o, t, v34TreeFade(it.o, p)); else v34Tree(ctx, it.o, t, v34TreeFade(it.o, p)); }""")
rep("""      if (cell.dunes) cell.dunes = cell.dunes.filter(du => !near(du, du.w));
    }
    return;""", """      if (cell.dunes) cell.dunes = cell.dunes.filter(du => !near(du, du.w));
    }
    if (V34.on) v34DecorateRealm();
    return;""")

# --- zindanlar ---
rep("""  if (G.area) drawArea(ctx, t, vx0, vy0, vx1, vy1);""", """  if (G.area) { if (V34.on) { v34DrawArea(ctx, t, vx0, vy0, vx1, vy1); v34AreaProps(props); } else drawArea(ctx, t, vx0, vy0, vx1, vy1); }""")
rep("""    else if (it.k === 'well') v34Well(ctx, it.o);""", """    else if (it.k === 'well') v34Well(ctx, it.o);
    else if (it.k === 'brazier') v34Brazier(ctx, it.o, t);""")

# isim etiketi uzun karakterin başının üstünde
rep("  const y = p.y - 26 - 2 / z;", "  const y = p.y - (V34.on ? (p.classId === 'mage' ? 80 : 50) : 26) - 2 / z;")

out = os.path.join(HERE, 'deneme.html')
open(out, 'w', encoding='utf-8').write(s)
head = ('<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no">\n'
        '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n')
os.makedirs('/home/claude/site/deneme', exist_ok=True)
open('/home/claude/site/deneme/index.html', 'w', encoding='utf-8').write(head + s)
print('ok', len(s))
