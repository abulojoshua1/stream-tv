import { createTheme } from '@mui/material';

// ─── Brand palette ────────────────────────────────────────────────────────────
export const colors = {
  // Raw swatches
  powderBlue: '#8EB1C7',
  oxidizedIron: '#B02E0C',
  moltenOrange: '#EB4511',
  silver: '#C1BFB5',
  white: '#FEFDFF',

  // Player semantic tokens
  playerBg: '#000000',
  playerText: '#FEFDFF', // icons & labels
  playerTextDim: 'rgba(254,253,255,0.72)', // secondary icons at rest
  playerAccent: '#EB4511', // slider fill, hover accent
  playerAccentGlow: 'rgba(235,69,17,0.18)', // hover background tint
  playerLive: '#B02E0C', // LIVE indicator dot
  playerLiveBorder: 'rgba(193,191,181,0.35)', // LIVE badge outline
  playerDivider: 'rgba(193,191,181,0.12)', // thin separator line
  playerRail: 'rgba(193,191,181,0.30)', // slider unfilled rail
  playerOverlay: 'rgba(10,7,5,0.94)', // controls bar bottom
  playerOverlay50: 'rgba(10,7,5,0.55)', // controls bar mid-gradient
} as const;

// ─── MUI Theme ────────────────────────────────────────────────────────────────
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.moltenOrange,
      light: colors.white,
      dark: colors.oxidizedIron,
    },
    secondary: {
      main: colors.powderBlue,
      light: colors.silver,
      dark: colors.powderBlue,
    },
    error: {
      main: colors.oxidizedIron,
    },
    warning: {
      main: colors.moltenOrange,
    },
    success: {
      main: '#3c6e71',
    },
    text: {
      primary: colors.white,
      secondary: colors.silver,
    },
    background: {
      default: colors.playerBg,
      paper: '#0a0703',
    },
  },

  components: {
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        sx: {
          '& input:-webkit-autofill': {
            WebkitBoxShadow: '0 0 0 1000px transparent inset',
            WebkitTextFillColor: 'inherit',
          },
        },
      },
      variants: [
        {
          props: { variant: 'outlined', color: 'primary' },
          style: {
            '& input': { fontSize: '14px' },
            '& fieldset': { borderColor: colors.silver },
            '& .Mui-focused fieldset': { borderColor: `${colors.white} !important` },
            '& label.Mui-focused': { color: colors.white },
          },
        },
      ],
    },
    MuiLink: {
      defaultProps: { color: colors.white },
    },
    MuiTab: {
      defaultProps: {
        sx: {
          color: colors.silver,
          textTransform: 'capitalize',
          '&.Mui-selected': { color: colors.white },
        },
      },
    },
    MuiTabs: {
      defaultProps: { sx: {} },
      styleOverrides: {
        indicator: { backgroundColor: colors.moltenOrange },
      },
    },
    MuiSelect: {
      defaultProps: { fullWidth: true },
      variants: [
        {
          props: { variant: 'outlined' },
          style: {
            '& input': { fontSize: '14px' },
            '& fieldset': { borderColor: colors.silver },
            '& fieldset.Mui-focused': { borderColor: `${colors.white} !important` },
          },
        },
      ],
    },
    MuiRadio: {
      defaultProps: { style: { color: colors.white } },
    },
    MuiTypography: {
      styleOverrides: {
        h1: { fontSize: '34px', fontWeight: 500, color: colors.white },
        h2: { fontSize: '30px', fontWeight: 500, color: colors.white },
        h3: { fontSize: '24px', fontWeight: 500, color: colors.white },
        h4: { fontSize: '20px', fontWeight: 500, color: colors.white },
        h5: { fontSize: '18px', fontWeight: 500, color: colors.white },
        h6: { fontSize: '16px', fontWeight: 500, color: colors.white },
        body1: { fontSize: '16px', fontWeight: 'lighter', color: colors.white },
        body2: { fontSize: '14px', fontWeight: 'lighter', color: colors.white },
        caption: { fontSize: '13px', color: colors.white },
        subtitle1: { fontSize: '13px', color: colors.silver },
        subtitle2: { fontSize: '13px', color: colors.silver },
      },
    },
    MuiPopper: {
      defaultProps: { sx: { zIndex: 1300 } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: '1.1rem' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: colors.white,
          textTransform: 'capitalize',
          borderWidth: 2,
          ':hover': { borderWidth: 2 },
        },
      },
    },
    MuiMenuList: {
      styleOverrides: {
        root: { backgroundColor: '#0a0703' },
      },
    },
    MuiList: {
      styleOverrides: {
        root: { backgroundColor: '#0f0c0a' },
      },
    },
  },

  spacing: [0, 4, 8, 16, 32, 64, 128, 256, 512],
});
