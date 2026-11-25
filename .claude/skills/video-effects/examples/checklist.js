// media: plate=assets/footage/talk.mp4
/* Checklist: a dark frosted-glass card over your shot, with a label, a "0 of 3" counter and a thin progress bar. The rows type in
   and tick one by one while the counter and the bar keep count. It sits beside you on a landscape shot, and above your head
   (or under your chin when your head is high) on a vertical one, never over your face.
   Layers: your shot (z 0) < the card (z 5). No cutout needed: the card is in front of everything. */
const CONFIG = {
  footage: 'talk',              // the --name of the footage (made with --cutout, the card knows where your head is; without, it guesses the middle)
  label: 'ALL YOU NEED TO DO',  // small caps over the list
  rows: ['Drop your clips', 'Trigger the skill', 'Post it'],   // 2 to 4 short steps read best
  accent: '#E6F27C',            // the ticks, the bar and the dot by the label (a hex colour like this one)
  ticks: [],                    // optional: the second each tick lands, one per row (e.g. [0.4, 1.1, 1.9]) so they land on the words; empty = quick, all done by 0.8 s
  place: 'auto',                // 'auto' picks the roomiest spot clear of your face; or force 'left', 'right', 'top' or 'below'
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const ACC = CONFIG.accent, ROWS = CONFIG.rows, n = ROWS.length;
  document.getElementById('plate').style.zIndex = 0;

  // every size is written as a number of design units times --s, so the whole card scales by changing one value.
  // On vertical the rows sit closer together, so the card fits under the chin with its words still big.
  const S = (v) => `calc(${v} * var(--s))`;
  const ROW = portrait ? 74 : 94, RGAP = portrait ? 8 : 11, TM = portrait ? 14 : 20;
  const card = FX.el('div', null, { position: 'absolute', zIndex: 5, padding: `${S(portrait ? 22 : 31)} ${S(29)} ${S(portrait ? 20 : 26)}`, borderRadius: S(37), color: '#fff',
    background: 'rgba(24,26,30,0.58)', backdropFilter: `blur(${S(26)}) saturate(1.25)`, webkitBackdropFilter: `blur(${S(26)}) saturate(1.25)`,
    border: `${S(1.5)} solid rgba(255,255,255,0.14)`, boxShadow: `0 ${S(34)} ${S(86)} rgba(0,0,0,0.45), inset 0 ${S(1.5)} 0 rgba(255,255,255,0.10)` });
  const top = FX.el('div', card, { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S(20), padding: `0 ${S(6)}` });
  const lab = FX.el('div', top, { font: `700 ${S(21)} ${FX.font.sans}`, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.78)', whiteSpace: 'nowrap' });
  lab.innerHTML = `<span style="color:${ACC}">●</span>&nbsp; `; lab.append(CONFIG.label);
  const cnt = FX.el('div', top, { padding: `${S(7)} ${S(17)}`, borderRadius: S(19), font: `700 ${S(23)} ${FX.font.sans}`, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' });
  const cntN = FX.el('span', cnt, { color: '#fff' }); FX.el('span', cnt).textContent = ' of ' + n;
  const track = FX.el('div', card, { margin: `${S(TM)} ${S(6)}`, height: S(7), borderRadius: S(4), background: 'rgba(255,255,255,0.13)', overflow: 'hidden' });
  const fill = FX.el('div', track, { height: '100%', borderRadius: S(4), background: ACC, boxShadow: `0 0 ${S(14)} ${ACC}` });

  // timing: the card is there from f 0; each row types in over 3 f and ticks, the last tick lands by about f 19
  const step = 18 / n;
  const TK = (CONFIG.ticks || []).length === n ? CONFIG.ticks.map((sec) => sec * 24) : null;   // ticks timed to the words
  const rows = ROWS.map((txt, i) => {
    const tk = TK ? TK[i] : 1 + (i + 1) * step;
    const t0 = TK ? Math.max(i ? TK[i - 1] : 0, tk - 5) : (i ? 1 + i * step : 1);
    const r = FX.el('div', card, { position: 'relative', height: S(ROW), marginTop: i ? S(RGAP) : '0', borderRadius: S(23), display: 'flex', alignItems: 'center', padding: `0 ${S(20)}` });
    const hi = FX.el('div', r, { position: 'absolute', inset: '0', borderRadius: S(23), background: 'rgba(255,255,255,0.08)', border: `${S(1.5)} solid rgba(255,255,255,0.08)` });
    FX.el('div', r, { position: 'relative', width: S(49), height: S(49), borderRadius: '50%', border: `${S(3.5)} solid rgba(255,255,255,0.42)`, flex: 'none' });
    const dot = FX.el('div', r, { position: 'absolute', left: S(20), top: S((ROW - 49) / 2), width: S(49), height: S(49), borderRadius: '50%', background: ACC,
      display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${S(23)} ${ACC}88` });
    dot.innerHTML = '<svg viewBox="0 0 20 20" style="width:60%;height:60%"><path d="M4.5 10.5l3.6 3.6L15.5 6.5" stroke="#15170f" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    // a grey bar stands in for the words until they type in
    const ph = FX.el('div', r, { position: 'absolute', left: S(91), top: S((ROW - 16) / 2), height: S(16), width: S(271 + Math.min(i, 3) * 57), borderRadius: S(8), background: 'rgba(255,255,255,0.13)' });
    const tx = FX.el('div', r, { position: 'relative', marginLeft: S(23), font: `700 ${S(41)} ${FX.font.sans}`, letterSpacing: '-0.01em', whiteSpace: 'nowrap' });
    tx.textContent = txt;   // full words for now, so the card can measure how wide it needs to be
    return { txt, hi, dot, ph, tx, t0, t1: TK ? Math.max(t0 + 1, tk - 1) : t0 + Math.min(3, step * 0.5), tk };
  });

  // measure the card at one unit (--s = u), wide enough for its longest row and never narrower than 694 units
  card.style.setProperty('--s', u + 'px');
  card.style.width = 'max-content';
  const BW = Math.max(694 * u, card.offsetWidth), BH = card.offsetHeight;

  // where it can go, clear of the head over the whole clip (sampled every quarter second)
  const sub = FX.subject(CONFIG.footage), hs = [];
  for (let f = 0; f <= FX.END; f += 6) hs.push(sub.head(f));
  const headTop = Math.min(...hs.map((h) => h.top)), chin = Math.max(...hs.map((h) => h.top + h.h * 1.1));
  const headL = Math.min(...hs.map((h) => h.x - h.h * 0.42)), headR = Math.max(...hs.map((h) => h.x + h.h * 0.42));
  const M = 40 * u, GAP = 36 * u, top0 = H * (portrait ? 0.06 : 0.05);
  const spots = {
    left: { w: headL - GAP - M, h: H * 0.82, x: () => M, y: H * 0.11 },
    right: { w: W - M - headR - GAP, h: H * 0.82, x: (cw) => W - M - cw, y: H * 0.11 },
    top: { w: W - 2 * M, h: headTop - GAP - top0, x: (cw) => (W - cw) / 2, y: top0 },
    // under the chin: on vertical, stop above the bottom fifth where the app's buttons and captions sit
    below: { w: W - 2 * M, h: (portrait ? H * 0.8 : H - M) - chin - GAP, x: (cw) => (W - cw) / 2, y: chin + GAP },
  };
  const scale = (s) => Math.min(portrait ? 1.05 : 1.1, s.w / BW, s.h / BH);   // the biggest size that fits that spot (words about 40 px at most)
  let place = CONFIG.place;
  if (place === 'auto') {
    place = scale(spots.right) > scale(spots.left) * 1.15 ? 'right' : 'left';   // top-left reads first, so left unless right is clearly roomier
    // a vertical frame (or a person filling a square one) has no room beside them: go above, or under the chin if the head is high
    if (portrait || scale(spots[place]) < 0.7) place = scale(spots.top) >= 0.85 || scale(spots.top) >= scale(spots.below) ? 'top' : 'below';
  }
  const sp = spots[place], k = Math.max(0.5, scale(sp));
  const cw = place === 'top' || place === 'below' ? Math.min(sp.w, Math.max(BW * k, W * 0.8)) : BW * k;   // above or below: a wide card, 80% of the frame
  card.style.setProperty('--s', k * u + 'px');
  Object.assign(card.style, { width: cw + 'px', left: sp.x(cw) + 'px', top: sp.y + 'px', transformOrigin: place === 'right' ? '70% 0%' : place === 'left' ? '30% 0%' : '50% 0%' });

  return (f) => {
    // already mostly there on the first frame, settles by f 3
    const c = FX.out(FX.lin(f, -3, 3));
    card.style.opacity = c.toFixed(3);
    card.style.transform = `translateY(${(-23 * k * u * (1 - c)).toFixed(1)}px) scale(${FX.mix(0.95, 1, c).toFixed(4)})`;
    let done = 0, prog = 0;
    for (const r of rows) {
      const typed = Math.floor(FX.lin(f, r.t0, r.t1) * r.txt.length + 1e-6);
      r.tx.textContent = f >= r.t0 ? r.txt.slice(0, Math.max(1, typed)) : '';
      r.ph.style.opacity = f >= r.t0 ? 0 : 1;
      const tick = FX.lin(f, r.tk, r.tk + 4);
      r.dot.style.transform = `scale(${FX.back(tick, 2.6).toFixed(3)})`;   // the tick pops past full size, then settles
      r.dot.style.opacity = tick > 0 ? 1 : 0;
      r.hi.style.opacity = FX.lin(f, r.tk, r.tk + 3);
      r.tx.style.color = tick > 0.3 ? '#F3F7C8' : '#fff';
      if (f >= r.tk + 1) done++;
      prog += FX.out(FX.lin(f, r.tk, r.tk + 5));
    }
    cntN.textContent = done;
    cnt.style.background = done === n ? ACC + '38' : 'rgba(255,255,255,0.1)';
    fill.style.width = (100 * prog / n).toFixed(2) + '%';
  };
});
