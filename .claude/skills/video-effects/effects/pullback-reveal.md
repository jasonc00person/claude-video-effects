# Pullback Reveal

**What it looks like:** it starts as your normal shot, then the camera pulls back to show it's a video inside a light editing app: a window with a file name, an assistant panel ticking off its steps, a render bar filling up and turning green, and a big percent counter racing to 100%.

**Use it when:** you say AI made this video, or show how fast it was done ("Claude edited this whole video", "this took two minutes"). The reveal is the proof.

**Needs:** nothing but the footage (no cutout). On vertical, footage made with `--cutout` lets it tuck the panel under the chin; without it, it guesses where the head is.

**Example:** [`examples/pullback-reveal.js`](../examples/pullback-reveal.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second>` (add `--cutout` on vertical)
2. Copy `examples/pullback-reveal.js` to `effects/pullback-reveal.js`.
3. In `CONFIG`: write 3 to 5 short `steps` about what was really done to this video, and a `file` name that sounds like theirs.
4. `node fx.mjs snap pullback-reveal`, look, then `node fx.mjs render pullback-reveal`.

## Keep these (they make it work)

- **The first frame is their shot, full frame.** The video in the window has the same shape as the frame, so the pull starts seamless and lands it in the window.
- **Layers:** a cream desk, the window, their shot in it, the render bar under it, then the panel and counter on top.
- **Wide:** the window on the right, the panel over its left edge, the counter top left. **Vertical or square:** the window centred and narrower, the counter above it, the panel over its lower left just under the chin, and the render bar above the bottom fifth.
- **Timing:** the pull runs over f 1 to 13.5 (a quick start, a soft landing), then drifts 2.5% closer until the end so it never sits dead. The panel slides in over f 5 to 11 and the counter rises in over f 4 to 8. Each step spins for 3 f then pops a green tick, the first at f 9 and one every 3 f. The bar fills from f 5 to 18.5, then turns green over 2 f while the counter pops at 100% and the tag flips to done.
- **Look:** cream background, soft shadows, three window dots, a blue waveform bar that turns green, a tall elegant serif counter, a small orange mark beside the assistant's name.

## Make it yours

- Their own steps: keep each under about 20 letters so it stays on one line.
- Another app name: `title` (the title bar and panel), `accent` for the mark's colour.
- Faster or slower: change the pull's span (`FX.lin(f, 1, 13.5)`) and the fill's (`FILL0`, `FILL1`) together.

## If it looks off

- The panel covers the face on vertical: make the footage with `--cutout` so it knows where the chin is.
- A step wraps or runs out of the panel: shorten it.
- The counter overlaps the window on a square frame: it shrinks to fit the space above, so shorten the window instead (`VW`).
