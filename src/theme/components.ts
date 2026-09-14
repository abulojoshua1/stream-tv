import type { ThemeOptions } from '@mui/material/styles';

/** Card corner radius. Square: panels meet the page at a hard 90 degrees. */
export const RADIUS = 0;

/*
 * The shared surface language, kept out of the palettes so light and dark stay
 * the same design in two colourways. Panels are hard-edged tiles separated by
 * the gap between them rather than by borders or rules, and controls square off
 * with them so nothing reads as a leftover rounded widget.
 */
export const components: ThemeOptions['components'] = {
  MuiPaper: {
    defaultProps: { elevation: 0 },
    // Elevation normally tints dark surfaces, which muddies a flat tile.
    styleOverrides: { root: { backgroundImage: 'none' } },
  },
  MuiCard: {
    defaultProps: { elevation: 0 },
    styleOverrides: {
      root: {
        backgroundImage: 'none', borderRadius: RADIUS, border: 'none', boxShadow: 'none',
      },
    },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0, color: 'inherit' },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundImage: 'none',
        backgroundColor: theme.palette.background.default,
        boxShadow: 'none',
      }),
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: { root: { borderRadius: RADIUS, paddingInline: 16 } },
  },
  MuiChip: {
    styleOverrides: { root: { borderRadius: RADIUS, fontWeight: 400 } },
  },
  MuiTableCell: {
    styleOverrides: {
      head: ({ theme }) => ({
        fontWeight: 400,
        color: theme.palette.text.secondary,
        borderBottomColor: theme.palette.divider,
      }),
      root: ({ theme }) => ({ borderBottomColor: theme.palette.divider }),
    },
  },
  MuiDialog: {
    styleOverrides: { paper: { borderRadius: RADIUS, backgroundImage: 'none' } },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: { borderRadius: RADIUS },
      notchedOutline: ({ theme }) => ({ borderColor: theme.palette.divider }),
    },
  },
  MuiLinearProgress: {
    styleOverrides: { root: { borderRadius: RADIUS, height: 6 } },
  },
  MuiAlert: {
    styleOverrides: { root: { borderRadius: RADIUS } },
  },
};

/** The muted caption sitting beside or under a figure. Spread into an `sx`. */
export const labelSx = {
  fontWeight: 400,
  color: 'text.secondary',
} as const;

/** The large figure a tile is built around. */
export const figureSx = {
  fontWeight: 300,
  lineHeight: 1.1,
  letterSpacing: '-0.02em',
} as const;
