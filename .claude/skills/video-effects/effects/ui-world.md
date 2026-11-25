# UI World

**What it looks like:** a cream AI chat app drops in over the top of the frame and you're standing in it, in front of it. Your clips fall into its message box one after another, a yellow "RAW CLIPS" tag lands, then a command types itself in.

**Use it when:** you talk about handing work to AI ("I just drop my clips in and type one command", "this is how I edit now"). It shows the workflow in one second.

**Needs:** footage with `--cutout`. Best with 5 stills from their own clips in `assets/images/`: `node fx.mjs stills "<their video>" --count 5` makes them. No pictures? It draws coloured clip cards with a little figure on them.

**Example:** [`examples/ui-world.js`](../examples/ui-world.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout`
2. Copy `examples/ui-world.js` to `effects/ui-world.js`.
3. In `CONFIG`: list their stills in `images` (paths like `assets/images/clip-01.jpg`), set `command` to what they'd really type, and `name` to the app they use.
4. `node fx.mjs snap ui-world`, look, then `node fx.mjs render ui-world`.

## Keep these (they make it work)

- **Layers:** their shot, the cream world, the app, then their cutout on top. They stand in front of the app, never behind it.
- **It moves out of their way.** On a wide frame the app owns the left and their shot grows 1.3 times and slides right, so the head lands about two thirds across. On a vertical or square frame the app sits across the top and their shot slides down until the hair clears the box; the cream covers the gap it leaves.
- **Timing:** the cream drops in from the top over f 0 to 6 while their shot slides, so the first frame is exactly their video. The app fades in by f 4, the drop zone fades over f 5 to 8, a clip lands every 1.6 f from f 3 (each falls for 5 f with a small bounce), the tag pops over f 13.5 to 17, the command types from f 16.5 at one letter every 0.55 f, then the send button pulses and the caret blinks.
- **Look:** a soft cream gradient over about two thirds of the frame, a white rounded box with a dashed drop zone, tall clip cards with a white edge, the command in mono, an orange send button, a yellow tag tilted 4 degrees.

## Make it yours

- Their own app: change `name` and `accent` (the drawn mark and send button take the colour).
- Another command: keep it under about 16 letters so it fits the box.
- Screenshots instead of clips: any pictures work in `images`, they're cropped to tall cards.

## If it looks off

- The app is hidden behind their head: the head measurement is off. Look at a still and check the footage was made with `--cutout`.
- A thin light line round the hair against the cream: raise the choke to `FX.choke(4 * u)`.
- The command runs past the box: shorten it.
