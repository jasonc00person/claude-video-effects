# Paper Cut

**What it looks like:** the whole shot turns into a paper collage on notebook paper. You become a paper cut-out with a thick white border, nudging on 2s like stop motion, while ransom-note letters stamp in one by one and a red pen circles them.

**Use it when:** you say a number or a short punchy word you want to land ("100%", "10X", "FREE", "NOPE"). It's playful, so it suits a hook, a hot take or a result.

**Needs:** footage with `--cutout` (the paper hides your real background, so the cutout is all that's left of the shot). No pictures needed.

**Example:** [`examples/paper-cut.js`](../examples/paper-cut.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout`
2. Copy `examples/paper-cut.js` to `effects/paper-cut.js`.
3. In `CONFIG`: set `word` to what they say in that moment, 2 to 6 characters (a space counts as a gap).
4. `node fx.mjs snap paper-cut`, look, then `node fx.mjs render paper-cut`.

## Keep these (they make it work)

- **Layers:** grid paper and grain, the collage (hatching, a torn yellow scrap, a kraft strip, doodles), then their cut-out, then the letters and the pen on top. Everything but the letters sits behind them.
- **The cut-out edge:** a white paper border about 16 units wide with a rough torn wobble and a soft shadow down and right. It comes from an SVG filter on the cutout, after the usual choke.
- **Stop motion:** the cut-out, the tape and the doodles all change on 2s (every second f), never smoothly. The doodles are three hand-drawn copies that take turns.
- **Timing:** one letter stamps down from twice its size every 2.5 f from f 1 (quicker for long words), each in 3 f with a small twist. The pen circle draws over f 11 to 19.
- **Where the word goes:** beside the head in landscape (left unless the right has clearly more room), above the head on vertical and square frames, sized to fit the room and kept clear of the head over the whole clip. The rest of the collage takes the other side.

## Make it yours

- Different colours: change `paper`, `scrap` and `pen` in `CONFIG`.
- A calmer cut-out: lower the 10 and 7 in the stop motion nudge (the `cut.style.transform` line).
- Each letter's look lives in `STYLES`: swap fonts or colours there, one row per character.

## If it looks off

- Bits of the old room show round the cut-out: the cutout grabbed some background. Raise the choke to `FX.choke(4 * u)` or pick a moment with a plainer background.
- The letters are small: the word is long or the head sits high. Use a shorter word, or a moment where they sit lower in the frame.
- The letters touch the hair: the head measurement is off. Look at a still and lower `boxY`.
