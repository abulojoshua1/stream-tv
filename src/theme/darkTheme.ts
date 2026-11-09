import { createTheme } from '@mui/material/styles';
import { BLUE } from './colors';
import { components, RADIUS } from './components';
import { EASE_OUT } from './motion';
import { typography } from './typography';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    // The same three colours inverted: tiles sit a step above a black page,
    // and the orange stays exactly as loud as it is in the light theme.
    primary: { main: '#e2521f', contrastText: '#ffffff' },
    secondary: { main: '#f1f0ee', contrastText: '#0a0a0a' },
    success: { main: '#4caf72' },
    warning: { main: '#ff9f0a' },
    error: { main: '#ff5c48' },
    info: { main: BLUE.dark, contrastText: '#0a0a0a' },
    background: { default: '#000000', paper: '#141414' },
    text: { primary: '#f1f0ee', secondary: '#8a8880' },
    divider: '#262626',
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
