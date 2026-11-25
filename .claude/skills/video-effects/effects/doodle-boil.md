# Doodle Boil

**What it looks like:** a white chalk outline traces round you, a little way out from your edge, and wobbles like hand-drawn animation. Chalky doodles (a clapperboard, a heart, a star, sparkles) draw on around you and wobble the same way.

**Use it when:** the moment is fun or personal ("I love making these", "this is my favourite part"). It adds energy to a plain talking shot without hiding anything.

**Needs:** footage with `--cutout`. No pictures needed.

**Example:** [`examples/doodle-boil.js`](../examples/doodle-boil.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout`
2. Copy `examples/doodle-boil.js` to `effects/doodle-boil.js`. Its first line loads the cutout twice (`cut` and `cut2`): keep both.
3. In `CONFIG`: pick the `doodles` that suit the moment, set `sparkles`, and change the colours if you like.
4. `node fx.mjs snap doodle-boil`, look, then `node fx.mjs render doodle-boil`.

## Keep these (they make it work)

- **Layers:** their shot, the doodles, their cutout, then the outline on top. The doodles sit behind the cutout, so one can never cover the face.
- **How the outline is made:** a second copy of the cutout goes through an SVG filter. It blurs the person's shape, keeps only a band of that blur a set distance outside them (so it's a line, not a fill), roughens it with noise, and adds a chalk texture and a soft dark shadow. A thin second line rides beside the thick one.
- **The boil:** every 2 f the noise gets a new seed, so the whole outline is redrawn with a fresh wobble. The doodles do the same, and the sparkles pulse. Never smooth: on 2s is what makes it look hand-drawn.
- **Timing:** the outline draws on round the head over f 0.3 to 8 (starting bottom left, over the top, down the right). The heart starts at f 0.5, the clapperboard at f 2, the star at f 5, the sparkles from f 7 to 11.
- **Placement:** landscape puts the doodles in the space left and right of the head, vertical uses the band above the head and the strips beside it. All sizes are in units.

## Make it yours

- Outline closer or further out: change `gap` (8 is snug, 16 is loose).
- Wilder wobble: raise the `scale` on the two `feDisplacementMap` lines (18 and 22 units).
- A slower boil: use `Math.floor(f / 3)` for the step (3 f per wobble).

## If it looks off

- Odd loops or blobs in the outline: the cutout caught a bit of the room (a chair, a mic arm). Pick a moment with a cleaner cutout, or accept it: the outline follows whatever the cutout holds.
- No outline at all: the first line must load the cutout as `cut2`, and the footage needs `--cutout`.
- A doodle hidden behind you: move its spot in `place` for that orientation.
