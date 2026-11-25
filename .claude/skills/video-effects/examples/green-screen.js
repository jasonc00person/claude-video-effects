// media: plate=assets/footage/talk.mp4 cut=assets/footage/talk-cutout.webm
/* Green Screen: your room keys out in the first two frames (a green flash, then a white pop) and you are standing in front
   of a bright app on a purple gradient: a focus timer bar, a big serif line, a task list and a chat box typing a question.
   On a wide frame the app fills the middle behind you, its list reading beside you. On a vertical (or square) frame you slide
   down until the big line and the list sit clear above your hair, and the chat box comes in front of you, under your chin.
   Layers: your shot (z 0, gone after f 1.6) < the green flash (z 1) < the purple ground and the app (z 2) < a white pop (z 15)
   < your cutout (z 20) < the chat box on vertical (z 25). */
const CONFIG = {
  footage: 'talk',                              // the --name of the footage (used to find your head)
  name: 'Claude',                               // the app's name in its title bar, next to a drawn orange mark
  accent: '#d9653b',                            // the mark, the current task and the send button
  focus: 'FOCUS',                               // the label in the timer bar
  timer: 49 * 60 + 57,                          // where the timer starts, in seconds (49:57); it counts down
  button: 'End sprint',                         // the button in the timer bar
  headline: 'Everything else waits.',           // the big serif line
  tasks: ["Film today's video", 'Edit with Claude', 'Post by 6 pm'],   // the list; the first is the one you're on (and sits in the timer bar)
  now: 'NOW',                                   // the tag on the current task
  message: 'What should I post next?',          // what types into the chat box
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const tall = W < H * 1.3;                     // vertical or square: the app's top sits above your head
  const plate = document.getElementById('plate'), cut = document.getElementById('cut');
  plate.style.zIndex = 0; cut.style.zIndex = 20;
  cut.style.filter = FX.choke(2 * u);           // tighten the cutout's edge so no old background glows round your hair
  const INK = '#1c1a17', A = CONFIG.accent;
  const mark = (size) => {                      // the app's mark: a small orange sparkle, drawn
    const s = FX.svg('svg', null, { width: size, height: size, viewBox: '-12 -12 24 24' });
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6 + 0.15, r = i % 2 ? 8 : 11.5;
      FX.svg('line', s, { x1: 0, y1: 0, x2: (Math.cos(a) * r).toFixed(2), y2: (Math.sin(a) * r).toFixed(2), stroke: A, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
    }
    return s;
  };

  // the new background: a purple-blue gradient with the app window on it
  const bg = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 2,
    background: 'radial-gradient(ellipse at 20% 0%, rgba(176,120,255,0.55), rgba(176,120,255,0) 55%), radial-gradient(ellipse at 90% 100%, rgba(40,80,255,0.6), rgba(40,80,255,0) 60%), linear-gradient(180deg, #7a3af2 0%, #5a2ce4 50%, #2c22c2 100%)' });
  const winW = tall ? W * 0.91 : W * 0.8, winL = (W - winW) / 2, winT = tall ? H * 0.05 : H * 0.024;
  const ui = FX.el('div', bg, { position: 'absolute', left: winL + 'px', top: winT + 'px', width: winW + 'px', background: '#f8f4ec',
    borderRadius: 26 * u + 'px', boxShadow: `0 ${43 * u}px ${114 * u}px rgba(20,8,80,0.55)`, overflow: 'hidden', transformOrigin: '50% 0%' });
  // title bar: three dots, the mark and the name
  const tb = FX.el('div', ui, { position: 'relative', height: 54 * u + 'px', display: 'flex', alignItems: 'center', padding: `0 ${23 * u}px`, borderBottom: `${1.5 * u}px solid #ebe5d8` });
  ['#ff5f57', '#febc2e', '#28c840'].forEach((c) => FX.el('div', tb, { width: 17 * u + 'px', height: 17 * u + 'px', borderRadius: '50%', background: c, marginRight: 11 * u + 'px' }));
  const tt = FX.el('div', tb, { position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 11 * u + 'px' });
  tt.appendChild(mark(25 * u));
  FX.el('div', tt, { font: `700 ${21 * u}px ${FX.font.sans}`, color: '#3b3730' }).textContent = CONFIG.name;
  // the timer bar
  const sp = FX.el('div', ui, { position: 'absolute', left: 29 * u + 'px', right: 29 * u + 'px', top: 69 * u + 'px', height: 83 * u + 'px', background: INK,
    borderRadius: 17 * u + 'px', display: 'flex', alignItems: 'center', padding: `0 ${29 * u}px`, gap: 26 * u + 'px', color: '#fff', whiteSpace: 'nowrap' });
  const fo = FX.el('div', sp, { display: 'flex', alignItems: 'center', gap: 10 * u + 'px', font: `700 ${19 * u}px ${FX.font.sans}`, letterSpacing: 2 * u + 'px', color: '#ff8d74' });
  FX.el('div', fo, { width: 13 * u + 'px', height: 13 * u + 'px', borderRadius: '50%', background: '#ff6a4d' });
  FX.el('div', fo, {}).textContent = CONFIG.focus;
  const timer = FX.el('div', sp, { font: `700 ${57 * u}px/1 ${FX.font.mono}`, letterSpacing: 1.4 * u + 'px' });
  FX.el('div', sp, { font: `700 ${30 * u}px ${FX.font.sans}`, overflow: 'hidden', textOverflow: 'ellipsis' }).textContent = CONFIG.tasks[0];
  FX.el('div', sp, { marginLeft: 'auto', font: `700 ${20 * u}px ${FX.font.sans}`, background: '#fff', color: INK, padding: `${11 * u}px ${20 * u}px`, borderRadius: 11 * u + 'px' }).textContent = CONFIG.button;
  // the big serif line (shrunk to fit if it is long)
  const bigRow = FX.el('div', ui, { position: 'absolute', left: 0, right: 0, top: (tall ? 168 : 154) * u + 'px', textAlign: 'center' });
  const big = FX.el('div', bigRow, { display: 'inline-flex', alignItems: 'center', gap: '0.25em', font: `400 ${71 * u}px/1.1 ${FX.font.serif}`, color: INK, whiteSpace: 'nowrap' });
  const bm = mark(71 * u * 0.8); big.appendChild(bm);
  FX.el('span', big, {}).textContent = CONFIG.headline;
  const maxW = winW - 80 * u;
  if (big.offsetWidth > maxW) { const fs = 71 * u * maxW / big.offsetWidth; big.style.fontSize = fs + 'px'; bm.setAttribute('width', fs * 0.8); bm.setAttribute('height', fs * 0.8); }
  // the task list: the current one boxed in white with a tag, the rest greyed with a lock
  const rows = CONFIG.tasks.map((t, i) => {
    const on = i === 0;
    const r = FX.el('div', ui, { position: 'absolute', left: 29 * u + 'px', right: 29 * u + 'px', top: (260 + i * 71) * u + 'px', height: 60 * u + 'px', borderRadius: 14 * u + 'px',
      display: 'flex', alignItems: 'center', padding: `0 ${23 * u}px`, gap: 17 * u + 'px', whiteSpace: 'nowrap',
      background: on ? '#fff' : 'transparent', border: `${3 * u}px solid ${on ? '#e7a99a' : 'transparent'}` });
    FX.el('div', r, { width: 26 * u + 'px', height: 26 * u + 'px', flex: 'none', borderRadius: '50%', border: on ? `${7 * u}px solid ${A}` : `${3 * u}px solid #c9c2b3` });
    FX.el('div', r, { font: `${on ? 700 : 400} ${27 * u}px ${FX.font.sans}`, color: on ? INK : '#a69f90' }).textContent = t;
    if (on) FX.el('div', r, { marginLeft: 'auto', font: `700 ${17 * u}px ${FX.font.sans}`, letterSpacing: 1.4 * u + 'px', color: '#fff', background: A, padding: `${6 * u}px ${14 * u}px`, borderRadius: 9 * u + 'px' }).textContent = CONFIG.now;
    else FX.el('div', r, { marginLeft: 'auto', width: 17 * u + 'px', height: 14 * u + 'px', border: `${3 * u}px solid #c9c2b3`, borderRadius: 3 * u + 'px', marginTop: 9 * u + 'px' });
    return r;
  });
  const listEnd = winT + (260 + CONFIG.tasks.length * 71) * u;      // the bottom of the list, on the frame

  // where you stand. Wide: where you are. Tall: slid down (never shrunk, so your sides stay off screen) until your hair
  // clears the list, and the chat box goes under your chin
  const subj = FX.subject(CONFIG.footage), hs = [];
  for (let f = 0; f <= FX.END; f += 6) hs.push(subj.head(f));
  const htop = Math.min(...hs.map((h) => h.top)), chin = Math.max(...hs.map((h) => h.top + h.h * 1.05));   // a little below the chin, to be safe
  const D = tall ? Math.max(0, listEnd + 40 * u - htop) : 0;
  const CH = 109 * u;
  let chatTop;
  if (tall) {
    chatTop = Math.min(chin + D + 30 * u, (portrait ? H * 0.8 : H - 20 * u) - CH);
    ui.style.height = (chatTop + CH + 49 * u - winT) + 'px';
  } else ui.style.height = H * 0.794 + 'px';

  // the chat box: inside the window behind you on a wide frame, in front of you on a tall one
  const inp = FX.el('div', tall ? null : ui, { position: 'absolute', height: CH + 'px', background: '#fff', borderRadius: 23 * u + 'px',
    boxShadow: tall ? `0 ${20 * u}px ${50 * u}px rgba(20,8,80,0.45)` : `0 ${3 * u}px 0 rgba(0,0,0,0.04), 0 0 0 ${2 * u}px #e4ddcf`,
    display: 'flex', alignItems: 'center', padding: `0 ${20 * u}px 0 ${37 * u}px` });
  if (tall) Object.assign(inp.style, { left: (winL + 40 * u) + 'px', width: (winW - 80 * u) + 'px', top: chatTop + 'px', zIndex: 25 });
  else Object.assign(inp.style, { left: 57 * u + 'px', right: 57 * u + 'px', bottom: 49 * u + 'px' });
  const typed = FX.el('div', inp, { font: `400 ${31 * u}px ${FX.font.sans}`, color: '#2a2722', whiteSpace: 'nowrap' });
  const caret = FX.el('div', inp, { width: 3 * u + 'px', height: 37 * u + 'px', background: '#2a2722', marginLeft: 3 * u + 'px' });
  const send = FX.el('div', inp, { marginLeft: 'auto', width: 63 * u + 'px', height: 63 * u + 'px', flex: 'none', borderRadius: '50%', background: A,
    display: 'flex', alignItems: 'center', justifyContent: 'center' });
  send.innerHTML = `<svg width="${31 * u}" height="${31 * u}" viewBox="0 0 22 22"><path d="M11 17 V5 M5.5 10.5 L11 5 L16.5 10.5" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  // the key: a green spill over your shot for a frame, then a white pop as the new background lands
  const key = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 1, background: '#19e05a' });
  const pop = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 15, background: '#fff' });

  return (f) => {
    key.style.opacity = (0.85 * Math.exp(-Math.pow((f - 1.1) / 0.7, 2))).toFixed(3);   // peaks at f 1.1
    plate.style.opacity = f < 1.6 ? 1 : 0;                                              // your room is gone from f 1.6
    bg.style.opacity = FX.out(FX.lin(f, 1.2, 2.4));
    pop.style.opacity = (0.55 * Math.exp(-Math.pow((f - 2.2) / 1.0, 2))).toFixed(3);    // peaks at f 2.2
    // the app rises and settles over f 1.5 to 8; on a tall frame you slide down at the same pace
    const a = FX.out5(FX.lin(f, 1.5, 8));
    ui.style.transform = `translateY(${(57 * u * (1 - a)).toFixed(2)}px) scale(${FX.mix(0.94, 1, a).toFixed(4)})`;
    for (const v of [plate, cut]) v.style.transform = `translateY(${(D * a).toFixed(1)}px)`;
    if (tall) { inp.style.opacity = FX.lin(f, 3, 7); inp.style.transform = `translateY(${(57 * u * (1 - FX.out(FX.lin(f, 3, 9)))).toFixed(2)}px)`; }
    bigRow.style.opacity = FX.out(FX.lin(f, 4, 8));
    bigRow.style.transform = `translateY(${(20 * u * (1 - FX.out(FX.lin(f, 4, 9)))).toFixed(2)}px)`;
    rows.forEach((r, i) => { const p = FX.lin(f, 5 + i * 1.5, 9 + i * 1.5); r.style.opacity = FX.out(p); r.style.transform = `translateX(${(-34 * u * (1 - FX.out(p))).toFixed(2)}px)`; });
    const secs = Math.max(0, CONFIG.timer - Math.floor(Math.max(0, f - 2) / 24));     // a real countdown, one tick a second
    timer.textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    const n = Math.floor(FX.mix(0, CONFIG.message.length, FX.lin(f, 9, 34)));          // types from f 9 to f 34
    typed.textContent = CONFIG.message.slice(0, n);
    caret.style.opacity = (Math.floor(f / 8) % 2 === 0 || n < CONFIG.message.length) ? 1 : 0;
  };
});
