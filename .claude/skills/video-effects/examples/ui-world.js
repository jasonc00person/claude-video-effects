// media: plate=assets/footage/talk.mp4 cut=assets/footage/talk-cutout.webm
/* UI World: a cream AI chat app drops in over the top of the frame and you are standing in it, in front of it. Your clips
   drop into its message box as attachments, a yellow tag lands next to them, then a command types itself in.
   On a wide frame the app owns the left and you slide right; on a vertical (or square) frame the app owns the top and you
   slide down below it.
   Layers: your shot (z 0) < the cream world (z 5) < the app (z 6) < your cutout (z 10). */
const CONFIG = {
  footage: 'talk',                   // the --name of the footage (used to find your head)
  name: 'Claude',                    // the app's name, shown next to its drawn orange mark
  accent: '#D97757',                 // the mark and the send button
  drop: 'Drop your clips here',      // the hint in the dashed drop zone
  placeholder: 'How can I help you today?',
  images: [],                        // 5 stills from your clips, e.g. ['assets/images/clip-01.jpg', ...]; empty = drawn clip cards
                                     // (make them with: node fx.mjs stills "<your video>" --count 5)
  tag: 'RAW CLIPS',                  // the yellow tag that lands next to the clips
  command: '/edit-my-video',         // what types itself into the box
};

FX.comp(() => {
  const { W, H, u } = FX;
  const stacked = W < H * 1.3;       // vertical or square: the app sits on top and you stand below it
  const plate = document.getElementById('plate'), cut = document.getElementById('cut');
  plate.style.zIndex = 0; cut.style.zIndex = 10;
  cut.style.filter = FX.choke(2 * u);       // tighten the cutout's edge so no old background glows round your hair

  // your head over the whole clip (its average place and its highest point), so the layout fits every frame
  const subj = FX.subject(CONFIG.footage), hs = [];
  for (let f = 0; f <= FX.END; f += 6) hs.push(subj.head(f));
  const hx = hs.reduce((s, h) => s + h.x, 0) / hs.length, hh = hs.reduce((s, h) => s + h.h, 0) / hs.length;
  const htop = Math.min(...hs.map((h) => h.top));

  // the app: one unit k, so the whole box shrinks on a narrow frame
  const k = u * Math.min(1, W * 0.92 / (880 * u));
  const BW = 880 * k, BH = 368 * k;
  let BX, BY, EDGE, move;            // the box's corner, how far down the cream reaches, and how your shot moves (0..1)
  if (!stacked) {
    // wide: the box on the left; you scaled 1.3 about a point on the left so you slide right, with no gap at any edge
    BX = W * 0.04; BY = H * 0.157; EDGE = H * 0.68;
    const S = 1.3, ox = Math.max(0, Math.min(W, (S * hx - W * 0.68) / (S - 1)));
    for (const v of [plate, cut]) v.style.transformOrigin = `${ox}px ${H / 2}px`;
    move = (t) => `scale(${FX.mix(1, S, t).toFixed(4)})`;
  } else {
    // vertical: the box across the top; you slide down so your hair clears it. The cream covers the gap your shot leaves.
    BX = (W - BW) / 2; BY = H * 0.07 + 94 * k;
    const target = BY + BH + 50 * k, D = Math.max(0, target - htop);
    EDGE = Math.min(H * 0.8, Math.max(D + 20 * u, target + hh));
    move = (t) => `translateY(${(D * t).toFixed(1)}px)`;
  }

  // the cream world and the app layer above it
  const world = FX.el('div', null, { position: 'absolute', left: 0, top: 0, width: W + 'px', height: EDGE + 'px', zIndex: 5,
    background: 'radial-gradient(120% 90% at 30% 20%, #FAF8F3 0%, #F3EFE6 60%, #ECE6DA 100%)', boxShadow: `0 ${14 * k}px ${40 * k}px rgba(0,0,0,0.35)` });
  const ui = FX.el('div', null, { position: 'absolute', left: 0, top: 0, width: W + 'px', height: H + 'px', zIndex: 6 });
  const INK = '#2a2925';

  // the header: a drawn orange sparkle and the app's name, centred over the box
  const head = FX.el('div', ui, { position: 'absolute', left: BX + 'px', width: BW + 'px', top: (BY - 94 * k) + 'px', height: 63 * k + 'px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 * k + 'px' });
  const mk = FX.svg('svg', head, { width: 50 * k, height: 50 * k, viewBox: '-12 -12 24 24' });
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6 + 0.15, r = i % 2 ? 8 : 11.5;
    FX.svg('line', mk, { x1: 0, y1: 0, x2: (Math.cos(a) * r).toFixed(2), y2: (Math.sin(a) * r).toFixed(2), stroke: CONFIG.accent, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  }
  FX.el('div', head, { font: `400 ${48 * k}px/1 ${FX.font.serif}`, color: INK, whiteSpace: 'nowrap' }).textContent = CONFIG.name;

  // the message box
  const box = FX.el('div', ui, { position: 'absolute', left: BX + 'px', top: BY + 'px', width: BW + 'px', height: BH + 'px', background: '#fff',
    borderRadius: 34 * k + 'px', border: `${2 * k}px solid #E2DCCF`, boxShadow: `0 ${14 * k}px ${43 * k}px rgba(60,45,20,0.12)` });
  const drop = FX.el('div', box, { position: 'absolute', left: 26 * k + 'px', top: 23 * k + 'px', width: (BW - 52 * k) + 'px', height: 174 * k + 'px',
    border: `${3 * k}px dashed #D6CFC0`, borderRadius: 20 * k + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center',
    font: `700 ${29 * k}px ${FX.font.sans}`, color: '#A39C8D' });
  drop.textContent = '↑  ' + CONFIG.drop;
  const ph = FX.el('div', box, { position: 'absolute', left: 34 * k + 'px', top: 223 * k + 'px', font: `400 ${34 * k}px ${FX.font.sans}`, color: '#9C968A', whiteSpace: 'nowrap' });
  ph.textContent = CONFIG.placeholder;
  const typed = FX.el('div', box, { position: 'absolute', left: 34 * k + 'px', top: 220 * k + 'px', font: `700 ${39 * k}px ${FX.font.mono}`, color: INK, whiteSpace: 'nowrap' });
  const caret = FX.el('div', box, { position: 'absolute', top: 223 * k + 'px', width: 4 * k + 'px', height: 43 * k + 'px', background: INK });
  const tools = FX.el('div', box, { position: 'absolute', left: 34 * k + 'px', top: 290 * k + 'px', font: `400 ${37 * k}px ${FX.font.sans}`, color: '#8E887C', letterSpacing: 26 * k + 'px' });
  tools.textContent = '+ ≡';
  const send = FX.el('div', box, { position: 'absolute', right: 26 * k + 'px', top: 286 * k + 'px', width: 60 * k + 'px', height: 60 * k + 'px',
    borderRadius: 17 * k + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
  send.innerHTML = `<svg width="${29 * k}" height="${29 * k}" viewBox="0 0 20 20"><path d="M10 16V4M4.5 9.5L10 4l5.5 5.5" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  // the clips: five tall cards that fall into the box one after another. Your stills, or drawn cards with a figure on them
  const PAL = [['#ff5e3a', '#7a1a0a'], ['#2f6bff', '#0b1f66'], ['#16c47f', '#064d32'], ['#b04bff', '#3b0f66'], ['#ffb800', '#8a4b00']];
  const CW = 106 * k, CH = 174 * k, GAP = 17 * k, rnd = FX.rng(11);
  const clips = PAL.map((pal, i) => {
    const c = FX.el('div', ui, { position: 'absolute', left: 0, top: 0, width: CW + 'px', height: CH + 'px', borderRadius: 14 * k + 'px', overflow: 'hidden',
      background: `linear-gradient(160deg, ${pal[0]}, ${pal[1]})`, boxShadow: `0 0 0 ${3 * k}px #fff, 0 ${11 * k}px ${26 * k}px rgba(0,0,0,0.28)`, zIndex: 2 });
    if (CONFIG.images.length) {
      const im = FX.el('img', c, { width: '100%', height: '100%', objectFit: 'cover', display: 'block' });
      im.src = CONFIG.images[i % CONFIG.images.length];
    } else {
      c.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 60 100" preserveAspectRatio="xMidYMax slice"><circle cx="30" cy="44" r="13" fill="rgba(255,255,255,0.42)"/>
        <path d="M4 100 C4 72 16 62 30 62 C44 62 56 72 56 100 Z" fill="rgba(255,255,255,0.42)"/></svg>`;
    }
    const play = FX.el('div', c, { position: 'absolute', left: 9 * k + 'px', top: (CH - 37 * k) + 'px', width: 28 * k + 'px', height: 28 * k + 'px',
      borderRadius: '50%', background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' });
    play.innerHTML = `<svg width="${11 * k}" height="${14 * k}" viewBox="0 0 10 12"><path d="M1 1l8 5-8 5z" fill="#fff"/></svg>`;
    const tx = BX + 34 * k + i * (CW + GAP), ty = BY + 21 * k;
    return { c, tx, ty, sx: tx + (rnd() - 0.5) * 228 * k + 86 * k, sy: -243 * k - rnd() * 86 * k, r0: (rnd() - 0.5) * 30, at: 3 + i * 1.6 };
  });
  const tag = FX.el('div', ui, { position: 'absolute', left: (BX + 34 * k + 5 * (CW + GAP) + 11 * k) + 'px', top: (BY + 74 * k) + 'px', padding: `${9 * k}px ${17 * k}px ${7 * k}px`,
    background: '#F4E04D', font: `900 ${31 * k}px ${FX.font.sans}`, color: INK, letterSpacing: '0.02em', borderRadius: 6 * k + 'px', transformOrigin: '20% 50%',
    boxShadow: `0 ${4 * k}px 0 rgba(0,0,0,0.08)`, whiteSpace: 'nowrap', zIndex: 3 });
  tag.textContent = CONFIG.tag;

  const T0 = 16.5, PER = 0.55, DONE = T0 + CONFIG.command.length * PER;   // the command types one letter every 0.55 f from f 16.5
  return (f) => {
    // the cream world drops in from the top over f 0 to 6, and your shot slides out of its way at the same pace
    const w = FX.out(FX.lin(f, 0, 6));
    world.style.transform = `translateY(${((w - 1) * EDGE).toFixed(1)}px)`;
    for (const v of [plate, cut]) v.style.transform = move(w);
    const a = FX.out(FX.lin(f, 1, 7));
    ui.style.transform = `translateY(${((1 - a) * -86 * k).toFixed(1)}px)`;
    ui.style.opacity = FX.lin(f, 0.5, 4);
    drop.style.opacity = 1 - FX.lin(f, 5, 8);
    for (const c of clips) {
      const p = FX.lin(f, c.at, c.at + 5);
      const x = FX.mix(c.sx, c.tx, FX.out(p)), y = FX.mix(c.sy, c.ty, FX.back(p, 1.3));   // a little bounce as each one lands
      c.c.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(c.r0 * (1 - FX.out(p))).toFixed(2)}deg) scale(${FX.mix(1.15, 1, FX.out(p)).toFixed(3)})`;
      c.c.style.opacity = f >= c.at ? 1 : 0;
    }
    const tg = FX.lin(f, 13.5, 17);
    tag.style.opacity = tg > 0 ? 1 : 0;
    tag.style.transform = `rotate(-4deg) scale(${FX.back(tg, 3).toFixed(3)})`;
    const n = Math.max(0, Math.min(CONFIG.command.length, Math.floor((f - T0) / PER) + 1));
    typed.textContent = f >= T0 ? CONFIG.command.slice(0, n) : '';
    ph.style.opacity = f >= T0 ? 0 : 1;
    caret.style.left = (34 * k + (f >= T0 ? typed.offsetWidth : 0) + 3 * k) + 'px';
    caret.style.opacity = f < DONE + 2 ? 1 : (Math.floor((f - DONE) / 7) % 2 === 0 ? 0 : 1);   // blinks once typing is done
    send.style.background = f >= T0 ? CONFIG.accent : '#EBC9BB';
    send.style.transform = `scale(${(1 + 0.12 * Math.sin(Math.PI * FX.lin(f, DONE, DONE + 5))).toFixed(3)})`;
  };
});
