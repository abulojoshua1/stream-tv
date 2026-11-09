import CssBaseline from '@mui/material/CssBaseline';
import { Box, Stack, Typography } from '@mui/material';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { BrandLogo } from './components/BrandLogo';
import { ColorModeToggle } from './components/ColorModeToggle';
import { Player } from './components/player';
import { AppThemeProvider } from './theme';
import { EASE_OUT, fade } from './theme/motion';

/*
 * One measure governs the page. Header, player and footer are all this wide
 * and share a left edge, so the video is not a narrow tile floating inside
 * full-bleed furniture.
 */
const MEASURE = 1280;

/** The page gutter, and the rhythm the header and footer breathe on. */
const GUTTER = { xs: 2, sm: 3, md: 4 };

/*
 * The mark stands alone in the bar with no name beside it, so it is set a
 * step larger than it would be as half of a lockup.
 */
const LOGO_HEIGHT = { xs: 40, sm: 46 };

/**
 * The hostel front-end's shell around one tile: a paper bar with a rule under
 * it, the stream on the page beneath, and a line of labels at the foot.
 * Nothing is rounded and nothing casts a shadow, so the stream itself is the
 * only picture on the page.
 */
function Shell() {
  return (
    // Fixed to the viewport, not merely at least as tall as it: the page is one
    // screen with the stream on it, and a scrollbar next to a 16/9 tile only
    // ever means the tile is the wrong size.
    <Stack sx={{ height: '100dvh', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Box
        component="header"
        sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            maxWidth: MEASURE + 64, mx: 'auto', px: GUTTER, py: 1,
          }}
        >
          <BrandLogo height={LOGO_HEIGHT} />
          <ColorModeToggle />
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
          // Anchors the backdrop, which fills the space the tile leaves around it.
          position: 'relative',
        }}
      >
        <AmbientBackdrop />
        <Player maxWidth={MEASURE} />
      </Box>

      <Stack
        component="footer"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          width: '100%',
          maxWidth: MEASURE + 64,
          mx: 'auto',
          px: GUTTER,
          pb: { xs: 1.5, sm: 2 },
          color: 'text.secondary',
          animation: `${fade} 320ms ${EASE_OUT} 120ms backwards`,
        }}
      >
        <Typography variant="overline">Baraka Hostel</Typography>
        {/* What the keys do, for the screens that have them. */}
        <Typography variant="overline" sx={{ display: { xs: 'none', md: 'block' } }}>
          Space play · M mute · F full screen
        </Typography>
        <Typography variant="overline" sx={{ display: { md: 'none' } }}>
          Streaming live
        </Typography>
      </Stack>
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
