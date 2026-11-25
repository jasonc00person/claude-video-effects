# Frame Break

**What it looks like:** your full shot shrinks into a dark phone post (side buttons, handle, caption) floating on a blurred copy of itself, and your head pops out past the top of the post, as if you're leaning out of your own video.

**Use it when:** you talk about a post, a reel or your content itself ("this video got a million views", "here's the reel that changed everything"). It turns the clip into the post you're talking about.

**Needs:** footage with `--cutout`. Nothing else: the blurred ground is a second copy of their own shot (the `bg=` on the first line).

**Example:** [`examples/frame-break.js`](../examples/frame-break.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout`
2. Copy `examples/frame-break.js` to `effects/frame-break.js`.
3. In `CONFIG`: put their own handle in `handle` (only if they give it) and a short `caption` that fits what they're saying.
4. `node fx.mjs snap frame-break`, look, then `node fx.mjs render frame-break`.

## Keep these (they make it work)

- **Layers:** the blurred shot, a dark tint, the post with their shot inside, the post's light rim, then their head on top. Only the head breaks out; everything else stays inside the post.
- **The edge sits at the collar.** The post's top edge crosses them at the collar (`edge: 1.1` head heights below the top of the hair), and their shot is scaled so the whole head fits between the top of the frame and that edge.
- **The break-out follows the head every frame**, solid over the hair, soft along the jaw and down the neck, so a chair back beside them fades away and a turn of the head never cuts the face. It stops just under the edge, so the neck covers the rim.
- **Timing:** the shot shrinks into the post over f 0.5 to 11 (slow in, slow out) while the ground blurs and darkens; the rim fades in over f 1 to 5, the shot fades into the post's dark foot over f 4 to 11, and the buttons, handle and caption fade in over f 9 to 14.
- **Look:** a 9:16 post about a quarter of the frame wide on landscape (just over half on vertical), rounded corners, a thin pale rim, a deep shadow; its foot runs off the bottom of a landscape frame. On vertical the handle and caption stay above the bottom fifth.

## Make it yours

- A bigger or smaller post: change `size` (1.2 is a fifth bigger).
- More of them out of the post: lower `edge` to about 0.95 (the edge then crosses the chin); raise it to show the shoulders inside.
- Their real handle and caption: `handle` and `caption`.

## If it looks off

- A chair back or shoulder shows beside the neck: lower `NECK` in the recipe (try 0.22).
- The neck looks faded at one side: raise `NECK` a little (try 0.32), or pick a moment where they face the camera.
- A pale fuzz round the hair: raise the choke to `FX.choke(4 * u)`.
