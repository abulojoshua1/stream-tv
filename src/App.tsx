import { useEffect, useRef } from "react";
import Hls from "hls.js";

export function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const src = "/hls/live.m3u8";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        liveDurationInfinity: false,
        liveSyncDuration: 2,
        liveMaxLatencyDuration: 30,
        maxBufferLength: 60,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });

      return () => hls.destroy();
    } else {
      console.error("HLS not supported.");
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
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
          height: "100%",
          maxWidth: "1280px",
          maxHeight: "100%",
          objectFit: "contain",
          background: "black",
          borderRadius: "8px",
        }}
      />
    </div>
  );
}
