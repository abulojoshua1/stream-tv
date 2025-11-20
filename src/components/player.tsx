import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import ReplayCircleFilledIcon from "@mui/icons-material/ReplayCircleFilled";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Alert, Stack, Button, IconButton, Slider } from "@mui/material";

export function Player() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [volume, setVolume] = useState(0); // 0–100 slider value

  useEffect(() => {
    // Disable scroll
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      // Restore scroll when component unmounts
      document.body.style.overflow = originalStyle;
    };
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
        if (data.fatal) {
          setError("Signal jam! Time to reload and retry!");
        }
      });

      return () => hls.destroy();
    }

    setError("This browser cannot play live streams!");
  }, []);

  // Mute toggle
  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMuted = !video.muted;

    video.muted = newMuted;
    setIsMuted(newMuted);

    // If unmuting, restore last volume or default to 100%
    if (!newMuted) {
      if (volume === 0) {
        setVolume(100);
        video.volume = 1;
      }
      video.play();
    }
  };

  // Volume slider handler
  const handleVolumeChange = (_: any, newValue: number | number[]) => {
    if (!videoRef.current) return;

    const vol = Array.isArray(newValue) ? newValue[0] : newValue;

    setVolume(vol);
    videoRef.current.volume = vol / 100;

    if (vol > 0 && isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }

    if (vol === 0 && !isMuted) {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handlePlay = () => videoRef.current?.play();
  const handlePause = () => videoRef.current?.pause();
  const handleFullscreen = () => videoRef.current?.requestFullscreen?.();

  // ERROR UI
  if (error) {
    return (
      <Box
        width="100%"
        maxWidth={1280}
        sx={{
          position: "relative",
          aspectRatio: "16/9",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "1px solid red",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: 'url("/noise.gif")',
            opacity: 0.3,
          }}
        />
        <Stack sx={{ zIndex: 1000 }} spacing={2}>
          <Button
            color="warning"
            variant="outlined"
            startIcon={<ReplayCircleFilledIcon />}
            onClick={() => window.location.reload()}
          >
            RELOAD
          </Button>
          <Alert severity="warning" variant="filled">
            {error}
          </Alert>
        </Stack>
      </Box>
    );
  }

  // NORMAL PLAYER
  return (
    <Stack>
      <Box
        component="video"
        ref={videoRef}
        controls={false}
        muted
        autoPlay
        playsInline
        sx={{
          width: "100%",
          maxWidth: 1280,
          height: "100%",
          backgroundColor: "#000000",
          objectFit: "contain",
          border: "1px solid #ffffff",
        }}
      />

      <Box bgcolor="#ffffff" p={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* LEFT SIDE CONTROLS */}
          <Stack direction="row" spacing={2} alignItems="center">
            {isPaused ? (
              <IconButton size="large" color="primary" onClick={handlePlay}>
                <PlayArrowIcon fontSize="inherit" />
              </IconButton>
            ) : (
              <IconButton size="large" color="primary" onClick={handlePause}>
                <StopCircleIcon fontSize="inherit" />
              </IconButton>
            )}

            {isMuted ? (
              <IconButton size="large" color="primary" onClick={handleToggleMute}>
                <VolumeOffIcon fontSize="inherit" />
              </IconButton>
            ) : (
              <IconButton size="large" color="primary" onClick={handleToggleMute}>
                <VolumeUpIcon fontSize="inherit" />
              </IconButton>
            )}
            <Stack pl={3}>
              {/* VOLUME SLIDER */}
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                min={0}
                max={100}
                sx={{
                  width: 60,
                  color: "#000000",
                }}
              />
            </Stack>
          </Stack>

          {/* FULLSCREEN */}
          <IconButton size="large" color="primary" onClick={handleFullscreen}>
            <OpenInFullIcon fontSize="inherit" />
          </IconButton>
        </Stack>
      </Box>
    </Stack>
  );
}
