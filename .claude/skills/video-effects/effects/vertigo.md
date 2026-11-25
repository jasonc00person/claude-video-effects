# Vertigo

**What it looks like:** a dolly zoom, the shot from the horror films. You stay exactly the same size while the room behind you lunges in, hard and smeared, then keeps creeping in. The edges of the frame darken as it swells.

**Use it when:** something hits you ("and then I saw the bill", "that's when it clicked"). It's the feeling of the floor dropping away, so save it for the one big moment.

**Needs:** footage with `--cutout --room` (the room is your background with a hole where you were). Best with a photo of the empty set taken from the same camera spot (`CONFIG.background`). Without one, the hole is filled with the room's own colours smeared in.

**Example:** [`examples/vertigo.js`](../examples/vertigo.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout --room`
2. Copy `examples/vertigo.js` to `effects/vertigo.js`.
3. In `CONFIG`: if they have a photo of the empty room from the same tripod spot, put it in `assets/images/` and set `background`. Otherwise leave it empty.
4. `node fx.mjs snap vertigo --at 0.02,0.12,0.25,0.75,2.9`, look, then `node fx.mjs render vertigo`.

## Keep these (they make it work)

- **The person never changes size.** Only the room moves. Their cutout and the middle of their chest stay exactly as filmed, so anything in front of them (a mic, a hand on the desk) stays put too.
- **It zooms round the face:** the middle of the head is the centre of the zoom, so the room swells out from behind them.
- **Timing:** the room grows from 1x to 1.62x between f 0 and f 18, fastest at the start, then creeps to 1.72x by the end. A smear (two lagging copies of the room and a blur that follows the speed) only while it moves fast.
- **The hole is always filled.** As the room grows, the hole where they were grows bigger than them. It's filled with the empty-set photo, or with smeared room colours made solid, and their own shot sits under everything as a safety net. It never shows black.
- **Dark edges:** a soft dark ring fades in over the first 14 f, so it feels like the room is tunnelling in.

## Make it yours

- A bigger or smaller lunge: `zoom` (1.62) and `creep` (1.72). Under 1.3 it barely reads; over 2 the smear round them gets large.
- No dark edges: `darken: 0`.
- The cleanest result: film 2 seconds of the empty set before they sit down, take one still (`node fx.mjs stills <that clip> --count 1`) and set `background`.

## If it looks off

- A pale haze or a smeared patch round their head and shoulders: that's the filled hole, made from the colours around it. A photo of the empty set fixes it; a smaller `zoom` shrinks it.
- A ghost of a mic or a hand flying off: it sits outside the middle of the chest. Widen the chest area: raise the `0.4` in the line that sets `rx`.
- A pale fuzz round the hair: raise the choke to `FX.choke(4 * u)`.
