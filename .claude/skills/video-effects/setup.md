# Getting a computer ready (once)

The effects need two free tools:

- **Node.js** (version 22 or newer): runs the effects engine.
- **ffmpeg**: cuts, reads and writes video.

Everything else (HyperFrames, the render browser, the AI model that cuts the person out) downloads by itself the first time it's used.

Walk the person through it one step at a time. Say what each step does in a sentence, run what you can yourself (ask first), and tell them exactly what to click or type for anything you can't do (a password, an installer window). After each install, check it worked before moving on.

## Mac

1. **Homebrew** (the standard way to install tools on a Mac). Check with `brew --version`.
   - Missing: tell them "This installs Homebrew, the free tool Macs use to install things like this. It asks for your Mac password, which you type yourself (nothing shows while you type, that's normal)." They paste this into the Terminal app themselves, since it needs their password:
     ```bash
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```
     At the end Homebrew prints two or three "Next steps" lines starting with `echo` and `eval`: they run those too (or you do, from what they paste back). Then check `brew --version` again.
2. **Node and ffmpeg**, one command, you can run it:
   ```bash
   brew install node ffmpeg
   ```
   It takes a few minutes.
3. Check: `node --version` (v22 or higher) and `ffmpeg -version`.

## Windows

1. **Node and ffmpeg**, with winget (built into Windows 10 and 11). You can run these:
   ```bash
   winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
   winget install --id Gyan.FFmpeg -e --accept-source-agreements --accept-package-agreements
   ```
   If a window pops up asking "Do you want to allow this app to make changes", they click Yes.
2. **Restart so Windows finds them:** they close Claude Code completely and open it again (new tools only show up in a fresh window). Then come back to this chat or start a new one and say "continue the setup".
3. Check: `node --version` (v22 or higher) and `ffmpeg -version`.

No winget? They install Node from nodejs.org (the big LTS button, then click through the installer). For ffmpeg, walk them through the "release essentials" zip from https://www.gyan.dev/ffmpeg/builds/: unzip it somewhere permanent (like `C:\ffmpeg`) and add its `bin` folder to their PATH, then restart Claude Code.

## Linux

```bash
sudo apt install nodejs ffmpeg      # Ubuntu, Debian (check node is 22+; if not, use nodesource.com or nvm)
sudo dnf install nodejs ffmpeg      # Fedora
```

## Then

```bash
node SKILL_DIR/kit/fx.mjs check
```

If the only ❌ is the render browser, run `node SKILL_DIR/kit/fx.mjs check --fix` (one download, about 200 MB). When it says "All set", go back to Step 2 of SKILL.md.

## If an install fails

- "command not found" right after installing: the terminal is older than the install. Close and reopen Claude Code (Windows), or run the Homebrew "Next steps" lines (Mac).
- Homebrew asks for Xcode Command Line Tools: let it install them (a system window), then run the Homebrew line again.
- Something fails twice: stop, tell them what the error says in plain words, and point them to the tool's own site (nodejs.org, ffmpeg.org, brew.sh).
