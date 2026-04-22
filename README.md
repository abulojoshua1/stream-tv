# 📺 Stream TV

> **A minimal, hackable HLS streaming stack. One command, any network.**
> ~600 lines of code between a capture device and a browser. Fork it, bend it, ship it.

<p>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue.svg"></a>
  <img alt="Node 22" src="https://img.shields.io/badge/node-22-brightgreen">
  <img alt="React 19" src="https://img.shields.io/badge/react-19-61dafb">
  <img alt="pnpm" src="https://img.shields.io/badge/pnpm-9-f69220">
  <img alt="Self-hosted" src="https://img.shields.io/badge/self--hosted-%E2%9C%93-black">
</p>

---

## 🚀 What is Stream TV?

A deliberately small HLS streaming stack: FFmpeg captures, nginx serves, a React player plays. That's the whole product. It does one thing — push HLS to a browser — and leaves everything else (auth, chat, DRM, multi-bitrate, DVR) to whoever forks it.

- ⚡ **Minimal by design** — no media server, no cloud, no accounts, no framework lock-in.
- 🎥 **Direct capture → browser** — plug in a USB/HDMI capture card, get a web stream.
- 📺 **Drop-in HLS player** — auto-hide controls, live badge, error recovery.
- 🧑‍💻 **Built to be forked** — small enough to read end-to-end in an evening.

## 🎯 What you can build with it

- 📷 Turn a USB/HDMI capture card into a web stream
- 🖥️ Build internal video monitoring or dashboarding tools
- 🧪 Test streaming pipelines locally (ships with a test-loop script)
- ⛪ Run simple live streams — churches, events, schools, community radio
- 🏠 Replace IP cameras with a self-hosted, privacy-respecting solution
- 🧰 Use as a base for custom streaming apps — fork and add only what *you* need

## 🧠 How it works

```
Video Source ──► FFmpeg ──► HLS (.m3u8 + .ts) ──► nginx ──► React Player
```

- **FFmpeg** captures from a V4L2 device (or file) and encodes H.264 + AAC
- **HLS segments** are written to a directory as 2-second chunks
- **nginx** serves the playlist and segments with sane cache headers + CORS
- **React + hls.js** plays it in the browser with a clean, accessible UI

That's the whole thing.

## ⚡ Why Stream TV?

Most streaming tools are either:

- 🏋️ **Too heavy** — full media servers (Ant Media, Wowza, OvenMediaEngine) you don't need
- 🔧 **Too manual** — OBS + custom scripts you rewire every time
- 🧩 **Too fragmented** — DIY blog-post configs that rot in a year

Stream TV focuses on:

- ✅ **Simplicity** — works from a folder of HLS files
- ✅ **Minimal setup** — Docker *or* PM2, pick one
- ✅ **Modern UI** — built-in React player, no iframe hacks
- ✅ **Dev-first workflow** — Vite, HMR, TypeScript, pnpm, ESLint
- ✅ **Self-hosted** — no cloud, no accounts, no egress fees, no telemetry
- ✅ **Hackable** — small codebase, one Dockerfile, one nginx config, MIT licensed

## ✨ What's in the box

### 🎬 Player
- Auto-hiding controls — reveal on mouse/touch, hide after 3.5s
- Animated **LIVE** badge so viewers know they're on the live edge
- Play/pause, volume slider with mute + last-volume restore
- Fullscreen toggle (desktop + mobile)
- Graceful error recovery — manifest/stream fatal errors show a static-noise fallback with "Reload Stream"
- Mobile-friendly layout and touch targets
- Service worker caches the app shell but **never** caches live media

### 📡 Pipeline
- FFmpeg with `libx264` `-preset veryfast` `-tune zerolatency`
- 2-second HLS segments, 6-segment rolling playlist (low-latency friendly)
- Configurable bitrate, framerate, resolution, audio source via env vars
- nginx with open CORS on `/hls/`, micro-cached TS segments, uncached playlists
- Works with V4L2 capture devices (USB / HDMI grabbers) and PulseAudio

### 🛠️ Developer experience
- Node 22 pinned via `.nvmrc` (`nvm use` and you're aligned)
- Vite 7 + React Compiler + HMR
- TypeScript + ESLint (Airbnb base) + React 19 hooks lint
- `pnpm stream:test` — loop a local MP4 into HLS for offline dev, no capture device needed
- One-command Docker (`docker compose up --build`) or host-native PM2

## 👥 Who is this for?

| You are… | Stream TV fits if… |
| --- | --- |
| A **homelab / self-hoster** | You want a clean web player for an IP camera or capture card without cloud |
| A **developer** building streaming features | You want a working end-to-end reference to fork |
| A **church / school / small org** | You want to stream a service or event without paying a SaaS |
| A **tinkerer** | You want ~1 evening from clone to working stream |

### 🚫 Out of scope — on purpose

The following will **not** be added to this repo. They're all legitimate features, just not this project's job:

- Multi-bitrate ABR ladders
- DRM
- WebRTC / sub-second latency
- Recording / DVR / archival
- Built-in auth (use a reverse proxy: Caddy, Traefik, nginx)
- Chat, reactions, social overlays
- Admin UI for runtime config
- Multi-stream / multi-tenant

If you need any of these, fork the repo and add them. The codebase is intentionally small enough (~600 LOC of actual product code) that you can do that without fighting a framework. For a more batteries-included alternative, look at [Owncast](https://owncast.online/) or [Restreamer](https://github.com/datarhei/restreamer).

---

## ⚡ Quick start (60 seconds)

Fastest path to a running stream using the bundled test video:

```bash
pnpm install
pnpm stream:test     # terminal 1 — loops test-video.mp4 into public/hls
pnpm start:dev       # terminal 2 — starts the player at http://localhost:5173
```

Open http://localhost:5173/ and you'll see the player on a live test stream. That's it.

## 📋 Prerequisites

- **Node 22** (pinned via `.nvmrc` — run `nvm use` in the repo root)
- **pnpm** (lockfile v9). Install once: `npm install -g pnpm` or `corepack enable pnpm`
- **FFmpeg** on your PATH (for the non-Docker flow)
- **PM2** (optional) if you use the PM2 flow for FFmpeg

## 📦 Scripts

```bash
pnpm install
pnpm start:dev    # Vite dev server with HMR
pnpm build        # Production build to dist/
pnpm preview      # Serve the built app locally
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint autofix
pnpm stream:test  # Loop test-video.mp4 into public/hls (run pnpm start:dev separately)
```

## 🎞️ Feeding the player

### Option A — PM2 + real capture device (local dev)

Run the FFmpeg pipeline under PM2 so the player always sees `/hls/live.m3u8` during development:

```bash
pnpm install
pm2 start ecosystem.config.cjs   # FFmpeg → public/hls
pnpm start:dev                   # React app with HMR

# Player: http://localhost:5173/
# HLS:    http://localhost:5173/hls/live.m3u8
```

Ensure PulseAudio and the video device are accessible to the user running PM2.

### Option B — Test with a file (no capture device needed)

```bash
# terminal 1 — stop the PM2 stream and loop the test file into public/hls
pnpm stream:test

# terminal 2 — run the UI with HMR
pnpm start:dev
```

`stream:test` is equivalent to:

```bash
pm2 stop FFMPEG-HLS-STREAM
mkdir -p public/hls
ffmpeg -re -stream_loop -1 -i "./test-video.mp4" \
  -c:v libx264 -preset veryfast -tune zerolatency -b:v 3000k -g 60 -keyint_min 60 \
  -c:a aac -b:a 128k \
  -f hls -hls_time 2 -hls_list_size 6 \
  -hls_flags delete_segments+append_list+independent_segments \
  -hls_segment_filename "public/hls/live_%03d.ts" public/hls/live.m3u8
```

### Option C — Docker (nginx + FFmpeg in one container)

```bash
docker compose up --build
```

- `Dockerfile` builds the React app with pnpm, then runs nginx + FFmpeg.
- `docker-compose.yml` maps `/dev/video2` and Pulse audio in, writes segments to `./hls` (bind-mounted to `/usr/share/nginx/html/hls`).
- Player: http://localhost:5000/ — HLS: http://localhost:5000/hls/live.m3u8

## ⚙️ Configuration

All runtime knobs are plain env vars:

| Name | Default | Purpose |
| --- | --- | --- |
| `VIDEO_DEVICE` | `/dev/video2` | Video input device (V4L2) |
| `PULSE_SOURCE` | `alsa_input.usb-MACROSILICON_USB_Video-02.iec958-stereo` | PulseAudio source for audio |
| `VIDEO_WIDTH` | `1920` | Capture width |
| `VIDEO_HEIGHT` | `1080` | Capture height |
| `FRAMERATE` | `30` (compose) / `40` (PM2) | Capture FPS; GOP is `FRAMERATE × 2` |
| `VIDEO_BITRATE` | `3000k` (compose) / `6000k` (PM2) | Video bitrate |
| `AUDIO_BITRATE` | `128k` | Audio bitrate |
| `HLS_DIR` | `/usr/share/nginx/html/hls` (compose) / `./public/hls` (PM2) | HLS output directory |
| `FFMPEG_THREADS` | `0` | `0` = auto (all cores) |
| `PULSE_SERVER` | `unix:/run/user/1000/pulse/native` | Pulse socket for audio in compose |
| `VITE_HLS_URL` | *(unset)* | **Build-time** player override. If unset, the player fetches `${BASE_URL}hls/live.m3u8`. Set this to point the player at a different host, path, or CDN. |

### Runtime notes
- nginx CORS is open for `/hls/` so the SPA can play back from any origin.
- HLS playlists are uncached; TS segments are micro-cached (10s) in nginx.
- Service worker caches app shell/static assets but skips `/hls/*` entirely to keep live content fresh.
- Works behind a reverse proxy. If mounting at a sub-path, build with `vite build --base=/your-path/` so both the app and the default HLS URL are prefixed correctly. For anything more custom (different host, CDN), set `VITE_HLS_URL` at build time.

## 🔧 Hacking on it

The whole point of this project is that it's small enough to fork and bend. The two files you'll touch most:

### Customise the encode pipeline
**Edit [`s6-rc.d/ffmpeg/run`](s6-rc.d/ffmpeg/run).** It's one FFmpeg command with three sections:
1. **Input** — `-f v4l2` for the capture card, `-f pulse` for audio. Swap to `-i rtsp://…` for an IP camera, `-i file.mp4` for a file loop, `-f x11grab` for screen capture, etc.
2. **Encode** — `libx264` preset/tune/bitrate/GOP. Swap to `h264_nvenc` / `h264_vaapi` / `h264_v4l2m2m` for hardware encoding. Change codecs, bitrates, resolution here.
3. **Output** — HLS settings (segment length, list size, flags). Usually the last thing you'd change.

If you want the PM2 flow or the `stream:test` script to reflect your changes, mirror edits to [`ecosystem.config.cjs`](ecosystem.config.cjs) and the `stream:test` entry in [`package.json`](package.json).

### Customise the player
**Edit [`src/components/player/`](src/components/player/).**
- [`index.tsx`](src/components/player/index.tsx) — main player, hls.js config, error handling.
- [`LiveBadge.tsx`](src/components/player/LiveBadge.tsx), [`PlayPause.tsx`](src/components/player/PlayPause.tsx), [`VolumeControls.tsx`](src/components/player/VolumeControls.tsx), [`ErrorState.tsx`](src/components/player/ErrorState.tsx) — individual UI pieces, each ~50 LOC.
- [`src/theme.ts`](src/theme.ts) — colours in one place. Rebrand here.

If you're removing features: the player is flat, not abstracted — just delete what you don't need. No framework will fight you.

## 🧱 Tech stack

- **Frontend:** React 19, Vite 7, TypeScript, MUI, hls.js, React Compiler
- **Pipeline:** FFmpeg (libx264 + AAC), HLS v3
- **Serving:** nginx (CORS, micro-cache)
- **Runtime orchestration:** PM2 (dev) or Docker Compose (prod)
- **Tooling:** pnpm 9, ESLint (Airbnb), Node 22

## 🌐 Browser support

Works anywhere `hls.js` works — Chrome, Firefox, Edge on desktop; Safari plays HLS natively. Tested on modern mobile browsers (iOS Safari, Android Chrome).

## 🧭 Project values

These are the lenses we use when evaluating changes. Align with them and PRs move fast:

1. **Self-hostable by default.** No cloud, no accounts, no telemetry.
2. **Small on purpose.** If a feature needs a library bigger than the feature, we think twice.
3. **One command should just work.** If onboarding grows past three steps, that's a bug.
4. **Readable beats clever.** New contributors should understand any file in 5 minutes.
5. **Boring tech where it matters.** nginx, FFmpeg, React, Vite. Nothing exotic in the hot path.

---

## 🤝 Contributing — we'd love your help

**This project is actively looking for contributors.** If you've ever wanted to:

- 💡 Ship something used by self-hosters, small orgs, and devs in the wild
- 🎓 Learn FFmpeg, HLS, nginx, or streaming internals with a friendly codebase
- 🪛 Sharpen a small codebase — contributions that *reduce* LOC are welcome
- 🏷️ Get your name on a growing open-source project

…you're in the right place. We pair well with: **frontend devs** (React/TS player polish), **backend/infra folks** (FFmpeg, nginx, Docker), **designers** (UI, icons, a demo GIF), and **writers** (docs, tutorials).

> **Heads up on scope.** PRs that add features from the [Out of scope](#-out-of-scope--on-purpose) list will be declined with thanks — not because the idea is bad, but because keeping this repo small is the feature. Fork freely.

### ✨ Why contribute to Stream TV?

- **Real users, real impact** — churches, homelabbers, and devs are using this
- **Responsive maintainers** — we aim to review PRs within a few days
- **Low review friction** — small focused PRs get merged fast
- **No CLA, no gatekeeping** — MIT license, send the PR
- **Recognition** — every contributor is credited below and in release notes
- **Mentorship available** — stuck on something? Open a draft PR and ask, we'll help

### 🎯 Good first issues

Ranked by difficulty. Pick one, open an issue saying you're taking it, and go.

All of these serve the core goal (simple, hackable, reliable HLS-to-browser on any network) without bloating scope.

| Difficulty | Task | Area |
| --- | --- | --- |
| 🟢 Easy | Add a screenshot or demo GIF of the player to this README | Docs |
| 🟢 Easy | Write a deploy guide (Raspberry Pi, Synology, TrueNAS, VPS, behind Caddy/Traefik) | Docs |
| 🟢 Easy | Add GitHub Actions CI: install → lint → build | DevOps |
| 🟢 Easy | Add keyboard shortcuts to the player (space, m, f, ←/→) | Frontend |
| 🟢 Easy | Picture-in-Picture support in the player | Frontend |
| 🟢 Easy | Fix `bufsize` hardcoded at 2M — derive from `VIDEO_BITRATE` | Pipeline |
| 🟡 Medium | Dockerized PulseAudio alternative for headless servers | Infra |
| 🟡 Medium | Auto-discover the V4L2 device instead of hardcoding `/dev/video2` | Infra |
| 🟡 Medium | Container healthcheck that verifies a fresh `.m3u8` is being written | Infra |
| 🟡 Medium | Reduce LOC in the player without losing features | Frontend |
| 🟡 Medium | Multi-arch Docker build (x86_64 + aarch64 for Raspberry Pi) | Infra |
| 🟡 Medium | Tested reverse-proxy recipe (Caddy/Traefik/nginx) with HTTPS | Infra/Docs |

Don't see your idea? **Open an issue** — but check the [Out of scope](#-out-of-scope--on-purpose) list first.

### 🔁 Dev loop

```bash
# one-time
git clone <your-fork>
cd stream-tv
nvm use              # Node 22
pnpm install

# work loop
pnpm stream:test     # terminal 1 — fake a live stream from test-video.mp4
pnpm start:dev       # terminal 2 — React app with HMR
pnpm lint            # before you push
```

That's the whole dev environment. No database, no secrets, no external services to mock.

### 📬 Submitting a PR

1. Fork the repo and branch from `main`.
2. Keep PRs small and focused — one concern per PR. If you're unsure, open a draft early.
3. Run `pnpm lint` and `pnpm build` locally — both should pass.
4. Reference the issue you're fixing in the PR description. Screenshots/GIFs welcome for UI changes.
5. Be patient and kind in review — we are too.

**Anything you send that improves docs, UX, or reliability is almost certainly welcome.** Don't overthink the first PR.

### 🫶 Code of conduct

Be decent. Assume good faith. No harassment, no discrimination, no gatekeeping.
If something feels off, open an issue or email the maintainer — it'll be handled.

### 🌟 Contributors

<!-- Add yourself when you send your first PR! -->
A huge thanks to everyone who has contributed, filed issues, or starred the project.
*Your name here.*

## 🧪 Conventions

- **Package manager:** pnpm only. `package-lock.json` is intentionally removed to avoid tool conflicts.
- **Linting:** Airbnb base + TS + React hooks. Run `pnpm lint` before commits.
- **Node:** pinned at 22 via `.nvmrc`.
- **Commit style:** anything readable. Conventional commits are nice but not required.
- **Comments:** prefer self-explanatory code. Add a comment only when *why* isn't obvious.

## 📄 License

Released under the [MIT License](LICENSE) — free to use, modify, fork, ship, commercialize. Attribution appreciated but not required.

---

<p>Built with ❤️ for the self-hosted community. If Stream TV is useful to you, a ⭐ on GitHub goes a long way.</p>
