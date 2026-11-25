# Digital Zoom

**What it looks like:** the camera slams in on your face in hard, fast punches: in, then tighter, then back out and in again. Each punch smears for a split second, then the picture is sharp and still.

**Use it when:** you hit the key word or the punchline ("and it did it in ten seconds"), or you want energy on a line that is just you talking. It's the cheapest way to make a plain shot feel edited.

**Needs:** nothing. No cutout and no pictures. If the footage was made with `--cutout` it zooms into the measured middle of your face; without it, it zooms to `CONFIG.center`.

**Example:** [`examples/digital-zoom.js`](../examples/digital-zoom.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second>` (add `--cutout` if you want the zoom aimed at the face for you)
2. Copy `examples/digital-zoom.js` to `effects/digital-zoom.js`.
3. In `CONFIG`: without `--cutout`, look at a still and set `center` to the middle of the face (0.5 is the middle of the frame, 0.38 is a bit above the middle). Move the keys in `zooms` so the punches land on the words that matter.
4. `node fx.mjs snap digital-zoom --at 0.1,0.33,0.52,1.25,1.73,2.5`, look, then `node fx.mjs render digital-zoom`.

## Keep these (they make it work)

- **Snaps are 3 f long**, fast and almost straight (no slow ease at the end). That is what makes it feel digital and punchy, not like a smooth camera move.
- **Timing:** first punch from f 1 to f 4 (to 1.35x), a tighter one from f 11 to f 14 (to 1.75x), back out from f 40 to f 43, one more in from f 53 to f 56. So it reads in the first half second and never sits still for long.
- **The smear only while snapping:** two copies of the shot, a fraction of a frame behind, at 30% and 16%, plus a light blur. When it holds, the copies drop away and the picture is sharp.
- **Holds creep:** between snaps the zoom grows a tiny bit (1.35 to 1.37), so a held frame never looks frozen.
- **Zoom into the face**, never the middle of the frame by default: the face stays put while the room jumps round it.

## Make it yours

- One punch only: `zooms: [[0, 1], [1, 1], [4, 1.4], [72, 1.45]]`.
- Harder: raise the second punch toward 2. Past 2 the picture starts to look soft.
- Line the punches up with their words: f 24 is one second into the clip.

## If it looks off

- The zoom lands beside the face: without `--cutout` it aims at `center`, so set that from a still. With `--cutout` the head measurement is off: delete `assets/footage/talk.subject.json` and it uses `center` instead.
- Ghost copies hang on between punches: a big jump is spread over too many f, so it never stops moving. Keep big jumps 3 f long.
- It looks soft when zoomed: the clip is low resolution. Keep the zoom under 1.5.
