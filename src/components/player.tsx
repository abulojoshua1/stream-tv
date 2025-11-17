import { useEffect, useRef } from "react";
import Hls from "hls.js";
import ReactPlayer from 'react-player'

export function Player() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const src = "/hls/live.m3u8"; // or "/av_feed" (it redirects)

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari / native HLS support
      video.src = src;
      video.play().catch(() => { });
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        liveDurationInfinity: false,
        liveSyncDuration: 2,        // how close to live edge (seconds)
        liveMaxLatencyDuration: 30, // how far back user may seek
        maxBufferLength: 60,        // buffer up to 60 seconds
      });

      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => { });
      });

      return () => {
        hls.destroy();
      };
    } else {
      console.error("HLS not supported in this browser.");
    }
  }, []);

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
      <ReactPlayer
        ref={videoRef}
        controls
        muted={false}
        autoPlay
        playsInline
        playing
        width="100%"
        height="auto"
        style={{
          maxWidth: "1280px",
          borderRadius: "8px",
          background: "black",
        }}
      />
    </div>
  );
}
