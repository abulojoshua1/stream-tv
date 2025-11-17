const path = require("path");

const {
  VIDEO_DEVICE = "/dev/video2",
  PULSE_SOURCE = "alsa_input.usb-MACROSILICON_USB_Video-02.iec958-stereo",
  VIDEO_WIDTH = "1280",
  VIDEO_HEIGHT = "720",
  FRAMERATE = "25",
  VIDEO_BITRATE = "1500k",
  AUDIO_BITRATE = "96k",
  HLS_DIR = "./hls",  // <<==== ALWAYS RELATIVE (NO LEADING SLASH)
} = process.env;

// GOP = framerate * 2
const gop = String(Number(FRAMERATE) * 2 || 50);

module.exports = {
  apps: [
    {
      name: "FFMPEG-HLS-STREAM",

      // Run exactly in the directory where this file lives
      cwd: __dirname,

      // Run ffmpeg directly
      script: "ffmpeg",
      exec_mode: "fork",

      // Restart behavior
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
        HLS_DIR: "./hls", // FORCE CORRECT RELATIVE PATH
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

        // VIDEO ENCODING (NVENC)
        "-c:v", "h264_nvenc",
        "-preset", "fast",
        "-rc", "vbr",
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
        "-hls_segment_filename", path.join("./hls", "live_%03d.ts"),
        path.join("./hls", "live.m3u8"),
      ],
    },
  ],
};
