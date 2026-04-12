import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { colors } from "../../theme";
import { ErrorState } from "./ErrorState";
import { LiveBadge } from "./LiveBadge";
import { PlayPause } from "./PlayPause";
import { VolumeControls } from "./VolumeControls";

export function Player() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [volume, setVolume] = useState(0);
  const [lastVolume, setLastVolume] = useState(80);
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

  // Sync play/pause state from video element events
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

  if (error) return <ErrorState />;

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

      {/* CONTROLS OVERLAY */}
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
        {/* Separator */}
        <Box sx={{ height: "1px", bgcolor: colors.playerDivider, mx: "28px" }} />

        {/* Controls grid — 1fr | auto | 1fr keeps play/pause perfectly centred */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            px: "28px",
            py: "18px",
          }}
        >
          <LiveBadge />
          <PlayPause isPaused={isPaused} onPlay={handlePlay} onPause={handlePause} />
          <VolumeControls
            isMuted={isMuted}
            volume={volume}
            onToggleMute={handleToggleMute}
            onVolumeChange={handleVolumeChange}
            onFullscreen={handleFullscreen}
          />
        </Box>
      </Box>
    </Box>
  );
}
