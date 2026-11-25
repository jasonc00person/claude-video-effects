// media: plate=assets/footage/talk.mp4 g1=assets/footage/talk.mp4 g2=assets/footage/talk.mp4
/* Digital Zoom: hard punch-ins on your face, like someone slamming a camera's zoom: a 3 f snap in at f 1, a second, tighter
   snap at f 11, a snap back out at f 40 and one more punch-in at f 53. While it snaps, two lagging copies of the shot and a
   touch of blur smear the move; between snaps the picture is sharp and holds (with a tiny creep so it never sits dead).
   Layers: your shot (z 3), with two copies of it on top (z 4 and 5) that only show while it snaps. No cutout needed. */
const CONFIG = {
  footage: 'talk',          // the --name of the footage (used to find your face, if it was made with --cutout)
  center: [0.5, 0.38],      // where to zoom when your face wasn't measured: across, then down, as a fraction of the frame
  // the zoom over time: [f, how big], 1 = normal. A jump of more than 0.1 between two keys is a snap: keep snaps 3 f long
  zooms: [[0, 1], [1, 1], [4, 1.35], [11, 1.37], [14, 1.75], [40, 1.8], [43, 1], [53, 1.02], [56, 1.35], [72, 1.37]],
};

FX.comp(() => {
  const { W, H, u } = FX;
  const vids = ['plate', 'g1', 'g2'].map((id) => document.getElementById(id));
  const [plate, g1, g2] = vids;

  // zoom into the middle of your face: measured from the cutout if there is one, else CONFIG.center
  const S = FX.subject(CONFIG.footage);
  let ox = CONFIG.center[0] * W, oy = CONFIG.center[1] * H;
  if (S.found) {
    const hs = [0, 0.25, 0.5, 0.75, 1].map((t) => S.head(t * FX.END));
    ox = hs.reduce((a, h) => a + h.x, 0) / hs.length; oy = hs.reduce((a, h) => a + h.y, 0) / hs.length;
  }
  vids.forEach((v) => { v.style.transformOrigin = `${ox}px ${oy}px`; });

  // how big the picture is at any f, from CONFIG.zooms; a snap is fast and nearly straight (a digital punch, no float)
  const K = CONFIG.zooms;
  const snap = (t) => 1 - Math.pow(1 - t, 2.2);
  const zoom = (f) => {
    if (f <= K[0][0]) return K[0][1];
    for (let i = 1; i < K.length; i++) {
      const [f1, s1] = K[i], [f0, s0] = K[i - 1];
      if (f <= f1) { const t = (f - f0) / (f1 - f0); return s0 + (s1 - s0) * (Math.abs(s1 - s0) > 0.1 ? snap(t) : t); }
    }
    return K[K.length - 1][1];
  };

  return (f) => {
    const s0 = zoom(f), s1 = zoom(f - 0.3), s2 = zoom(f - 0.6);   // the copies run a moment behind, so they smear the snap
    const v = Math.abs(s0 - s2);                                   // how fast it is snapping right now
    const on = v > 0.01 ? Math.min(1, v * 10) : 0;                 // 0 while it holds, so the held picture stays sharp
    const blur = Math.min(2.3, v * 11.4) * u;
    plate.style.transform = `scale(${s0.toFixed(4)})`;
    g1.style.transform = `scale(${s1.toFixed(4)})`;
    g2.style.transform = `scale(${s2.toFixed(4)})`;
    g1.style.opacity = (0.3 * on).toFixed(3); g2.style.opacity = (0.16 * on).toFixed(3);
    for (const e of vids) e.style.filter = blur > 0.2 * u ? `blur(${blur.toFixed(2)}px)` : 'none';
    // the copies sit ON TOP while it snaps so the smear reads, and drop under the shot when it holds
    plate.style.zIndex = 3; g1.style.zIndex = on ? 4 : 1; g2.style.zIndex = on ? 5 : 2;
  };
});
