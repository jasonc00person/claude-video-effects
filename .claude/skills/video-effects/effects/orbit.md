# Orbit

**What it looks like:** little phone screens circle you on a tilted ring round your chest. They pass behind you on the far side, smaller and darker, and swing in front of your chest on the near side.

**Use it when:** you talk about your content, your clients or your apps ("I post on five platforms", "these are all my reels this month"). It says "all of this revolves around me" without a word.

**Needs:** footage with `--cutout`. Best with 5 to 8 of your own tall pictures (reel covers, phone screenshots, posts) in `assets/images/`. No pictures? It draws bold colour cards with short titles instead.

**Example:** [`examples/orbit.js`](../examples/orbit.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout`
2. Copy `examples/orbit.js` to `effects/orbit.js`.
3. In `CONFIG`: list their pictures in `images` (paths like `assets/images/reel-1.jpg`), or leave it empty and write 5 to 7 short `titles` (two to four words each) that sound like their real reels.
4. `node fx.mjs snap orbit`, look, then `node fx.mjs render orbit`.

## Keep these (they make it work)

- **Layers:** their shot, the cards on the far half of the ring, their cutout, then the cards on the near half. A card switches from behind to in front as it comes round the side.
- **Depth:** a card at the back is half size and 55% darker, a card at the front is a little over full size and clean. This is what sells the 3D.
- **Placement from the head:** the ring is centred on the head, about two head heights wide (narrower on vertical, so it stays in the frame), and flat (its height is a fifth of its width). Its centre sits low enough that a card at the very front starts below the chin.
- **Timing:** the cards pop in one after another, 0.3 f apart, each growing from 62% with a small overshoot over 4 f, so the whole ring is there by about f 6. One lap takes 104 f, so it never stops moving.
- **Look of a card:** 9:16, rounded corners, a thin off-white border, a soft shadow, a small lean (up to 5 degrees) that follows its side of the ring.

## Make it yours

- Spin faster or slower: change `lap` (lower is faster; under 60 starts to look frantic).
- More or fewer cards: `count`. Five reads calmer, nine looks busy.
- A steeper ring: change `tilt` (0 is level).
- Bigger cards: raise the `0.48` in the line that sets `cw`.

## If it looks off

- Cards go in front of the face: the head was measured wrong. Look at a still, then set `head.y` and `head.h` by hand.
- Cards at the back show in front of their body: the footage was made without `--cutout`.
- A pale fuzz round the hair: raise the choke to `FX.choke(4 * u)`.
