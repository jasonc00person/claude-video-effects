// media: plate=assets/footage/talk.mp4 cut=assets/footage/talk-cutout.webm
/* Cover Story: your shot becomes a magazine cover. A huge white serif masthead rises in letter by letter across the top,
   BEHIND your head, its letters closing up as they land. Then the cover lines settle in: an issue line and a thin rule above
   the masthead, a red EXCLUSIVE tag with the cover story in the lower left, a big number and a barcode in the lower right.
   A warm paper vignette, a faint grain and a slow sheen make it feel printed.
   Layers: your shot (z 0) < a darkening at the top and bottom (z 2) < the masthead (z 5) < your cutout (z 10)
   < the cover lines (z 15) < vignette, grain and sheen (z 20 to 22). */
const CONFIG = {
  footage: 'talk',                          // the --name of the footage (used to find your head)
  masthead: 'EDIT',                         // the magazine's name, 3 to 8 letters: it is sized to fit the frame
  issue: 'THE AI ISSUE',                    // small line, top left
  number: 'VOL. 3  ·  NO. 17',              // small line, top right
  tag: 'EXCLUSIVE',                         // the red tag
  headline: 'Claude cut\nthis video',      // the cover story (\n starts a new line)
  subline: 'Inside the AI that edits for you',
  bigNumber: '17',                          // the big gold number, lower right: only a number they actually say ('' for none)
  numberLine: 'EFFECTS, ONE PROMPT',        // the line under it ('' for none)
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const plate = document.getElementById('plate'), cut = document.getElementById('cut');
  plate.style.zIndex = 0; cut.style.zIndex = 10;
  cut.style.filter = FX.choke(2 * u);
  const S = FX.subject(CONFIG.footage), head = S.head(0);
  for (let f = 0; f <= FX.END; f += 6) head.top = Math.min(head.top, S.head(f).top);   // the highest the head goes

  // ---- measure the masthead so it fits any word: as wide as the cover allows, never taller than a third of the frame
  const word = [...String(CONFIG.masthead)];
  const ctx = document.createElement('canvas').getContext('2d');
  const FONT = (px) => `700 ${px}px ${FX.font.serif}`;
  ctx.font = FONT(100);
  const adv = word.map((ch) => ctx.measureText(ch).width / 100);          // each letter's width, per pixel of font size
  const m = ctx.measureText(word.join(''));
  const asc = m.actualBoundingBoxAscent / 100, desc = Math.max(0.02, m.actualBoundingBoxDescent / 100);
  const sumAdv = adv.reduce((a, b) => a + b, 0);
  const fitW = W * (portrait ? 0.9 : W > H ? 0.71 : 0.86);
  const fs = Math.min(fitW / sumAdv, (portrait ? 0.16 : 0.31) * H / asc);
  const capH = asc * fs;
  // its top sits a little under the frame's top; on vertical it drops until the top of the head covers its lower third
  const mastTop = (portrait ? 0.075 : 0.13) * H;
  const base = portrait ? Math.max(mastTop + capH, head.top + 0.35 * capH) : mastTop + capH;   // the letters' baseline

  // ---- the darkening, so white type reads over a bright wall (top) and the cover lines read (bottom)
  const mb = base / H, low = portrait ? 0.55 : 0.7;
  FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 2, background: `linear-gradient(180deg, rgba(8,8,14,0.62) 0%,
    rgba(8,8,14,0.42) ${(mb * 87).toFixed(1)}%, rgba(8,8,14,0) ${Math.min(low * 100 - 5, mb * 126).toFixed(1)}%,
    rgba(8,8,14,0) ${(low * 100).toFixed(1)}%, rgba(8,8,14,${portrait ? 0.55 : 0.45}) 100%)` });

  // ---- the masthead: one letter per clipped slot, so each rises out of its own baseline
  const mast = FX.layer(5);
  mast.innerHTML = `<defs><filter id="cs-sh" x="-10%" y="-10%" width="120%" height="140%">
    <feDropShadow dx="0" dy="${(9 * u).toFixed(1)}" stdDeviation="${(15 * u).toFixed(1)}" flood-color="#000" flood-opacity="0.35"/></filter></defs>`;
  const gM = FX.svg('g', mast, { filter: 'url(#cs-sh)' });
  const step = Math.min(1.6, 9 / Math.max(1, word.length - 1));   // one letter every 1.6 f (quicker for long words)
  const letters = word.map((ch, i) => {
    const clip = FX.svg('clipPath', mast, { id: 'cs-c' + i });
    FX.svg('rect', clip, { x: -0.1 * fs, y: base - capH - 0.12 * fs, width: (adv[i] + 0.2) * fs, height: capH + 0.12 * fs + desc * fs + 2 * u });
    const g = FX.svg('g', gM, { 'clip-path': `url(#cs-c${i})` });
    const t = FX.svg('text', g, { x: 0, y: base, fill: '#ffffff', style: `font: ${FONT(fs.toFixed(1))}` });
    t.textContent = ch;
    return { g, t, at: 1 + i * step };
  });

  // ---- the cover lines
  const scale = portrait ? 0.85 : 1, s = (v) => (v * u * scale) + 'px';
  const M = 83 * u, MR = portrait ? 140 * u : M;                 // side margins (wider on the right on vertical: app buttons)
  const bottom = portrait ? 0.2 * H + 40 * u : 77 * u;            // vertical keeps clear of the bottom fifth
  const lines = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 15 });
  const txt = (parent, str, style) => { const e = FX.el('div', parent, Object.assign({ whiteSpace: 'nowrap' }, style)); e.textContent = str; return e; };
  const shadow = `0 ${2 * u}px ${12 * u}px rgba(0,0,0,0.5)`;
  // above the masthead: the issue line, the number line and a rule
  const ruleY = Math.max(52 * u, base - capH - 0.03 * H - 40 * u);
  const small = { position: 'absolute', top: (ruleY - 44 * u) + 'px', font: `700 ${s(27)} ${FX.font.sans}`, color: '#fff', letterSpacing: '0.26em' };
  const topL = txt(lines, CONFIG.issue, Object.assign({ left: M + 'px' }, small));
  const topR = txt(lines, CONFIG.number, Object.assign({ right: M + 'px' }, small));
  const rule = FX.el('div', lines, { position: 'absolute', left: M + 'px', right: M + 'px', top: ruleY + 'px', height: Math.max(2, 3 * u) + 'px',
    background: 'rgba(255,255,255,0.9)', transformOrigin: '0 50%' });
  // lower left: the cover story
  const bl = FX.el('div', lines, { position: 'absolute', left: M + 'px', bottom: bottom + 'px', width: s(470) });
  txt(bl, CONFIG.tag, { display: 'inline-block', font: `900 ${s(23)} ${FX.font.sans}`, letterSpacing: '0.2em', color: '#fff', background: '#d3202e', padding: `${s(7)} ${s(13)} ${s(6)}` });
  txt(bl, CONFIG.headline, { whiteSpace: 'pre-line', marginTop: s(14), font: `italic 700 ${s(71)}/0.98 ${FX.font.italic}`, color: '#fff', textShadow: shadow });
  txt(bl, CONFIG.subline, { whiteSpace: 'normal', marginTop: s(14), font: `400 ${s(24)} ${FX.font.sans}`, color: 'rgba(255,255,255,0.88)', letterSpacing: '0.02em', textShadow: shadow });
  // lower right: the big number, its line and a barcode
  const br = FX.el('div', lines, { position: 'absolute', right: MR + 'px', bottom: bottom + 'px', width: s(386), textAlign: 'right' });
  txt(br, CONFIG.bigNumber, { font: `700 ${s(92)}/0.9 ${FX.font.serif}`, color: '#ffd84a', textShadow: shadow });
  txt(br, CONFIG.numberLine, { whiteSpace: 'normal', marginTop: s(8), font: `900 ${s(26)} ${FX.font.sans}`, letterSpacing: '0.14em', color: '#fff', textShadow: shadow });
  const bc = FX.el('div', br, { position: 'relative', marginTop: s(20), marginLeft: 'auto', width: s(183), height: s(83), background: '#fff',
    padding: `${s(9)} ${s(11)} ${s(20)}`, display: 'flex', alignItems: 'stretch' });
  const rb = FX.rng(4);
  for (let i = 0; i < 34; i++) FX.el('div', bc, { width: s(1 + Math.floor(rb() * 3)), marginRight: s(1 + Math.floor(rb() * 2)), background: rb() < 0.18 ? 'transparent' : '#111' });
  const digits = '0 ' + Array.from({ length: 10 }, () => Math.floor(rb() * 10)).join('').replace(/(\d{5})(\d{5})/, '$1 $2');
  txt(bc, digits, { position: 'absolute', left: s(8), right: s(8), bottom: s(2), font: `500 ${s(13)} ${FX.font.mono}`, color: '#111', textAlign: 'center', letterSpacing: '0.1em' });
  const ins = [[topL, 7], [topR, 8], [bl, 9], [br, 11]];

  // ---- cover paper: a warm vignette, a faint grain and the slow sheen of coated stock
  FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 20, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 80% 85% at 50% 48%, rgba(0,0,0,0) 55%, rgba(20,12,4,0.42) 100%)' });
  const grain = FX.layer(21);
  Object.assign(grain.style, { opacity: 0.08, mixBlendMode: 'overlay', pointerEvents: 'none' });
  grain.innerHTML = `<filter id="cs-g"><feTurbulence type="fractalNoise" baseFrequency="${(0.63 / u).toFixed(3)}" numOctaves="2" seed="3"/></filter>
    <rect width="${W}" height="${H}" filter="url(#cs-g)"/>`;
  const sheen = FX.el('div', null, { position: 'absolute', inset: '-20%', zIndex: 22, pointerEvents: 'none', mixBlendMode: 'screen',
    background: 'linear-gradient(115deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0) 60%)' });

  return (f) => {
    // the letters close up as they land: wide tracking settles to tight, the row stays centred
    const gap = FX.mix(0.135, 0, FX.out(FX.lin(f, 1, 11))) * fs;
    let x = W / 2 - (sumAdv * fs + gap * (word.length - 1)) / 2;
    letters.forEach((l, i) => {
      const p = FX.lin(f, l.at, l.at + 5);
      const y = (1 - FX.out5(p)) * (capH + 0.14 * fs);                 // rises out of its baseline
      const sy = 1 + 0.12 * Math.sin(p * Math.PI) * (1 - p);           // a small stretch as it settles
      l.g.setAttribute('transform', `translate(${x.toFixed(2)} 0)`);
      l.t.setAttribute('transform', `translate(0 ${(y + base * (1 - sy)).toFixed(2)}) scale(1 ${sy.toFixed(4)})`);
      x += adv[i] * fs + gap;
    });
    rule.style.transform = `scaleX(${FX.out(FX.lin(f, 5, 13)).toFixed(4)})`;
    for (const [el, at] of ins) {
      const p = FX.out(FX.lin(f, at, at + 6));
      el.style.opacity = p; el.style.transform = `translateY(${((1 - p) * 20 * u).toFixed(2)}px)`;
    }
    sheen.style.transform = `translateX(${FX.mix(-30, 30, FX.lin(f, 0, FX.END)).toFixed(2)}%)`;
  };
});
