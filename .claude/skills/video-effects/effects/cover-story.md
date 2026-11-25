# Cover Story

**What it looks like:** your shot turns into a magazine cover. A huge white masthead rises in letter by letter behind your head, then the cover lines settle into the corners: an issue line, a red EXCLUSIVE tag with the story, a big number and a barcode.

**Use it when:** you're making a big claim, a reveal or a "this changed everything" moment ("this is the future of editing", "I'm in the news"). It makes the moment feel like headline news.

**Needs:** footage with `--cutout`. No pictures needed.

**Example:** [`examples/cover-story.js`](../examples/cover-story.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout`
2. Copy `examples/cover-story.js` to `effects/cover-story.js`.
3. In `CONFIG`: set `masthead` (3 to 8 letters, the topic in one word), the `headline` from what they say, and the small lines. Keep each line short.
4. `node fx.mjs snap cover-story`, look, then `node fx.mjs render cover-story`.

## Keep these (they make it work)

- **Layers:** their shot, a darkening at the top and bottom, the masthead, their cutout, then the cover lines, then the paper vignette, grain and sheen. The masthead is behind them, the small type in front.
- **The masthead fits the frame:** it's measured and sized to about 71% of the width in landscape and 90% on vertical, never taller than about a third of the frame (a sixth on vertical), so any word from 3 to 8 letters works.
- **Behind the head:** in landscape its top sits 13% down and the head overlaps its lower half. On vertical it drops until the top of the head covers its lower third.
- **Timing:** one letter every 1.6 f from f 1, each rising out of its own baseline over 5 f with a small stretch; the letters start spread out and close up by f 11. The rule draws over f 5 to 13, then the cover lines fade up from f 7 to 11.
- **Vertical:** the cover lines stay above the bottom fifth and further from the right edge, where the app's buttons sit.

## Make it yours

- Another look: change the masthead colour (`fill` on the letters) or use `FX.font.poster` for a bold tabloid feel.
- No real number in what they say: set `bigNumber` and `numberLine` to `''`. No barcode: delete its lines in the lower right block.
- A slower reveal: raise the 1.6 f between letters.

## If it looks off

- The masthead is mostly hidden behind the head: the head sits high in the shot. Use a shorter word, or a moment where they sit lower.
- The middle letter hides behind the head and the word misreads ("SE_UP"): pick a word that still reads with its middle covered, or one short enough to clear the head. Check the stills where the head is highest.
- A soft dark patch round the top of the hair, in front of the white letters: the free AI cutout is a rounded shape that takes a little of the wall with it. Raise the choke to `FX.choke(6 * u)` (more starts to blur the hair), or pick a moment against a lighter wall.
- White letters vanish on a bright wall: raise the first two numbers in the top darkening (0.62 and 0.42).
- The small lines overlap on a square frame: shorten `number` and `numberLine`.
