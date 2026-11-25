# Headline Wall

**What it looks like:** paper notes and headline clippings slap onto the wall behind you, one after another, fast, until the wall is full: newspaper scraps, sticky notes, dark cards, chat bubbles, posts and torn clippings, held up with tape and pins.

**Use it when:** you say everyone is talking about something ("this is all over the internet", "everyone's asking the same question"). The wall filling up is the buzz.

**Needs:** footage with `--cutout`.

**Example:** [`examples/headline-wall.js`](../examples/headline-wall.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout`
2. Copy `examples/headline-wall.js` to `effects/headline-wall.js`.
3. In `CONFIG`: write 10 to 16 `headlines` about their topic, each with a `kind`, most important first (a vertical frame uses only the first 8). Mix the kinds: a few `serif`, a few `hand`, a couple each of `dark`, `big` and `strip`, one or two `chat`, `tweet` and `torn`. Set `paper` (the masthead), and `name` and `handle` for the tweet notes.
4. `node fx.mjs snap headline-wall`, look, then `node fx.mjs render headline-wall`.

## Keep these (they make it work)

- **Layers:** their shot, a 28% dark shade, the notes, then their cutout on top. The notes are always behind them.
- **The layout is worked out from the shot:** for each note it tries 90 spots and keeps the one that stays most in view (not hidden behind the person), overlaps the notes already up the least, and fills an empty stretch of wall, near the head. The first headlines get the best spots.
- **Vertical: fewer, bigger notes, all readable.** Only the first 8 headlines are used (`verticalCount`), every headline is set at least 36 px, and a note is left out when it has no spot where it stays in view and clear of the other notes. Readable beats complete: on a tight close-up expect 5 to 7.
- **Timing:** the first note slaps on at f 1, then one every 0.95 f (faster when there are many), outward from just above the head, so the wall is full by about f 17.
- **The slap:** each note lands from 135% down to full size over 3.2 f, with an extra 7 degree twist that straightens. Then every note creeps 1% bigger until the end, so it never sits dead.
- **Look of the notes:** cream paper, a deep shadow, a random tilt of up to 6 degrees. Each kind has its own type: a magazine serif, handwriting in blue ink, heavy sans on black, an italic serif on a torn edge. Tape or a red pin holds most of them.

## Make it yours

- A fuller or calmer wall: add or remove headlines.
- A different layout: change the number in `FX.rng(11)` for a new arrangement of the same notes.
- Their own brand of paper: change the colours in `CREAM`.

## If it looks off

- Notes cover the face: they can't, they're behind the cutout. If they do, the footage was made without `--cutout`.
- Fewer notes than you listed on vertical: the ones with no readable spot were left out. Put the ones that matter first, or keep their headlines short.
- A note is mostly hidden behind them: it's the depth working. If it's an important one, move it higher in the list.
- A pale fuzz round the hair: raise the choke to `FX.choke(4 * u)`.
