// media: plate=assets/footage/talk.mp4
/* Phone Mockup: a drawn phone slides up beside you showing an AI assistant's chat: a short message, then a card with its
   recommendation, three thumbnails with bars, and an Approve button. A touch lands on Approve, the button turns to
   "Approved" and the bars move. Your shot pushes in a little and slides away from the phone so it never covers your face:
   sideways on a landscape shot, up on a vertical one (the phone rises into the lower half).
   Layers: your shot (z 0) < a soft shade on the phone's side (z 1) < the phone (z 5). No cutout needed. */
const CONFIG = {
  footage: 'talk',                // the --name of the footage (made with --cutout, the layout knows where your head is; without, it guesses the middle)
  app: 'Claude',                  // the assistant's name in the chat header
  status: 'Online',               // the small line under the name
  message: 'Found one fix for you.',                       // its first chat bubble
  label: 'RECOMMENDATION',                                  // small caps on the card
  recommendation: 'Pause Ad 3, move the budget to Ad 1',    // the big line: two short lines at most
  items: ['Ad 1', 'Ad 2', 'Ad 3'],                          // the three things under it
  images: [],                     // three pictures for them, e.g. ['assets/images/ad-1.jpg', ...]; empty = drawn colour blocks
  from: [0.55, 0.4, 0.35],        // how full each bar is before the tap (0 to 1)
  to: [0.95, 0.4, 0],             // and after it: here the budget drains out of item 3 into item 1
  button: 'Approve', done: 'Approved', skip: 'Not now',     // the button, what it says once tapped, the grey choice beside it
  accent: '#E3F27A',              // the button once approved, the dot by the label, item 1's bar (a hex colour)
  side: 'auto',                   // 'auto' puts the phone on the roomier side (left on vertical, away from the app's buttons); or 'left' / 'right'
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const ACC = CONFIG.accent, SANS = FX.font.sans;
  const plate = document.getElementById('plate');
  plate.style.zIndex = 0;

  // where the head is over the whole clip (sampled every quarter second), to keep the phone clear of it
  const sub = FX.subject(CONFIG.footage), hs = [];
  for (let f = 0; f <= FX.END; f += 6) hs.push(sub.head(f));
  const headX = hs.reduce((a, h) => a + h.x, 0) / hs.length;
  const headL = Math.min(...hs.map((h) => h.x - h.h * 0.42)), headR = Math.max(...hs.map((h) => h.x + h.h * 0.42));
  const chin = Math.max(...hs.map((h) => h.top + h.h));

  // the phone's size and spot. Landscape: tall, on the side with more room. Vertical: smaller, in the lower half, on the left
  // (the right edge is where the app's like and share buttons sit), with Approve above the bottom fifth.
  let side = CONFIG.side;
  if (side === 'auto') side = portrait ? (headX < W * 0.4 ? 'right' : 'left') : (headX > W / 2 ? 'left' : 'right');
  const ph = H * (portrait ? 0.46 : 0.85), pw = ph * 300 / 640;
  const px = side === 'right' ? W - pw - (portrait ? 0.08 : 0.067) * W : (portrait ? 0.04 : 0.067) * W;
  const py = portrait ? H * 0.8 - ph * 0.66 : H * 0.077;
  const GAP = 40 * u;
  // your shot pushes in (at least 1.1x) from the phone's edge, so you slide away from it: as much as it takes to clear the face
  let S;
  if (portrait) S = (H - py + GAP) / (H - chin);
  else S = side === 'right' ? (W - px + GAP) / (W - headR) : (px + pw + GAP) / headL;
  S = Math.min(portrait ? 1.35 : 1.5, Math.max(1.1, S));
  plate.style.transformOrigin = `${side === 'right' ? W : 0}px ${portrait ? H : H / 2}px`;
  plate.style.transform = `scale(${S.toFixed(4)})`;
  FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 1,
    background: `linear-gradient(${portrait ? 180 : side === 'right' ? 90 : 270}deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.38) 100%)` });

  // the phone is drawn at 300 x 640 and scaled up to its size, so every number inside it stays simple
  const holder = FX.el('div', null, { position: 'absolute', left: px + 'px', top: py + 'px', width: pw + 'px', height: ph + 'px', zIndex: 5, transformOrigin: '50% 100%' });
  const phone = FX.el('div', holder, { position: 'absolute', left: 0, top: 0, width: '300px', height: '640px', transformOrigin: '0 0', transform: `scale(${ph / 640})`,
    borderRadius: '50px', background: 'linear-gradient(145deg, #4a4a4f 0%, #1c1c1f 40%, #2c2c30 100%)',
    boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 10px 24px rgba(0,0,0,0.45)' });
  const bezel = FX.el('div', phone, { position: 'absolute', inset: '4px', borderRadius: '46px', background: '#050506', padding: '9px' });
  const scr = FX.el('div', bezel, { position: 'relative', width: '100%', height: '100%', borderRadius: '38px', overflow: 'hidden',
    background: 'linear-gradient(180deg, #14171c 0%, #0f1115 100%)', color: '#fff', fontFamily: SANS });
  const glare = FX.el('div', bezel, { position: 'absolute', inset: '9px', borderRadius: '38px',
    background: 'linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 38%)' });

  // status bar: the camera notch, the time, signal, wifi and battery
  FX.el('div', scr, { position: 'absolute', left: '50%', top: '10px', width: '86px', height: '25px', marginLeft: '-43px', borderRadius: '14px', background: '#000' });
  FX.el('div', scr, { position: 'absolute', left: '26px', top: '13px', font: `700 14px ${SANS}` }).textContent = '9:41';
  FX.el('div', scr, { position: 'absolute', right: '22px', top: '14px' }).innerHTML = '<svg width="62" height="13" viewBox="0 0 62 13">'
    + '<rect x="0" y="8" width="3" height="5" rx="1" fill="#fff"/><rect x="5" y="6" width="3" height="7" rx="1" fill="#fff"/><rect x="10" y="3" width="3" height="10" rx="1" fill="#fff"/><rect x="15" y="0" width="3" height="13" rx="1" fill="#fff"/>'
    + '<path d="M24 5.5a9 9 0 0 1 12 0M26.5 8.3a5 5 0 0 1 7 0" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="30" cy="11" r="1.4" fill="#fff"/>'
    + '<rect x="40" y="1" width="19" height="11" rx="3" stroke="rgba(255,255,255,0.5)" fill="none"/><rect x="42" y="3" width="14" height="7" rx="1.5" fill="#fff"/></svg>';

  // the chat header: a drawn mark (an orange sparkle on a cream circle), the app's name and its status
  const rays = Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4 + 0.2, r = i % 2 ? 7 : 9.5;
    return `<line x1="12" y1="12" x2="${(12 + r * Math.cos(a)).toFixed(1)}" y2="${(12 + r * Math.sin(a)).toFixed(1)}"/>`; }).join('');
  const hd = FX.el('div', scr, { position: 'absolute', left: '16px', top: '48px', right: '16px', display: 'flex', alignItems: 'center', gap: '10px' });
  FX.el('div', hd, { font: `400 26px ${SANS}`, color: 'rgba(255,255,255,0.6)', marginTop: '-4px' }).textContent = '‹';
  FX.el('div', hd, { width: '36px', height: '36px', borderRadius: '50%', background: '#F4EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' })
    .innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><g stroke="#D97757" stroke-width="3" stroke-linecap="round">${rays}</g></svg>`;
  const who = FX.el('div', hd, { minWidth: 0 });
  FX.el('div', who, { font: `700 15px ${SANS}`, whiteSpace: 'nowrap' }).textContent = CONFIG.app;
  FX.el('div', who, { font: `400 11px ${SANS}`, color: 'rgba(255,255,255,0.55)' }).innerHTML = '<span style="color:#5BD27A">●</span> ';
  who.lastChild.append(CONFIG.status);

  const msg = FX.el('div', scr, { position: 'absolute', left: '16px', top: '100px', maxWidth: '230px', padding: '9px 13px', borderRadius: '16px 16px 16px 5px',
    background: '#23272e', font: `400 14px/1.3 ${SANS}`, color: 'rgba(255,255,255,0.92)' });
  msg.textContent = CONFIG.message;

  // the recommendation card: label, the big line, three items with bars, the buttons (it grows to fit the words)
  const card = FX.el('div', scr, { position: 'absolute', left: '12px', right: '12px', top: '150px', borderRadius: '20px',
    background: '#1c2027', border: '1px solid rgba(255,255,255,0.07)', padding: '16px' });
  FX.el('div', card, { font: `700 10px ${SANS}`, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.5)' }).innerHTML = `<span style="color:${ACC}">●</span>&nbsp; `;
  card.lastChild.append(CONFIG.label);
  const big = FX.el('div', card, { marginTop: '10px', font: `900 23px/1.18 ${SANS}`, letterSpacing: '-0.01em' });
  big.textContent = CONFIG.recommendation;
  const ads = FX.el('div', card, { marginTop: '14px', display: 'flex', gap: '8px' });
  const PAL = [['#ff5a3d', '#7a1a0a'], ['#2f6bff', '#0b1f66'], ['#16c47f', '#064d32']];
  const bars = CONFIG.items.slice(0, 3).map((name, i) => {
    const col = FX.el('div', ads, { flex: '1', minWidth: 0 });
    const im = FX.el('div', col, { height: '46px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, ${PAL[i][0]}, ${PAL[i][1]})` });
    if (CONFIG.images[i]) FX.el('img', im, { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }).src = CONFIG.images[i];
    else im.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M5 3.5v9l7.5-4.5z" fill="rgba(255,255,255,0.9)"/></svg>';   // a play mark
    FX.el('div', col, { marginTop: '6px', font: `700 11px ${SANS}`, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }).textContent = name;
    const tr = FX.el('div', col, { marginTop: '4px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.12)' });
    return { im, fl: FX.el('div', tr, { height: '100%', borderRadius: '2px', background: i === 0 ? ACC : 'rgba(255,255,255,0.75)' }) };
  });
  const btns = FX.el('div', card, { position: 'relative', marginTop: '18px', display: 'flex', alignItems: 'center', gap: '14px' });
  const ok = FX.el('div', btns, { position: 'relative', minWidth: '138px', height: '42px', padding: '0 16px', borderRadius: '21px', background: '#fff', color: '#111',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', font: `700 16px ${SANS}`, boxShadow: '0 4px 14px rgba(0,0,0,0.35)', whiteSpace: 'nowrap' });
  const tick = FX.el('span', ok, { display: 'none' });
  tick.innerHTML = '<svg width="14" height="14" viewBox="0 0 20 20" style="display:block"><path d="M4 10.5l3.8 3.8L16 6" stroke="#111" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const okT = FX.el('span', ok);
  const no = FX.el('div', btns, { font: `700 14px ${SANS}`, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' });
  no.textContent = CONFIG.skip;

  // the message bar and the home line at the bottom
  const bar = FX.el('div', scr, { position: 'absolute', left: '12px', right: '12px', bottom: '26px', height: '42px', borderRadius: '21px',
    background: '#1c2027', font: `400 14px ${SANS}`, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', paddingLeft: '16px' });
  bar.textContent = 'Message';
  FX.el('div', bar, { position: 'absolute', right: '5px', top: '5px', width: '32px', height: '32px', borderRadius: '50%', background: '#2e333c',
    display: 'flex', alignItems: 'center', justifyContent: 'center' }).innerHTML = '<svg width="14" height="14" viewBox="0 0 20 20"><path d="M10 16V4M4.5 9.5L10 4l5.5 5.5" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  FX.el('div', scr, { position: 'absolute', left: '50%', bottom: '8px', width: '110px', marginLeft: '-55px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.85)' });

  // the touch: a soft grey dot that comes in from below and lands on the middle of Approve (measured, so it follows the words)
  okT.textContent = CONFIG.button;
  const tgtX = card.offsetLeft + 1 + btns.offsetLeft + ok.offsetLeft + ok.offsetWidth / 2 - 20;
  const tgtY = card.offsetTop + 1 + btns.offsetTop + ok.offsetTop + ok.offsetHeight / 2 - 20;
  const touch = FX.el('div', scr, { position: 'absolute', left: 0, top: 0, width: '40px', height: '40px', borderRadius: '50%',
    background: 'rgba(200,200,205,0.55)', border: '2px solid rgba(255,255,255,0.7)', boxShadow: '0 4px 12px rgba(0,0,0,0.35)' });
  const lean = side === 'right' ? 1 : -1;

  return (f) => {
    // slides up from below the frame and settles with a small overshoot and a slight lean (already moving on the first frame)
    const p = FX.lin(f, -1.5, 8.5);
    holder.style.transform = `translateY(${((1 - FX.back(p, 1.2)) * (H - py)).toFixed(1)}px) rotate(${(lean * FX.mix(6, 2, FX.out(p))).toFixed(2)}deg)`;
    msg.style.opacity = FX.lin(f, 4, 7);
    msg.style.transform = `translateY(${(8 * (1 - FX.out(FX.lin(f, 4, 8)))).toFixed(1)}px)`;
    const c = FX.lin(f, 5.5, 9.5);
    card.style.opacity = c;
    card.style.transform = `translateY(${(14 * (1 - FX.out(c))).toFixed(1)}px)`;
    const t = FX.lin(f, 7, 11);
    big.style.filter = `blur(${(6 * (1 - t)).toFixed(2)}px)`;
    big.style.opacity = 0.25 + 0.75 * t;
    // the tap: comes in from f 10.5, presses f 14 to 17.5 (Approved at f 16), lifts away by f 23
    const tin = FX.out(FX.lin(f, 10.5, 14)), press = Math.sin(Math.PI * FX.lin(f, 14, 17.5));
    touch.style.opacity = Math.min(tin, 1 - FX.lin(f, 19, 23)).toFixed(3);
    touch.style.transform = `translate(${FX.mix(tgtX + 70, tgtX, tin).toFixed(1)}px, ${FX.mix(tgtY + 165, tgtY, tin).toFixed(1)}px) scale(${(1 - 0.22 * press).toFixed(3)})`;
    ok.style.transform = `scale(${(1 - 0.08 * press).toFixed(3)})`;
    const done = f >= 16;
    okT.textContent = done ? CONFIG.done : CONFIG.button;
    tick.style.display = done ? 'block' : 'none';
    ok.style.background = done ? ACC : '#fff';
    no.style.opacity = 1 - FX.lin(f, 16, 19);
    // then the bars move to their new values, and item 3's picture dims
    const m = FX.inout(FX.lin(f, 17, 26));
    bars.forEach((b, i) => { b.fl.style.width = (100 * FX.mix(CONFIG.from[i], CONFIG.to[i], m)).toFixed(1) + '%'; });
    if (bars[2]) bars[2].im.style.opacity = 1 - 0.6 * m;
    glare.style.opacity = 0.7 + 0.3 * Math.sin(f / 12);
  };
});
