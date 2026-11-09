import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import {
  Box, Button, LinearProgress, Slider,
} from '@mui/material';
import {
  useEffect, useRef, useState, type MouseEvent,
} from 'react';
import { colors } from '../../theme';
import {
  DURATION, EASE_OUT, fade, rise,
} from '../../theme/motion';
import { ControlButton } from './ControlButton';
import { ErrorState } from './ErrorState';
import { LiveBadge } from './LiveBadge';
import { loadSound, saveSound } from './sound';
import { useHlsStream } from './useHlsStream';

interface PlayerProps {
  /** The widest the tile may be drawn, in pixels. */
  maxWidth: number;
}

/** How long the controls stay up after the pointer last moved. */
const HIDE_CONTROLS_AFTER = 3000;

/** What one press of an arrow key adds to or takes off the volume. */
const VOLUME_STEP = 5;

const ICON = { fontSize: 22 } as const;

/** iOS has no element full screen, only its own for the video itself. */
type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

export function Player({ maxWidth }: PlayerProps) {
  const tileRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read once: what the viewer left the sound at last time.
  const [savedSound] = useState(loadSound);
  const [volume, setVolume] = useState(savedSound.volume);
  const [isMuted, setIsMuted] = useState(savedSound.muted);
  // Silence the viewer chose, as opposed to silence the browser's autoplay
  // rules forced: only the second is worth offering a way out of.
  const [choseMuted, setChoseMuted] = useState(savedSound.muted);

  const [isPaused, setIsPaused] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inPictureInPicture, setInPictureInPicture] = useState(false);
  const [pointerActive, setPointerActive] = useState(true);

  // The saved sound goes onto the element before the stream first plays.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = savedSound.volume / 100;
    video.muted = savedSound.muted;
  }, [savedSound]);

  const {
    failure, behind, goLive, retry,
  } = useHlsStream(videoRef);

  const revealControls = () => {
    setPointerActive(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setPointerActive(false), HIDE_CONTROLS_AFTER);
  };

  useEffect(() => {
    hideTimerRef.current = setTimeout(() => setPointerActive(false), HIDE_CONTROLS_AFTER);

    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, []);

  // The element is the one source of truth; the controls only mirror it, so a
  // media key or the picture-in-picture window's own buttons stay in step.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const listeners = new AbortController();
    const { signal } = listeners;

    video.addEventListener('play', () => setIsPaused(false), { signal });
    video.addEventListener('pause', () => { setIsPaused(true); setIsBuffering(false); }, { signal });
    video.addEventListener('waiting', () => setIsBuffering(true), { signal });
    video.addEventListener('playing', () => setIsBuffering(false), { signal });
    video.addEventListener('volumechange', () => {
      setIsMuted(video.muted);
      setVolume(Math.round(video.volume * 100));
    }, { signal });
    video.addEventListener('enterpictureinpicture', () => setInPictureInPicture(true), { signal });
    video.addEventListener('leavepictureinpicture', () => setInPictureInPicture(false), { signal });
    document.addEventListener('fullscreenchange', () => {
      setIsFullscreen(document.fullscreenElement === tileRef.current);
    }, { signal });

    return () => listeners.abort();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const setSound = (nextVolume: number, nextMuted: boolean) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.min(100, Math.max(0, nextVolume));
    video.volume = clamped / 100;
    video.muted = nextMuted;
    // Set here as well as from the element's event, which a busy page can
    // deliver a moment late: the control answers the hand that moved it.
    setVolume(clamped);
    setIsMuted(nextMuted);
    setChoseMuted(nextMuted);
    saveSound({ volume: clamped, muted: nextMuted });
  };

  // Unmuting at zero would change nothing anyone could hear.
  const toggleMute = () => (isMuted ? setSound(volume || 80, false) : setSound(volume, true));
  const changeVolume = (next: number) => setSound(next, next <= 0);

  const toggleFullscreen = () => {
    const tile = tileRef.current;
    const video: FullscreenVideo | null = videoRef.current;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    // The tile, not the video: the controls go to full screen with the picture.
    else if (tile?.requestFullscreen) tile.requestFullscreen().catch(() => {});
    else video?.webkitEnterFullscreen?.();
  };

  const canPictureInPicture = typeof document !== 'undefined' && document.pictureInPictureEnabled;
  const togglePictureInPicture = () => {
    if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {});
    else videoRef.current?.requestPictureInPicture().catch(() => {});
  };

  // The keys a video player is expected to answer to, wherever the focus is.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || failure) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      const key = event.key.toLowerCase();
      // A focused button already answers to space; pressing it twice would undo itself.
      if (key === ' ' && target?.closest('button, a')) return;

      if (key === ' ' || key === 'k') togglePlay();
      else if (key === 'm') toggleMute();
      else if (key === 'f') toggleFullscreen();
      else if (key === 'p' && canPictureInPicture) togglePictureInPicture();
      else if (key === 'l') goLive();
      else if (key === 'arrowup') changeVolume((isMuted ? 0 : volume) + VOLUME_STEP);
      else if (key === 'arrowdown') changeVolume((isMuted ? 0 : volume) - VOLUME_STEP);
      else return;

      event.preventDefault();
      revealControls();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  });

  // A mouse click on the picture plays or stops it; a finger's first touch
  // only brings the controls up, as it has no other way to ask for them.
  const handlePictureClick = (event: MouseEvent) => {
    if ((event.nativeEvent as PointerEvent).pointerType === 'mouse') togglePlay();
  };

  const audibleVolume = isMuted ? 0 : volume;
  // Stopped, there is nothing to watch for the controls to be in the way of.
  const controlsVisible = pointerActive || isPaused;
  const offerSound = isMuted && !choseMuted && !failure;

  let volumeIcon = <VolumeUpIcon sx={ICON} />;
  if (audibleVolume === 0) volumeIcon = <VolumeOffIcon sx={ICON} />;
  else if (audibleVolume < 50) volumeIcon = <VolumeDownIcon sx={ICON} />;

  return (
    <Box
      ref={tileRef}
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
        // Full screen is the whole screen, whatever shape it is.
        '&:fullscreen': {
          aspectRatio: 'auto', width: '100%', height: '100%', maxWidth: 'none',
        },
        bgcolor: colors.playerBg,
        overflow: 'hidden',
        cursor: controlsVisible ? 'default' : 'none',
        // The tile settles into place once, as the page arrives.
        animation: `${rise} 320ms ${EASE_OUT} backwards`,
      }}
      onMouseMove={revealControls}
      onMouseLeave={() => setPointerActive(false)}
      onTouchStart={revealControls}
      onFocus={revealControls}
    >
      <Box
        component="video"
        ref={videoRef}
        playsInline
        onClick={handlePictureClick}
        onDoubleClick={toggleFullscreen}
        sx={{
          width: '100%', height: '100%', objectFit: 'contain', display: 'block',
        }}
      />

      {/* The app's loading bar, along the top edge while the picture is held up. */}
      {isBuffering && !failure && (
        <LinearProgress
          aria-label="Loading the stream"
          sx={{
            position: 'absolute',
            inset: '0 0 auto 0',
            height: 2,
            bgcolor: 'transparent',
            // Only after a moment: most waits are over before they are worth showing.
            animation: `${fade} 200ms ${EASE_OUT} 400ms backwards`,
          }}
        />
      )}

      {/* The browser started the stream silent: the one thing to press. */}
      {offerSound && (
        <Button
          variant="contained"
          size="small"
          startIcon={<VolumeOffIcon />}
          onClick={toggleMute}
          sx={{
            position: 'absolute',
            top: { xs: 12, sm: 16 },
            left: { xs: 12, sm: 16 },
            animation: `${rise} 320ms ${EASE_OUT} 200ms backwards`,
          }}
        >
          Turn sound on
        </Button>
      )}

      {/* The controls: a flat strip along the foot of the picture. The play
          control sits in the middle column of 1fr | auto | 1fr, so it stays
          centred whatever is either side of it. */}
      {!failure && (
        <Box
          sx={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            px: { xs: 1, sm: 1.5 },
            py: { xs: 0.5, sm: 0.75 },
            bgcolor: colors.playerBar,
            opacity: controlsVisible ? 1 : 0,
            transform: controlsVisible ? 'none' : 'translateY(6px)',
            visibility: controlsVisible ? 'visible' : 'hidden',
            transition: controlsVisible
              ? `opacity ${DURATION.overlay}ms ${EASE_OUT}, transform ${DURATION.overlay}ms ${EASE_OUT}`
              // Hidden only once it has faded, so it leaves the tab order too.
              : `opacity ${DURATION.enter}ms ${EASE_OUT}, transform ${DURATION.enter}ms ${EASE_OUT}, visibility 0s ${DURATION.enter}ms`,
          }}
        >
          <Box sx={{ pl: { xs: 0.5, sm: 1 } }}>
            <LiveBadge live={!isPaused && !behind} onGoLive={goLive} />
          </Box>

          <ControlButton label={isPaused ? 'Play (Space)' : 'Stop (Space)'} onClick={togglePlay} prominent>
            {isPaused
              ? <PlayArrowIcon sx={{ fontSize: 28 }} />
              : <StopIcon sx={{ fontSize: 28 }} />}
          </ControlButton>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <ControlButton label={isMuted ? 'Unmute (M)' : 'Mute (M)'} onClick={toggleMute}>
              {volumeIcon}
            </ControlButton>

            {/* Not on a phone, whose own buttons set the volume. */}
            <Slider
              aria-label="Volume"
              value={audibleVolume}
              onChange={(_, value) => changeVolume(value)}
              min={0}
              max={100}
              sx={{
                display: { xs: 'none', sm: 'block' },
                width: { sm: 80, md: 110 },
                flexShrink: 0,
                mx: 1.5,
                height: 4,
                p: '10px 0',
                color: colors.playerAccent,
                '& .MuiSlider-rail': { bgcolor: colors.playerRail, opacity: 1 },
                '& .MuiSlider-thumb': { width: 12, height: 12, bgcolor: colors.playerText },
              }}
            />

            {canPictureInPicture && (
              <ControlButton
                label={inPictureInPicture ? 'Back to the page (P)' : 'Picture in picture (P)'}
                onClick={togglePictureInPicture}
              >
                <PictureInPictureAltIcon sx={{ fontSize: 20 }} />
              </ControlButton>
            )}

            <ControlButton
              label={isFullscreen ? 'Exit full screen (F)' : 'Full screen (F)'}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <FullscreenExitIcon sx={ICON} /> : <FullscreenIcon sx={ICON} />}
            </ControlButton>
          </Box>
        </Box>
      )}

      {failure && <ErrorState failure={failure} onRetry={retry} />}
    </Box>
  );
}
