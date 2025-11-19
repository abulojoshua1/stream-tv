import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export function Player() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = "/hls/live.m3u8";

    // Native browser HLS (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.play().catch(() => {});
      return;
    }

    // Hls.js support
    if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: false,
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 12,

        maxBufferLength: 60,             // seconds to buffer
        maxMaxBufferLength: 120,         // absolute cap
        maxBufferSize: 120 * 1000 * 1000,// 120 MB
        backBufferLength: 120,

        enableWorker: true,
        progressive: true,

        maxFragLookUpTolerance: 0.5,
      });

      hls.startLoad(0); // immediately start downloading
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError("A streaming error occurred. Please reload the page.");
        }
      });

      return () => {
        hls.destroy();
      };
    }

    // ❌ No HLS support
    setError("Your browser does not support HLS video playback.");
  }, []);

  // If error -> show message instead of video element
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100vh",
          background: "#000",
          color: "#fff",
          fontSize: "1.4rem",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        {error}
      </div>
    );
  }

  // No error -> show the player
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        background: "#000",
      }}
    >
      <video
        ref={videoRef}
        controls
        muted
        autoPlay
        playsInline
        style={{
          width: "100%",
          maxWidth: "1280px",
          borderRadius: "8px",
          background: "black",
        }}
      />
    </div>
  );
}
