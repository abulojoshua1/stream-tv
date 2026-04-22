# Baraka TV – Live HLS Player

Baraka TV is a React + TypeScript single‑page app that plays a live HLS stream exposed at `/hls/live.m3u8`. The repo also includes an nginx + FFmpeg pipeline (Docker/PM2) to capture video/audio, encode to HLS, and serve the player.

## Stack
- React 19, Vite 7, TypeScript, MUI system components
- hls.js for adaptive playback, custom player UI (autohide controls, live badge, volume + fullscreen)
- Service worker for offline shell/static caching (skips `/hls/*` so live media never caches)
- nginx + FFmpeg container for HLS generation and delivery

## Prerequisites
- Node 22 (pinned via `.nvmrc` — run `nvm use` in the repo root).
- pnpm (lockfile v9). Install once: `npm install -g pnpm` or `corepack enable pnpm`.

## Install & scripts (pnpm only)
```bash
pnpm install
pnpm start:dev    # Vite dev server with HMR
pnpm build        # Production build to dist/
pnpm preview      # Serve the built app locally
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint autofix
pnpm stream:test  # Stop PM2 stream and loop test-video.mp4 into public/hls (run pnpm start:dev separately)
```

## Feeding the player in local dev (PM2-first)
Run the HLS pipeline with PM2 so the player always sees `/hls/live.m3u8` during development:

```bash
# 1) Install dependencies
pnpm install

# 2) Start FFmpeg -> HLS via PM2 (writes to public/hls)
pm2 start ecosystem.config.cjs

# 3) Run the UI with HMR
pnpm start:dev

# Player: http://localhost:5173/
# HLS:    http://localhost:5173/hls/live.m3u8
```

If you want to test with a file instead of a capture device, stop PM2 and generate HLS segments locally from the bundled `./test-video.mp4`. Run the stream in one terminal and the dev server in another:

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

## Dockerized pipeline (nginx + FFmpeg)
The provided images build the UI and run nginx + FFmpeg to stream from a capture device into HLS.

```bash
docker compose up --build
```

Key parts:
- `Dockerfile` builds the React app with pnpm, then runs nginx + FFmpeg.
- `docker-compose.yml` maps `/dev/video2` and Pulse audio into the container and writes segments to `./hls` (bind-mounted to `/usr/share/nginx/html/hls`).
- HLS is served from `http://localhost:5000/hls/live.m3u8`; the player loads from `http://localhost:5000/`.

### Environment variables (compose / entrypoint)
| Name | Default | Purpose |
| --- | --- | --- |
| `VIDEO_DEVICE` | `/dev/video2` | Video input device (V4L2) |
| `PULSE_SOURCE` | `alsa_input.usb-MACROSILICON_USB_Video-02.iec958-stereo` | PulseAudio source for audio |
| `VIDEO_WIDTH` | `1920` | Capture width |
| `VIDEO_HEIGHT` | `1080` | Capture height |
| `FRAMERATE` | `30` (compose) / `40` (PM2) | Capture FPS; GOP is `FRAMERATE * 2` |
| `VIDEO_BITRATE` | `3000k` (compose) / `6000k` (PM2) | Video bitrate |
| `AUDIO_BITRATE` | `128k` | Audio bitrate |
| `HLS_DIR` | `/usr/share/nginx/html/hls` (compose) / `./public/hls` (PM2) | HLS output directory |
| `FFMPEG_THREADS` | `0` | `0` = auto use all cores |
| `PULSE_SERVER` | `unix:/run/user/1000/pulse/native` | Pulse socket for audio in compose |

### Runtime notes
- nginx CORS is open for `/hls/` to allow playback in the SPA.
- HLS playlists are uncached; TS segments are micro‑cached (10s) in nginx.
- Service worker caches app shell/static assets but ignores `/hls/*` to keep live content fresh.

## PM2 (non-Docker) option
`ecosystem.config.cjs` runs FFmpeg via PM2 and writes HLS to `public/hls`. Use when running everything on the host:

```bash
pnpm install
pm2 start ecosystem.config.cjs
pnpm start:dev    # or pnpm preview after build
```

Ensure PulseAudio and the video device are accessible to the user running PM2.

## Player details
- Auto-hides controls after 3.5s inactivity; mouse move/tap reveals.
- LIVE badge animates; controls include play/pause, volume/mute (with last-volume restore), and fullscreen.
- Error handling: manifest/stream fatal errors show a static noise screen with “Reload Stream”.

## Notes on caching & SW
- Service worker (`public/service-worker.js`) precaches `/` and static assets; navigation is network-first with cached shell fallback.
- HLS is never cached (requests to `/hls/` bypass the SW handler entirely).

## Conventions
- Package manager: pnpm only. `package-lock.json` is intentionally removed to avoid tool conflicts.
- Linting: Airbnb base + TS + React hooks. Run `pnpm lint` before commits.

## License
Released under the [MIT License](LICENSE) — free to use, modify, and distribute.
