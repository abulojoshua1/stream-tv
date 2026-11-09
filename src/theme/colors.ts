/**
 * The orange's cool partner, shared with the hostel front-end: deep on the
 * light ground and lifted on the dark one, so it is as present in both. It is
 * spent narrowly, never on chrome: a link among words and an informational
 * note. The orange still marks the one thing to look at first.
 */
export const BLUE = { light: '#2f55d4', dark: '#7b93ff' } as const;

/*
 * The brand's colours, shared with the hostel front-end: near-black,
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
  playerTextDim: 'rgba(241,240,238,0.72)', // secondary icons and labels at rest
  playerAccent: '#e2521f', // slider fill, the one thing to press
  playerWash: 'rgba(241,240,238,0.12)', // hover on a control
  playerWashStrong: 'rgba(241,240,238,0.2)', // a control being pressed
  playerLive: '#4caf72', // the pip while the picture is at the live edge
  playerIdle: 'rgba(241,240,238,0.4)', // the pip while it is not
  playerRail: 'rgba(241,240,238,0.3)', // slider unfilled rail
  playerBar: 'rgba(0,0,0,0.78)', // the flat strip the controls sit on
} as const;
