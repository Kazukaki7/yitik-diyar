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
    '<p class="eyebrow">Deneme · 3/4 görünüm</p>')
rep('<title>Yitik Diyar</title>', '<title>Yitik Diyar · Deneme</title>')
rep("""      Ana tema ekrana ilk dokunuşta başlar.""",
    """      <b>Bu bir deneme sürümüdür:</b> karakterlerin asıl oyundan kopyalandı, burada yaptıkların asıl oyunu etkilemez. Yeni görünüm şimdilik yeşil diyarda ve okçuda.
      Ana tema ekrana ilk dokunuşta başlar.""")

# --- Yeni çizim modülü ---
mod = open(os.path.join(HERE, 'view34.js'), encoding='utf-8').read()
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
# isim etiketi uzun karakterin başının üstünde
rep("  const y = p.y - 26 - 2 / z;", "  const y = p.y - (V34.on && p.classId === 'archer' ? 42 : 26) - 2 / z;")

out = os.path.join(HERE, 'deneme.html')
open(out, 'w', encoding='utf-8').write(s)
head = ('<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no">\n'
        '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
        '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n')
os.makedirs('/home/claude/site/deneme', exist_ok=True)
open('/home/claude/site/deneme/index.html', 'w', encoding='utf-8').write(head + s)
print('ok', len(s))
