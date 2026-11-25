// media: plate=assets/footage/talk.mp4 cut=assets/footage/talk-cutout.webm cut2=assets/footage/talk-cutout.webm
/* Doodle Boil: a white chalk outline traces round you, a little way out from your edge, and BOILS: it is redrawn with a new
   wobble every 2 f, like hand-drawn animation. Chalky doodles (a clapperboard, a heart, a star, sparkles) draw on around you
   and boil the same way.
   The outline is made in the browser from a second copy of your cutout: an SVG filter blurs its shape, cuts a thin band a set
   distance outside you, roughens that band with noise whose seed changes every 2 f, and gives it a chalk texture.
   Layers: your shot (z 0) < the doodles (z 5) < your cutout (z 10, so a doodle can never cover your face) < the outline (z 11). */
const CONFIG = {
  footage: 'talk',                      // the --name of the footage (used to find your head)
  chalk: '#ffffff',                     // the outline and the doodles' lines
  pink: '#ff8ecb',                      // the doodles' scribbled fill, one colour...
  yellow: '#ffe46b',                    // ...and the other
  doodles: ['clapper', 'heart', 'star'],// which big doodles to draw: any of 'clapper', 'heart', 'star'
  sparkles: 5,                          // how many little four-point sparkles, 0 to 5
  gap: 8,                               // how far outside your edge the outline sits, in units
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const plate = document.getElementById('plate'), cut = document.getElementById('cut'), ring = document.getElementById('cut2');
  plate.style.zIndex = 0; cut.style.zIndex = 10; ring.style.zIndex = 11;
  cut.style.filter = FX.choke(2 * u);
  const S = FX.subject(CONFIG.footage), head = S.head(0);
  for (let f = 0; f <= FX.END; f += 6) head.top = Math.min(head.top, S.head(f).top);   // the highest the head goes
  const hw = head.h / 1.3, headL = head.x - hw / 2, headR = head.x + hw / 2;

  // ---- the outline filter. Blurring your shape and keeping only a band of the blur gives a smooth line a fixed distance
  // outside you (the blur's value at a distance d outside an edge is the normal tail at d / blur, worked out below).
  // The cutout's see-through wisps are dropped first (a hard edge at 40%), or they would fill in white.
  const BLUR = 16;                                   // units
  const tail = (z) => { const t = 1 / (1 + 0.2316419 * z), d = 0.3989423 * Math.exp(-z * z / 2);
    return d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); };
  const at = (d) => tail(d / BLUR);                  // the blur's value d units outside your edge
  const band = (name, near, far) => {                // keep the blur between two distances: a ring round you
    const K = 80;
    return `<feComponentTransfer in="b" result="${name}o"><feFuncA type="linear" slope="${K}" intercept="${(-at(far) * K).toFixed(3)}"/></feComponentTransfer>
      <feComponentTransfer in="b" result="${name}i"><feFuncA type="linear" slope="${K}" intercept="${(-at(near) * K).toFixed(3)}"/></feComponentTransfer>
      <feComposite in="${name}o" in2="${name}i" operator="out" result="${name}"/>`;
  };
  const g = CONFIG.gap, n = (v) => (v * u).toFixed(2);
  const defs = FX.svg('svg', FX.root, { width: 0, height: 0 });
  Object.assign(defs.style, { position: 'absolute', width: 0, height: 0 });
  defs.innerHTML = `<filter id="db-ring" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feComponentTransfer in="SourceAlpha" result="hard"><feFuncA type="linear" slope="10" intercept="-4"/></feComponentTransfer>
      <feGaussianBlur in="hard" stdDeviation="${n(BLUR)}" result="b"/>
      ${band('thick', g, g + 13)}
      ${band('thin', g + 5, g + 9)}
      <feTurbulence id="db-n1" type="fractalNoise" baseFrequency="${(0.028 / u).toFixed(4)}" numOctaves="3" seed="1" result="n1"/>
      <feDisplacementMap in="thick" in2="n1" scale="${n(18)}" xChannelSelector="R" yChannelSelector="G" result="w1"/>
      <feTurbulence id="db-n2" type="fractalNoise" baseFrequency="${(0.032 / u).toFixed(4)}" numOctaves="3" seed="51" result="n2"/>
      <feDisplacementMap in="thin" in2="n2" scale="${n(22)}" xChannelSelector="R" yChannelSelector="G" result="w2"/>
      <feOffset in="w2" dx="${n(4)}" dy="${n(-3)}" result="w2o"/>
      <feMerge result="lines"><feMergeNode in="w1"/><feMergeNode in="w2o"/></feMerge>
      <feTurbulence type="fractalNoise" baseFrequency="${(0.77 / u).toFixed(3)}" numOctaves="1" seed="5" result="gr"/>
      <feColorMatrix in="gr" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3.2 -0.75" result="ga"/>
      <feComposite in="lines" in2="ga" operator="in" result="ca"/>
      <feFlood flood-color="${CONFIG.chalk}"/><feComposite in2="ca" operator="in" result="chalk"/>
      <feGaussianBlur in="lines" stdDeviation="${n(3.6)}" result="sb"/>
      <feFlood flood-color="#000" flood-opacity="0.45"/><feComposite in2="sb" operator="in" result="sh"/>
      <feMerge><feMergeNode in="sh"/><feMergeNode in="chalk"/></feMerge>
    </filter>`;
  ring.style.filter = 'url(#db-ring)';
  const seeds = [defs.querySelector('#db-n1'), defs.querySelector('#db-n2')];

  // ---- the doodles: drawn in a little local space, then scaled and placed from the frame and the head
  const svg = FX.layer(5);
  svg.innerHTML = `<defs><filter id="db-chalk" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="${(0.77 / u).toFixed(3)}" numOctaves="1" seed="5" result="g"/>
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 3.2 -0.75" result="ga"/>
      <feComposite in="SourceGraphic" in2="ga" operator="in" result="c"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="${n(3.6)}" result="b"/>
      <feFlood flood-color="#000" flood-opacity="0.45"/><feComposite in2="b" operator="in" result="sh"/>
      <feMerge><feMergeNode in="sh"/><feMergeNode in="c"/></feMerge></filter></defs>`;
  const gD = FX.svg('g', svg, { filter: 'url(#db-chalk)', fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const hash = (s) => FX.rng((s * 2654435761) >>> 0);
  const k = 1.43 * u * (portrait ? 0.85 : 1);        // local units to pixels (smaller on vertical, where room is tight)
  const C = CONFIG.chalk, PINK = CONFIG.pink, YEL = CONFIG.yellow;

  const smooth = (P) => {                            // a smooth line through points
    let d = `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return d;
  };
  const resample = (P, gap) => {                     // even spacing, so the wobble is even along a stroke
    const out = [P[0]]; let carry = 0;
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      let t = gap - carry;
      while (t <= L) { out.push([a[0] + (b[0] - a[0]) * t / L, a[1] + (b[1] - a[1]) * t / L]); t += gap; }
      carry = L - (t - gap);
    }
    out.push(P[P.length - 1]);
    return out;
  };
  const zig = (x, y, w, h, gp) => { const P = []; for (let t = 0, up = true; t <= w; t += gp, up = !up) P.push([x + t, up ? y : y + h]); return P; };
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]];
  const rotP = (P, cx, cy, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return P.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]); };
  const twinkle = (R) => { const P = []; for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 4, rr = i % 2 ? R * 0.22 : R; P.push([rr * Math.cos(a), rr * Math.sin(a)]); } return P; };

  // each doodle in local units round its own centre: { strokes: [{ P, color, w, sharp }], at, dur, tilt, size }
  const SHAPES = {
    clapper: () => {
      const x = -95, y = -90, w = 190, h = 128, st = [];
      st.push({ P: zig(x + 10, y + 46, w - 20, h - 56, 11), color: PINK, w: 6, sharp: true });
      st.push({ P: rect(x, y + 34, w, h), color: C, w: 5 });
      st.push({ P: [[x, y + 62], [x + w, y + 62]], color: C, w: 4 });
      st.push({ P: rotP(rect(x, y, w, 32), x, y + 32, -14), color: C, w: 5 });
      for (let i = 0; i < 5; i++) st.push({ P: rotP([[x + 18 + i * 36, y + 32], [x + 36 + i * 36, y]], x, y + 32, -14), color: YEL, w: 5 });
      for (let i = 0; i < 5; i++) st.push({ P: [[x + 10 + i * 38, y + 62], [x + 28 + i * 38, y + 36]], color: C, w: 4 });
      return { strokes: st, at: 2, dur: 7, tilt: -6, size: [200, 175] };
    },
    heart: () => {
      const s = 5, P = [], fill = [];
      for (let i = 0; i <= 48; i++) { const t = i / 48 * Math.PI * 2;
        P.push([s * 16 * Math.pow(Math.sin(t), 3), -s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); }
      for (let t = 0, up = true; t <= 150; t += 10, up = !up) { const xx = -72 + t, half = 64 * Math.sqrt(Math.max(0, 1 - Math.pow(xx / 84, 2)));
        fill.push([xx, up ? -half * 0.55 - (Math.abs(xx) < 20 ? -14 : 0) : half * 0.95]); }
      const st = [{ P: fill, color: PINK, w: 6, sharp: true }, { P, color: C, w: 5 }];
      for (let i = 0; i < 3; i++) { const a = (-160 + i * 30) * Math.PI / 180;
        st.push({ P: [[98 * Math.cos(a), 98 * Math.sin(a) + 10], [126 * Math.cos(a), 126 * Math.sin(a) + 10]], color: YEL, w: 5 }); }
      return { strokes: st, at: 0.5, dur: 6, tilt: 8, size: [260, 230] };
    },
    star: () => {
      const P = [], fill = [];
      for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 27 : 62; P.push([rr * Math.cos(a), rr * Math.sin(a)]); }
      for (let t = 0, up = true; t <= 70; t += 9, up = !up) fill.push([-35 + t, up ? -22 : 26]);
      return { strokes: [{ P: fill, color: YEL, w: 6, sharp: true }, { P, color: C, w: 5, sharp: true }], at: 5, dur: 6, tilt: -10, size: [130, 125] };
    },
  };
  const SPARK = [[34, PINK, 7], [26, C, 9], [22, YEL, 10], [28, C, 11], [22, YEL, 8]];

  // ---- where they go. Landscape: the spaces left and right of the head. Vertical: the band above the head and the strips beside it.
  let place;
  if (!portrait) {
    let Lw = Math.max(0, headL - 40 * u), Rx = headR + 40 * u, Rw = Math.max(0, W - Rx);
    const flip = Lw < Rw * 0.6;                      // head well to the left: the big doodles swap sides
    const left = (t) => (flip ? Rx + Rw * (1 - t) : Lw * t), right = (t) => (flip ? Lw * (1 - t) : Rx + Rw * t);
    place = { clapper: [left(0.31), 0.2 * H], heart: [right(0.34), 0.17 * H], star: [left(0.39), 0.67 * H],
      sparks: [[right(0.7), 0.44 * H], [left(0.8), 0.16 * H], [left(0.63), 0.4 * H], [right(0.78), 0.74 * H], [right(0.55), 0.38 * H]] };
  } else {
    const bandC = (0.04 * H + head.top - 20 * u) / 2, Rs = (W - headR) / 2;
    place = { clapper: [0.27 * W, bandC], heart: [0.72 * W, bandC - 10 * u], star: [headR + Rs, head.top + 0.55 * head.h],
      sparks: [[headR + Rs * 0.9, head.top + 0.12 * head.h], [0.5 * W, 0.04 * H + 30 * u], [headL * 0.5, head.top + 0.35 * head.h],
        [headL * 0.45, head.top + 0.75 * head.h], [0.5 * W, bandC + 60 * u]] };
  }
  const keepIn = (x, y, w, h) => [Math.max(w / 2 + 20 * u, Math.min(W - w / 2 - 20 * u, x)), Math.max(h / 2 + 20 * u, Math.min(H - h / 2 - 20 * u, y))];

  const doodles = [];
  for (const name of CONFIG.doodles) {
    if (!SHAPES[name]) continue;
    const d = SHAPES[name]();
    [d.cx, d.cy] = keepIn(place[name][0], place[name][1], d.size[0] * k, d.size[1] * k);
    doodles.push(d);
  }
  SPARK.slice(0, Math.max(0, Math.min(5, CONFIG.sparkles))).forEach(([R, color, at], i) => {
    const [cx, cy] = keepIn(place.sparks[i][0], place.sparks[i][1], R * 2 * k, R * 2 * k);
    doodles.push({ strokes: [{ P: twinkle(R), color, w: 4.5, sharp: true }], at, dur: 4, tilt: 0, pulse: true, cx, cy });
  });
  doodles.forEach((d, di) => d.strokes.forEach((s, si) => { s.el = FX.svg('path', gD, { stroke: s.color, 'stroke-width': s.w * k }); s.seed = di * 100 + si; }));

  return (f) => {
    const step = Math.floor(f / 2);                  // the boil: a fresh wobble every 2 f
    // ---- the outline: new noise seeds every step, drawn on round you over f 0.3 to 8 (a sweep round your head)
    seeds[0].setAttribute('seed', 1 + step * 7);
    seeds[1].setAttribute('seed', 51 + step * 11);
    const draw = 1 - Math.pow(1 - FX.lin(f, 0.3, 8), 2), hd = S.head(f), a = (draw * 360).toFixed(2);
    const mask = draw >= 1 ? 'none' : `conic-gradient(from 180deg at ${hd.x}px ${hd.y}px, #000 ${a}deg, transparent ${a}deg)`;
    ring.style.webkitMaskImage = mask; ring.style.maskImage = mask;
    // ---- the doodles: each re-jittered every step, popping in and drawing on at its own time
    for (const d of doodles) {
      const p = FX.out(FX.lin(f, d.at, d.at + d.dur));
      const r0 = hash(step * 17 + Math.round(d.cx));
      const pop = FX.back(FX.lin(f, d.at, d.at + 4), 2.4);
      const sc = (d.pulse ? 1 + 0.12 * Math.sin(step * 1.9 + d.cx) : 1) * FX.mix(0.6, 1, pop) * k;
      const rot = ((r0() - 0.5) * 4 + d.tilt * (1 - FX.out(FX.lin(f, d.at, d.at + 6)))) * Math.PI / 180;
      for (const s of d.strokes) {
        const r = hash(step * 97 + s.seed);
        const P = (s.sharp ? s.P : resample(s.P, 14)).map(([x, y]) => [x + (r() - 0.5) * 4.4, y + (r() - 0.5) * 4.4]);
        const T = P.map(([x, y]) => [d.cx + (x * Math.cos(rot) - y * Math.sin(rot)) * sc, d.cy + (x * Math.sin(rot) + y * Math.cos(rot)) * sc]);
        s.el.setAttribute('d', s.sharp ? 'M' + T.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L') : smooth(T));
        s.el.style.opacity = p > 0 ? 1 : 0;
        const L = s.el.getTotalLength();
        s.el.setAttribute('stroke-dasharray', `${L.toFixed(1)} ${(L + 10).toFixed(1)}`);
        s.el.setAttribute('stroke-dashoffset', (L * (1 - p)).toFixed(1));
      }
    }
  };
});
