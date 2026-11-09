import { alpha, type Theme, type ThemeOptions } from '@mui/material/styles';
import Fade from '@mui/material/Fade';
import { DURATION, EASE_OUT } from './motion';

/** Card corner radius. Square: panels meet the page at a hard 90 degrees. */
export const RADIUS = 0;

/** A faint wash of the ink colour: hover on a neutral surface. */
const inkWash = (theme: Theme, light: number, dark = light * 1.4) => alpha(
  theme.palette.text.primary,
  theme.palette.mode === 'light' ? light : dark,
);

const ease = (...properties: string[]) => properties
  .map((property) => `${property} ${DURATION.hover}ms ${EASE_OUT}`)
  .join(', ');

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
const TONES: readonly string[] = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
const toneOf = (color: unknown): Tone | undefined => (
  typeof color === 'string' && TONES.includes(color) ? color as Tone : undefined
);

/*
 * The shared surface language, the same one the hostel front-end is built on,
 * kept out of the palettes so light and dark stay the same design in two
 * colourways. Panels are hard-edged tiles separated by the gap between them
 * rather than by borders or rules, and controls square off with them so
 * nothing reads as a leftover rounded widget.
 *
 * Nothing casts a shadow. Where a surface floats over the page a 1px edge in
 * the divider tone sets it apart.
 *
 * The orange is spent on the one thing to press. Everything else is ink, and
 * status colours only ever mean a status.
 */
export const components: ThemeOptions['components'] = {
  MuiCssBaseline: {
    styleOverrides: (theme: Theme) => ({
      '::selection': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.45 : 0.24),
        color: 'inherit',
      },
      'a:focus-visible:not(.MuiButtonBase-root)': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2,
      },
    }),
  },
  MuiButtonBase: {
    // A square state change, not a round ink splash, answers a press.
    defaultProps: { disableRipple: true },
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      }),
    },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    // Elevation normally tints dark surfaces, which muddies a flat tile.
    styleOverrides: { root: { backgroundImage: 'none' } },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: ({ theme, ownerState }) => {
        const primary = (ownerState.color ?? 'primary') === 'primary';

        return {
          borderRadius: RADIUS,
          paddingInline: 16,
          minHeight: 40,
          transition: `${ease('background-color', 'border-color', 'color')}, transform ${DURATION.press}ms ${EASE_OUT}`,
          '&:active:not(.Mui-disabled)': { transform: 'translateY(1px)' },
          '& .MuiButton-startIcon > *:nth-of-type(1), & .MuiButton-endIcon > *:nth-of-type(1)': { fontSize: 18 },
          // Secondary actions in ink, so the orange stays on the one to press.
          ...(ownerState.variant === 'outlined' && primary && {
            '--variant-outlinedColor': theme.palette.text.primary,
            '--variant-outlinedBorder': alpha(theme.palette.text.primary, 0.24),
            '&:hover': {
              '--variant-outlinedBorder': theme.palette.text.primary,
              '--variant-outlinedBg': inkWash(theme, 0.04),
            },
          }),
        };
      },
      sizeSmall: { minHeight: 32, paddingInline: 12, fontSize: '0.8125rem' },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: RADIUS,
        transition: ease('background-color', 'color'),
        '&:hover': { backgroundColor: inkWash(theme, 0.06) },
        '&:active': { backgroundColor: inkWash(theme, 0.1) },
      }),
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: RADIUS, fontWeight: 400, letterSpacing: '0.01em' },
      sizeSmall: { height: 22, fontSize: '0.75rem' },
    },
  },
  // Square, like every bar in the app: the flat end is where the value is read.
  MuiSlider: {
    styleOverrides: {
      root: { borderRadius: RADIUS },
      rail: { borderRadius: RADIUS },
      track: { borderRadius: RADIUS, border: 'none' },
      thumb: {
        borderRadius: RADIUS,
        boxShadow: 'none',
        '&::before': { boxShadow: 'none' },
        '&:hover, &.Mui-active': { boxShadow: 'none' },
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: { root: { borderRadius: RADIUS } },
  },
  // A flat tile with a rule in the colour of what it says, and the words in ink.
  MuiAlert: {
    styleOverrides: {
      root: { borderRadius: RADIUS, alignItems: 'center' },
      icon: { opacity: 1, marginRight: 10 },
      standard: ({ theme, ownerState }) => {
        const tone = theme.palette[toneOf(ownerState.color) ?? toneOf(ownerState.severity) ?? 'info'];

        return {
          backgroundColor: alpha(tone.main, theme.palette.mode === 'dark' ? 0.1 : 0.07),
          color: theme.palette.text.primary,
          borderLeft: `2px solid ${tone.main}`,
          '& .MuiAlert-icon': { color: tone.main },
        };
      },
    },
  },
  // The app's own inverse: ink with paper-coloured type.
  MuiTooltip: {
    defaultProps: { slots: { transition: Fade } },
    styleOverrides: {
      tooltip: ({ theme }) => ({
        backgroundColor: theme.palette.text.primary,
        color: theme.palette.background.paper,
        borderRadius: RADIUS,
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: 1.45,
        padding: '6px 10px',
      }),
      arrow: ({ theme }) => ({ color: theme.palette.text.primary }),
    },
  },
};
