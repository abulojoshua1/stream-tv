import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import ReplayIcon from '@mui/icons-material/Replay';
import { Box, Alert, Stack, Button } from "@mui/material";

export function Player() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = "/hls/live.m3u8";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.play().catch(() => { });
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
        video.play().catch(() => { });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError("Houston, we have a buffering problem. Hit reload and engage streaming thrusters!");
        }
      });

      return () => {
        hls.destroy();
      };
    }

    setError("Looks like your browser isn't ready for live streaming. Try a different one or join the 21st century!");
  }, []);

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
        height="100vh"
        bgcolor="black"
        overflow="hidden"
        p={2}
      >
        <Box
          width="100%"
          maxWidth={1280}
          sx={{
            position: "relative",
            aspectRatio: "16/9",
            borderRadius: 2,
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Noise GIF background */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: 'url("/noise.gif")',
              backgroundRepeat: "repeat",
              backgroundSize: "25% 25% 25% 25%",
              backgroundPosition: "top left",
              opacity: 0.3,
            }}
          />
          {/* Semi-transparent dark overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              bgcolor: "rgba(0,0,0,0.01)", // further dimming for contrast
            }}
          />

          {/* Alert on top */}
          <Stack
            sx={{ zIndex: 1000 }}
            spacing={2}
          >
            <Alert
              severity="error"
              variant="filled"
            >
              {error}
            </Alert>
            <Box display="flex" justifyContent="center">
              <Button
                variant="contained"
                startIcon={<ReplayIcon />}
                size="small"
                onClick={() => window.location.reload()}
              >
                Reload
              </Button>
            </Box>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
      height="100vh"
      bgcolor="black"
      overflow="hidden"
      p={2}
    >
      <Box
        component="video"
        ref={videoRef}
        controls
        muted
        autoPlay
        playsInline
        sx={{
          width: "100%",
          maxWidth: 1280,
          height: "100%",
          borderRadius: 2,
          backgroundColor: "black",
          objectFit: "contain",
        }}
      />
    </Box>
  );
}
