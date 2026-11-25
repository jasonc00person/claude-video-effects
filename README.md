# 17 video effects Claude makes on your own videos

You saw the reel. This is the skill. Give it to Claude, point it at a video of you talking, pick an effect, and you get the clip back with the effect on it and your voice in it.

No editing skills needed. No code. Claude does the work and explains anything you need to do in plain words.

## What you need

- **Claude Code.** That's Claude working right on your computer: the Code tab in the Claude desktop app, or `claude` in a terminal. It comes with a paid Claude plan.
- **A Mac or a Windows PC** (Linux works too).
- **A video of you talking.** Phone or camera, vertical or horizontal, both work.

That's it. Your computer also needs two free video tools (Node.js and ffmpeg). If they're missing, Claude spots it and walks you through installing them, about 5 minutes, once.

## Get started

Open Claude Code and paste this:

```
Install the video effects skill from https://github.com/jasonc00person/claude-video-effects for me, then check my computer is ready to make effects.
```

Claude downloads it, checks your computer, and tells you if anything needs installing. When it says you're all set, ask for an effect:

```
Put the Couch Wall effect on my video at 0:12
```

Drag your video file into the chat so Claude knows where it is. A few minutes later you have the clip.

## The 17 effects

| Effect | What it does |
|---|---|
| **Orbit** | little phone screens circle around you, passing behind and in front |
| **Couch Wall** | a wall of your thumbnails builds up behind you |
| **UI World** | an AI chat app takes over the frame with you standing in it |
| **Frame Break** | your shot shrinks into a phone post and your head pops out of the top |
| **Digital Zoom** | hard punch-ins on your face |
| **Phone Mockup** | a phone slides up next to you and a tap lands on its screen |
| **Checklist** | a glass card ticks off three steps |
| **Headline Wall** | paper headlines slap onto the wall behind you |
| **Zoom Through** | the camera rushes into your face and out onto the next shot |
| **Chart Grow** | a glowing chart climbs up the wall behind you |
| **Pullback Reveal** | the camera pulls back and your shot is a video inside an editing app |
| **Green Screen** | your room disappears and you're standing in front of an app |
| **Paper Cut** | you turn into a paper cut-out on a notebook collage |
| **Doodle Boil** | a hand-drawn outline and doodles wobble around you |
| **Vertigo** | the room lunges at you while you stay put |
| **Cover Story** | you're on a magazine cover with the title behind your head |
| **Glass Type** | big 3D glass letters swing in behind you |

Not sure which one? Tell Claude what you're saying in that moment and ask it to pick.

## What you get

An MP4 of that moment (about 3 seconds) with the effect on it and your own audio. Drop it into CapCut, Premiere, Final Cut or whatever you edit in, on top of the same spot in your video. It lines up.

## How it works

Claude cuts the moment out of your video, cuts you out of the background with a free AI model that runs on your computer, then builds the effect and renders it with [HyperFrames](https://github.com/heygen-com/hyperframes), a free open-source tool that turns web pages into video. Your video never gets uploaded anywhere.

Want to tweak one? Just say it: "make the title bigger", "use my thumbnails instead", "slower", "put it on the left". Claude changes it and renders again.

## Other ways to install

- **Already cloned this folder?** Open Claude Code inside it and the skill is ready. Ask for an effect.
- **By hand:** copy the folder `.claude/skills/video-effects` into `~/.claude/skills/` (on Windows: `C:\Users\<you>\.claude\skills\`). It's then there in every Claude Code session.

## If something goes wrong

Tell Claude what happened. It knows how to fix the usual stuff (a missing tool, a failed render, a cutout with fuzzy edges). The full check it runs is `node fx.mjs check`.

## For Claude: installing this skill

1. Download this repo: `git clone --depth 1 https://github.com/jasonc00person/claude-video-effects ~/claude-video-effects` (no git? download `https://github.com/jasonc00person/claude-video-effects/archive/refs/heads/main.zip` and unzip it there).
2. Copy `.claude/skills/video-effects` from it to the user's personal skills folder, `~/.claude/skills/video-effects`, so it works in every project. Ask first.
3. Read `~/.claude/skills/video-effects/SKILL.md` and do its Step 1 (the setup check) right away, in this session.
4. To update later: pull (or download) again and copy the folder over the old one.

## Credits

Made by [Jason Cooperson](https://www.youtube.com/@jasoncooperson). Rendering by [HyperFrames](https://github.com/heygen-com/hyperframes) (Apache 2.0). The code here is MIT licensed. The fonts are free fonts under the SIL Open Font License, with their licences in `.claude/skills/video-effects/kit/assets/fonts/`. Not affiliated with Anthropic.
