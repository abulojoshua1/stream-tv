/*
 * A neutral geometric sans, set light. Inter ships real 300/400/500 cuts, so
 * the weights below are genuine rather than synthesised: body copy sits at 300
 * and the few places that need emphasis step up to 400, which is enough
 * separation without anything reading as bold. Inter is loaded with its
 * optical sizes (index.scss), so titles get the tighter display cut on their
 * own and only need a little tracking taken out.
 *
 * Each variant has one job, so a size says what a thing is:
 *   h6         a title on the tile
 *   body1/2    reading text
 *   caption    a note
 *   overline   a label: small, tracked capitals, never something to click
 *   button     an action: sentence case, never capitals
 */
const sans = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

export const typography = {
  fontFamily: sans,
  fontWeightLight: 300,
  fontWeightRegular: 300,
  fontWeightMedium: 400,
  fontWeightBold: 500,
  h1: { fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.025em' },
  h2: { fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em' },
  h3: { fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em' },
  h4: { fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.018em' },
  h5: { fontWeight: 400, lineHeight: 1.25, letterSpacing: '-0.015em' },
  h6: {
    fontWeight: 400, fontSize: '1.375rem', lineHeight: 1.25, letterSpacing: '-0.015em', textWrap: 'balance',
  },
  subtitle1: { fontWeight: 400, lineHeight: 1.45, letterSpacing: '-0.011em' },
  subtitle2: {
    fontWeight: 400, fontSize: '1rem', lineHeight: 1.4, letterSpacing: '-0.011em',
  },
  body1: { fontWeight: 300, lineHeight: 1.55, letterSpacing: '-0.011em' },
  body2: { fontWeight: 300, lineHeight: 1.5, letterSpacing: '-0.006em' },
  button: {
    fontWeight: 400, lineHeight: 1.5, letterSpacing: '-0.006em', textTransform: 'none',
  },
  // At 12px a 300 cut turns to a hairline in grey on the dark page; 400 still reads light.
  caption: {
    fontWeight: 400, fontSize: '0.75rem', lineHeight: 1.45, letterSpacing: '0.005em',
  },
  // Capitals need air between them, where lower case wants it taken out.
  overline: {
    fontWeight: 500,
    fontSize: '0.6875rem',
    lineHeight: 1.5,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    display: 'block',
  },
} as const;
