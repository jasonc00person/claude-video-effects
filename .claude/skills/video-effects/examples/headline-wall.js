// media: plate=assets/footage/talk.mp4 cut=assets/footage/talk-cutout.webm
/* Headline Wall: paper notes and headline clippings slap onto the wall BEHIND you, one after another, fast, until the wall
   is full: newspaper scraps, sticky notes, dark cards, chat bubbles, posts, torn clippings, held up with tape and pins.
   The layout is worked out from your frame and your head (around and above it, varied sizes and tilts), so it fits any shot.
   Layers: your shot (z 0) < a dark shade (z 4) < the notes (z 5) < your cutout (z 10). */
const CONFIG = {
  footage: 'talk',              // the --name of the footage (used to find your head)
  // the notes, in order of importance (the first ones get the best spots, nearest your head). 10 to 16 fill the wall.
  // kind: 'serif' newspaper scrap | 'big' large serif scrap | 'hand' sticky note | 'dark' black card | 'chat' chat bubble
  //       'tweet' social post | 'torn' torn clipping | 'strip' thin strip of caps
  headlines: [
    { kind: 'serif', text: 'Claude edits everyone’s videos now' },
    { kind: 'hand', text: 'Claude cut my whole reel.' },
    { kind: 'dark', text: 'POV: Claude edits your reel' },
    { kind: 'chat', text: 'can claude edit videos?' },
    { kind: 'tweet', text: 'Dropped my clips in. Claude did the edit.' },
    { kind: 'big', text: 'AI editors are here' },
    { kind: 'hand', text: 'wait, Claude edits videos??' },
    { kind: 'torn', text: 'Your next video editor is Claude' },
    { kind: 'serif', text: 'The 5 minute edit is real' },
    { kind: 'dark', text: 'Editors: this is new.' },
    { kind: 'hand', text: '1 prompt. full edit.' },
    { kind: 'serif', text: 'AI edits your content now' },
    { kind: 'strip', text: 'AI EDITING IS HERE' },
    { kind: 'strip', text: 'BREAKING: CLAUDE EDITS' },
  ],
  verticalCount: 8,             // a vertical frame uses only the first 8: fewer, bigger notes read on a phone
  paper: 'THE CREATOR TIMES',   // the masthead on the 'serif' scraps
  name: 'creator',              // the name and handle on the 'tweet' notes
  handle: 'yourhandle',
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const plate = document.getElementById('plate'), cut = document.getElementById('cut');
  plate.style.zIndex = 0; cut.style.zIndex = 10;
  cut.style.filter = FX.choke(2 * u);       // tighten the cutout's edge so no old background glows round your hair
  const shade = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 4, background: 'rgba(10,8,6,0.28)' });
  const wall = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 5 });
  const rnd = FX.rng(11);
  const CREAM = ['#fbf8f1', '#f4ecda', '#fffdf8', '#efe5cf'];
  const SPARK = Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4 + 0.2, r = i % 2 ? 7 : 9.5;
    return `<line x1="12" y1="12" x2="${(12 + r * Math.cos(a)).toFixed(1)}" y2="${(12 + r * Math.sin(a)).toFixed(1)}"/>`; }).join('');

  // one note of each kind: [width in units, how it is held up, its headline's type size in units]
  const KIND = { serif: [386, 'tape', 39], big: [307, 'pin', 49], hand: [293, 'pin', 47], dark: [307, 'tape', 36], chat: [323, 'none', 27],
    tweet: [317, 'tape', 30], torn: [271, 'none', 37], strip: [222, 'none', 21] };
  const makeNote = (kind, text, i) => {
    const [w0, hold, fs] = KIND[kind] || KIND.serif;
    // on vertical, a note with small type grows until its headline is at least 36 px, so every one reads on a phone,
    // and notes are a little narrower (more lines) so they fit the columns beside your head ('big' keeps its width for its big type)
    const k = u * (portrait ? Math.max(1, 36 / fs) : 1);
    const px = (v) => (v * k).toFixed(1) + 'px';
    const box = FX.el('div', wall, { position: 'absolute', left: 0, top: 0, width: px(w0 * (portrait && kind !== 'big' ? 0.85 : 1) * (0.9 + rnd() * 0.22)), padding: `${px(23)} ${px(23)} ${px(20)}`,
      background: CREAM[i % CREAM.length], color: '#1a1714', borderRadius: px(3), transformOrigin: '50% 30%',
      boxShadow: `0 ${px(11)} ${px(26)} rgba(0,0,0,0.5), 0 ${px(1.5)} ${px(3)} rgba(0,0,0,0.35)` });
    const line = (font, style) => { const d = FX.el('div', box, Object.assign({ font }, style || {})); d.textContent = text; return d; };
    if (kind === 'serif') {
      FX.el('div', box, { font: `700 ${px(13)} ${FX.font.sans}`, letterSpacing: px(3), color: '#8a7f6c', marginBottom: px(9) }).textContent = CONFIG.paper;
      line(`700 ${px(39)}/1.08 ${FX.font.serif}`, { letterSpacing: '-0.01em' });
    } else if (kind === 'big') {
      line(`700 ${px(49)}/1.0 ${FX.font.serif}`, { textAlign: 'center' });
    } else if (kind === 'hand') {
      Object.assign(box.style, { background: '#fff8d6', padding: `${px(20)} ${px(23)}` });
      line(`700 ${px(47)}/0.98 ${FX.font.hand}`, { color: '#1d2a6b' });
    } else if (kind === 'dark') {
      Object.assign(box.style, { background: '#141414', color: '#f6f2ea' });
      line(`900 ${px(36)}/1.05 ${FX.font.sans}`, { letterSpacing: '-0.02em' });
    } else if (kind === 'chat') {
      Object.assign(box.style, { borderRadius: px(43), padding: `${px(17)} ${px(26)}`, display: 'flex', alignItems: 'center', gap: px(14), background: '#fff' });
      FX.el('div', box, { width: px(31), height: px(31), borderRadius: '50%', border: `${px(4)} solid #555`, flex: 'none' });
      line(`700 ${px(27)}/1.1 ${FX.font.sans}`, { color: '#222' });
    } else if (kind === 'tweet') {
      // a drawn round avatar (an orange circle with a sparkle), the name and handle, then the post
      const row = FX.el('div', box, { display: 'flex', alignItems: 'center', gap: px(11), marginBottom: px(11) });
      FX.el('div', row, { width: px(43), height: px(43), borderRadius: '50%', background: '#D97757', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' })
        .innerHTML = `<svg viewBox="0 0 24 24" style="width:62%;height:62%"><g stroke="#fff6ee" stroke-width="3" stroke-linecap="round">${SPARK}</g></svg>`;
      const nm = FX.el('div', row);
      FX.el('div', nm, { font: `700 ${px(19)} ${FX.font.sans}` }).textContent = CONFIG.name;
      FX.el('div', nm, { font: `400 ${px(16)} ${FX.font.sans}`, color: '#7a7368' }).textContent = '@' + CONFIG.handle;
      line(`700 ${px(30)}/1.15 ${FX.font.sans}`);
    } else if (kind === 'torn') {
      Object.assign(box.style, { background: '#f1e8d2', clipPath: 'polygon(0 4%, 9% 0, 22% 3%, 40% 0, 61% 4%, 80% 1%, 100% 3%, 98% 52%, 100% 97%, 78% 100%, 55% 96%, 31% 100%, 12% 97%, 0 100%, 2% 50%)' });
      line(`italic 800 ${px(37)}/1.05 ${FX.font.italic}`);
    } else if (kind === 'strip') {
      Object.assign(box.style, { padding: `${px(11)} ${px(17)}`, background: '#f7f2e6' });
      line(`700 ${px(21)}/1.1 ${FX.font.serif}`, { letterSpacing: px(1.5), textAlign: 'center' });
    }
    if (hold === 'tape') FX.el('div', box, { position: 'absolute', left: '50%', top: px(-14), width: px(106), height: px(31), marginLeft: px(-53),
      background: 'rgba(236,228,200,0.72)', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', transform: `rotate(${((rnd() - 0.5) * 12).toFixed(1)}deg)` });
    if (hold === 'pin') FX.el('div', box, { position: 'absolute', left: '50%', top: px(9), width: px(20), height: px(20), marginLeft: px(-10), borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 30%, #ff8a7a, #d2241c 60%, #8c120c)', boxShadow: `${px(1.5)} ${px(4)} ${px(4)} rgba(0,0,0,0.45)` });
    return { box, w: box.offsetWidth, h: box.offsetHeight };
  };

  // roughly where you are: an oval for the head and hair, then the shoulders widening out to the body's edges.
  // A note mostly hidden behind you is wasted, so spots are scored on how much of them stays in view.
  // On vertical the head fills more of the frame, so every half second of its movement counts.
  const sub = FX.subject(CONFIG.footage), hd = sub.head(0), bd = sub.body(0);
  const heads = portrait ? [0, 12, 24, 36, 48, 60, 72].filter((f) => f <= FX.END).map((f) => sub.head(f)) : [hd];
  const inPerson = (x, y) => heads.some((h) => {
    const hy = h.top + h.h * 0.5, chin = h.top + h.h;
    if (((x - h.x) / (h.h * 0.46)) ** 2 + ((y - hy) / (h.h * 0.56)) ** 2 <= 1) return true;
    if (y < chin - h.h * 0.1) return false;
    const t = FX.clamp((y - chin) / (h.h * 0.5));
    return x > FX.mix(h.x - h.h * 0.3, bd.left, t) && x < FX.mix(h.x + h.h * 0.3, bd.right, t);
  });
  const seen = (x, y, w, h) => { let n = 0; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) n += inPerson(x + w * (i + 0.5) / 6, y + h * (j + 0.5) / 4) ? 0 : 1; return n / 24; };
  const overlap = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

  // the wall: the whole frame, except the bottom of a vertical one (the app's captions and buttons sit there)
  const M = 14 * u, wallBottom = H * (portrait ? 0.7 : 0.97);
  const ax = hd.x, ay = Math.max(H * 0.05, hd.top - hd.h * 0.15);   // the wall grows from just above your head
  const notes = [];
  (portrait ? CONFIG.headlines.slice(0, CONFIG.verticalCount) : CONFIG.headlines).forEach((hl, i) => {
    const n = makeNote(hl.kind, hl.text, i);
    // try 90 spots (160 on vertical), keep the one that stays most in view, overlaps the notes already up the least, finds
    // an empty stretch of wall (so the whole frame fills) and sits fairly near your head. On vertical, being readable counts most.
    let best = null;
    for (let t = 0; t < (portrait ? 160 : 90); t++) {
      const x = M + rnd() * Math.max(1, W - 2 * M - n.w), y = M + rnd() * Math.max(1, wallBottom - M - n.h);
      const r = { x, y, w: n.w, h: n.h }, cx = x + n.w / 2, cy = y + n.h / 2;
      const over = notes.reduce((s, o) => s + overlap(r, o), 0) / (n.w * n.h);
      const room = Math.min(1, ...notes.map((o) => Math.hypot(cx - o.x - o.w / 2, cy - o.y - o.h / 2) / (n.w * 1.3)));
      const near = Math.hypot(cx - ax, (cy - ay) * 1.3) / Math.max(W, H);
      const vis = seen(x, y, n.w, n.h), score = vis * (portrait ? 2.5 : 1.2) - over * (portrait ? 3.5 : 1.6) + room * 0.3 - near * 0.15;
      if (!best || score > best.score) best = Object.assign(r, { score, vis, over });
    }
    if (portrait && (best.vis < 0.8 || best.over > 0.12)) { n.box.remove(); return; }   // no spot where it can be read: leave it out
    Object.assign(n.box.style, { left: best.x + 'px', top: best.y + 'px' });
    notes.push(Object.assign(best, { box: n.box, rot: (rnd() - 0.5) * 12, d: Math.hypot(best.x + n.w / 2 - ax, best.y + n.h / 2 - ay) }));
  });
  // slap order: outward from above your head, one every 0.95 f (faster with many), the last one landing by about f 17
  notes.sort((a, b) => a.d - b.d).forEach((nt, i) => { nt.at = 1 + i * Math.min(0.95, 13 / Math.max(1, notes.length - 1)); nt.box.style.zIndex = i; });

  return (f) => {
    shade.style.opacity = FX.out(FX.lin(f, 0, 6));
    for (const nt of notes) {
      const p = FX.lin(f, nt.at, nt.at + 3.2);
      // each note lands from 135% down to full size with an extra twist that straightens, then creeps 1% bigger
      const s = FX.mix(1.35, 1, FX.out(p)) * (1 + 0.01 * FX.lin(f, nt.at, FX.END));
      nt.box.style.opacity = p > 0 ? Math.min(1, p * 3) : 0;
      nt.box.style.transform = `rotate(${(nt.rot + (1 - FX.out(p)) * 7).toFixed(2)}deg) scale(${s.toFixed(4)})`;
    }
  };
});
