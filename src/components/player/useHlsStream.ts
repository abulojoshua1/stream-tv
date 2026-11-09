import type Hls from 'hls.js';
import {
  useEffect, useRef, useState, type RefObject,
} from 'react';

/** Why there is no picture: the feed cannot be reached, or this browser cannot play one. */
export type Failure = 'signal' | 'unsupported';

const SOURCE = import.meta.env.VITE_HLS_URL || `${import.meta.env.BASE_URL}hls/live.m3u8`;

/** Seconds behind where the player aims to sit before it counts as "not live". */
const BEHIND_AFTER = 6;

/**
 * How long a pause lasts before the player stops fetching. A double click
 * (full screen) pauses and plays within this, and must not restart the feed.
 */
const STOP_LOADING_AFTER = 1500;

/** Times a decoder fault is repaired in place before the feed is given up on. */
const MEDIA_RECOVERIES = 2;

/*
 * The watchdog, for a screen nobody is standing at. A picture that should be
 * moving and has not for STUCK_AFTER seconds is first put back where there
 * is picture, if it has drifted off it; still frozen at twice that, the
 * stream is rebuilt from nothing. It is only rebuilt once until it has since
 * played for STEADY_AFTER seconds: a
 * broadcast that has gone quiet would otherwise replay its last few seconds
 * on a loop, where a frozen frame that picks up again by itself is the truth.
 */
const WATCH_EVERY = 2;
const STUCK_AFTER = 8;
const STEADY_AFTER = 30;

/**
 * Where to put a playhead that has come to rest outside every stretch of
 * picture that has arrived: the start of the next stretch ahead, or failing
 * that the newest one. Null while it is within one, or at the end of one.
 */
function landingPoint(video: HTMLVideoElement): number | null {
  const { buffered, currentTime } = video;
  if (buffered.length === 0) return null;
  for (let index = 0; index < buffered.length; index += 1) {
    if (currentTime >= buffered.start(index) - 0.5 && currentTime <= buffered.end(index) + 0.5) {
      return null;
    }
    if (buffered.start(index) > currentTime) return buffered.start(index) + 0.1;
  }
  const last = buffered.length - 1;

  return Math.max(buffered.start(last), buffered.end(last) - 3);
}

/**
 * Plays the live feed in the given video element and reports how that is
 * going. Start with the sound the viewer asked for; a browser that refuses to
 * autoplay with sound gets the picture muted instead, and the element's own
 * `volumechange` event says so.
 */
export function useHlsStream(videoRef: RefObject<HTMLVideoElement | null>) {
  const [failure, setFailure] = useState<Failure | null>(null);
  const [behind, setBehind] = useState(false);
  // Bumped to tear the stream down and build it again from nothing.
  const [session, setSession] = useState(0);
  const hlsRef = useRef<Hls | null>(null);
  const rebuiltRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const listeners = new AbortController();
    const { signal } = listeners;
    let hls: Hls | null = null;
    let disposed = false;
    let native = false;
    let mediaRecoveries = 0;
    // Paused long enough that fetching was stopped, and has to be picked up again.
    let stopped = false;
    let rejoinLive = false;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;

    const fail = (kind: Failure) => {
      if (disposed) return;
      hls?.destroy();
      hls = null;
      hlsRef.current = null;
      setFailure(kind);
    };

    const start = () => {
      video.play().catch(() => {
        if (disposed || video.muted) return;
        // Autoplay with sound was refused: the picture still starts, silent.
        video.muted = true;
        video.play().catch(() => {});
      });
    };

    const playNatively = () => {
      if (!video.canPlayType('application/vnd.apple.mpegurl')) {
        fail('unsupported');
        return;
      }
      native = true;
      video.src = SOURCE;
      video.addEventListener('loadedmetadata', start, { once: true, signal });
      video.addEventListener('error', () => fail('signal'), { signal });
    };

    const playWithHls = (HlsLight: typeof Hls) => {
      const instance = new HlsLight({
        enableWorker: true,
        // Sit three segments behind the edge: close to live, with room to ride
        // out one slow segment without stalling.
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 6,
        // Drift is closed by playing a touch faster, not by a visible jump.
        // (hls.js only does this in low-latency mode, which is otherwise
        // inert on a feed without partial segments.)
        lowLatencyMode: true,
        maxLiveSyncPlaybackRate: 1.05,
        // A live feed has nothing ahead to buffer and nothing behind worth
        // keeping, so memory stays flat however long the page is left open.
        maxBufferLength: 20,
        maxMaxBufferLength: 30,
        maxBufferSize: 30 * 1000 * 1000,
        backBufferLength: 10,
        // Never decode more pixels than the tile shows, if a ladder is added.
        capLevelToPlayerSize: true,
      });
      hls = instance;
      hlsRef.current = instance;

      instance.on(HlsLight.Events.MANIFEST_PARSED, (_, data) => {
        if (data.levels.length === 0) fail('signal');
        else start();
      });

      instance.on(HlsLight.Events.LEVEL_UPDATED, () => {
        if (!rejoinLive || instance.liveSyncPosition === null) return;
        rejoinLive = false;
        video.currentTime = instance.liveSyncPosition;
      });

      instance.on(HlsLight.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        // hls.js has already retried the network by the time an error is
        // fatal; a decoder fault it leaves to us, and is usually repairable.
        if (data.type === HlsLight.ErrorTypes.MEDIA_ERROR && mediaRecoveries < MEDIA_RECOVERIES) {
          mediaRecoveries += 1;
          instance.recoverMediaError();
          return;
        }
        fail('signal');
      });

      instance.loadSource(SOURCE);
      instance.attachMedia(video);
    };

    // A paused live feed is not worth downloading: stop, and on play pick the
    // broadcast up where it is now, not where it was left.
    video.addEventListener('pause', () => {
      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => {
        if (!hls || !video.paused) return;
        hls.stopLoad();
        stopped = true;
      }, STOP_LOADING_AFTER);
    }, { signal });

    video.addEventListener('play', () => {
      clearTimeout(stopTimer);
      if (!hls || !stopped) return;
      stopped = false;
      rejoinLive = true;
      hls.startLoad(-1);
    }, { signal });

    video.addEventListener('timeupdate', () => {
      let lag = 0;
      if (hls) {
        lag = hls.liveSyncPosition === null ? 0 : hls.liveSyncPosition - video.currentTime;
      } else if (native && video.seekable.length > 0) {
        // Safari keeps its own distance from the end of the playlist.
        lag = video.seekable.end(video.seekable.length - 1) - video.currentTime - 12;
      }
      setBehind(lag > BEHIND_AFTER);
    }, { signal });

    let lastTime = -1;
    let stuckFor = 0;
    let steadyFor = 0;
    const watchdog = setInterval(() => {
      if (video.paused || stopped) {
        stuckFor = 0;
        return;
      }
      if (video.currentTime !== lastTime) {
        lastTime = video.currentTime;
        stuckFor = 0;
        steadyFor += WATCH_EVERY;
        if (steadyFor >= STEADY_AFTER) rebuiltRef.current = false;
        return;
      }
      steadyFor = 0;
      stuckFor += WATCH_EVERY;
      // Adrift: sitting in a hole with picture either side of it, rather than
      // at the end of what has arrived (which is just a broadcast that paused).
      const landing = landingPoint(video);
      if (stuckFor === STUCK_AFTER && landing !== null) {
        video.currentTime = landing;
      } else if (stuckFor >= STUCK_AFTER * 2 && !rebuiltRef.current) {
        rebuiltRef.current = true;
        setSession((current) => current + 1);
      }
    }, WATCH_EVERY * 1000);

    // hls.js is only fetched by the browsers that need it, and only once the
    // page is already on screen. Where there is no Media Source at all (an
    // iPhone), the browser plays HLS itself.
    const hasMediaSource = 'MediaSource' in window || 'ManagedMediaSource' in window;
    const loading = hasMediaSource ? import('hls.js/light') : Promise.resolve(null);

    loading
      .then((module) => {
        if (disposed) return;
        if (module?.default.isSupported()) playWithHls(module.default);
        else playNatively();
      })
      .catch(() => fail('signal'));

    return () => {
      disposed = true;
      listeners.abort();
      clearTimeout(stopTimer);
      clearInterval(watchdog);
      hls?.destroy();
      hlsRef.current = null;
      if (native) {
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [videoRef, session]);

  /** Jump to the live edge, and play. */
  const goLive = () => {
    const video = videoRef.current;
    if (!video) return;
    // Resuming a stopped feed rejoins at the edge on its own.
    if (!video.paused) {
      const sync = hlsRef.current?.liveSyncPosition;
      if (typeof sync === 'number') video.currentTime = sync;
      else if (video.seekable.length > 0) {
        video.currentTime = Math.max(0, video.seekable.end(video.seekable.length - 1) - 6);
      }
    }
    video.play().catch(() => {});
  };

  /** Start over: a new connection to the feed. */
  const retry = () => {
    setFailure(null);
    setBehind(false);
    setSession((current) => current + 1);
  };

  return {
    failure, behind, goLive, retry,
  };
}
