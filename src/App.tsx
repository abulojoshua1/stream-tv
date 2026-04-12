import { Player } from './components/player';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme } from './theme';

export function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Player />
    </ThemeProvider>
  );
}
