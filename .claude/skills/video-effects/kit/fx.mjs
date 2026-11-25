#!/usr/bin/env node
// fx.mjs: the one tool of the video effects kit. Needs Node 22+ and ffmpeg, nothing else to install.
//
//   node fx.mjs init <folder>                      make a new effects project (copies this kit into it)
//   node fx.mjs check [--fix]                      is this computer ready? (--fix downloads the render browser if missing)
//   node fx.mjs footage <clip> --name <n> [--start <s>] [--seconds <s>] [--size auto|landscape|vertical|square]
//                       [--x <0..1>] [--cutout] [--room]   cut the moment you want out of your video (+ a cutout of you,
//                                                  + with --room the background with you removed)
//   node fx.mjs measure <name>                     find where you are in the frame again (footage made with --cutout)
//   node fx.mjs stills <clip> [--count 8]          pull stills from a video into assets/images (stand-in pictures)
//   node fx.mjs build <effect>                     effects/<effect>.js -> compositions/<effect>.html
//   node fx.mjs snap <effect> [--at 0.2,0.6,1.5]   still frames + a contact sheet, to look before rendering
//   node fx.mjs render <effect>                    renders/<effect>.mp4, with the sound of your clip put back in
//
// Every command but init and check runs inside a project folder.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HF = 'hyperframes@0.9.40';                       // the HyperFrames version this kit was built and tested on
const HF_ENV = {
  npm_config_before: '2026-11-13T00:45:00Z',           // freeze its dependencies to what was tested, too
  HYPERFRAMES_SKIP_SKILLS: '1',                        // never install anything outside this project
  HYPERFRAMES_NO_TELEMETRY: '1',
};
const KIT = path.dirname(fileURLToPath(import.meta.url));
const WIN = process.platform === 'win32';
const SIZES = { landscape: [1920, 1080], vertical: [1080, 1920], square: [1080, 1080] };

// ---------- small helpers
const die = (msg) => { console.error('\n✋ ' + msg + '\n'); process.exit(1); };
const q = (a) => (WIN && /[\s"&()]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
function run(cmd, args, opts = {}) {
  const sh = WIN && cmd === 'npx';                     // npx is a .cmd on Windows, which only runs through the shell
  const r = spawnSync(sh ? 'npx.cmd' : cmd, sh ? args.map(q) : args, {
    encoding: opts.binary ? 'buffer' : 'utf8', maxBuffer: 1 << 30, shell: sh,
    env: { ...process.env, ...(opts.env || {}) }, stdio: opts.inherit ? 'inherit' : 'pipe',
  });
  if (r.error) return { code: 127, out: '', err: String(r.error.message) };
  return { code: r.status, out: r.stdout, err: r.stderr ? String(r.stderr) : '' };
}
const hf = (args, inherit = true) => run('npx', ['-y', HF, ...args], { env: HF_ENV, inherit });
function args(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); const v = argv[i + 1]; if (v === undefined || v.startsWith('--')) o[k] = true; else { o[k] = v; i++; } }
    else o._.push(a);
  }
  return o;
}
function probe(file) {
  const r = run('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', file]);
  if (r.code) die(`ffprobe could not read ${file}\n${r.err}`);
  const j = JSON.parse(r.out);
  const v = j.streams.find((s) => s.codec_type === 'video');
  if (!v) die(`${file} has no video in it.`);
  let rot = 0;
  for (const sd of v.side_data_list || []) if (sd.rotation !== undefined) rot = +sd.rotation;
  if (v.tags && v.tags.rotate) rot = +v.tags.rotate;
  const swap = Math.abs(rot) % 180 === 90;
  const [n, d] = (v.avg_frame_rate && v.avg_frame_rate !== '0/0' ? v.avg_frame_rate : v.r_frame_rate).split('/').map(Number);
  return {
    w: swap ? v.height : v.width, h: swap ? v.width : v.height, fps: n / (d || 1), rate: `${n}/${d || 1}`,
    duration: +(j.format.duration || v.duration || 0), audio: j.streams.some((s) => s.codec_type === 'audio'),
    frames: +(v.nb_frames || 0), vduration: +(v.duration || 0),
  };
}
// the frame rate we work at: the clip's own, halved above 30 (smooth enough, renders twice as fast)
function pickRate(fps) {
  const R = [['24000/1001', 23.976], ['24', 24], ['25', 25], ['30000/1001', 29.97], ['30', 30]];
  let f = fps > 31 ? fps / 2 : fps;
  let best = R[0];
  for (const r of R) if (Math.abs(r[1] - f) < Math.abs(best[1] - f)) best = r;
  return best;
}
const inProject = () => { if (!fs.existsSync('assets/fx.js')) die('Run this inside an effects project folder (make one with: node fx.mjs init <folder>).'); };

// ---------- init
function init(o) {
  const dir = o._[1] || die('Say where: node fx.mjs init <folder>');
  if (fs.existsSync(path.join(dir, 'fx.mjs'))) die(`${dir} is already an effects project.`);
  for (const d of ['assets/footage', 'assets/images', 'assets/fonts', 'effects', 'compositions', 'renders', 'snaps']) fs.mkdirSync(path.join(dir, d), { recursive: true });
  fs.copyFileSync(path.join(KIT, 'fx.mjs'), path.join(dir, 'fx.mjs'));
  for (const f of ['fx.js', 'fx.css']) fs.copyFileSync(path.join(KIT, 'assets', f), path.join(dir, 'assets', f));
  for (const f of fs.readdirSync(path.join(KIT, 'assets/fonts'))) fs.copyFileSync(path.join(KIT, 'assets/fonts', f), path.join(dir, 'assets/fonts', f));
  fs.writeFileSync(path.join(dir, '.gitignore'), 'assets/footage/\nrenders/\nsnaps/\ncompositions/\n.preview/\n.hyperframes/\n');
  console.log(`✅ New effects project: ${path.resolve(dir)}\n   Next: cd into it, then  node fx.mjs footage <your clip> --name <name> --start <seconds> --cutout`);
}

// ---------- check
function check(o) {
  const rows = []; let ok = true;
  const add = (good, what, detail, fix) => { rows.push([good, what, detail, fix]); if (!good) ok = false; };
  const nv = process.versions.node.split('.').map(Number);
  add(nv[0] >= 22, 'Node.js', 'v' + process.versions.node, 'Install Node 22 or newer from nodejs.org (the LTS button), then reopen your terminal.');
  const ff = run('ffmpeg', ['-hide_banner', '-version']);
  const fp = run('ffprobe', ['-hide_banner', '-version']);
  add(ff.code === 0 && fp.code === 0, 'ffmpeg', ff.code === 0 ? ff.out.split('\n')[0].split(' ').slice(0, 3).join(' ') : 'not found',
    WIN ? 'Run:  winget install --id Gyan.FFmpeg  then close and reopen your terminal.' : process.platform === 'darwin' ? 'Run:  brew install ffmpeg  (no Homebrew? get it from brew.sh first).' : 'Run:  sudo apt install ffmpeg  (or your system\'s package manager).');
  if (ff.code === 0) {
    const dec = run('ffmpeg', ['-hide_banner', '-decoders']);
    const vpx = /libvpx-vp9/.test(dec.out);
    rows.push([vpx ? true : 'warn', 'ffmpeg can read cutouts', vpx ? 'yes (libvpx-vp9)' : 'no libvpx-vp9 decoder', 'Optional. Without it the kit cannot measure where your head is, so Claude places things by eye.']);
  }
  if (nv[0] >= 22) {
    console.log('Checking HyperFrames (the first time downloads it, about a minute)...');
    const d = hf(['doctor', '--json'], false);
    let doc = null; try { doc = JSON.parse(d.out.slice(d.out.indexOf('{'))); } catch { /* not json */ }
    if (!doc) add(false, 'HyperFrames', 'could not start', 'Check your internet connection, then run this check again.\n' + (d.err || '').slice(-400));
    else {
      add(true, 'HyperFrames', HF.split('@')[1], '');
      // the renderer uses its own browser (a "headless shell"), not the Chrome you browse with: doctor counts your Chrome as
      // fine, but the first render would then download its own anyway, so only the headless shell counts as ready
      const browserReady = (j) => { const c = ((j && (j.checks || j.results)) || []).find((x) => /chrome/i.test(x.name || x.id || '')); return !!c && /headless-shell/i.test(c.detail || ''); };
      let again = browserReady(doc);
      if (!again && o.fix) {
        console.log('Downloading the browser HyperFrames renders with (one time, about 200 MB)...');
        hf(['browser', 'ensure'], false);
        const r = hf(['doctor', '--json'], false); try { again = browserReady(JSON.parse(r.out.slice(r.out.indexOf('{')))); } catch { again = false; }
      }
      add(again, 'Render browser', again ? 'ready' : 'not downloaded yet', 'Run this check again with --fix at the end: it downloads it once (about 200 MB).');
    }
  }
  const free = (() => { try { const s = fs.statfsSync('.'); return s.bavail * s.bsize / 1e9; } catch { return null; } })();
  if (free !== null) rows.push([free > 3 ? true : 'warn', 'Free disk space', free.toFixed(0) + ' GB', 'Free up a few GB: renders and cutouts need room.']);
  console.log('');
  for (const [g, what, detail, fix] of rows) {
    console.log(`${g === true ? '✅' : g === 'warn' ? '⚠️ ' : '❌'} ${what}: ${detail}`);
    if (g !== true && fix) console.log('   → ' + fix);
  }
  console.log(ok ? '\nAll set. You can make effects on this computer.' : '\nNot ready yet: fix the ❌ lines above, then run this check again.');
  process.exit(ok ? 0 : 1);
}

// ---------- footage
function footage(o) {
  inProject();
  const clip = o._[1] || die('Which video? node fx.mjs footage <clip> --name <name>');
  if (!fs.existsSync(clip)) die(`Can't find ${clip}`);
  const name = String(o.name || die('Give it a short name: --name talk'));
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) die('Use a short lowercase name with dashes, like: --name my-intro');
  const src = probe(clip);
  const start = +(o.start || 0), secs = +(o.seconds || 3);
  if (start + secs > src.duration + 0.05) die(`The clip is only ${src.duration.toFixed(1)} s long: --start ${start} --seconds ${secs} runs past its end.`);
  const sz = o.size && o.size !== 'auto' ? o.size : src.w >= src.h ? 'landscape' : 'vertical';
  const [W, H] = SIZES[sz] || die('--size is one of: auto, landscape, vertical, square');
  const [rate, fps] = pickRate(src.fps);
  const N = Math.round(secs * fps);
  // the crop: when the shape changes (a landscape video made vertical, say), centre it on the person, found by the same AI
  // cutout on one still of the moment; --x 0..1 sets it by hand (0 = the left edge of the video, 1 = the right)
  let x = o.x !== undefined ? +o.x : 0.5;
  const sw = src.w * Math.max(W / src.w, H / src.h);
  if (o.x === undefined && sw - W > 4) {
    const cx = findPerson(clip, start + secs / 2);
    if (cx !== null) { x = (cx * sw - W / 2) / (sw - W); console.log(`Found you at ${Math.round(cx * 100)}% across the frame: centring the crop on you.`); }
    else console.log('Could not find you in the frame: cropping the middle (set --x to move it).');
  }
  x = Math.max(0, Math.min(1, x));
  const out = `assets/footage/${name}.mp4`;
  const vf = `fps=${rate},scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H}:(iw-${W})*${x}:(ih-${H})/2,setsar=1,format=yuv420p`;
  console.log(`Cutting ${secs}s from ${start}s of ${path.basename(clip)} → ${W}x${H} at ${fps.toFixed(3).replace(/\.?0+$/, '')} fps...`);
  const r = run('ffmpeg', ['-v', 'error', '-y', '-ss', String(start), '-i', clip, '-t', String(secs), '-frames:v', String(N), '-vf', vf, '-r', rate,
    '-c:v', 'libx264', '-crf', '15', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-ac', '2', '-ar', '48000', '-movflags', '+faststart', out]);
  if (r.code) die('ffmpeg failed:\n' + r.err.slice(-800));
  console.log(`✅ ${out}`);
  if (o.cutout || o.room) {
    console.log('Cutting you out of the background (the first time downloads a small AI model)...');
    const cut = `assets/footage/${name}-cutout.webm`, room = `assets/footage/${name}-room.webm`;
    const c = hf(['remove-background', out, '-o', cut, '--quality', 'best', ...(o.room ? ['--background-output', room] : [])], false);
    if (c.code) die('The cutout failed. Run  node fx.mjs check  and try again.\n' + (c.err || c.out || '').slice(-600));
    console.log(`✅ ${cut}` + (o.room ? `\n✅ ${room} (the room with a see-through hole where you were)` : ''));
    measure(cut, name, W, H, fps);
  }
}

// where across the frame the person's head is, from one still: 0 = left edge, 1 = right edge (null if no one found)
function findPerson(clip, t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fx-aim-')), still = path.join(dir, 'still.png'), cut = path.join(dir, 'cut.png');
  try {
    if (run('ffmpeg', ['-v', 'error', '-y', '-ss', t.toFixed(2), '-i', clip, '-frames:v', '1', '-vf', 'scale=640:-2', still]).code) return null;
    if (hf(['remove-background', still, '-o', cut], false).code || !fs.existsSync(cut)) return null;
    const r = run('ffmpeg', ['-v', 'error', '-i', cut, '-vf', 'alphaextract,scale=160:-2', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { binary: true });
    if (r.code || !r.out.length) return null;
    const w = 160, h = Math.floor(r.out.length / w), F = r.out;
    let T = -1; for (let y = 0; y < h && T < 0; y++) for (let xx = 0; xx < w; xx++) if (F[y * w + xx] > 127) { T = y; break; }
    if (T < 0) return null;
    let m = 0, sx = 0; for (let y = T; y < Math.min(h, T + Math.round(h * 0.15)); y++) for (let xx = 0; xx < w; xx++) if (F[y * w + xx] > 127) { m++; sx += xx; }
    return m ? sx / m / w : null;
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

// where the person is in every frame, read from the cutout's transparency -> assets/footage/<name>.subject.json
function measure(cut, name, W, H, fps) {
  const k = 4, w = Math.round(W / k), h = Math.round(H / k);
  const r = run('ffmpeg', ['-v', 'error', '-c:v', 'libvpx-vp9', '-i', cut, '-vf', `alphaextract,scale=${w}:${h}`, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { binary: true });
  if (r.code || !r.out || !r.out.length) { console.log('⚠️  Could not measure where you are in the frame (ffmpeg has no libvpx-vp9). Place things by eye from a still.'); return; }
  const buf = r.out, n = Math.floor(buf.length / (w * h)), head = [], body = [];
  for (let i = 0; i < n; i++) {
    const F = buf.subarray(i * w * h, (i + 1) * w * h), cnt = new Array(h).fill(0), sx = new Array(h).fill(0);
    let L = w, R = -1, T = -1, B = -1;
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) if (F[y * w + xx] > 127) { cnt[y]++; sx[y] += xx; if (xx < L) L = xx; if (xx > R) R = xx; if (T < 0) T = y; B = y; }
    if (T < 0) { head.push(null); body.push(null); continue; }
    // the top band of the person (hair and forehead) gives the head's width and centre; a head is about 1.3 times as tall as
    // it is wide, and its centre (about eye level) sits a little over half way down
    const band = Math.max(3, Math.round(h * (W > H ? 0.15 : 0.09)));
    let hw = 0, m = 0, s = 0;
    for (let y = T; y <= Math.min(B, T + band); y++) { if (cnt[y] > hw) hw = cnt[y]; m += cnt[y]; s += sx[y]; }
    const cx = m ? s / m : (L + R) / 2, hh = hw * 1.3;
    head.push([Math.round(cx * k), Math.round((T + 0.55 * hh) * k), T * k, Math.round(hh * k)]);
    body.push([L * k, T * k, (R + 1) * k, (B + 1) * k]);
  }
  const med = (a, j) => { const v = a.filter(Boolean).map((e) => e[j]).sort((p, q2) => p - q2); return v.length ? v[Math.floor(v.length / 2)] : null; };
  const J = { width: W, height: H, fps, frames: n,
    note: 'head: [centre x, centre y, top of head, head height] and body: [left, top, right, bottom] for every frame, in pixels',
    typical: { head: [0, 1, 2, 3].map((j) => med(head, j)), body: [0, 1, 2, 3].map((j) => med(body, j)) }, head, body };
  fs.writeFileSync(`assets/footage/${name}.subject.json`, JSON.stringify(J));
  const t = J.typical.head;
  console.log(`✅ assets/footage/${name}.subject.json (your head is around x ${t[0]}, y ${t[1]}; top of head at y ${t[2]})`);
}

// ---------- stills
function stills(o) {
  inProject();
  const clip = o._[1] || die('Which video? node fx.mjs stills <clip> [--count 8]');
  const info = probe(clip), cnt = Math.max(1, +(o.count || 8)), base = path.basename(clip).replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-]+/g, '-').toLowerCase();
  for (let i = 0; i < cnt; i++) {
    const t = info.duration * (i + 0.5) / cnt, out = `assets/images/${base}-${String(i + 1).padStart(2, '0')}.jpg`;
    const r = run('ffmpeg', ['-v', 'error', '-y', '-ss', t.toFixed(2), '-i', clip, '-frames:v', '1', '-vf', "scale='if(gt(iw,ih),1280,-2)':'if(gt(iw,ih),-2,1280)'", '-q:v', '3', out]);
    console.log(r.code ? `⚠️  skipped ${out}` : `✅ ${out}`);
  }
}

// ---------- build
function build(name) {
  inProject();
  const file = `effects/${name}.js`;
  if (!fs.existsSync(file)) die(`No ${file} yet.`);
  const js = fs.readFileSync(file, 'utf8');
  const m = js.match(/^\/\/\s*media:(.*)$/m);
  if (!m) die(`${file} needs a first line like:  // media: plate=assets/footage/talk.mp4 cut=assets/footage/talk-cutout.webm`);
  const media = m[1].trim().split(/\s+/).map((kv) => kv.split('='));
  for (const [, v] of media) if (!fs.existsSync(v)) die(`${file} uses ${v}, which isn't there. Make it with: node fx.mjs footage ...`);
  const p = probe(media[0][1]);
  const [rate, fps] = pickRate(p.fps);
  // exactly the clip's own frame count (the sound is put back after, untrimmed, so no frame is lost at the end)
  const N = p.frames || Math.round((p.vduration || p.duration) * fps);
  const dur = N / fps;
  const vids = media.map(([k, v], i) => `<video id="${k}" class="clip fill" src="${v}" muted playsinline data-start="0" data-duration="${dur.toFixed(6)}" data-track-index="${i}"></video>`).join('\n');
  const css = fs.readFileSync('assets/fx.css', 'utf8');
  const id = 'fx-' + name;
  const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${p.w}, height=${p.h}"/><title>${id}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
${css}
</style></head>
<body style="margin:0;background:#000">
<div id="root" data-composition-id="${id}" data-width="${p.w}" data-height="${p.h}" data-fps="${fps}" data-rate="${rate}" data-start="0" data-duration="${dur.toFixed(6)}" style="position:relative;width:${p.w}px;height:${p.h}px;background:#000">
${vids}
</div>
<script src="assets/fx.js"></script>
<script>
${js}
</script>
</body></html>
`;
  fs.writeFileSync(`compositions/${name}.html`, html);
  return { rate, plate: media[0][1], audio: p.audio, dur };
}

// ---------- snap
function snap(o) {
  const name = o._[1] || die('Which effect? node fx.mjs snap <effect>');
  const b = build(name);
  const P = path.join('.preview', name);
  fs.rmSync(P, { recursive: true, force: true }); fs.mkdirSync(P, { recursive: true });
  fs.copyFileSync(`compositions/${name}.html`, path.join(P, 'index.html'));
  fs.symlinkSync(path.resolve('assets'), path.join(P, 'assets'), WIN ? 'junction' : 'dir');
  const at = o.at ? String(o.at) : [0.1, 0.3, 0.6, 1.2, Math.max(1.5, b.dur - 0.2)].map((t) => t.toFixed(2)).join(',');
  const out = path.resolve('snaps', name);
  fs.rmSync(out, { recursive: true, force: true });
  console.log(`Taking stills of ${name} at ${at} s...`);
  const r = hf(['snapshot', P, '--output', out, '--at', at], false);
  if (r.code || !fs.existsSync(path.join(out, 'contact-sheet.jpg'))) die('The snapshot failed:\n' + ((r.err || '') + (r.out || '')).slice(-1500));
  console.log(`\n✅ Stills in snaps/${name}/ (contact-sheet.jpg shows them all). Look at them before rendering.`);
}

// ---------- render
function render(o) {
  const name = o._[1] || die('Which effect? node fx.mjs render <effect>');
  const b = build(name);
  let out = `renders/${name}.mp4`;
  for (let i = 2; fs.existsSync(out); i++) out = `renders/${name}-${i}.mp4`;
  const tmp = out.replace(/\.mp4$/, '.silent.mp4');
  console.log(`Rendering ${name} (a few seconds of video takes a minute or two)...`);
  const r = hf(['render', '.', '-c', `compositions/${name}.html`, '--video-frame-format', 'png', '--fps', b.rate, '--quality', 'high', '--output', tmp], false);
  if (r.code || !fs.existsSync(tmp)) die('The render failed. Run  node fx.mjs check  if this is the first render on this computer.\n' + ((r.err || '') + (r.out || '')).slice(-1500));
  if (b.audio) {
    const m = run('ffmpeg', ['-v', 'error', '-y', '-i', tmp, '-i', b.plate, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', out]);
    if (m.code) { fs.renameSync(tmp, out); console.log('⚠️  Could not put the sound back in; the render is silent.'); }
    else fs.rmSync(tmp);
  } else fs.renameSync(tmp, out);
  console.log(`\n✅ ${path.resolve(out)}`);
}

// ---------- main
const o = args(process.argv.slice(2));
const cmd = o._[0];
const remeasure = (x) => { inProject(); const n = x._[1] || die('Which footage? node fx.mjs measure <name>'); const c = `assets/footage/${n}-cutout.webm`;
  if (!fs.existsSync(c)) die(`No ${c}: make it with  node fx.mjs footage <clip> --name ${n} --cutout`); const p = probe(`assets/footage/${n}.mp4`); measure(c, n, p.w, p.h, pickRate(p.fps)[1]); };
const CMDS = { init, check, footage, measure: remeasure, stills, build: (x) => { build(x._[1] || die('Which effect?')); console.log(`✅ compositions/${x._[1]}.html`); }, snap, render };
if (!CMDS[cmd]) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 15).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(cmd ? 1 : 0);
}
CMDS[cmd](o);
