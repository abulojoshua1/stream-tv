import CssBaseline from '@mui/material/CssBaseline';
import { Box, Stack, Typography } from '@mui/material';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { BrandLogo } from './components/BrandLogo';
import { ColorModeToggle } from './components/ColorModeToggle';
import { Player } from './components/player';
import { AppThemeProvider } from './theme';

/*
 * One measure governs the page. Header, player and footer are all this wide
 * and share a left edge, so the video is not a narrow tile floating inside
 * full-bleed furniture; and every element is sized off the same scale below,
 * which is why the logo, the toggle and the footer line look like they belong
 * to each other at any width.
 */
const MEASURE = 1280;

/** The page gutter, and the rhythm the header and footer breathe on. */
const GUTTER = { xs: 2, sm: 3, md: 4 };

/*
 * The mark's height, and the unit the rest of the chrome is derived from: the
 * toggle's icon is a little under half of it, and the footer's captions about
 * a quarter, which keeps the three in proportion as they scale. The mark
 * stands alone in the header with no name beside it, so it is set a step
 * larger than it would be as half of a lockup.
 */
const LOGO_HEIGHT = { xs: 44, sm: 52, md: 58 };

/**
 * The page is a hard-edged shell around one tile: header, player, footer line.
 * Nothing is rounded and nothing is bordered — the panels are separated by the
 * gap between them — so the stream itself is the only picture on the page.
 */
function Shell() {
  return (
    // Fixed to the viewport, not merely at least as tall as it: the page is one
    // screen with the stream on it, and a scrollbar next to a 16/9 tile only
    // ever means the tile is the wrong size.
    <Stack sx={{ height: '100dvh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Stack
          component="header"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            maxWidth: MEASURE, mx: 'auto', px: GUTTER, py: { xs: 1.5, sm: 2 },
          }}
        >
          <BrandLogo height={LOGO_HEIGHT} />
          <ColorModeToggle size={{ xs: 20, sm: 22, md: 24 }} />
        </Stack>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          // Without this a flex child refuses to shrink below its content, and
          // the tile would push the footer off the bottom instead of scaling.
          minHeight: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          py: { xs: 2, sm: 3, md: 4 },
          px: GUTTER,
          // Anchors the accents, which fill the space the tile leaves around it.
          position: 'relative',
        }}
      >
        <AmbientBackdrop />
        <Player maxWidth={MEASURE} />
      </Box>

      <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
        <Stack
          component="footer"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            maxWidth: MEASURE, mx: 'auto', px: GUTTER, py: { xs: 1.5, sm: 2 },
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Baraka Hostel
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Streaming live
          </Typography>
        </Stack>
      </Box>
    </Stack>
  );
}

export function App() {
  return (
    <AppThemeProvider>
      <CssBaseline />
      <Shell />
    </AppThemeProvider>
  );
}
