// media: plate=assets/footage/talk.mp4 a1=assets/footage/talk.mp4 a2=assets/footage/talk.mp4 a3=assets/footage/talk.mp4 a4=assets/footage/talk.mp4 a5=assets/footage/talk.mp4 a6=assets/footage/talk.mp4 next=assets/footage/talk2.mp4 b1=assets/footage/talk2.mp4 b2=assets/footage/talk2.mp4 b3=assets/footage/talk2.mp4 b4=assets/footage/talk2.mp4 b5=assets/footage/talk2.mp4 b6=assets/footage/talk2.mp4
/* Zoom Through: the camera rushes into your face with a zoom blur, and the cut lands INSIDE the blur on the next thing,
   which keeps zooming IN, slowing down as it settles. One continuous push forward through the cut, never in-then-out.
   The zoom blur is the shot stacked 7 times at slightly bigger and bigger sizes, plus a blur that follows the speed: that is
   why the first line lists each video 7 times (a1 to a6 and b1 to b6 are copies; fewer copies still work, just steppier).
   What it lands on, the first that's there wins:
     1. a second shot: next= on the first line (with its copies b1 to b6). Make it with: node fx.mjs footage ... --name talk2
     2. a picture: CONFIG.picture (delete next= and b1 to b6 from the first line)
     3. a drawn title card with CONFIG.title (no second shot, no picture)
   Layers: your shot and its copies (z 1 to 7) < the backdrop behind a picture or card (z 10) < the next thing and its copies
   (z 11 and up) < a soft flash at the cut (z 30) < dark edges (z 31). */
const CONFIG = {
  footage: 'talk',          // the --name of the first shot (used to find your face: the camera rushes into it)
  picture: '',              // land on a picture instead of a second shot, e.g. 'assets/images/thumbnail.jpg' (shown whole)
  title: 'Claude edits my videos now',   // no second shot and no picture: a title card with these words
  highlight: 1,             // how many of the title's first words are orange
  name: 'Claude',           // the name beside the orange mark at the top of the title card ('' = no mark)
};

FX.comp(() => {
  const { W, H, u, portrait } = FX;
  const byId = (id) => document.getElementById(id);
  const A = ['plate', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6'].map(byId).filter(Boolean);
  const face = FX.subject(CONFIG.footage).head(4);           // the point the first shot rushes into: your face
  A.forEach((v, k) => Object.assign(v.style, { zIndex: 1 + k, transformOrigin: `${face.x}px ${face.y}px` }));

  // ---- what it lands on: B is the next thing and its copies, `base` its size when the cut lands
  let B, base, backdrop = null;
  const next = byId('next');
  if (next) {
    // a second shot: full frame, pushing into ITS face (measured if it was made with --cutout, else a centred guess)
    B = [next, ...['b1', 'b2', 'b3', 'b4', 'b5', 'b6'].map(byId).filter(Boolean)];
    const nf = FX.subject(next.getAttribute('src').split('/').pop().replace(/\.[^.]+$/, '')).head(12);
    B.forEach((v) => { v.style.transformOrigin = `${nf.x}px ${nf.y}px`; });
    base = 1;
  } else {
    // a picture or a title card: shown whole, a little smaller than the frame, on a backdrop, so the push in never crops it
    const one = FX.el('div', null, { position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transformOrigin: '50% 50%' });
    const look = { display: 'block', borderRadius: (22 * u) + 'px', boxShadow: `0 ${24 * u}px ${60 * u}px rgba(0,0,0,0.55)`, overflow: 'hidden' };
    if (CONFIG.picture) {
      FX.el('img', one, look).src = CONFIG.picture;
      backdrop = FX.el('img', null, { filter: `blur(${40 * u}px) brightness(0.55)`, transformOrigin: '50% 50%' }, 'fill');
      backdrop.src = CONFIG.picture;
    } else {
      const card = FX.el('div', one, { ...look, width: W + 'px', height: H + 'px', position: 'relative',
        background: 'radial-gradient(120% 90% at 30% 20%, #2f6bff 0%, #0b2a8a 55%, #06123d 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: (36 * u) + 'px', padding: (90 * u) + 'px' });
      if (CONFIG.name) {
        const mark = FX.el('div', card, { display: 'flex', alignItems: 'center', gap: (16 * u) + 'px', font: `700 ${Math.round(54 * u)}px ${FX.font.sans}`, color: '#fff' });
        FX.el('span', mark, { color: '#ff7a45', fontSize: (78 * u) + 'px', lineHeight: '1' }).textContent = '✳';
        FX.el('span', mark).textContent = CONFIG.name;
      }
      const t = FX.el('div', card, { font: `900 ${Math.round((portrait ? 118 : 128) * u)}px/1.0 ${FX.font.sans}`, color: '#fff', textAlign: 'center',
        textTransform: 'uppercase', letterSpacing: '-0.02em', maxWidth: (portrait ? W * 0.82 : W * 0.78) + 'px', textShadow: `0 ${4 * u}px ${18 * u}px rgba(0,0,0,0.35)` });
      CONFIG.title.split(' ').forEach((w, i) => { FX.el('span', t, { color: i < CONFIG.highlight ? '#ff7a45' : '#fff' }).textContent = w + ' '; });
      backdrop = FX.el('div', null, { position: 'absolute', inset: '0', background: 'radial-gradient(circle at 50% 45%, #0b2a8a, #020617 75%)' });
    }
    backdrop.style.zIndex = 10;
    B = [one];
    for (let k = 1; k < 7; k++) {                 // six copies for the smear (no shadow on them)
      const c = one.cloneNode(true); c.firstChild.style.boxShadow = 'none'; FX.root.appendChild(c); B.push(c);
    }
    base = 0.74;
  }
  B.forEach((v, k) => { v.style.zIndex = 11 + k; });
  const pic = CONFIG.picture && !next ? B.map((c) => c.firstChild) : [];

  const flash = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 30,
    background: `radial-gradient(circle at ${face.x}px ${face.y}px, rgba(255,250,235,0.9), rgba(255,250,235,0.25) 45%, rgba(255,250,235,0) 75%)` });
  const vig = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 31,
    background: 'radial-gradient(circle at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)' });

  // the first shot: 1x to 7x between f 0.5 and 8.5, speeding up. The next thing: still pushing IN, fast out of the cut and
  // slowing to f 17 (to 1.22x of where it started), then creeping on: the same direction of travel on both sides of the cut
  const sA = (f) => 1 + 6 * FX.in(FX.lin(f, 0.5, 8.5));
  const sB = (f) => base * (1 + 0.216 * FX.out5(FX.lin(f, 7.6, 17))) * (1 + 0.05 * FX.lin(f, 17, FX.END));
  // the zoom blur: copies at spreading sizes, copy k at 1/(k+1) strength so all of them weigh the same, plus a real blur
  const stack = (els, s, v, op) => {
    const spread = Math.min(0.65, Math.abs(v) / s * 1.6), n = Math.max(1, els.length - 1);
    els.forEach((el, k) => {
      el.style.transform = `scale(${(s * (1 + k * spread / n)).toFixed(4)})`;
      el.style.filter = `blur(${(Math.min(8.6, Math.abs(v) / s * 12.9) * u).toFixed(2)}px)`;
      el.style.opacity = k === 0 ? op : (spread > 0.002 ? op / (k + 1) : 0);
    });
  };

  return (f) => {
    // a picture is fitted whole inside the frame (its own shape, so its corners stay round)
    pic.forEach((im) => { if (im.naturalWidth) { const k = Math.min(W / im.naturalWidth, H / im.naturalHeight);
      im.style.width = im.naturalWidth * k + 'px'; im.style.height = im.naturalHeight * k + 'px'; } });
    const vA = sA(f + 0.5) - sA(f - 0.5), vB = sB(f + 0.5) - sB(f - 0.5);
    const cutT = FX.lin(f, 7.6, 9.2);                    // a short dissolve, hidden inside the blur
    stack(A, sA(f), vA, f < 9.2 ? 1 : 0);
    stack(B, sB(f), vB, f < 7.6 ? 0 : FX.inout(cutT));
    if (backdrop) {
      backdrop.style.opacity = f < 7.6 ? 0 : FX.inout(cutT);
      backdrop.style.transform = `scale(${(1.2 * sB(f) / base).toFixed(4)})`;
    }
    const peak = Math.exp(-Math.pow((f - 8.4) / 2.2, 2));
    flash.style.opacity = (0.4 * peak).toFixed(3);
    vig.style.opacity = Math.min(1, peak * 1.4 + 0.15).toFixed(3);
  };
});
