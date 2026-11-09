/*
 * hls.js ships a light build (no subtitles, alternate audio, DRM or ad
 * insertion: none of which a single live feed uses) at about half the size,
 * but publishes no types for that entry point. It is the same API.
 */
declare module 'hls.js/light' {
  export * from 'hls.js';
  // eslint-disable-next-line no-restricted-exports
  export { default } from 'hls.js';
}
