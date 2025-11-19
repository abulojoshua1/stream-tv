#!/usr/bin/env sh
set -e

mkdir -p "$HLS_DIR"

# -------------------------------
# Auto CPU threads
# -------------------------------
if [ -z "$FFMPEG_THREADS" ] || [ "$FFMPEG_THREADS" = "0" ]; then
  CPU_THREADS=$(nproc)
else
  CPU_THREADS="$FFMPEG_THREADS"
fi

echo "Using $CPU_THREADS FFmpeg threads"


# -------------------------------
# Start Nginx in background
# -------------------------------
nginx -g "daemon off;" &
NGINX_PID=$!


# -------------------------------
# Compute GOP
# -------------------------------
GOP=$(( FRAMERATE * 2 ))


# -------------------------------
# Start FFmpeg (MAX CPU)
# -------------------------------
ffmpeg \
  -nostdin \
  -loglevel warning \
  \
  -threads "$CPU_THREADS" \
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
  -threads "$CPU_THREADS" \
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
  -threads "$CPU_THREADS" \
  \
  -f hls \
  -hls_time 2 \
  -hls_list_size 6 \
  -hls_flags delete_segments+append_list+independent_segments \
  -hls_segment_filename "$HLS_DIR/live_%03d.ts" \
  "$HLS_DIR/live.m3u8" &
FFMPEG_PID=$!


# -------------------------------
# Supervisor: exit if either dies
# -------------------------------
wait -n $NGINX_PID $FFMPEG_PID

kill $NGINX_PID $FFMPEG_PID 2>/dev/null || true

exit 1
