// media: plate=assets/footage/talk.mp4 cut=assets/footage/talk-cutout.webm
/* Paper Cut: the whole shot turns into a paper collage. Grid notebook paper, a torn yellow scrap with tape, a kraft paper strip,
   pencil hatching and little doodles that wobble on 2s. You become a paper cut-out (a thick white paper border and a drop
   shadow) that steps on 2s like stop motion. Ransom-note letters stamp in one by one, then a red pen circle scribbles round them.
   Layers: paper (z 0) < grain (z 1) < collage and doodles (z 3) < tape (z 4) < your cut-out (z 10) < letters (z 20) < pen (z 21).
   Your real background is hidden: the paper replaces it. */
const CONFIG = {
  footage: 'talk',        // the --name of the footage (used to find your head)
  word: '100%',           // the ransom-note word, 2 to 6 characters, each on its own scrap of paper
  paper: '#f3efe4',       // the notebook paper
  scrap: '#f3e44a',       // the big torn scrap beside you
  pen: '#d81e2c',         // the pen circle round the letters
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const plate = document.getElementById('plate'), cut = document.getElementById('cut');
  plate.style.display = 'none';
  // where the head goes over the whole clip: its highest top, so the letters stay clear of it even if you lean
  const S = FX.subject(CONFIG.footage), head = S.head(0);
  for (let f = 0; f <= FX.END; f += 6) head.top = Math.min(head.top, S.head(f).top);
  const hw = head.h / 1.3, headL = head.x - hw / 2, headR = head.x + hw / 2;   // the head's width and its two sides

  // ---- the filters: the paper cut-out edge, pencil grain, paper grain, a small drop shadow
  const n = (v) => (v * u).toFixed(2);
  const defs = FX.svg('svg', FX.root, { width: 0, height: 0 });
  Object.assign(defs.style, { position: 'absolute', width: 0, height: 0 });
  defs.innerHTML = `<filter id="pc-cut" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 7 -1.1" result="s0"/>
      <feMorphology in="s0" operator="erode" radius="${n(16)}" result="e"/>
      <feMorphology in="e" operator="dilate" radius="${n(16)}" result="o"/>
      <feComposite in="s0" in2="o" operator="in" result="s"/>
      <feMorphology in="o" operator="dilate" radius="${n(16)}" result="d"/>
      <feTurbulence type="fractalNoise" baseFrequency="${(0.025 / u).toFixed(4)}" numOctaves="2" seed="4" result="nz"/>
      <feDisplacementMap in="d" in2="nz" scale="${n(13)}" xChannelSelector="R" yChannelSelector="G" result="dd"/>
      <feFlood flood-color="#fbfaf4" result="w"/><feComposite in="w" in2="dd" operator="in" result="white"/>
      <feGaussianBlur in="dd" stdDeviation="${n(10)}" result="sb"/><feOffset in="sb" dx="${n(10)}" dy="${n(16)}" result="so"/>
      <feFlood flood-color="#1a140c" flood-opacity="0.55"/><feComposite in2="so" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="white"/><feMergeNode in="s"/></feMerge>
    </filter>
    <filter id="pc-pencil" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="${(0.63 / u).toFixed(3)}" numOctaves="1" seed="2" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.6 -0.9" result="ga"/>
      <feComposite in="SourceGraphic" in2="ga" operator="in"/>
    </filter>
    <filter id="pc-grain"><feTurbulence type="fractalNoise" baseFrequency="${(0.52 / u).toFixed(3)}" numOctaves="3" seed="9"/>
      <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.3  0 0 0 0.22 0"/></filter>
    <filter id="pc-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="${n(4)}" dy="${n(7)}" stdDeviation="${n(4)}" flood-color="#000" flood-opacity="0.4"/></filter>`;

  // ---- the paper: off-white grid paper with a red margin line and a fine grain
  const grid = 54 * u;
  const paper = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 0, background: CONFIG.paper,
    backgroundImage: `linear-gradient(rgba(96,132,190,0.30) ${2 * u}px, transparent ${2 * u}px), linear-gradient(90deg, rgba(96,132,190,0.30) ${2 * u}px, transparent ${2 * u}px)`,
    backgroundSize: `${grid}px ${grid}px`, backgroundPosition: `${-8 * u}px ${-6 * u}px` });
  FX.el('div', paper, { position: 'absolute', left: (83 * u) + 'px', top: '0', bottom: '0', width: (3 * u) + 'px', background: 'rgba(214,72,72,0.45)' });
  const grain = FX.layer(1);
  grain.style.mixBlendMode = 'multiply';
  FX.svg('rect', grain, { width: W, height: H, filter: 'url(#pc-grain)' });

  // ---- the ransom letters: one torn scrap per character, each its own type and colours
  const STYLES = [
    { font: FX.font.serif, wt: 700, fg: '#ffffff', bg: '#2438b0', k: 0.82, w: 0.95, h: 0.95, y: 0.08, rot: -5 },
    { font: FX.font.mono, wt: 800, fg: '#111111', bg: '#f7f5ee', k: 0.86, w: 0.95, h: 0.89, y: 0.15, rot: 4 },
    { font: FX.font.serif, wt: 700, fg: '#cc1428', bg: '#fbe3e3', k: 0.86, w: 1.0, h: 1.04, y: 0.0, rot: -3 },
    { font: FX.font.poster, wt: 400, fg: '#f6e24a', bg: '#121212', k: 0.76, w: 1.06, h: 0.94, y: 0.1, rot: 6 },
    { font: FX.font.sans, wt: 900, fg: '#ffffff', bg: '#e2452b', k: 0.74, w: 1.0, h: 0.92, y: 0.05, rot: -4 },
    { font: FX.font.hand, wt: 700, fg: '#1d2a6b', bg: '#ffe14d', k: 0.95, w: 0.97, h: 1.0, y: 0.12, rot: 3 },
  ];
  const chars = [...String(CONFIG.word)].slice(0, 6);
  const N = chars.length;
  // the natural size of a scrap (about 140 x 180 units), then shrunk until the word fits the free room
  const TW = 140 * u, GAP = 14 * u;
  const naturalW = N * TW + (N - 1) * GAP;
  // two ways to place the word: beside the head (landscape) or above it (vertical, or a frame with no side room)
  const sideRoom = Math.max(headL, W - headR) - 230 * u;
  const topRoomH = head.top - 0.045 * H - 70 * u;
  const sideScale = Math.min(1, sideRoom / naturalW);
  const topScale = Math.min(1, ((portrait ? 0.76 : 0.84) * W) / naturalW, topRoomH / (TW * 1.3));
  const onTop = portrait || topScale > sideScale;
  const sc = Math.max(0.35, onTop ? topScale : sideScale);
  const tw = TW * sc, th = tw * 1.3, gap = GAP * sc;
  // the left side reads first, so it wins unless the right has clearly more room
  const side = onTop ? (portrait ? 'left' : (head.x > W / 2 ? 'left' : 'right')) : (W - headR > headL * 1.25 ? 'right' : 'left');
  // the word's box
  const boxW = N * tw + (N - 1) * gap;
  const boxX = onTop ? Math.max(40 * u, Math.min(W - boxW - 40 * u, W * (portrait ? 0.46 : 0.5) - boxW / 2))
    : side === 'left' ? 110 * u : W - 110 * u - boxW;
  const boxY = onTop ? Math.max(0.045 * H, head.top - 70 * u - th * 1.12) : 0.07 * H;
  const box = { x: boxX, y: boxY, w: boxW, h: th * 1.1 };
  // the rest of the collage goes on the other side of the head
  const far = (x, w) => (side === 'left' ? x : W - x - w);   // mirror a box's left edge when the word sits on the right
  const hR = side === 'left' ? headR : W - headL;              // the head's far edge, in the same mirrored terms

  // ---- collage layer, behind you
  const art = FX.layer(3);
  const rnd = FX.rng(13), J = (a) => (rnd() - 0.5) * 2 * a;
  const torn = (x, y, w, h, step, amp) => {         // a rectangle with a torn, wobbly edge
    const pts = [];
    for (let t = 0; t < w; t += step) pts.push([x + t, y + J(amp)]);
    for (let t = 0; t < h; t += step) pts.push([x + w + J(amp), y + t]);
    for (let t = w; t > 0; t -= step) pts.push([x + t, y + h + J(amp)]);
    for (let t = h; t > 0; t -= step) pts.push([x + J(amp), y + t]);
    return pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  };
  const hatch = (x, y, w, h, gp, slant, wob) => {   // pencil hatching: back-and-forth strokes filling a box
    let d = `M${x} ${y + h}`;
    for (let t = 0, up = true; t <= w; t += gp, up = !up) {
      const px = x + t + J(wob);
      d += up ? ` L${(px + slant).toFixed(1)} ${(y + J(wob * 2)).toFixed(1)}` : ` L${px.toFixed(1)} ${(y + h + J(wob * 2)).toFixed(1)}`;
    }
    return d;
  };
  const line = (parent, d, attrs) => FX.svg('path', parent, Object.assign({ d, fill: 'none' }, attrs));
  const piece = (pts, fill, rot, cx, cy) => FX.svg('polygon', art, { points: pts, fill, transform: `rotate(${rot} ${cx} ${cy})`, filter: 'url(#pc-shadow)' });

  // where the pieces go: landscape keeps the classic layout, vertical tucks them beside the head
  const L = portrait ? {
    hatchA: [box.x - 35 * u, box.y - 15 * u, box.w + 70 * u, box.h + 120 * u],
    scrap: [headR - hw * 0.2, head.top + head.h * 0.18, W - headR + hw * 0.2 + 60 * u, head.h * 0.42],
    kraft: [-30 * u, head.y + head.h * 0.12, Math.max(260 * u, headL + hw * 0.25), 150 * u],
    pink: [headR + 30 * u, head.top + head.h * 0.66, Math.min(250 * u, W - headR - 50 * u), 130 * u],
  } : {
    hatchA: [box.x - 35 * u, box.y - 25 * u, box.w + 50 * u, box.h + 150 * u],
    scrap: [far(Math.max(0.64 * W, hR + 60 * u), 0.33 * W), 0.2 * H, 0.33 * W, 0.44 * H],
    kraft: [far(-30 * u, 0.26 * W), 0.85 * H, 0.26 * W, 0.2 * H],
    pink: [far(0.772 * W, 0.135 * W), 0.66 * H, 0.135 * W, 0.16 * H],
  };
  // a big blue-grey pencil hatch: the letters sit on it
  const hA = FX.svg('g', art, { filter: 'url(#pc-pencil)' });
  line(hA, hatch(L.hatchA[0], L.hatchA[1], L.hatchA[2], L.hatchA[3], 13 * u, 37 * u, 4 * u), { stroke: '#7d8db8', 'stroke-width': 10 * u, 'stroke-linejoin': 'round', opacity: 0.85 });
  // a kraft paper strip and the torn yellow scrap, each with a small shadow
  const [kx, ky, kw, kh] = L.kraft;
  piece(torn(kx, ky, kw, kh, 20 * u, 6 * u), '#c9a776', side === 'left' ? -4 : 4, kx + kw / 2, ky + kh / 2);
  const [sx, sy, sw, sh] = L.scrap;
  piece(torn(sx, sy, sw, sh, 16 * u, 9 * u), CONFIG.scrap, side === 'left' ? -5 : 5, sx + sw / 2, sy + sh / 2);
  // the part of the scrap you can see (it may run off the frame or behind you)
  const vx = Math.max(sx, portrait ? headR : sx), vw = Math.min(sx + sw, W) - vx;
  // a strip of tape over the scrap's top corner
  const tapeX = side === 'left' ? Math.min(sx + sw, W) - 190 * u : sx - 30 * u;
  const tape = FX.el('div', null, { position: 'absolute', left: tapeX + 'px', top: (sy - 32 * u) + 'px', width: (214 * u) + 'px', height: (63 * u) + 'px',
    zIndex: 4, background: 'rgba(240,235,220,0.72)', boxShadow: `0 ${u}px ${4 * u}px rgba(0,0,0,0.15)` });
  const tapeRot = side === 'left' ? 28 : -28;
  // dark hatch on the yellow, red ticks along its top, pink hatch below it
  const hB = FX.svg('g', art, { filter: 'url(#pc-pencil)' });
  line(hB, hatch(vx + vw * 0.17, sy + sh * 0.2, vw * 0.6, sh * 0.52, 11 * u, 26 * u, 4 * u), { stroke: '#3b4470', 'stroke-width': 9 * u, opacity: 0.9 });
  line(hB, hatch(L.pink[0], L.pink[1], L.pink[2], L.pink[3], 11 * u, 20 * u, 4 * u), { stroke: '#d6475e', 'stroke-width': 9 * u, opacity: 0.9 });
  const ticks = FX.svg('g', art, {});
  for (let i = 0; i < 9; i++) line(ticks, `M${vx + vw * 0.27 + i * 28 * u} ${sy + sh * 0.09 + i * 1.7 * u} l${(14 + J(3)) * u} ${(28 + J(4)) * u}`,
    { stroke: '#d02a2a', 'stroke-width': 5 * u, 'stroke-linecap': 'round' });

  // ---- doodles: three hand-drawn copies that take turns on 2s (the wobble of a stop motion collage)
  const P = portrait ? {
    xs: [[0.07 * W, head.top + head.h * 0.42, '#c42222'], [vx + vw * 0.74, sy + sh * 0.8], [vx + vw * 0.83, sy + sh * 0.74], [0.12 * W, head.y + head.h * 0.3, '#c42222']],
    star: [0.13 * W, head.top + head.h * 0.5],
    loops: [Math.min(headR + 20 * u, W - 330 * u), L.pink[1] + L.pink[3] + 45 * u],
    squiggle: [box.x + 10 * u, box.y + box.h + 30 * u],
  } : {
    xs: [[L.hatchA[0] + 85 * u, L.hatchA[1] + L.hatchA[3] + 60 * u, '#c42222'], [vx + vw * 0.82, sy + sh * 0.85], [vx + vw * 0.89, sy + sh * 0.79],
      [far(0.2 * W, 0), 0.79 * H, '#c42222']],
    star: [L.hatchA[0] + 140 * u, L.hatchA[1] + L.hatchA[3] + 98 * u],
    loops: [far(0.768 * W, 300 * u), 0.885 * H],
    squiggle: [L.hatchA[0] + 45 * u, L.hatchA[1] + L.hatchA[3] + 25 * u],
  };
  const doodles = [];
  for (let v = 0; v < 3; v++) {
    const r = FX.rng(100 + v), j = (a) => (r() - 0.5) * 2 * a * u;
    const set = FX.svg('g', art, { stroke: '#2a2a32', 'stroke-width': 6 * u, 'stroke-linecap': 'round', fill: 'none' });
    const X = (cx, cy, s, col) => line(set, `M${cx - s + j(3)} ${cy - s + j(3)} L${cx + s + j(3)} ${cy + s + j(3)} M${cx + s + j(3)} ${cy - s + j(3)} L${cx - s + j(3)} ${cy + s + j(3)}`, col ? { stroke: col } : {});
    const star = (cx, cy, s) => { let d = ''; for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3 + (r() - 0.5) * 0.3; d += `M${cx - Math.cos(a) * s} ${cy - Math.sin(a) * s} L${cx + Math.cos(a) * s} ${cy + Math.sin(a) * s} `; } line(set, d, {}); };
    P.xs.forEach(([x, y, col], i) => X(x, y, (i === 2 ? 16 : 19) * u, col));
    star(P.star[0], P.star[1], 19 * u);
    // a telephone cord scribble
    const [lx, ly] = P.loops, q = 43 * u;
    let d = `M${lx} ${ly + j(3)}`;
    for (let k = 0; k < 7; k++) { const x = lx + k * q; d += ` C${x + q + j(3)} ${ly - 14 * u + j(4)}, ${x + q * 1.13 + j(3)} ${ly - 57 * u + j(4)}, ${x + q * 0.6 + j(3)} ${ly - 54 * u + j(4)} S${x + q * 0.2 + j(3)} ${ly - 3 * u + j(4)}, ${x + q + j(3)} ${ly + j(3)}`; }
    line(set, d, { 'stroke-width': 5 * u });
    const [qx, qy] = P.squiggle;   // a little wave under the letters' corner
    line(set, `M${qx} ${qy + j(3)} q${29 * u} ${(-20 + (r() - 0.5) * 8) * u} ${57 * u} 0 t${57 * u} 0 t${57 * u} 0`, { stroke: '#3b4470', 'stroke-width': 5 * u });
    doodles.push(set);
  }

  // ---- you: the paper cut-out (choke first, then the white paper border and its shadow)
  cut.style.zIndex = 10;
  cut.style.filter = `${FX.choke(2 * u)} url(#pc-cut)`;
  cut.style.transformOrigin = '50% 100%';

  // ---- the letters
  const lay = FX.el('div', null, { position: 'absolute', left: '0', top: '0', zIndex: 20 });
  const r2 = FX.rng(31);
  const tiles = [];
  let x = box.x;
  chars.forEach((ch, i) => {
    const S = STYLES[i % STYLES.length];
    if (ch === ' ') { x += tw * 0.5; return; }
    const fs = th * S.k;
    // a wide character (W, M, %) gets a wider scrap so it never spills out
    const probe = FX.el('span', null, { position: 'absolute', visibility: 'hidden', font: `${S.wt} ${fs}px ${S.font}`, whiteSpace: 'pre' });
    probe.textContent = ch;
    const w = Math.max(tw * S.w, probe.offsetWidth + 22 * u * sc), h = th * S.h;
    probe.remove();
    const pts = [], st = 13 * u * sc, a = 3 * u * sc, jj = () => (r2() - 0.5) * 2 * a;
    for (let t = 0; t < w; t += st) pts.push(`${(t + jj()).toFixed(1)}px ${(jj() + a).toFixed(1)}px`);
    for (let t = 0; t < h; t += st) pts.push(`${(w - a + jj()).toFixed(1)}px ${(t + jj()).toFixed(1)}px`);
    for (let t = w; t > 0; t -= st) pts.push(`${(t + jj()).toFixed(1)}px ${(h - a + jj()).toFixed(1)}px`);
    for (let t = h; t > 0; t -= st) pts.push(`${(a + jj()).toFixed(1)}px ${(t + jj()).toFixed(1)}px`);
    const wrap = FX.el('div', lay, { position: 'absolute', left: x + 'px', top: (box.y + S.y * th * 0.7) + 'px', width: w + 'px', height: h + 'px',
      filter: `drop-shadow(${4 * u}px ${7 * u}px ${6 * u}px rgba(0,0,0,0.45))` });
    const paperBit = FX.el('div', wrap, { position: 'absolute', inset: '0', background: S.bg, clipPath: `polygon(${pts.join(',')})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', font: `${S.wt} ${fs}px/1 ${S.font}`, color: S.fg, paddingTop: (6 * u * sc) + 'px' });
    paperBit.textContent = ch;
    tiles.push({ wrap, rot: S.rot, at: 0 });
    x += w + gap;
  });
  // one stamp every 2.5 f (quicker for long words), so the last lands before the pen starts at f 11
  const every = Math.min(2.5, 7.5 / Math.max(1, tiles.length - 1));
  tiles.forEach((t, i) => { t.at = 1 + i * every; });
  const realW = x - gap - box.x;

  // ---- the red pen circle round the letters
  const pen = FX.layer(21);
  const r3 = FX.rng(57);
  const cx = box.x + realW / 2, cy = box.y + box.h / 2;
  const rx = Math.min(realW / 2 * 1.2 + 30 * u, cx - 14 * u, W - cx - 14 * u), ry = box.h / 2 * 1.2 + 22 * u;
  let pd = '';
  for (let i = 0, M = 90; i <= M; i++) {
    const t = i / M, ang = -2.6 + t * 1.32 * Math.PI * 2, k = 1 + 0.05 * Math.sin(t * 7) + (r3() - 0.5) * 0.012 - t * 0.05;
    pd += (i ? ' L' : 'M') + (cx + Math.cos(ang) * rx * k).toFixed(1) + ' ' + (cy + Math.sin(ang) * ry * k + t * 11 * u).toFixed(1);
  }
  const circ = line(pen, pd, { stroke: CONFIG.pen, 'stroke-width': 10 * u, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: `rotate(-4 ${cx} ${cy})` });
  const clen = circ.getTotalLength();
  circ.setAttribute('stroke-dasharray', clen.toFixed(1));

  const hash = (s) => FX.rng(s * 7919 + 17);
  return (f) => {
    const step = Math.floor(f / 2);                        // everything hand-made moves on 2s, like stop motion
    const h = hash(step);
    cut.style.transform = `translate(${((h() - 0.5) * 10 * u).toFixed(2)}px, ${((h() - 0.5) * 7 * u).toFixed(2)}px) rotate(${((h() - 0.5) * 1.3).toFixed(3)}deg)`;
    doodles.forEach((s, i) => { s.style.display = step % 3 === i ? '' : 'none'; });
    tape.style.transform = `rotate(${(tapeRot + (hash(step + 500)() - 0.5) * 1.2).toFixed(2)}deg)`;
    tiles.forEach((t, i) => {
      const p = FX.lin(f, t.at, t.at + 3);
      const s = FX.mix(2.1, 1, FX.out5(p));                // stamps down from twice its size
      const wob = p >= 1 ? (hash(step + 900 + i * 25)() - 0.5) * 1.2 : 0;
      t.wrap.style.opacity = p > 0 ? 1 : 0;
      t.wrap.style.transform = `rotate(${(t.rot - (1 - FX.out(p)) * 10 + wob).toFixed(2)}deg) scale(${s.toFixed(4)})`;
    });
    const cp = FX.out(FX.lin(f, 11, 19));                  // the pen scribbles round them
    circ.setAttribute('stroke-dashoffset', (clen * (1 - cp)).toFixed(1));
    circ.style.opacity = cp > 0 ? 1 : 0;
  };
});
