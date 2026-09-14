import { createTheme } from '@mui/material/styles';
import { components, RADIUS } from './components';
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
    info: { main: '#0a0a0a' },
    background: { default: '#e6e5e2', paper: '#f2f1ef' },
    text: { primary: '#0a0a0a', secondary: '#77756f' },
    divider: '#d5d3ce',
  },
  typography,
  components,
  shape: { borderRadius: RADIUS },
});
