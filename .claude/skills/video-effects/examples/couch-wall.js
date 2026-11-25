// media: plate=assets/footage/talk.mp4 cut=assets/footage/talk-cutout.webm
/* Couch Wall: a wall of pictures (your thumbnails, screenshots, posts) builds BEHIND you, tile after tile, growing outward
   from behind your head, while you keep talking in front of it.
   Layers: your shot (z 0) < a dark shade (z 4) < the wall (z 5) < your cutout (z 10). */
const CONFIG = {
  footage: 'talk',          // the --name of the footage (used to find your head)
  images: [],               // your pictures, e.g. ['assets/images/thumb-1.jpg', 'assets/images/thumb-2.png']; empty = drawn title cards
  titles: ['I tried this for 30 days', 'Claude edits my videos', 'Do this before you post', 'My whole setup',
           'Stop doing this', 'The 5 minute edit', 'How I film every day', 'Watch this first'],
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const plate = document.getElementById('plate'), cut = document.getElementById('cut');
  plate.style.zIndex = 0; cut.style.zIndex = 10;
  cut.style.filter = FX.choke(2 * u);       // tighten the cutout's edge so no old background glows round your hair
  const shade = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 4, background: 'rgba(0,0,0,0.35)' });
  const wall = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 5 });
  const head = FX.subject(CONFIG.footage).head(0);
  const rnd = FX.rng(7);
  const PAL = [['#ff3d3d', '#7a0a0a'], ['#2f6bff', '#0b1f66'], ['#ffb800', '#8a4b00'], ['#16c47f', '#064d32'], ['#b04bff', '#3b0f66'], ['#ff5ea8', '#6b0b3a']];

  // one tile: a 16:9 card, your picture or a drawn title card
  let k = 0;
  const card = (box) => {
    const i = k++;
    if (CONFIG.images.length) {
      const im = FX.el('img', box, { width: '100%', height: '100%', objectFit: 'cover', display: 'block' });
      im.src = CONFIG.images[i % CONFIG.images.length];
    } else {
      const [a, b] = PAL[i % PAL.length];
      Object.assign(box.style, { background: `linear-gradient(135deg, ${a}, ${b})`, display: 'flex', alignItems: 'flex-end', padding: (10 * u) + 'px' });
      const t = FX.el('div', box, { font: `900 ${Math.round(27 * u)}px/1.02 ${FX.font.sans}`, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em',
        textShadow: '0 2px 8px rgba(0,0,0,0.45)' });
      t.textContent = CONFIG.titles[i % CONFIG.titles.length];
    }
  };

  // the layout: rows of tiles over the upper part of the frame, a brick pattern centred on your head
  const tw = portrait ? W * 0.40 : W * 0.195, th = tw * 9 / 16, gap = 14 * u;
  const bottom = portrait ? H * 0.58 : H * 0.68;
  const tiles = [];
  for (let r = 0, y = H * (portrait ? 0.05 : 0.08); y + th * 0.5 < bottom; r++, y += th + gap * 0.9) {
    const n = Math.ceil(W / (tw + gap)) + 1;
    const x0 = head.x - (n / 2) * (tw + gap) + (r % 2 ? 0 : (tw + gap) / 2);
    for (let i = 0; i < n; i++) {
      const x = x0 + i * (tw + gap) + (rnd() - 0.5) * 18 * u, yy = y + (rnd() - 0.5) * 16 * u;
      if (x + tw < -10 || x > W + 10) continue;
      const box = FX.el('div', wall, { position: 'absolute', left: x + 'px', top: yy + 'px', width: tw + 'px', height: th + 'px',
        borderRadius: (10 * u) + 'px', overflow: 'hidden', background: '#111',
        boxShadow: `0 ${10 * u}px ${26 * u}px rgba(0,0,0,0.55), 0 0 0 ${2 * u}px rgba(255,255,255,0.85)` });
      card(box);
      // build order: outward from your head, so the wall grows from behind you
      tiles.push({ box, rot: (rnd() - 0.5) * 7, d: Math.hypot(x + tw / 2 - head.x, (yy + th / 2 - head.y) * 1.6) });
    }
  }
  // one every 0.85 f, faster when there are many, so the last tile still lands by about f 18
  tiles.sort((a, b) => a.d - b.d).forEach((t, i) => { t.at = 1 + i * Math.min(0.85, 13 / tiles.length); });

  return (f) => {
    shade.style.opacity = FX.out(FX.lin(f, 0, 8));
    for (const t of tiles) {
      const p = FX.lin(f, t.at, t.at + 5);
      const s = FX.mix(0.55, 1, FX.back(p, 2.2));          // pops in past full size, then settles
      const drift = 1 + 0.012 * FX.lin(f, t.at, FX.END);    // a slow creep so it never sits dead
      t.box.style.opacity = p > 0 ? Math.min(1, p * 2.5) : 0;
      t.box.style.transform = `rotate(${t.rot}deg) scale(${(s * drift).toFixed(4)})`;
    }
  };
});
