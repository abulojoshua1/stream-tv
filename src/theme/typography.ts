/*
 * A neutral geometric sans, set light. Inter ships real 300/400/500 cuts, so
 * the weights below are genuine rather than synthesised: body copy sits at 300
 * and the few places that need emphasis step up to 400, which is enough
 * separation without anything reading as bold.
 */
const sans = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

export const typography = {
  fontFamily: sans,
  fontWeightLight: 300,
  fontWeightRegular: 300,
  fontWeightMedium: 400,
  fontWeightBold: 500,
  h1: { fontWeight: 300, letterSpacing: '-0.025em' },
  h2: { fontWeight: 300, letterSpacing: '-0.022em' },
  h3: { fontWeight: 300, letterSpacing: '-0.02em' },
  h4: { fontWeight: 400, letterSpacing: '-0.018em' },
  h5: { fontWeight: 400, letterSpacing: '-0.015em' },
  h6: { fontWeight: 400, letterSpacing: '-0.012em' },
  subtitle1: { fontWeight: 400, letterSpacing: '-0.011em' },
  subtitle2: { fontWeight: 400, letterSpacing: '-0.008em' },
  body1: { fontWeight: 300, letterSpacing: '-0.011em' },
  body2: { fontWeight: 300, letterSpacing: '-0.006em' },
  button: { fontWeight: 400, letterSpacing: '-0.006em' },
  caption: { fontWeight: 300, letterSpacing: 0 },
  overline: { fontWeight: 400, letterSpacing: '0.08em' },
} as const;
