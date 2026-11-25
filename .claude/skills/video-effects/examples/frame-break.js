// media: plate=assets/footage/talk.mp4 cut=assets/footage/talk-cutout.webm bg=assets/footage/talk.mp4
/* Frame Break: your full shot shrinks into a dark phone post (side icons, handle, caption) floating on a blurred, darkened
   copy of itself, and your head BREAKS OUT past the post's top edge. Above the edge your cutout is drawn, but only in a
   column around your head (it follows your head every frame), so you seem to lean out of the post.
   Layers: the blurred shot (z 0) < a dark tint (z 1) < the post with your shot inside (z 5) < its rim (z 7) < your head (z 9). */
const CONFIG = {
  footage: 'talk',                         // the --name of the footage (used to find your head)
  handle: 'yourhandle',                    // the name on the post
  caption: 'Claude edited this whole reel',// the line under the name
  size: 1,                                 // the post's size: 1 is the default, 1.2 a fifth bigger, 0.8 smaller
  edge: 1.1,                               // where the post's top edge crosses you, in head heights below the top of your hair (1.1 = your collar)
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const plate = document.getElementById('plate'), cut = document.getElementById('cut'), bg = document.getElementById('bg');
  // the ground: a second copy of your shot, blurred and pushed dark (scaled up a little so the blur's soft edge stays off screen)
  bg.style.zIndex = 0; bg.style.transform = 'scale(1.12)';
  const tint = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 1,
    background: 'radial-gradient(70% 80% at 50% 45%, rgba(20,24,20,0.55) 0%, rgba(6,7,6,0.92) 100%)' });

  // your head over the whole clip (its average place and size)
  const subj = FX.subject(CONFIG.footage), hs = [];
  for (let f = 0; f <= FX.END; f += 6) hs.push(subj.head(f));
  const avg = (key) => hs.reduce((s, h) => s + h[key], 0) / hs.length;
  const hx = avg('x'), hh = avg('h'), htop = avg('top');

  // the post: a 9:16 window in the middle, its top edge a little under halfway down, its foot running off the bottom
  const k = u * CONFIG.size;
  const PW = (portrait ? W * 0.56 : 531 * u) * CONFIG.size, PH = PW * 16 / 9, PL = (W - PW) / 2, PT = H * (portrait ? 0.4 : 0.42), R = 43 * k;
  // your shot inside it: scaled so your whole head fits between the top of the frame and the post's edge, centred on your head
  const span = CONFIG.edge * hh;
  const S = Math.max(0.5, Math.min(1.4, (PT - H * 0.04) / span));
  const TX = W / 2 - S * hx, TY = PT - S * (htop + span);

  const win = FX.el('div', null, { position: 'absolute', overflow: 'hidden', zIndex: 5, background: '#0a0b0a' });
  win.appendChild(plate);
  plate.style.transformOrigin = '0 0';
  // where your shot ends inside the post: fade it into the post's dark foot
  const fade = FX.el('div', win, { position: 'absolute', left: 0, right: 0, bottom: 0, top: (TY + S * H - PT - 129 * u) + 'px',
    background: `linear-gradient(to bottom, rgba(10,11,10,0) 0px, rgba(10,11,10,0.6) ${114 * u}px, #0a0b0a ${200 * u}px)` });
  const rim = FX.el('div', null, { position: 'absolute', zIndex: 7, border: `${4 * u}px solid rgba(236,236,230,0.72)`, boxShadow: `0 ${43 * u}px ${100 * u}px rgba(0,0,0,0.7)` });

  // the post's buttons and text, drawn at its final size. They sit in the part of the post you can see
  // (on vertical, above the bottom fifth where the real app's buttons go)
  const vis = Math.min(PT + PH, H * (portrait ? 0.78 : 1)) - PT, hy = vis - 140 * k;
  const ig = FX.el('div', win, { position: 'absolute', left: 0, top: 0, width: PW + 'px', height: PH + 'px', color: '#fff',
    filter: `drop-shadow(0 ${k}px ${3 * k}px rgba(0,0,0,0.4))` });
  const icon = (d, y) => {
    const e = FX.el('div', ig, { position: 'absolute', right: 20 * k + 'px', top: y + 'px', width: 43 * k + 'px', textAlign: 'center' });
    e.innerHTML = `<svg width="${40 * k}" height="${40 * k}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  };
  icon('<path d="M12 20s-7-4.4-9-8.6C1.6 8.3 3.6 5 6.8 5c2 0 3.4 1.1 5.2 3 1.8-1.9 3.2-3 5.2-3 3.2 0 5.2 3.3 3.8 6.4C19 15.6 12 20 12 20z"/>', hy - 289 * k);
  icon('<path d="M20.5 11.5a8.5 8.5 0 0 1-12.4 7.6L3.5 20.5l1.4-4.4A8.5 8.5 0 1 1 20.5 11.5z"/>', hy - 223 * k);
  icon('<path d="M21 3L10 14M21 3l-7 18-4-7-7-4z"/>', hy - 157 * k);
  icon('<circle cx="5" cy="12" r="1.3" fill="#fff"/><circle cx="12" cy="12" r="1.3" fill="#fff"/><circle cx="19" cy="12" r="1.3" fill="#fff"/>', hy - 94 * k);
  const who = FX.el('div', ig, { position: 'absolute', left: 20 * k + 'px', top: hy + 'px', display: 'flex', alignItems: 'center', gap: 11 * k + 'px',
    font: `700 ${20 * k}px ${FX.font.sans}` });
  who.innerHTML = `<div style="width:${37 * k}px;height:${37 * k}px;border-radius:50%;background:linear-gradient(135deg,#f9ce34,#ee2a7b,#6228d7);padding:${3 * k}px">`
    + `<div style="width:100%;height:100%;border-radius:50%;background:#2b2b2b;border:${3 * k}px solid #0a0b0a"></div></div>`
    + `<span></span><span style="border:${2 * k}px solid rgba(255,255,255,0.8);border-radius:${10 * k}px;padding:${3 * k}px ${11 * k}px;font:700 ${17 * k}px ${FX.font.sans}">Follow</span>`;
  who.children[1].textContent = CONFIG.handle;
  const cap = FX.el('div', ig, { position: 'absolute', left: 20 * k + 'px', top: (hy + 51 * k) + 'px', right: 80 * k + 'px',
    font: `400 ${19 * k}px/1.3 ${FX.font.sans}`, color: 'rgba(255,255,255,0.88)' });
  cap.textContent = CONFIG.caption;

  // the break-out: your cutout in a full-frame layer that shows only a column around your head above the post's edge
  const out = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 9, webkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat' });
  out.appendChild(cut);
  cut.style.transformOrigin = '0 0';
  cut.style.filter = FX.choke(2 * u);       // tighten the cutout's edge so no old background glows round your hair

  return (f) => {
    // the shrink: f 0.5 to 11, from the full frame to the post
    const p = FX.inout(FX.lin(f, 0.5, 11));
    const L = FX.mix(0, PL, p), T = FX.mix(0, PT, p), ww = FX.mix(W, PW, p), wh = FX.mix(H, PH, p), r = FX.mix(0, R, p);
    Object.assign(win.style, { left: L + 'px', top: T + 'px', width: ww + 'px', height: wh + 'px', borderRadius: r + 'px' });
    Object.assign(rim.style, { left: (L - 4 * u) + 'px', top: (T - 4 * u) + 'px', width: (ww + 8 * u) + 'px', height: (wh + 8 * u) + 'px',
      borderRadius: (r + 4 * u) + 'px', opacity: FX.lin(f, 1, 5) });
    const s = FX.mix(1, S, p), tx = FX.mix(0, TX, p), ty = FX.mix(0, TY, p);
    plate.style.left = (-L) + 'px'; plate.style.top = (-T) + 'px';   // the window moves, your shot stays put on the frame
    plate.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(4)})`;
    cut.style.transform = plate.style.transform;
    // the break-out's shape, following your head every frame: solid over the hair, a soft oval that narrows along the jaw,
    // then a soft band down the neck (so a chair back beside you fades away instead of poking out). Soft edges never cut
    // the face if the head turns. It ends with a hard line 2 u under the post's edge, so the neck covers the rim.
    const hd = subj.head(f), X = tx + s * hd.x, Y0 = ty + s * hd.top, h = s * hh, F = 0.06 * h, y1 = T + 2 * u;
    const band = (hw) => `linear-gradient(to right, transparent ${(X - hw - F).toFixed(1)}px, #000 ${(X - hw).toFixed(1)}px, #000 ${(X + hw).toFixed(1)}px, transparent ${(X + hw + F).toFixed(1)}px)`;
    const Yc = Y0 + 0.5 * h, Yn = Y0 + 0.85 * h, NECK = 0.27;      // NECK: the neck band's half width, in head heights
    out.style.webkitMaskImage = out.style.maskImage =
      `${band(0.55 * h)}, radial-gradient(${(0.6 * h).toFixed(1)}px ${(0.5 * h).toFixed(1)}px at ${X.toFixed(1)}px ${Yc.toFixed(1)}px, #000 80%, transparent 100%), ${band(NECK * h)}`;
    out.style.webkitMaskSize = out.style.maskSize = `${W}px ${Math.max(0, Yc).toFixed(1)}px, ${W}px ${H}px, ${W}px ${H}px`;
    out.style.webkitMaskPosition = out.style.maskPosition = `0 0, 0 0, 0 ${Yn.toFixed(1)}px`;
    out.style.clipPath = `inset(0 0 ${(H - y1).toFixed(1)}px 0)`;
    fade.style.opacity = FX.lin(f, 4, 11);
    ig.style.opacity = FX.lin(f, 9, 14);
    bg.style.filter = `blur(${(37 * u * p).toFixed(1)}px)`;
    tint.style.opacity = p;
  };
});
