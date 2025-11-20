import { Player } from './components/player';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from "@mui/material";
import { darkTheme } from './theme';

export function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      {/* CssBaseline applies global styles such as background and font */}
      <CssBaseline />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
        height="100vh"
        bgcolor="#000000"
        overflow="hidden"
      >
        <Player />
      </Box>
    </ThemeProvider>
  );
}
