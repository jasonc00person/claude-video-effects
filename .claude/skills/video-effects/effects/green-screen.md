# Green Screen

**What it looks like:** your room keys out in a flash (green, then a white pop) and you're suddenly standing in front of a bright app on a purple background: a focus timer, a big serif line, your task list, and a chat box typing a question.

**Use it when:** you talk about focus, your day, or what AI does for you ("one thing at a time", "I just ask Claude what's next"). The jump out of the room grabs attention in the first frames.

**Needs:** footage with `--cutout`. Works best with nothing in front of them (a mic or desk in front gets cut away with the room).

**Example:** [`examples/green-screen.js`](../examples/green-screen.js)

## Build it

1. `node fx.mjs footage "<video>" --name talk --start <second> --cutout`
2. Copy `examples/green-screen.js` to `effects/green-screen.js`.
3. In `CONFIG`: write their own `headline`, three short `tasks` (the first is the one they're on) and the `message` they'd type, all from what they say in that moment.
4. `node fx.mjs snap green-screen`, look, then `node fx.mjs render green-screen`.

## Keep these (they make it work)

- **The key is instant.** A green flash peaks at f 1.1, the room is gone at f 1.6, the purple fades in over f 1.2 to 2.4, and a soft white pop peaks at f 2.2. Only their cutout stays.
- **Layers:** their shot (only for the first frames), the green flash, the purple background and the app, the white pop, then their cutout on top. They always stand in front of the app.
- **Wide:** the app fills the middle behind them, the list left-aligned so it reads beside them. **Vertical or square:** they slide down (never shrink, so their shoulders stay off the edges) until the big line and the list sit clear above their hair, and the chat box comes in front of them just under the chin, above the bottom fifth.
- **Timing:** the app rises and settles over f 1.5 to 8, the big line fades up over f 4 to 8, the tasks slide in one every 1.5 f from f 5, the message types from f 9 to f 34, the timer counts down one tick a second.
- **Look:** a cream window with three dots and a drawn orange mark, a black timer bar with a mono clock, a tall elegant serif line, the current task boxed in white with an orange tag, the rest greyed with a lock.

## Make it yours

- Their own app and colour: `name` and `accent`.
- A short `headline` (under about 25 letters) reads biggest; a long one shrinks to fit the window.
- Another background: change the three colours in the purple gradient.

## If it looks off

- A hole in their chest or a missing mic: the cutout keeps only people, so anything in front of them disappears with the room. Pick a moment where nothing is in front of them.
- A grey fuzz round a chair or messy hair: raise the choke to `FX.choke(4 * u)`.
- On a wide frame part of the message hides behind them: shorten `message`.
