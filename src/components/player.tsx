import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import ReplayCircleFilledIcon from "@mui/icons-material/ReplayCircleFilled";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { Box, Alert, Stack, Button, IconButton, Slider } from "@mui/material";

export function Player() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [volume, setVolume] = useState(0); // effective slider value (0 when muted)
  const [lastVolume, setLastVolume] = useState(80); // restored on unmute
  const [controlsVisible, setControlsVisible] = useState(true);

  // Disable page scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalStyle; };
  }, []);

  // Auto-hide controls on mount
  useEffect(() => {
    scheduleHide();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  // Sync video.play() and video.pause() to state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPaused(false);
    const onPause = () => setIsPaused(true);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  // HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = "/hls/live.m3u8";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.play().catch(() => {});
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: false,
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 12,
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
        maxBufferSize: 120 * 1000 * 1000,
        backBufferLength: 120,
        enableWorker: true,
        progressive: true,
        maxFragLookUpTolerance: 0.5,
      });

      hls.startLoad(0);
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) setError("Signal jam! Time to reload and retry!");
      });

      return () => hls.destroy();
    }

    setError("This browser cannot play live streams!");
  }, []);

  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3500);
  };

  const handleMouseMove = () => {
    setControlsVisible(true);
    scheduleHide();
  };

  // Mute toggle
  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      const restore = lastVolume > 0 ? lastVolume : 80;
      video.muted = false;
      video.volume = restore / 100;
      setIsMuted(false);
      setVolume(restore);
      video.play();
    } else {
      setLastVolume(volume);
      video.muted = true;
      setIsMuted(true);
      setVolume(0);
    }
  };

  // Volume slider handler
  const handleVolumeChange = (_: any, newValue: number | number[]) => {
    if (!videoRef.current) return;
    const vol = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(vol);
    if (vol > 0) {
      setLastVolume(vol);
      videoRef.current.volume = vol / 100;
      if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handlePlay = () => videoRef.current?.play();
  const handlePause = () => videoRef.current?.pause();
  const handleFullscreen = () => videoRef.current?.requestFullscreen?.();

  // ─── ERROR STATE ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 1280,
          aspectRatio: "16/9",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: 'url("/noise.gif")',
            backgroundSize: "cover",
            opacity: 0.2,
          }}
        />
        <Stack sx={{ zIndex: 1 }} spacing={2} alignItems="center">
          <Alert severity="warning" variant="filled" sx={{ maxWidth: 360 }}>
            Signal jam! Time to reload and retry!
          </Alert>
          <Button
            color="warning"
            variant="outlined"
            startIcon={<ReplayCircleFilledIcon />}
            onClick={() => window.location.reload()}
          >
            Reload Stream
          </Button>
        </Stack>
      </Box>
    );
  }

  // ─── PLAYER ──────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 1280,
        aspectRatio: "16/9",
        bgcolor: "#000",
        overflow: "hidden",
        cursor: controlsVisible ? "default" : "none",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setControlsVisible(false)}
    >
      {/* VIDEO */}
      <Box
        component="video"
        ref={videoRef}
        controls={false}
        muted
        autoPlay
        playsInline
        sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
      />

      {/* ── CONTROLS OVERLAY ────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          // Deep Netflix-style gradient — transparent at top, near-opaque at bottom
          background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.92) 100%)",
          opacity: controlsVisible ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: controlsVisible ? "auto" : "none",
        }}
      >
        {/* Thin separator line */}
        <Box sx={{ height: "1px", bgcolor: "rgba(255,255,255,0.07)", mx: "28px" }} />

        {/* Controls — 3-column grid so play/pause is always perfectly centred */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            px: "28px",
            py: "18px",
          }}
        >
          {/* ── LEFT: LIVE badge ── */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Stack
              direction="row"
              alignItems="center"
              sx={{ gap: "6px", px: "10px", py: "5px", border: "1px solid rgba(255,255,255,0.22)", borderRadius: "4px", userSelect: "none" }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "#ef4444",
                  boxShadow: "0 0 6px #ef4444",
                  animation: "livePulse 2s ease-in-out infinite",
                  "@keyframes livePulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.25 },
                  },
                }}
              />
              <Box
                component="span"
                sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#fff", lineHeight: 1 }}
              >
                LIVE
              </Box>
            </Stack>
          </Box>

          {/* ── CENTER: Play / Pause ── */}
          <IconButton
            onClick={isPaused ? handlePlay : handlePause}
            disableRipple
            sx={playBtnSx}
          >
            {isPaused
              ? <PlayArrowIcon sx={{ fontSize: 32 }} />
              : <PauseIcon sx={{ fontSize: 32 }} />}
          </IconButton>

          {/* ── RIGHT: Volume + Fullscreen ── */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>

            <IconButton onClick={handleToggleMute} disableRipple sx={iconBtnSx}>
              {isMuted || volume === 0
                ? <VolumeOffIcon sx={{ fontSize: 22 }} />
                : volume < 50
                  ? <VolumeDownIcon sx={{ fontSize: 22 }} />
                  : <VolumeUpIcon sx={{ fontSize: 22 }} />}
            </IconButton>

            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={100}
              sx={{
                width: 100,
                flexShrink: 0,
                alignSelf: "center",
                color: "#fff",
                height: 3,
                p: 0,
                "& .MuiSlider-thumb": {
                  width: 13,
                  height: 13,
                  bgcolor: "#fff",
                  boxShadow: "none",
                  transition: "box-shadow 0.2s ease, width 0.15s ease, height 0.15s ease",
                  "&:hover, &.Mui-focusVisible": {
                    width: 17,
                    height: 17,
                    boxShadow: "0 0 0 5px rgba(255,255,255,0.18)",
                  },
                },
                "& .MuiSlider-track": { border: "none", height: 3, bgcolor: "#fff" },
                "& .MuiSlider-rail": { height: 3, bgcolor: "rgba(255,255,255,0.25)" },
              }}
            />

            <Box sx={{ width: "12px" }} />

            <IconButton onClick={handleFullscreen} disableRipple sx={iconBtnSx}>
              <FullscreenIcon sx={{ fontSize: 22 }} />
            </IconButton>

          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── STYLE TOKENS ─────────────────────────────────────────────────────────────

/** Primary action — play/pause gets a slightly larger hover circle */
const playBtnSx = {
  color: "#fff",
  transition: "transform 0.15s ease, background-color 0.15s ease",
  "&:hover": {
    bgcolor: "rgba(255,255,255,0.14)",
    transform: "scale(1.08)",
  },
} as const;

/** Secondary icons — mute, fullscreen */
const iconBtnSx = {
  color: "rgba(255,255,255,0.85)",
  transition: "color 0.15s ease, transform 0.15s ease, background-color 0.15s ease",
  "&:hover": {
    color: "#fff",
    bgcolor: "rgba(255,255,255,0.1)",
    transform: "scale(1.1)",
  },
} as const;
