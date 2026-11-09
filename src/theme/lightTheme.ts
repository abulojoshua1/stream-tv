import { createTheme } from '@mui/material/styles';
import { BLUE } from './colors';
import { components, RADIUS } from './components';
import { EASE_OUT } from './motion';
import { typography } from './typography';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    // Three colours only: near-black, off-white, and one orange that is spent
    // on the thing the eye should land on first and nowhere else.
    primary: { main: '#e2521f', contrastText: '#ffffff' },
    secondary: { main: '#0a0a0a', contrastText: '#f1f0ee' },
    success: { main: '#2f7d4f' },
    warning: { main: '#b25000' },
    error: { main: '#c62f1e' },
    info: { main: BLUE.light, contrastText: '#ffffff' },
    background: { default: '#e6e5e2', paper: '#f2f1ef' },
    text: { primary: '#0a0a0a', secondary: '#65635d' },
    divider: '#d5d3ce',
  },
  typography,
  components,
  shape: { borderRadius: RADIUS },
  // Every MUI hover and fade moves on the app's one curve, a little quicker than Material's.
  transitions: {
    duration: { shortest: 120, shorter: 160, short: 200 },
    easing: { easeInOut: EASE_OUT, easeOut: EASE_OUT },
  },
});
