/*
 * The brand's three colours, shared with the hostel front-end: near-black,
 * off-white, and one orange spent only on the thing the eye should land on
 * first. The player tokens below are deliberately mode-independent — the
 * control bar sits on top of video, which is its own picture whatever the
 * page around it is doing, so its chrome stays dark in both themes.
 */
export const colors = {
  // Raw swatches
  orange: '#e2521f',
  brandOrange: '#f26522',
  ink: '#0a0a0a',
  paper: '#f1f0ee',

  // Player semantic tokens — always dark, always over video
  playerBg: '#000000',
  playerText: '#f1f0ee', // icons & labels
  playerTextDim: 'rgba(241,240,238,0.72)', // secondary icons at rest
  playerAccent: '#e2521f', // slider fill, hover accent
  playerAccentGlow: 'rgba(226,82,31,0.18)', // hover background tint
  playerLive: '#e2521f', // LIVE indicator dot
  playerLiveBorder: 'rgba(241,240,238,0.35)', // LIVE badge outline
  playerDivider: 'rgba(241,240,238,0.12)', // thin separator line
  playerRail: 'rgba(241,240,238,0.30)', // slider unfilled rail
  playerOverlay: 'rgba(0,0,0,0.94)', // controls bar bottom
  playerOverlay50: 'rgba(0,0,0,0.55)', // controls bar mid-gradient
} as const;
