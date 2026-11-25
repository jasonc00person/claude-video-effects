# Checklist

**What it looks like:** a dark frosted-glass card appears beside you with a label, a "0 of 3" counter and a thin progress bar. Three steps type in and tick off one by one, while the counter and the bar keep count.

**Use it when:** you list steps or say how easy something is ("all you need to do is...", "three things", "that's it"). By default all three tick in the first second; `ticks` lands each one on its word.

**Needs:** nothing. Footage made with `--cutout` is better: the card then knows where your head is and keeps clear of your face. Without it, it guesses you're in the middle, so check a still.

**Example:** [`examples/checklist.js`](../examples/checklist.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout` (`--cutout` is optional here, see Needs)
2. Copy `examples/checklist.js` to `effects/checklist.js`.
3. In `CONFIG`: write their steps in `rows` (2 to 4, a few words each, in the order they say them), a short `label`, and pick an `accent` colour if they have a brand colour.
4. `node fx.mjs snap checklist`, look, then `node fx.mjs render checklist`.

## Keep these (they make it work)

- **Layers:** their shot, then the card on top. No cutout layer: the card sits in front, so it must never cover the face.
- **Where it goes:** landscape, top left beside them (or the right when that side has clearly more room). Vertical, a wide card (80% of the frame) with its rows a little closer together, above the head, or under the chin when the head is high, always above the bottom fifth of the frame. It takes the biggest size that fits there, with the step words about 40 px at most on either shape.
- **Timing:** the card is already there on the first frame and settles by f 3. Each row types in over 3 f, then ticks; the ticks land about every 6 f, the last one by f 19. The counter and the bar count each tick.
- **The tick:** a round accent dot pops past full size and settles over 4 f, the row lights up behind it and its words turn pale yellow.
- **Look of the card:** dark see-through glass with a blur of the shot behind it, a thin light border, rounded corners, a soft shadow. Grey bars stand in for the words until they type.

## Make it yours

- More or fewer steps: add or remove lines in `rows`. The timing spreads itself so the last tick still lands by about f 19.
- Ticks on the words: if they tell you when they say each step (or you can tell from the moment), put those seconds in `ticks`, one per row, counted from the start of the clip. Each row types in just before its tick.
- Force a spot: set `place` to `'left'`, `'right'`, `'top'` or `'below'`.
- A calmer feel: in `const step = 18 / n`, raise 18 (the f the ticks are spread over) to about 30.

## If it looks off

- The card covers the face: the footage was made without `--cutout`, so it guessed where you are. Make it again with `--cutout`, or set `place` by hand.
- The words look small on vertical: there wasn't room under the chin. Use 3 steps or fewer, or pick a moment where the head sits lower.
- The card is too wide or too small: it grows to fit the longest row, so one long step shrinks everything. Shorten that step.
- The card looks washed out on a bright wall: raise the card's darkness, `rgba(24,26,30,0.58)`, to about 0.75.
