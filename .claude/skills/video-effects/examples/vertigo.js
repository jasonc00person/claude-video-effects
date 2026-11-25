// media: plate=assets/footage/talk.mp4 chest=assets/footage/talk.mp4 room=assets/footage/talk-room.webm room2=assets/footage/talk-room.webm room3=assets/footage/talk-room.webm cut=assets/footage/talk-cutout.webm
/* Vertigo: a dolly zoom, the shot from the horror films. You hold your size while the room behind you lunges in, hard,
   over f 0 to 18, smeared while it moves, then keeps creeping in to the end. The room edges darken as it swells.
   The room comes from footage made with --room: your background with a see-through hole where you were. When the room
   grows, that hole grows bigger than you, so it gets filled: either with a photo of the empty set (CONFIG.background,
   the best) or with the room's own colours smeared into it.
   Layers: your shot as a safety net (z 0) < the empty-set photo if you have one (z 2) < the room, hole filled (z 3) < two
   lagging copies of the room while it lunges (z 4, 5) < the dark edges (z 6) < a copy of your shot, kept only in the middle
   of your chest (z 9) < your cutout (z 10). */
const CONFIG = {
  footage: 'talk',          // the --name of the footage (used to find your face: the room swells out round it)
  background: '',           // a photo of the empty set from the same camera spot, e.g. 'assets/images/empty-room.jpg'; '' = fill the hole by smearing
  zoom: 1.62,               // how much bigger the room is once the lunge lands at f 18
  creep: 1.72,              // how big it ends up after creeping on to the end
  darken: 0.9,              // how dark the edges get (0 = off)
};

FX.comp(() => {
  const { W, H, u } = FX;
  const plate = document.getElementById('plate'), chest = document.getElementById('chest'), cut = document.getElementById('cut');
  plate.style.zIndex = 0;                 // under everything: if any gap is left, your own shot shows there, never black
  const rooms = ['room', 'room2', 'room3'].map((id) => document.getElementById(id));
  cut.style.zIndex = 10;
  // tighten the cutout's edge, then a faint shadow so you sit IN the room rather than on top of it
  cut.style.filter = `${FX.choke(2 * u)} drop-shadow(0 0 ${14 * u}px rgba(0,0,0,0.22))`;

  // the zoom centre: the middle of your face, so the room swells out round your head
  const S = FX.subject(CONFIG.footage), at = [0, 0.25, 0.5, 0.75, 1].map((t) => t * FX.END);
  const hs = at.map((f) => S.head(f)), bs = at.map((f) => S.body(f));
  const avg = (a, k) => a.reduce((n, o) => n + o[k], 0) / a.length;
  const OX = avg(hs, 'x'), OY = avg(hs, 'y');

  // a copy of your shot stays, at normal size, only in the middle of your chest, just under the cutout. Anything in front of you
  // (a mic, a hand on the desk) is part of the room, so the cutout has a hole there; this shows it in place instead of
  // the room flying past behind it.
  const cx = (avg(bs, 'left') + avg(bs, 'right')) / 2, rx = (avg(bs, 'right') - avg(bs, 'left')) * 0.4;
  const ry = Math.max(10 * u, H - (avg(hs, 'top') + avg(hs, 'h') * 1.2));
  chest.style.zIndex = 9;
  chest.style.webkitMaskImage = chest.style.maskImage = `radial-gradient(${rx}px ${ry}px at ${cx}px ${H}px, #000 70%, transparent 100%)`;

  // the hole filler. Blurring the room smears its colours into the hole, but leaves it half see-through; this filter then
  // turns the smear fully solid. A heavy blur fills deep inside the hole, lighter ones fill near its edge, and the sharp room
  // goes back on top with its hole edge softened, so the sharp room melts into the fill instead of drawing your outline.
  const fid = 'vertigo-fill', svg = FX.svg('svg', FX.root, { width: 0, height: 0 });
  Object.assign(svg.style, { position: 'absolute', width: 0, height: 0 });
  const blurs = [[160, 90], [60, 14], [20, 4]].map(([sd, k], i) => `<feGaussianBlur in="SourceGraphic" stdDeviation="${(sd * u).toFixed(1)}" result="b${i}"/>
    <feComponentTransfer in="b${i}" result="f${i}"><feFuncA type="linear" slope="${k}"/></feComponentTransfer>`).join('');
  svg.innerHTML = `<filter id="${fid}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">${blurs}
    <feMorphology in="SourceAlpha" operator="erode" radius="${(8 * u).toFixed(1)}" result="ea"/>
    <feGaussianBlur in="ea" stdDeviation="${(8 * u).toFixed(1)}" result="fa"/>
    <feComposite in="SourceGraphic" in2="fa" operator="in" result="soft"/>
    <feMerge><feMergeNode in="f0"/><feMergeNode in="f1"/><feMergeNode in="f2"/><feMergeNode in="soft"/></feMerge></filter>`;

  let bg = null;
  if (CONFIG.background) {               // a photo of the empty set goes under the room and shows through the hole instead
    bg = FX.el('img', null, { zIndex: 2, transformOrigin: `${OX}px ${OY}px` }, 'fill');
    bg.src = CONFIG.background;
  }
  rooms.forEach((r, k) => Object.assign(r.style, { zIndex: 3 + k, transformOrigin: `${OX}px ${OY}px`, opacity: k ? 0 : 1 }));

  // the dark edges: a soft ring round the frame that swells with the move, so the room seems to tunnel in
  const vig = FX.el('div', null, { position: 'absolute', inset: '0', zIndex: 6,
    background: `radial-gradient(ellipse 70% 75% at ${OX}px ${OY + 80 * u}px, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)` });

  // the room's size over time: lunges to `zoom` by f 18 (fast, then easing off), then creeps on to `creep` at the end
  const scaleAt = (f) => f <= 18 ? FX.mix(1, CONFIG.zoom, 1 - Math.pow(1 - FX.lin(f, 0, 18), 2.2))
    : FX.mix(CONFIG.zoom, CONFIG.creep, FX.lin(f, 18, FX.END));

  return (f) => {
    const s = scaleAt(f);
    const v = Math.max(0, scaleAt(f + 0.5) - scaleAt(f - 0.5));   // how fast it is zooming right now
    const ramp = FX.lin(f, 0, 3);
    const blur = (0.4 + ramp * (2.3 + v * 43)) * u;                 // softer the faster it moves, a touch soft after
    rooms.forEach((r, k) => {
      // the lagging copies sit at slightly smaller sizes: together they make a zoom smear while it moves fast
      const sk = s / (1 + k * v * 1.6);
      r.style.transform = `scale(${sk.toFixed(5)})`;
      r.style.filter = (k === 0 && !bg ? `url(#${fid}) ` : '') + `blur(${blur.toFixed(2)}px)`;
      if (k) r.style.opacity = (ramp * Math.min(0.3, v * 5) * (1 - k * 0.22)).toFixed(3);
    });
    if (bg) { bg.style.transform = `scale(${s.toFixed(5)})`; bg.style.filter = `blur(${blur.toFixed(2)}px)`; }
    vig.style.opacity = (FX.out(FX.lin(f, 0, 14)) * CONFIG.darken).toFixed(3);
  };
});
