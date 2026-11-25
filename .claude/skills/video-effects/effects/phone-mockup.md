# Phone Mockup

**What it looks like:** a phone slides up beside you showing an AI assistant's chat: a message, then a card with its recommendation, three thumbnails with bars, and an Approve button. A touch lands on Approve, it turns to "Approved" and the bars move.

**Use it when:** you talk about an AI doing work for you, or a decision made in one tap ("it just tells me what to do", "I approve it from my phone"). It shows the moment instead of describing it.

**Needs:** nothing. Footage made with `--cutout` is better: the layout then knows where your head is and keeps the phone clear of it. Optional: three of their own pictures for the thumbnails.

**Example:** [`examples/phone-mockup.js`](../examples/phone-mockup.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout` (`--cutout` is optional here, see Needs)
2. Copy `examples/phone-mockup.js` to `effects/phone-mockup.js`.
3. In `CONFIG`: the `app` name, the first `message`, the `recommendation` (two short lines at most), the three `items`, and the `button` words. Put three pictures in `images` (paths like `assets/images/ad-1.jpg`) or leave it empty for colour blocks.
4. `node fx.mjs snap phone-mockup`, look, then `node fx.mjs render phone-mockup`.

## Keep these (they make it work)

- **Layers:** their shot, a soft shade on the phone's side, then the phone. No cutout layer.
- **Their shot makes room:** it pushes in at least 1.1x from the phone's edge, so they slide away from it, and further if the face would still touch the phone. Landscape: they move sideways, the phone stands tall on the roomier side (85% of the frame height). Vertical: they move up, and a smaller phone rises into the lower half on the left, away from the app's like and share buttons, with Approve above the bottom fifth.
- **Timing:** the phone is already half way up on the first frame and lands by f 9 with a small overshoot and a lean that straightens from 6 to 2 degrees. The message fades in at f 4, the card at f 5.5, the big line sharpens by f 11.
- **The tap:** the touch comes in from f 10.5, presses from f 14 to 17.5 (the button shrinks a little with it), and the button reads "Approved" from f 16. The bars move from f 17 to 26, and item 3's picture dims.
- **Look of the phone:** drawn, not a picture: dark metal edge, black bezel, a camera notch, a status bar, a soft glare that breathes. The app mark is a drawn orange sparkle on a cream circle.

## Make it yours

- A different story: change the words and the bars. `from` and `to` are how full each bar is before and after the tap (0 to 1).
- Put the phone on the other side: set `side` to `'left'` or `'right'`.
- Your brand: change `accent`, and the sparkle colour (`#D97757`) in the header.

## If it looks off

- The phone covers the face: the footage was made without `--cutout`, so it guessed where you are. Make it again with `--cutout`.
- The words spill out of the card: shorten the `recommendation` or the `items`.
- The top of the head is cut off on vertical: the shot had to push in a lot to clear the phone. Pick a moment where they sit lower in the frame.
