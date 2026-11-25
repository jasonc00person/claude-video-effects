/* fx.js: the engine every effect runs on. Loaded after #root exists.
   FX.comp(setup): setup() builds the picture ONCE and returns render(f). render(f) draws one moment and must depend on f alone:
   no Math.random (use FX.rng(seed) inside setup), no timers, nothing remembered between calls.
   f is the time in 24ths of a second (f = 24 is one second) on every clip, whatever its frame rate,
   so an effect's timing reads the same at 24, 25 or 30 fps. */
(function () {
  const FX = window.FX = {};
  const root = FX.root = document.getElementById('root');
  FX.W = +root.dataset.width;                 // the frame, in pixels (1920 x 1080, 1080 x 1920 or 1080 x 1080)
  FX.H = +root.dataset.height;
  FX.FPS = +root.dataset.fps;                 // the clip's frame rate
  FX.SECONDS = +root.dataset.duration;
  FX.END = FX.SECONDS * 24;                   // the last f of the clip
  FX.portrait = FX.H > FX.W;
  FX.u = Math.min(FX.W, FX.H) / 1080;         // one unit = 1 px on a 1080 px short side: size things in units and they fit any frame
  const st = document.createElement('style');
  st.textContent = `.fill{width:${FX.W}px;height:${FX.H}px}`;
  document.head.appendChild(st);

  // timing and easing: lin(f, a, b) runs 0 -> 1 between f = a and f = b; the eases shape a 0..1 value
  FX.clamp = (t) => Math.max(0, Math.min(1, t));
  FX.lin = (f, a, b) => FX.clamp((f - a) / Math.max(1e-6, b - a));
  FX.out = (t) => 1 - Math.pow(1 - FX.clamp(t), 3);
  FX.out5 = (t) => 1 - Math.pow(1 - FX.clamp(t), 5);
  FX.inout = (t) => { t = FX.clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  FX.in = (t) => Math.pow(FX.clamp(t), 3);
  FX.back = (t, s = 1.70158) => { t = FX.clamp(t) - 1; return t * t * ((s + 1) * t + s) + 1; };   // overshoots, then settles
  FX.mix = (a, b, t) => a + (b - a) * t;
  FX.rng = (seed) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };  // same "random" every render

  // FX.el('div', parent, {style}, 'class'): make an element (parent defaults to the frame)
  FX.el = (tag, parent, style, cls) => {
    const e = document.createElement(tag); if (cls) e.className = cls;
    Object.assign(e.style, style || {}); (parent || root).appendChild(e); return e;
  };
  // FX.svg('svg' | 'path' | ..., parent, {attributes}): the same for SVG. Pass a parent: FX.root for a top-level <svg>
  // (with no parent the element is made but not put on the page, so a filter defined in it does nothing)
  FX.svg = (tag, parent, attrs) => {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e); return e;
  };
  // a full-frame SVG layer at a z-index
  FX.layer = (z) => {
    const s = FX.svg('svg', root, { width: FX.W, height: FX.H, viewBox: `0 0 ${FX.W} ${FX.H}` });
    Object.assign(s.style, { position: 'absolute', left: 0, top: 0, zIndex: z, overflow: 'visible' });
    return s;
  };

  // fonts: the first four ship with the kit; serif and poster use what the computer has (Didot and Impact on a Mac)
  FX.font = {
    sans: "'Inter', sans-serif",                        // 400, 700, 900
    mono: "'JetBrains Mono', monospace",
    hand: "'Caveat', cursive",                          // handwriting
    italic: "'Playfair Display', Georgia, serif",       // use with font-style italic: an elegant italic serif
    serif: "'Didot', 'Bodoni 72', 'Bodoni MT', 'Playfair Display', Georgia, serif",   // magazine serif
    poster: "Impact, 'Haettenschweiler', 'Arial Narrow', sans-serif",                // tall, heavy, condensed
  };

  // FX.choke(px): a filter that pulls a cutout's edge in by px and softens it, so no light halo from the old background
  // shows round the hair. Use it on the cutout: cut.style.filter = FX.choke(2 * FX.u)
  const chokes = {};
  FX.choke = (px = 2 * FX.u) => {
    const r = Math.max(0.5, Math.round(px * 2) / 2), id = 'fx-choke-' + String(r).replace('.', '_');
    if (!chokes[id]) {
      const s = FX.svg('svg', root, { width: 0, height: 0 });
      Object.assign(s.style, { position: 'absolute', width: 0, height: 0 });
      // where the person runs off the edge of the frame (shoulders at the bottom) the edge is NOT pulled in: a band along
      // the frame's border keeps the cutout as it is, so no see-through strip opens there
      s.innerHTML = `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feFlood flood-color="#fff" result="all"/><feMorphology in="all" operator="erode" radius="${r + 2}" result="inner"/>
        <feComposite in="SourceAlpha" in2="inner" operator="out" result="band"/>
        <feMorphology in="SourceAlpha" operator="erode" radius="${r}" result="e"/>
        <feMerge result="m"><feMergeNode in="e"/><feMergeNode in="band"/></feMerge>
        <feGaussianBlur in="m" stdDeviation="${(r * 0.45).toFixed(2)}" result="b"/>
        <feMerge result="b2"><feMergeNode in="b"/><feMergeNode in="band"/></feMerge>
        <feComposite in="SourceGraphic" in2="b2" operator="in"/></filter>`;
      chokes[id] = true;
    }
    return `url(#${id})`;
  };

  // FX.subject('talk'): where the person is in footage made with --cutout (from assets/footage/talk.subject.json).
  //   .head(f) -> { x, y, top, h }  centre of the head, top of the hair, head height
  //   .body(f) -> { left, top, right, bottom }
  // Without the file it guesses a centred talking head, so check a still.
  FX.subject = (name) => {
    let J = null;
    try { const x = new XMLHttpRequest(); x.open('GET', `assets/footage/${name}.subject.json`, false); x.send(); J = JSON.parse(x.responseText); } catch (e) { J = null; }
    const guessH = [FX.W / 2, FX.H * (FX.portrait ? 0.36 : 0.36), FX.H * (FX.portrait ? 0.27 : 0.16), FX.H * (FX.portrait ? 0.14 : 0.28)];
    const guessB = [FX.W * 0.25, guessH[2], FX.W * 0.75, FX.H];
    const pick = (arr, typ, f) => {
      if (!J) return typ;
      const i = Math.max(0, Math.min(J.frames - 1, Math.round(f / 24 * J.fps)));
      return arr[i] || typ;
    };
    return {
      found: !!J,
      head: (f = 0) => { const h = pick(J && J.head, (J && J.typical.head[0] !== null) ? J.typical.head : guessH, f); return { x: h[0], y: h[1], top: h[2], h: h[3] }; },
      body: (f = 0) => { const b = pick(J && J.body, (J && J.typical.body[0] !== null) ? J.typical.body : guessB, f); return { left: b[0], top: b[1], right: b[2], bottom: b[3] }; },
    };
  };

  FX.comp = function (setup) {
    const id = root.dataset.compositionId;
    window.__timelines = window.__timelines || {};
    const loads = []; document.fonts.forEach((f) => loads.push(f.load().catch(() => null)));
    return Promise.all(loads).then(() => document.fonts.ready).then(() => {
      const render = setup();
      const tl = gsap.timeline({ paused: true }), s = { t: 0 };
      tl.to(s, { t: FX.SECONDS, duration: FX.SECONDS, ease: 'none', onUpdate: () => render(s.t * 24) }, 0);
      window.addEventListener('hf-seek', (e) => render(e.detail.time * 24));
      render(0); window.__timelines[id] = tl;
    });
  };
})();
