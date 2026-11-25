// media: plate=assets/footage/talk.mp4 cut=assets/footage/talk-cutout.webm
/* Chart Grow: a glowing line chart draws itself on the wall BEHIND you: day labels along the top, a bright line climbing
   left to right with a dot landing on each point, a pill with your number popping up near the peak, then a slow pulse
   on the peak. The line passes behind your head, so it really looks drawn on the wall.
   Layers: your shot (z 0) < a dark shade (z 4) < the chart (z 5) < the pill (z 6) < your cutout (z 10). */
const CONFIG = {
  footage: 'talk',          // the --name of the footage (used to find your head)
  labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],          // along the top, one per point
  values: [10, 14, 19, 27, 47, 74, 98],                // any numbers, one per label: the biggest sits at the top
  pill: '+312%',            // the word or number in the pill near the peak
  color: '#ecff4f',         // the line, the dots and the pill (a hex colour like this one)
  verticalStart: 0.5,       // vertical frames only: the chart's floor, as a share of the height (0.5 = half way down). Lower
                            // (0.58) starts the line beside your shoulder; keep it here if a chair or your shoulder hides it
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const C = CONFIG.color;
  const plate = document.getElementById('plate'), cut = document.getElementById('cut');
  plate.style.zIndex = 0; cut.style.zIndex = 10;
  cut.style.filter = FX.choke(2 * u);       // tighten the cutout's edge so no old background glows round your hair
  const shade = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 4, background: 'rgba(8,8,14,0.32)' });
  const svg = FX.layer(5);
  const mk = (tag, attrs, parent) => FX.svg(tag, parent || svg, attrs);

  // the chart's box: the line rises from low on the left to high on the right, labels along the top. Landscape: most of
  // the frame. Vertical: the floor half way down (verticalStart), so the line starts low beside you, passes behind your head
  // and ends high above it on the other side: the start, the end and the pill all show.
  const sub = FX.subject(CONFIG.footage), heads = [];
  for (let f = 0; f <= FX.END; f += 6) heads.push(sub.head(f));
  const headTop = Math.min(...heads.map((h) => h.top));    // the highest the hair goes over the whole clip
  const left = W * (portrait ? 0.09 : 0.1), right = W * (portrait ? 0.91 : 0.9);
  const labY = H * (portrait ? 0.075 : 0.077), top = H * (portrait ? 0.13 : 0.16);
  const floor = H * (portrait ? CONFIG.verticalStart : 0.66);
  const n = CONFIG.labels.length, max = Math.max(...CONFIG.values);
  const X = (i) => left + i * (right - left) / (n - 1), Y = (v) => floor - (v / max) * (floor - top);
  const pts = CONFIG.values.map((v, i) => [X(i), Y(v)]);

  // a faint grid: dashed guides down from each label, two rules across
  const grid = mk('g', { opacity: 0 });
  pts.forEach(([x]) => mk('line', { x1: x, y1: labY + 22 * u, x2: x, y2: floor + 28 * u, stroke: 'rgba(255,255,255,0.28)', 'stroke-width': 2 * u, 'stroke-dasharray': `${4 * u} ${9 * u}` }, grid));
  [0.37, 0.79].forEach((v) => { const y = floor - v * (floor - top); mk('line', { x1: left - 40 * u, y1: y, x2: right + 40 * u, y2: y, stroke: 'rgba(255,255,255,0.12)', 'stroke-width': 2 * u }, grid); });
  const labels = CONFIG.labels.map((c, i) => {
    const t = mk('text', { x: X(i), y: labY, 'text-anchor': 'middle', fill: '#fff', 'font-family': FX.font.sans, 'font-weight': 700, 'font-size': 37 * u, opacity: 0 });
    t.textContent = c; return t;
  });

  // the line: a wide blurred copy underneath for the glow, the sharp line on top; both drawn on by their dash offset
  const d = 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L');
  const glow = mk('path', { d, fill: 'none', stroke: C, 'stroke-width': 26 * u, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.45 });
  glow.style.filter = `blur(${14 * u}px)`;
  const line = mk('path', { d, fill: 'none', stroke: C, 'stroke-width': 13 * u, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  line.style.filter = `drop-shadow(0 0 ${9 * u}px ${C})`;
  const L = line.getTotalLength();
  [glow, line].forEach((p) => p.setAttribute('stroke-dasharray', `${L} ${L}`));
  const dots = pts.map(([x, y]) => mk('circle', { cx: x, cy: y, r: 0, fill: '#fff', stroke: C, 'stroke-width': 6 * u }));
  const ring = mk('circle', { cx: pts[n - 1][0], cy: pts[n - 1][1], r: 0, fill: 'none', stroke: C, 'stroke-width': 4 * u, opacity: 0 });
  const tip = mk('circle', { cx: pts[0][0], cy: pts[0][1], r: 0, fill: '#fffbe0' });   // the bright point leading the line
  tip.style.filter = `drop-shadow(0 0 ${14 * u}px ${C}) drop-shadow(0 0 ${31 * u}px ${C})`;

  // how far along the line it has drawn at time f: mostly eased, a little linear so it never stalls (f 1 to f 14)
  const drawn = (f) => FX.inout(FX.lin(f, 1, 14)) * 0.75 + FX.lin(f, 1, 14) * 0.25;
  // when the line reaches each point, so its dot pops as the line arrives
  let walked = 0;
  const arrive = pts.map((p, i) => {
    if (i) walked += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
    let f = 1; while (f < 14 && drawn(f) < walked / L - 1e-4) f += 0.1;
    return f;
  });

  // the pill: above the last stretch of the line, just left of the peak (still behind you)
  const pill = FX.el('div', null, { position: 'absolute', zIndex: 6, padding: `${14 * u}px ${31 * u}px ${14 * u}px ${34 * u}px`, borderRadius: 57 * u + 'px',
    background: C, color: '#111', font: `900 ${49 * u}px/1 ${FX.font.sans}`, letterSpacing: '0.01em', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center',
    gap: 11 * u + 'px', boxShadow: `0 0 ${37 * u}px ${C}a6, 0 ${11 * u}px ${26 * u}px rgba(0,0,0,0.35)`, transformOrigin: '50% 100%' });
  pill.append(CONFIG.pill);
  pill.insertAdjacentHTML('beforeend', `<svg width="${37 * u}" height="${37 * u}" viewBox="0 0 26 26"><path d="M6 20 L20 6 M9 6 H20 V17" stroke="#111" stroke-width="4.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`);
  const [ax, ay] = pts[n - 2], [bx, by] = pts[n - 1];
  pill.style.left = Math.max(20 * u, bx - 180 * u - pill.offsetWidth) + 'px';
  let pillY = (ay + by) / 2 - 28 * u - pill.offsetHeight;
  if (portrait) pillY = Math.min(pillY, headTop - 24 * u - pill.offsetHeight);   // on vertical, above the hair, clear of the face
  pill.style.top = Math.max(labY + 30 * u, pillY) + 'px';

  return (f) => {
    shade.style.opacity = FX.out(FX.lin(f, 0, 6));
    grid.setAttribute('opacity', FX.out(FX.lin(f, 0, 4)).toFixed(3));
    labels.forEach((t, i) => {
      const p = FX.out(FX.lin(f, 0.3 + i * 0.5, 2.8 + i * 0.5));   // the labels rise in left to right
      t.setAttribute('opacity', p.toFixed(3)); t.setAttribute('transform', `translate(0 ${(14 * u * (1 - p)).toFixed(2)})`);
    });
    const len = drawn(f) * L;
    [glow, line].forEach((e) => e.setAttribute('stroke-dashoffset', (L - len).toFixed(2)));
    const hp = line.getPointAtLength(Math.max(0.01, len));
    tip.setAttribute('cx', hp.x.toFixed(2)); tip.setAttribute('cy', hp.y.toFixed(2));
    tip.setAttribute('r', f < 0.8 ? 0 : 16 * u);
    dots.forEach((c, i) => { const k = FX.lin(f, arrive[i], arrive[i] + 3); c.setAttribute('r', (k > 0 ? 13 * u * FX.back(k, 3) : 0).toFixed(2)); });
    // once the line has landed, a ring pulses out of the peak every second
    const ph = f >= 14 ? ((f - 14) % 24) / 24 : -1;
    ring.setAttribute('r', ph < 0 ? 0 : ((17 + 49 * FX.out(ph)) * u).toFixed(2));
    ring.setAttribute('opacity', ph < 0 ? 0 : (0.9 * (1 - ph)).toFixed(3));
    // the pill pops up with a small overshoot and a tilt that straightens (f 10 to 15)
    const q = FX.lin(f, 10, 15);
    pill.style.opacity = q > 0 ? Math.min(1, q * 3) : 0;
    pill.style.transform = `translateY(${(20 * u * (1 - FX.out(q))).toFixed(2)}px) scale(${FX.mix(0.4, 1, FX.back(q, 2.6)).toFixed(4)}) rotate(${(-4 * (1 - FX.out(q))).toFixed(2)}deg)`;
  };
});
