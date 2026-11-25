// media: plate=assets/footage/talk.mp4 cut=assets/footage/talk-cutout.webm
/* Orbit: little phone-shaped screens (your reels, posts, screenshots) circle you on a tilted ring round your chest.
   On the far side they pass BEHIND you, smaller and darker; on the near side they swing in front of your chest.
   Layers: your shot (z 0) < cards on the far side (z 1 to 8) < your cutout (z 10) < cards on the near side (z 20 and up). */
const CONFIG = {
  footage: 'talk',          // the --name of the footage (used to find your head)
  images: [],               // your pictures, e.g. ['assets/images/reel-1.jpg']; tall 9:16 ones fit best; empty = drawn cards
  titles: ['Claude edits my videos now', 'Drop your clips', '100% hands off', 'My AI setup',
           'Watch this first', 'Day 1 vs day 30', 'No editor needed'],
  count: 7,                 // how many cards circle you
  lap: 104,                 // how long one full lap takes, in f (24 f = one second): lower spins faster
  tilt: -8,                 // how far the ring leans, in degrees (minus = higher on the right)
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const plate = document.getElementById('plate'), cut = document.getElementById('cut');
  plate.style.zIndex = 0; cut.style.zIndex = 10;
  cut.style.filter = FX.choke(2 * u);       // tighten the cutout's edge so no old background glows round your hair

  // where your head sits on average over the clip, so the ring stays put while you move a little
  const S = FX.subject(CONFIG.footage), hs = [0, 0.25, 0.5, 0.75, 1].map((t) => S.head(t * FX.END));
  const avg = (k) => hs.reduce((a, h) => a + h[k], 0) / hs.length;
  const head = { x: avg('x'), y: avg('y'), top: avg('top'), h: avg('h') };

  // the ring: round your chest, as wide as two heads (kept inside the frame), and flat like a hula hoop seen from the front
  const cw = Math.max(120 * u, Math.min(190 * u, head.h * 0.48)), ch = cw * 16 / 9;   // a card: a 9:16 phone screen
  const RX = Math.min(head.h * 2, portrait ? W / 2 - cw * 0.7 : W * 0.36), RY = RX * 0.22;
  const CX = Math.max(RX + cw * 0.7, Math.min(W - RX - cw * 0.7, head.x));
  // the ring's centre: low enough that a card at the very front starts below your chin, so it never covers your face
  const chin = head.top + head.h;
  const CY = Math.max(head.y + head.h * 0.5, chin + ch * 0.54 - RY + 24 * u);
  const TILT = CONFIG.tilt * Math.PI / 180, ct = Math.cos(TILT), st = Math.sin(TILT);
  const SPEED = Math.PI * 2 / CONFIG.lap;
  const PAL = [['#ff3d3d', '#7a0a0a'], ['#2f6bff', '#0b1f66'], ['#ffb800', '#8a4b00'], ['#16c47f', '#064d32'], ['#b04bff', '#3b0f66'], ['#ff5ea8', '#6b0b3a']];

  const cards = [];
  for (let i = 0; i < CONFIG.count; i++) {
    const box = FX.el('div', null, { position: 'absolute', left: (-cw / 2) + 'px', top: (-ch / 2) + 'px', width: cw + 'px', height: ch + 'px',
      borderRadius: (15 * u) + 'px', overflow: 'hidden', background: '#111',
      boxShadow: `0 0 0 ${3 * u}px rgba(246,242,234,0.96), 0 ${14 * u}px ${30 * u}px rgba(0,0,0,0.55)` });
    if (CONFIG.images.length) {
      const im = FX.el('img', box, { width: '100%', height: '100%', objectFit: 'cover', display: 'block' });
      im.src = CONFIG.images[i % CONFIG.images.length];
    } else {
      // a drawn card: a bold colour screen with a short title at the bottom, like a reel cover
      const [a, b] = PAL[i % PAL.length];
      Object.assign(box.style, { background: `linear-gradient(160deg, ${a}, ${b})`, display: 'flex', alignItems: 'flex-end', padding: (cw * 0.09) + 'px' });
      const t = FX.el('div', box, { font: `900 ${Math.round(cw * 0.15)}px/1.02 ${FX.font.sans}`, color: '#fff', textTransform: 'uppercase',
        letterSpacing: '-0.01em', textShadow: '0 2px 8px rgba(0,0,0,0.45)' });
      t.textContent = CONFIG.titles[i % CONFIG.titles.length];
    }
    const dim = FX.el('div', box, { position: 'absolute', inset: '0', background: '#05060a' });   // darkens the cards at the back
    cards.push({ box, dim, ph: (i / CONFIG.count) * Math.PI * 2 + 0.35 });
  }

  return (f) => {
    cards.forEach((c, i) => {
      const th = c.ph + f * SPEED;
      const x = RX * Math.sin(th), z = Math.cos(th), y = RY * z;    // z = 1 nearest you, -1 furthest away
      const px = CX + x * ct - y * st, py = CY + x * st + y * ct;
      const d = (z + 1) / 2;                                         // 0 at the back, 1 at the front
      const inn = FX.back(FX.lin(f, i * 0.3, i * 0.3 + 4), 1.6);     // each card pops in, 0.3 f after the one before
      const s = FX.mix(0.5, 1.08, d) * FX.mix(0.62, 1, inn);         // small at the back, big at the front
      c.box.style.opacity = FX.lin(f, i * 0.3 - 4, i * 0.3 + 0.5);
      c.box.style.transform = `translate(${px.toFixed(2)}px, ${py.toFixed(2)}px) scale(${s.toFixed(4)}) rotate(${(x / RX * -5).toFixed(2)}deg)`;
      // the far half of the ring goes under the cutout (behind you), the near half over it
      c.box.style.zIndex = z > 0 ? 20 + Math.round(z * 8) : 1 + Math.round(d * 7);
      c.dim.style.opacity = FX.mix(0.55, 0, Math.pow(d, 0.8)).toFixed(3);
    });
  };
});
