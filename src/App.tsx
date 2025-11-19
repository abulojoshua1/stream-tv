import { Player } from './components/player';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

export function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline applies global styles such as background and font */}
      <CssBaseline />
      <Player />
    </ThemeProvider>
  );
}
