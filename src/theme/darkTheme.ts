import { createTheme } from '@mui/material/styles';
import { components, RADIUS } from './components';
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
    info: { main: '#f1f0ee' },
    background: { default: '#000000', paper: '#141414' },
    text: { primary: '#f1f0ee', secondary: '#8a8880' },
    divider: '#262626',
  },
  typography,
  components,
  shape: { borderRadius: RADIUS },
});
