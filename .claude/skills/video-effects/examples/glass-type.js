// media: plate=assets/footage/talk.mp4 glass=assets/footage/talk.mp4 cut=assets/footage/talk-cutout.webm
/* Glass Type: big 3D glass letters on the wall BEHIND you. Each letter is thick glass: a blurred, brightened, slightly
   magnified copy of your room shows through the letterforms (a second copy of your shot, clipped to the type), with an
   extruded glass edge, bright rim highlights, an inner shadow and a soft shadow on the wall. They swing in from a 3D tilt
   over f 1 to 10, then hold while a light sweep crosses them.
   Layers: your shot (z 0) < the glass sign (z 5: wall shadow, extruded edge, refraction, glass face) < your cutout (z 10). */
const CONFIG = {
  footage: 'talk',          // the --name of the footage (used to find your head)
  word: 'DESIGN',           // the glass word: one short word reads best. On vertical, two words (a space) stack on two lines
  tint: [210, 235, 255],    // the glass colour (red, green, blue): a cool blue-white
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const plate = document.getElementById('plate'), glass = document.getElementById('glass'), cut = document.getElementById('cut');
  plate.style.zIndex = 0; cut.style.zIndex = 10;
  cut.style.filter = FX.choke(2 * u);
  const S = FX.subject(CONFIG.footage), head = S.head(0);
  for (let f = 0; f <= FX.END; f += 6) head.top = Math.min(head.top, S.head(f).top);   // the highest the head goes

  // ---- size the word to the frame: about two thirds of the width in landscape, most of it on vertical
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const LS = -0.017;                                            // tight tracking, in ems
  const lines = portrait ? String(CONFIG.word).trim().split(/\s+/) : [String(CONFIG.word).trim()];
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = `900 100px ${FX.font.sans}`;
  const em = (t) => (ctx.measureText(t).width + LS * 100 * (t.length - 1)) / 100;   // a line's width per pixel of font size
  const CAP = ctx.measureText('H').actualBoundingBoxAscent / 100;                    // capital height per pixel of font size
  const fitW = W * (portrait ? 0.86 : W > H ? 0.67 : 0.84);
  // never taller than the room above the head allows (so a second line doesn't push the word down onto the face)
  const room = (head.top - 0.05 * H) / (0.65 + 1.25 * (lines.length - 1)) / CAP;
  const FS = Math.min(...lines.map((l) => fitW / em(l)), (portrait ? 0.11 : 0.23) * H / CAP, Math.max(room, 0.05 * H / CAP));
  const capH = CAP * FS, lead = capH * 1.25;
  const tw = Math.max(...lines.map(em)) * FS;
  // behind the head: the bottom of the word sits just below the top of the head (lower in landscape, as on a wall)
  const Y = Math.max(0.05 * H + capH + lead * (lines.length - 1), head.top + (portrait ? 0.35 : 0.53) * capH);   // last baseline
  const X = Math.max(tw / 2 + 0.06 * W, Math.min(W - tw / 2 - 0.06 * W, head.x));                                // centre
  const top = Y - lead * (lines.length - 1) - capH;
  const tspans = lines.map((l, i) => `<tspan x="${X}" y="${(Y - lead * (lines.length - 1 - i)).toFixed(1)}">${esc(l)}</tspan>`).join('');
  const T = (attrs) => `<text text-anchor="middle" font-family="${FX.font.sans}" font-weight="900" font-size="${FS.toFixed(1)}" letter-spacing="${(LS * FS).toFixed(2)}" ${attrs || ''}>${tspans}</text>`;
  const n = (v) => (v * u).toFixed(2);
  const [tr, tg, tb] = CONFIG.tint;

  // the sign: everything that swings in, in frame coordinates, turning round a point in the middle of the word
  const pivot = `${X}px ${(top + capH * 0.5).toFixed(1)}px`;
  const sign = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 5, transformOrigin: pivot });
  const svgLayer = (z, inner, style) => {
    const s = FX.svg('svg', sign, { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
    Object.assign(s.style, { position: 'absolute', left: 0, top: 0, zIndex: z, overflow: 'visible' }, style || {});
    s.innerHTML = inner; return s;
  };
  // 1. its soft shadow on the wall
  const shadow = svgLayer(1, `<defs><filter id="gt-sh" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="${n(16)}"/></filter></defs>
    ${T(`fill="#000" opacity="0.42" filter="url(#gt-sh)" transform="translate(${n(26)} ${n(34)})"`)}`, { mixBlendMode: 'multiply' });
  // 2. the extruded glass edge: stacked copies stepping back, tinted, each a touch darker
  let ext = '';
  for (let i = 12; i >= 1; i--) ext += T(`transform="translate(${n(i * 1.3)} ${n(i * 1.8)})" fill="rgba(150,185,210,${(0.05 + 0.012 * (12 - i)).toFixed(3)})" stroke="rgba(235,248,255,${i === 12 ? 0.55 : 0.07})" stroke-width="${n(2)}"`);
  svgLayer(2, ext);
  // 3. the refraction: the room, blurred, brightened and magnified, seen only through the letterforms
  svgLayer(0, `<defs><clipPath id="gt-clip">${T()}</clipPath></defs>`, { width: '0', height: '0' });
  const refr = FX.el('div', sign, { position: 'absolute', inset: '0', zIndex: 3, clipPath: 'url(#gt-clip)' });
  refr.appendChild(glass);
  Object.assign(glass.style, { transformOrigin: pivot, transform: `scale(1.16) translate(${-14 * u}px, ${-20 * u}px)`,
    filter: `blur(${10 * u}px) brightness(1.45) contrast(1.05) saturate(1.25)` });
  FX.el('div', refr, { position: 'absolute', inset: '0',
    background: `linear-gradient(180deg, rgba(${tr},${tg},${tb},0.20), rgba(120,170,210,0.10) 60%, rgba(${tr},${tg},${tb},0.18))` });
  // 4. the glass face: inner shadow and rim light, a gloss on the top half, bright edges, and the moving light sweep
  const face = svgLayer(4, `<defs>
      <filter id="gt-inner" x="-5%" y="-20%" width="110%" height="140%">
        <feFlood flood-color="#06121e" flood-opacity="0.75"/><feComposite in2="SourceAlpha" operator="out"/>
        <feGaussianBlur stdDeviation="${n(10)}"/><feOffset dx="${n(-7)}" dy="${n(-10)}"/><feComposite in2="SourceAlpha" operator="in" result="dark"/>
        <feFlood flood-color="#ffffff" flood-opacity="0.95"/><feComposite in2="SourceAlpha" operator="out"/>
        <feGaussianBlur stdDeviation="${n(4)}"/><feOffset dx="${n(6)}" dy="${n(7)}"/><feComposite in2="SourceAlpha" operator="in" result="rim"/>
        <feMerge><feMergeNode in="dark"/><feMergeNode in="rim"/></feMerge>
      </filter>
      <linearGradient id="gt-gloss" x1="0" y1="${top}" x2="0" y2="${Y}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="0.42" stop-color="#fff" stop-opacity="0.12"/>
        <stop offset="0.46" stop-color="#fff" stop-opacity="0.0"/><stop offset="1" stop-color="#fff" stop-opacity="0.06"/></linearGradient>
      <linearGradient id="gt-edge" x1="0" y1="${top}" x2="0" y2="${Y}" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="0.6" stop-color="#e8f6ff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0.85"/></linearGradient>
      <linearGradient id="gt-sweep" x1="0" y1="0" x2="1" y2="0.35">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.38" stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.47" stop-color="#fff" stop-opacity="0.55"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.9"/><stop offset="0.53" stop-color="#fff" stop-opacity="0.55"/>
        <stop offset="0.62" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <clipPath id="gt-clip2">${T()}</clipPath>
    </defs>
    ${T('fill="#000" filter="url(#gt-inner)"')}
    ${T('fill="url(#gt-gloss)"')}
    <g clip-path="url(#gt-clip2)"><rect id="gt-sw" x="0" y="0" width="${(0.7 * W).toFixed(0)}" height="${H}" fill="url(#gt-sweep)"/></g>
    ${T(`fill="none" stroke="url(#gt-edge)" stroke-width="${n(4)}"`)}`);
  const sweep = face.querySelector('#gt-sw');
  const sweepFrom = X - tw / 2 - 0.7 * W, sweepTo = X + tw / 2 + 0.05 * W;

  return (f) => {
    // the swing: from turned away and tilted back, it turns to face us, overshooting a touch before it settles
    const e = FX.out5(FX.lin(f, 1, 10)), eb = FX.back(FX.lin(f, 1, 11), 1.4);
    const ry = FX.mix(-62, -9, eb), rx = FX.mix(28, 4, e), sc = FX.mix(1.35, 1, e);
    sign.style.transform = `perspective(${(1570 * u).toFixed(0)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg) scale(${sc.toFixed(4)}) translateZ(0)`;
    sign.style.opacity = Math.min(1, FX.lin(f, 0.6, 4) * 1.2);
    shadow.style.opacity = FX.lin(f, 4, 12);
    // the light sweep: a fast glint as it lands, then a slow pass while it holds
    const a = FX.lin(f, 6, 18), b = FX.lin(f, 30, FX.END - 6);
    sweep.setAttribute('x', FX.mix(sweepFrom, sweepTo, FX.inout(f < 24 ? a : b)).toFixed(1));
  };
});
