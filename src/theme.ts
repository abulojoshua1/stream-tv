// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // or 'light'
    primary: {
      main: '#90caf9', // light blue
    },
    secondary: {
      main: '#f48fb1', // pink
    },
    background: {
      default: '#000000', // black background like your player
      paper: '#121212',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
  },
});

export default theme;
