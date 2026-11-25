# Zoom Through

**What it looks like:** the camera rushes into your face with a zoom blur, and inside the blur it cuts to something new, which keeps pushing in as it settles. One continuous move forward through the cut, never in and back out.

**Use it when:** you go somewhere ("let me show you", "so I opened Claude", "here's the result"). It's a transition: it carries the viewer from you straight into the thing you're talking about.

**Needs:** something to land on: a second shot (best: a screen recording, a place, a product), or a picture, or nothing at all (then it lands on a drawn title card).

**Example:** [`examples/zoom-through.js`](../examples/zoom-through.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout` (the cutout aims the rush exactly at the face).
2. The second shot: `node fx.mjs footage "<other video>" --name talk2 --start <second> --cutout`. It first shows about a third of a second in, so start it a third of a second before the frame you want to land on, on a moment where nobody is talking (the sound stays the first shot's). Using a picture or the title card instead? Delete `next=` and `b1=` to `b6=` from the first line of the recipe.
3. Copy `examples/zoom-through.js` to `effects/zoom-through.js`. In `CONFIG`: a picture goes in `picture` (`assets/images/...`); for the title card write `title` from what they say (four to six words) and set `name` to the app they mention, or `''`.
4. `node fx.mjs snap zoom-through --at 0.15,0.33,0.38,0.5,2.9`, look, then `node fx.mjs render zoom-through`.

## Keep these (they make it work)

- **Always forward.** The first shot grows from 1x to 7x between f 0.5 and f 8.5, speeding up. The next thing starts at its landing size and keeps growing (to 1.22x of that by f 17, fast then slowing, then a 5% creep to the end). Never let the second half shrink: that reads as a bounce.
- **The cut hides in the blur:** a quick dissolve from f 7.6 to f 9.2, when the first shot is at its most smeared, plus a soft flash on the face that peaks at f 8.4.
- **The zoom blur is 7 copies** of each shot at spreading sizes, each copy weighted so they average evenly, plus a real blur that follows the speed. Fewer copies look like rings.
- **Into the face:** the first shot zooms toward the middle of the head. A second shot made with `--cutout` pushes into its own subject's face, otherwise into the upper middle.
- **A picture is shown whole,** as a card with round corners on a blurred, darkened copy of itself, starting at 74% of the frame, so the push never crops its words.

## Make it yours

- The cut lands at f 8: start the footage so their key word falls about a third of a second in.
- A vertical video: a tall picture or a vertical second shot fills it best. A wide picture shows as a smaller card.
- Different title colours: the card's gradient and the orange (`#ff7a45`) are in the title card block.

## If it looks off

- It seems to zoom back out after the cut: the second shot is a wider view of the same place. Use a different place, a screen, or a picture. If they really want that shot, start it on a tighter part of the video (or cut it with `--size` and `--x` to frame it closer), and tell them the landing will feel like a jump.
- The lips don't match after the cut: the sound is always the first shot's. Land on a shot where nobody is speaking.
- In their edit, the clip ends pushed in on the second shot: put it where their video cuts to that shot anyway, so what follows is the same shot.
- Rings instead of a smooth blur: some `a` or `b` copies are missing from the first line.
