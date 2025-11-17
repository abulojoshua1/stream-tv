// require("dotenv").config();
const path = require("path");

const {
  VIDEO_DEVICE = "/dev/video2",
  PULSE_SOURCE = "alsa_input.usb-MACROSILICON_USB_Video-02.iec958-stereo",
  VIDEO_WIDTH = "1920",
  VIDEO_HEIGHT = "1080",
  FRAMERATE = "30",
  VIDEO_BITRATE = "3000k",
  AUDIO_BITRATE = "128k",
  HLS_DIR = path.join(__dirname, "public", "hls"),
} = process.env;

// GOP = framerate * 2
const gop = String(Number(FRAMERATE) * 2 || 50);

module.exports = {
  apps: [
    {
      name: "FFMPEG-HLS-STREAM",

      cwd: __dirname,
      script: "ffmpeg",
      exec_mode: "fork",

      autorestart: true,
      restart_delay: 2000,
      max_restarts: 1000,
      watch: false,

      env: {
        VIDEO_DEVICE,
        PULSE_SOURCE,
        VIDEO_WIDTH,
        VIDEO_HEIGHT,
        FRAMERATE,
        VIDEO_BITRATE,
        AUDIO_BITRATE,
        HLS_DIR,
      },

      args: [
        "-nostdin",
        "-loglevel", "warning",

        // VIDEO INPUT
        "-thread_queue_size", "512",
        "-f", "v4l2",
        "-input_format", "mjpeg",
        "-framerate", FRAMERATE,
        "-video_size", `${VIDEO_WIDTH}x${VIDEO_HEIGHT}`,
        "-i", VIDEO_DEVICE,

        // AUDIO INPUT
        "-thread_queue_size", "512",
        "-f", "pulse",
        "-ac", "2",
        "-i", PULSE_SOURCE,

        // TIMESTAMPS
        "-use_wallclock_as_timestamps", "1",

        // VIDEO ENCODING
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-tune", "zerolatency",
        "-b:v", VIDEO_BITRATE,
        "-maxrate", VIDEO_BITRATE,
        "-bufsize", "2M",
        "-g", gop,
        "-keyint_min", gop,

        "-vf", "scale=iw:ih",
        "-pix_fmt", "yuv420p",

        // AUDIO ENCODING
        "-c:a", "aac",
        "-b:a", AUDIO_BITRATE,

        // HLS OUTPUT
        "-f", "hls",
        "-hls_time", "2",
        "-hls_list_size", "6",
        "-hls_flags", "delete_segments+append_list+independent_segments",

        "-hls_segment_filename",
        path.join(HLS_DIR, "live_%03d.ts"),

        path.join(HLS_DIR, "live.m3u8"),
      ],
    },
  ],
};
