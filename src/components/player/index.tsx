import Hls from 'hls.js';
import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { colors } from '../../theme';
import { ErrorState } from './ErrorState';
import { LiveBadge } from './LiveBadge';
import { PlayPause } from './PlayPause';
import { VolumeControls } from './VolumeControls';

interface PlayerProps {
  /** The widest the tile may be drawn, in pixels. */
  maxWidth: number;
}

export function Player({ maxWidth }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [volume, setVolume] = useState(0);
  const [lastVolume, setLastVolume] = useState(80);
  const [controlsVisible, setControlsVisible] = useState(true);

  const scheduleHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3500);
  };

  // Auto-hide controls on mount
  useEffect(() => {
    scheduleHide();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  // Sync play/pause state from video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const onPlay = () => setIsPaused(false);
    const onPause = () => setIsPaused(true);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, []);

  // HLS setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const src = import.meta.env.VITE_HLS_URL || `${import.meta.env.BASE_URL}hls/live.m3u8`;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play().catch(() => {});
      return undefined;
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
          setError('Signal jam! Time to reload and retry!');
          return;
        }
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError('Signal jam! Time to reload and retry!');
          return;
        }
        if (data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR) {
          setError('Signal jam! Time to reload and retry!');
        }
      });

      return () => hls.destroy();
    }

    queueMicrotask(() => setError('This browser cannot play live streams!'));
    return undefined;
  }, []);

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

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
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

  if (error) return <ErrorState maxWidth={maxWidth} />;

  return (
    <Box
      sx={{
        position: 'relative',
        // Whichever of the two runs out first is what sizes the tile, so it
        // always fits between the header and the footer without ever being
        // letterboxed. Landscape: the height is the scarce one, so the tile
        // takes all of it and the width follows the ratio. Portrait: the
        // width is, and a 16/9 box drawn from it is never tall enough to
        // overflow — which is why this is two regimes rather than one clamp.
        aspectRatio: '16/9',
        height: '100%',
        width: 'auto',
        maxWidth: `min(100%, ${maxWidth}px)`,
        '@media (orientation: portrait)': {
          height: 'auto',
          width: '100%',
        },
        bgcolor: colors.playerBg,
        overflow: 'hidden',
        cursor: controlsVisible ? 'default' : 'none',
        // The tile reads as a lit panel on the pale page and as a plain black
        // rectangle on the dark one, where a shadow would be invisible anyway.
        boxShadow: (theme) => (theme.palette.mode === 'light'
          ? '0 24px 60px -24px rgba(10,10,10,0.45)'
          : 'none'),
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setControlsVisible(false)}
      onTouchStart={handleMouseMove}
    >
      {/* VIDEO */}
      <Box
        component="video"
        ref={videoRef}
        controls={false}
        muted
        autoPlay
        playsInline
        sx={{
          width: '100%', height: '100%', objectFit: 'contain', display: 'block',
        }}
      />

      {/* CONTROLS OVERLAY */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: `linear-gradient(to bottom, transparent 50%, ${colors.playerOverlay50} 75%, ${colors.playerOverlay} 100%)`,
          opacity: controlsVisible ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: controlsVisible ? 'auto' : 'none',
        }}
      >
        {/* Separator */}
        <Box sx={{ height: '1px', bgcolor: colors.playerDivider, mx: { xs: '16px', sm: '20px', md: '28px' } }} />

        {/* Controls grid — 1fr | auto | 1fr keeps play/pause perfectly centred */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            px: { xs: '16px', sm: '20px', md: '28px' },
            py: { xs: '10px', sm: '14px', md: '18px' },
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
