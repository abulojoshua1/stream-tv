#!/usr/bin/env sh
set -e

mkdir -p "$HLS_DIR"

# Start nginx (background)
nginx -g "daemon off;" &
NGINX_PID=$!

# Compute GOP
GOP=$(( FRAMERATE * 2 ))

# Start ffmpeg (background)
ffmpeg \
  -nostdin \
  -loglevel warning \
  \
  -thread_queue_size 512 \
  -f v4l2 \
  -input_format mjpeg \
  -framerate "$FRAMERATE" \
  -video_size "${VIDEO_WIDTH}x${VIDEO_HEIGHT}" \
  -i "$VIDEO_DEVICE" \
  \
  -thread_queue_size 512 \
  -f pulse \
  -ac 2 \
  -i "$PULSE_SOURCE" \
  \
  -use_wallclock_as_timestamps 1 \
  \
  -c:v libx264 \
  -preset veryfast \
  -tune zerolatency \
  -b:v "$VIDEO_BITRATE" \
  -maxrate "$VIDEO_BITRATE" \
  -bufsize 2M \
  -g "$GOP" \
  -keyint_min "$GOP" \
  -vf scale=iw:ih \
  -pix_fmt yuv420p \
  \
  -c:a aac \
  -b:a "$AUDIO_BITRATE" \
  \
  -f hls \
  -hls_time 2 \
  -hls_list_size 6 \
  -hls_flags delete_segments+append_list+independent_segments \
  -hls_segment_filename "$HLS_DIR/live_%03d.ts" \
  "$HLS_DIR/live.m3u8" &
FFMPEG_PID=$!

# Supervisor: wait for EITHER process to exit
wait -n $NGINX_PID $FFMPEG_PID

# If either one dies, kill the other and exit
kill $NGINX_PID $FFMPEG_PID 2>/dev/null || true

# IMPORTANT:
# By exiting here, Docker's restart policy is triggered.
exit 1
