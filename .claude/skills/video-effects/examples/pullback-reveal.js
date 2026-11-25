// media: plate=assets/footage/talk.mp4
/* Pullback Reveal: it starts full frame on your shot, then the camera pulls back to show your shot is a video inside a light
   editing app: a window with a file name, an assistant panel ticking off its steps, a render bar that fills and turns green,
   and a big percent counter on a cream desk.
   On a wide frame the window sits right with the panel over its left edge and the counter top left; on a vertical (or square)
   frame the window is centred and narrower, the counter above it, the panel over its lower left, under your chin.
   Layers: the cream desk (the frame's background) < the window < your shot in it < the render bar < the panel and counter. */
const CONFIG = {
  footage: 'talk',                    // the --name of the footage (on vertical, the panel sits under your chin)
  file: 'raw-take.mp4',               // the file name in the window's title bar
  title: 'Claude',                    // the assistant's name, on its panel (next to a drawn orange mark) and the title bar
  accent: '#D97757',                  // the mark's colour
  steps: ['Transcribed 1 clip', 'Picked the best take', 'Cut 3 shots', 'Captions added'],   // ticked off one by one: 3 to 5 short lines
  status: ['EDITING', 'DONE'],        // the panel's tag, while working and once the render is done
  bar: ['Rendering', 'Rendered'],     // the render bar's label, while filling and once done
  frames: 150,                        // the number the render bar counts up to
};

FX.comp(() => {
  const { W, H, u } = FX;
  const stacked = W < H * 1.3;        // vertical or square: the window is centred, the counter above it
  const plate = document.getElementById('plate');
  FX.root.style.background = '#f1ede3';
  const world = FX.el('div', null, { position: 'absolute', left: 0, top: 0, width: W + 'px', height: H + 'px', transformOrigin: '0 0', zIndex: 1 });

  // the video's place in the window, at rest. It keeps your shot's shape, so at the start it exactly fills the frame
  const pad = 14 * u, bar = 54 * u, RB = 148 * u;   // window edge round the video, title bar height, render bar area
  const VW = W * (stacked ? 0.56 : 0.647), VH = VW * H / W;
  const VX = stacked ? (W - VW) / 2 : W * 0.967 - pad - VW, VY = H * (stacked ? 0.16 : 0.079) + bar;

  // the window: title bar (three dots, the file name, the assistant's name), your shot, the render bar
  const INK = '#1d1b17', MUTE = '#6b675e';
  FX.el('div', world, { position: 'absolute', left: (VX - pad) + 'px', top: (VY - bar) + 'px', width: (VW + 2 * pad) + 'px', height: (bar + VH + RB) + 'px',
    background: '#fbfaf6', borderRadius: 23 * u + 'px', boxShadow: `0 ${43 * u}px ${100 * u}px rgba(60,50,30,0.28), 0 0 0 ${1.5 * u}px rgba(0,0,0,0.08)` });
  const tb = FX.el('div', world, { position: 'absolute', left: (VX - pad) + 'px', top: (VY - bar) + 'px', width: (VW + 2 * pad) + 'px', height: bar + 'px',
    display: 'flex', alignItems: 'center', padding: `0 ${23 * u}px`, zIndex: 2 });
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c) => FX.el('div', tb, { width: 19 * u + 'px', height: 19 * u + 'px', borderRadius: '50%', background: c, marginRight: 11 * u + 'px' }));
  const ttl = FX.el('div', tb, { position: 'absolute', left: 0, right: 0, textAlign: 'center', font: `700 ${21 * u}px ${FX.font.sans}`, color: '#3a3833' });
  ttl.innerHTML = `<span style="display:inline-block;width:${20 * u}px;height:${16 * u}px;border:${3 * u}px solid #3a3833;border-radius:${3 * u}px;margin-right:${10 * u}px;vertical-align:${-1 * u}px"></span>`;
  ttl.appendChild(document.createTextNode(CONFIG.file));
  FX.el('div', tb, { position: 'absolute', right: 26 * u + 'px', font: `700 ${20 * u}px ${FX.font.sans}`, color: MUTE }).textContent = CONFIG.title;
  world.appendChild(plate);
  Object.assign(plate.style, { left: VX + 'px', top: VY + 'px', width: VW + 'px', height: VH + 'px', zIndex: 2 });

  // the render bar: a label row, then a waveform track that fills blue and turns green when done
  const rb = FX.el('div', world, { position: 'absolute', left: VX + 'px', top: (VY + VH + 17 * u) + 'px', width: VW + 'px', zIndex: 3 });
  const lab = FX.el('div', rb, { display: 'flex', justifyContent: 'space-between', font: `700 ${20 * u}px ${FX.font.sans}`, color: MUTE, marginBottom: 11 * u + 'px' });
  const labL = FX.el('div', lab, {}), labR = FX.el('div', lab, { font: `500 ${20 * u}px ${FX.font.mono}` });
  const track = FX.el('div', rb, { position: 'relative', height: 63 * u + 'px', borderRadius: 14 * u + 'px', background: '#e7e3d8', overflow: 'hidden' });
  const fill = FX.el('div', track, { position: 'absolute', left: 0, top: 0, bottom: 0, width: 0, overflow: 'hidden' });
  const wave = FX.el('div', fill, { position: 'absolute', left: 0, top: 0, width: VW + 'px', height: 63 * u + 'px', display: 'flex', alignItems: 'center',
    gap: 4 * u + 'px', padding: `0 ${9 * u}px` });
  const rnd = FX.rng(5), bars = [];
  for (let i = 0, n = Math.floor((VW - 18 * u) / (10 * u)); i < n; i++) {
    bars.push(FX.el('div', wave, { width: 6 * u + 'px', flex: 'none', borderRadius: 3 * u + 'px', height: (11 + Math.pow(rnd(), 1.4) * 43) * u + 'px' }));
  }
  const playhead = FX.el('div', track, { position: 'absolute', top: -3 * u + 'px', bottom: -3 * u + 'px', width: 6 * u + 'px', marginLeft: -3 * u + 'px', borderRadius: 3 * u + 'px' });

  // the assistant panel: a drawn orange mark, its name, a status tag, then the steps
  const panel = FX.el('div', world, { position: 'absolute', width: (stacked ? 470 : 543) * u + 'px', padding: `${26 * u}px ${29 * u}px ${20 * u}px`, background: '#fff',
    zIndex: 4, borderRadius: 23 * u + 'px', boxShadow: `0 ${31 * u}px ${71 * u}px rgba(60,50,30,0.3), 0 0 0 ${1.5 * u}px rgba(0,0,0,0.06)` });
  const ph = FX.el('div', panel, { display: 'flex', alignItems: 'center', gap: 14 * u + 'px', marginBottom: 17 * u + 'px' });
  const mk = FX.svg('svg', ph, { width: 37 * u, height: 37 * u, viewBox: '-12 -12 24 24' });
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6 + 0.15, r = i % 2 ? 8 : 11.5;
    FX.svg('line', mk, { x1: 0, y1: 0, x2: (Math.cos(a) * r).toFixed(2), y2: (Math.sin(a) * r).toFixed(2), stroke: CONFIG.accent, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  }
  FX.el('div', ph, { font: `700 ${27 * u}px ${FX.font.sans}`, color: INK }).textContent = CONFIG.title;
  const tag = FX.el('div', ph, { marginLeft: 'auto', font: `700 ${17 * u}px ${FX.font.sans}`, color: '#fff', borderRadius: 29 * u + 'px', padding: `${6 * u}px ${14 * u}px`, letterSpacing: 1.4 * u + 'px' });
  const N = CONFIG.steps.length, step = N > 1 ? Math.min(3, 9 / (N - 1)) : 0;   // the last step ticks by about f 20
  const rows = CONFIG.steps.map((t, i) => {
    const r = FX.el('div', panel, { display: 'flex', alignItems: 'center', gap: 17 * u + 'px', padding: `${13 * u}px ${9 * u}px`, borderTop: `${1.5 * u}px solid #eeebe3` });
    const c = FX.el('div', r, { position: 'relative', width: 37 * u + 'px', height: 37 * u + 'px', flex: 'none', borderRadius: '50%', border: `${4 * u}px solid #cfcabd` });
    const chk = FX.el('div', c, { position: 'absolute', inset: -4 * u + 'px', borderRadius: '50%', background: '#2fb457' });
    chk.innerHTML = `<svg width="${37 * u}" height="${37 * u}" viewBox="0 0 26 26"><path d="M7 13.5 L11.2 17.5 L19 9" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const spin = FX.el('div', c, { position: 'absolute', inset: -4 * u + 'px', borderRadius: '50%', border: `${4 * u}px solid transparent`, borderTopColor: '#3d6bf2', borderRightColor: '#3d6bf2' });
    const tx = FX.el('div', r, { font: `700 ${27 * u}px ${FX.font.sans}`, whiteSpace: 'nowrap' }); tx.textContent = t;
    return { chk, spin, tx, at: 9 + i * step };
  });

  // the big counter on the desk
  const count = FX.el('div', world, { position: 'absolute', zIndex: 4, font: `700 ${166 * u}px/1 ${FX.font.serif}`, color: '#171512', letterSpacing: -4 * u + 'px',
    whiteSpace: 'nowrap', transformOrigin: '0 70%' });
  if (!stacked) {
    Object.assign(panel.style, { left: W * 0.075 + 'px', top: H * 0.397 + 'px' });
    Object.assign(count.style, { left: W * 0.031 + 'px', top: H * 0.098 + 'px' });
  } else {
    // vertical: the panel over the window's lower left, just under your chin, and above the bottom fifth
    const hd = FX.subject(CONFIG.footage).head(0), chin = VY + (hd.top + hd.h) * VW / W;
    const ph2 = panel.offsetHeight;
    panel.style.left = W * 0.04 + 'px';
    panel.style.top = Math.min(H * 0.8 - ph2, Math.max(H * 0.42, chin + 30 * u)) + 'px';
    // the counter above the window, as big as the space there allows
    const room = VY - bar - H * 0.04;
    Object.assign(count.style, { left: W * 0.06 + 'px', top: H * 0.04 + 'px', fontSize: Math.min(150 * u, room * 0.85) + 'px' });
  }

  const FILL0 = 5, FILL1 = 18.5;      // the render bar fills from f 5 to f 18.5, then turns green
  const blue = [61, 107, 242], green = [47, 180, 87];
  return (f) => {
    // the pull: the video goes from the full frame to its place in the window over f 1 to 13.5, then drifts slowly closer
    const tp = FX.lin(f, 1, 13.5), e = 0.55 * FX.out(tp) + 0.45 * FX.inout(tp);
    const z = FX.mix(W, VW, e) / VW, rx = FX.mix(0, VX, e), ry = FX.mix(0, VY, e);
    const d = 1 + 0.025 * FX.lin(f, 14, FX.END);
    const tx = (rx - VX * z) * d + W / 2 * (1 - d), ty = (ry - VY * z) * d + H / 2 * (1 - d);
    world.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${(z * d).toFixed(5)})`;
    plate.style.borderRadius = (9 * u * e).toFixed(2) + 'px';
    // the panel slides in from the left and the counter rises in as the window lands
    const pp = FX.lin(f, 5, 11);
    panel.style.opacity = Math.min(1, pp * 2.5);
    panel.style.transform = `translateX(${(-86 * u * (1 - FX.out(pp))).toFixed(2)}px)`;
    for (const r of rows) {
      const done = FX.lin(f, r.at, r.at + 2.5), live = f >= r.at - 3 && done === 0;   // a spinner for 3 f, then a green tick pops
      r.chk.style.opacity = done > 0 ? 1 : 0;
      r.chk.style.transform = `scale(${done > 0 ? FX.back(done, 3).toFixed(3) : 0})`;
      r.spin.style.opacity = live ? 1 : 0;
      r.spin.style.transform = `rotate(${(f * 40) % 360}deg)`;
      r.tx.style.color = done > 0 || live ? INK : '#b3aea2';
    }
    const fp = FX.lin(f, FILL0, FILL1), fe = FX.inout(fp) * 0.6 + fp * 0.4;
    const g = FX.lin(f, FILL1, FILL1 + 2), rgb = `rgb(${blue.map((b, i) => Math.round(FX.mix(b, green[i], g))).join(',')})`;
    fill.style.width = (fe * 100).toFixed(2) + '%';
    fill.style.background = `rgb(${Math.round(FX.mix(217, 214, g))},${Math.round(FX.mix(228, 242, g))},${Math.round(FX.mix(255, 222, g))})`;
    for (const b of bars) b.style.background = rgb;
    playhead.style.left = (fe * 100).toFixed(2) + '%';
    playhead.style.background = rgb; playhead.style.opacity = 1 - g;
    track.style.boxShadow = g > 0 ? `0 0 0 ${(4 * u * g).toFixed(2)}px rgba(47,180,87,${(0.5 * g).toFixed(3)})` : 'none';
    labL.textContent = g >= 1 ? CONFIG.bar[1] : CONFIG.bar[0];
    labL.style.color = g >= 1 ? '#2fb457' : MUTE;
    labR.textContent = `${Math.round(CONFIG.frames * fe)} / ${CONFIG.frames}`;
    count.textContent = Math.round(100 * fe) + '%';
    const cp = FX.lin(f, 4, 8), pop = Math.exp(-Math.pow((f - (FILL1 + 1)) / 1.6, 2));   // a small pop as it hits 100
    count.style.opacity = FX.out(cp);
    count.style.transform = `translateY(${(29 * u * (1 - FX.out(cp))).toFixed(2)}px) scale(${(1 + 0.08 * pop).toFixed(4)})`;
    count.style.color = g >= 1 ? '#1f8f45' : '#171512';
    tag.textContent = g >= 1 ? CONFIG.status[1] : CONFIG.status[0];
    tag.style.background = g >= 1 ? '#2fb457' : '#3d6bf2';
  };
});
