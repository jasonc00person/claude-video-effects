# Couch Wall

**What it looks like:** a wall of your pictures pops up behind you, tile after tile, growing out from behind your head, while you keep talking in front of it.

**Use it when:** you mention your work, your past videos or your results ("I've made 200 of these", "here's everything I've posted this year"). It's instant proof.

**Needs:** footage with `--cutout`. Best with 6 to 12 of your own thumbnails or screenshots in `assets/images/` (16:9 pictures fit the tiles best). No pictures? It draws bold colour cards with short titles instead.

**Example:** [`examples/couch-wall.js`](../examples/couch-wall.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout`
2. Copy `examples/couch-wall.js` to `effects/couch-wall.js`.
3. In `CONFIG`: list their pictures in `images` (paths like `assets/images/thumb-1.jpg`), or leave it empty and write 6 to 8 `titles` that sound like their real video titles.
4. `node fx.mjs snap couch-wall`, look, then `node fx.mjs render couch-wall`.

## Keep these (they make it work)

- **Layers:** their shot, a 35% dark shade so the tiles pop, the wall, then their cutout on top. The wall is always behind them.
- **It grows from behind the head.** Tiles appear in order of distance from the head, so the wall spreads outward from them.
- **Timing:** the first tile at f 1, then one every 0.85 f (faster when there are many), so the whole wall has landed by about f 18. Each tile pops from 55% to full size with a small overshoot over 5 f.
- **It never sits dead:** after landing, every tile creeps 1% bigger until the end.
- **Look of a tile:** 16:9, about a fifth of the frame wide (two fifths on vertical), rounded corners, a thin white border, a soft shadow, a small random tilt of up to 3.5 degrees. A brick pattern, rows offset by half a tile.

## Make it yours

- Fewer, bigger tiles for a calmer look: raise the tile width (`tw`).
- Reel covers instead of thumbnails: make the tiles 9:16 (`th = tw * 16 / 9`) and use fewer rows.
- A wall that fills the whole frame: raise `bottom` to `H`.

## If it looks off

- Tiles cover the face: they shouldn't, they're behind the cutout. If they do, the footage was made without `--cutout`.
- A pale fuzz round the hair: raise the choke to `FX.choke(4 * u)`.
