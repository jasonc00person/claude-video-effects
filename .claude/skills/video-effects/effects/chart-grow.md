# Chart Grow

**What it looks like:** a glowing line chart draws itself on the wall behind you: day labels along the top, a bright line climbing from the lower left to the top right, a dot landing on each point, and a pill with your number popping up near the peak.

**Use it when:** you talk about growth or a result ("my views went up 300% this week", "this is what happened when I started posting daily"). The climb is the proof.

**Needs:** footage with `--cutout` (the line passes behind your head).

**Example:** [`examples/chart-grow.js`](../examples/chart-grow.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout`
2. Copy `examples/chart-grow.js` to `effects/chart-grow.js`.
3. In `CONFIG`: the `labels` along the top (days, weeks, months), one number per label in `values` (their real numbers if they have them; the biggest sits at the top), and the `pill` text (their number, short: "+312%", "100K", "10x").
4. `node fx.mjs snap chart-grow`, look, then `node fx.mjs render chart-grow`.

## Keep these (they make it work)

- **Layers:** their shot, a 32% dark shade so the glow pops, the chart, the pill, then their cutout on top. The line goes behind the head and comes out the other side, so it looks drawn on the wall.
- **Where it sits:** landscape, most of the frame, the floor of the chart two thirds of the way down. Vertical, the floor half way down (`verticalStart`), so the line starts low beside them, passes behind the head and ends high above it on the other side, with the pill above the hair. The start, the end and the pill all show; only the middle goes behind the head.
- **Timing:** the grid fades in by f 4, the labels rise in left to right from f 0.3, the line draws from f 1 to f 14 (eased, so it speeds up through the middle), each dot pops as the line reaches it. The pill pops in from f 10 to 15 with an overshoot and a tilt that straightens. After f 14, a ring pulses out of the peak every second.
- **The glow:** two copies of the line, a wide blurred one underneath and the sharp one on top, plus a bright point leading the line.
- **A rising shape:** the default numbers start slow and shoot up at the end. A chart that climbs late reads as a breakthrough.

## Make it yours

- More or fewer points: add or remove labels and values together.
- A different colour: change `color` (a bright one reads best on a dark shade).
- Weeks or months instead of days: change `labels` (for example `['W1', 'W2', 'W3', 'W4']`) and give one value each.
- A lower start on vertical: raise `verticalStart` to about 0.58 so the line starts beside the shoulder, if nothing there hides it.

## If it looks off

- The line covers the face: the footage was made without `--cutout`, so there's nothing to go behind.
- The start of the line flickers or vanishes on vertical: the cutout kept part of the chair or shoulder there. Lower `verticalStart` (0.45) so the line starts above it.
- The pill hides behind the head (someone sitting far right in the frame): it sits just left of the peak. Shorten the pill text, or move it where `pill.style.left` is set in the recipe.
- A pale fuzz round the hair: raise the choke to `FX.choke(4 * u)`.
