# Glass Type

**What it looks like:** a big 3D word made of glass swings in on the wall behind you. You can see a blurred, brightened copy of your room through the letters, with a thick glass edge, bright rims, and a light sweep gliding across.

**Use it when:** you name the topic or the one word the moment is about ("design", "AI", "workflows"). It works like a title card that lives in your room.

**Needs:** footage with `--cutout`. No pictures needed.

**Example:** [`examples/glass-type.js`](../examples/glass-type.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout`
2. Copy `examples/glass-type.js` to `effects/glass-type.js`. Its first line loads their shot twice (`plate` and `glass`): keep both.
3. In `CONFIG`: set `word` to one short word they say in that moment, in capitals. On vertical, two words stack on two lines.
4. `node fx.mjs snap glass-type`, look, then `node fx.mjs render glass-type`.

## Keep these (they make it work)

- **Layers:** their shot, then the glass sign (a soft shadow on the wall, the extruded edge, the room seen through the letters, the glass face), then their cutout. The word is always behind them.
- **The glass:** the second copy of the shot is blurred, brightened and scaled up 16%, then clipped to the letter shapes, so the room bends through them. Twelve stacked copies make the thick edge; an inner shadow, a rim light, a gloss on the top half and a bright outline make the face.
- **The word fits the frame:** it's measured and sized to about two thirds of the width in landscape (86% on vertical), never taller than about a quarter of the frame, and never taller than the room above the head.
- **Behind the head:** centred on the head, with its lower half (lower third on vertical) behind the top of the head.
- **Timing:** it swings in from turned away and tilted back (62 and 28 degrees) to facing us over f 1 to 10, with a slight overshoot, fading up over f 0.6 to 4. The wall shadow comes in over f 4 to 12. A fast light glint crosses f 6 to 18, then a slow one from f 30 to near the end.

## Make it yours

- Warmer glass: set `tint` to something like `[255, 225, 190]`.
- Clearer glass: lower the blur in the `glass.style` filter (10 units) or the brightness (1.45).
- A gentler entrance: lower the 62 and 28 starting angles.

## If it looks off

- The letters look solid white: the wall behind them is very bright. Lower the brightness to about 1.15, or pick a moment with a darker wall.
- The word sits on the face: it shouldn't, the cutout is on top. If it does, the footage was made without `--cutout`.
- A very long word comes out small: that's the fit. Use a shorter word.
