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
import { colors } from "../theme";

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

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        // Empty playlist — manifest loaded but contains no stream levels
        if (data.levels.length === 0) {
          setError("Signal jam! Time to reload and retry!");
          return;
        }
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError("Signal jam! Time to reload and retry!");
          return;
        }
        // Non-fatal but unrecoverable: empty or invalid manifest
        if (data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR) {
          setError("Signal jam! Time to reload and retry!");
        }
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
        bgcolor: colors.playerBg,
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

      {/* ── CONTROLS OVERLAY ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: `linear-gradient(to bottom, transparent 50%, ${colors.playerOverlay50} 75%, ${colors.playerOverlay} 100%)`,
          opacity: controlsVisible ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: controlsVisible ? "auto" : "none",
        }}
      >
        {/* Thin separator line */}
        <Box sx={{ height: "1px", bgcolor: colors.playerDivider, mx: "28px" }} />

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
              sx={{
                gap: "6px",
                px: "10px",
                py: "5px",
                border: `1px solid ${colors.playerLiveBorder}`,
                borderRadius: "4px",
                userSelect: "none",
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: colors.playerLive,
                  boxShadow: `0 0 6px ${colors.playerLive}`,
                  animation: "livePulse 2s ease-in-out infinite",
                  "@keyframes livePulse": {
                    "0%, 100%": { opacity: 1 },
                    "50%": { opacity: 0.25 },
                  },
                }}
              />
              <Box
                component="span"
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  color: colors.playerText,
                  lineHeight: 1,
                }}
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
                width: 110,
                flexShrink: 0,
                alignSelf: "center",
                color: colors.playerAccent,
                height: 5,
                p: 0,
                borderRadius: 1,
                "& .MuiSlider-thumb": {
                  width: 12,
                  height: 12,
                  opacity: 0,
                  bgcolor: colors.playerText,
                  boxShadow: "none",
                  transition: "opacity 0.2s ease, width 0.2s cubic-bezier(.47,1.64,.41,.8), height 0.2s cubic-bezier(.47,1.64,.41,.8)",
                  "&:hover, &.Mui-focusVisible": {
                    opacity: 1,
                    boxShadow: `0 0 0 6px ${colors.playerAccentGlow}`,
                  },
                  "&.Mui-active": {
                    opacity: 1,
                    width: 18,
                    height: 18,
                  },
                },
                "& .MuiSlider-track": { border: "none", height: 5, borderRadius: 1 },
                "& .MuiSlider-rail": { height: 5, borderRadius: 1, bgcolor: colors.playerRail },
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

const playBtnSx = {
  color: colors.playerText,
  transition: "transform 0.15s ease, background-color 0.15s ease",
  "&:hover": {
    bgcolor: colors.playerAccentGlow,
    transform: "scale(1.08)",
  },
} as const;

const iconBtnSx = {
  color: colors.playerTextDim,
  transition: "color 0.15s ease, transform 0.15s ease, background-color 0.15s ease",
  "&:hover": {
    color: colors.playerText,
    bgcolor: colors.playerAccentGlow,
    transform: "scale(1.1)",
  },
} as const;
