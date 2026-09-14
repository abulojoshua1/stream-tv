import ReplayCircleFilledIcon from '@mui/icons-material/ReplayCircleFilled';
import {
  Alert, Box, Button, Stack,
} from '@mui/material';
import { colors } from '../../theme';

export function ErrorState({ maxWidth }: { maxWidth: number }) {
  return (
    <Box
      sx={{
        position: 'relative',
        // Whichever of the two runs out first is what sizes the tile, so it
        // always fits between the header and the footer without ever being
        // letterboxed. Landscape: the height is the scarce one, so the tile
        // takes all of it and the width follows the ratio. Portrait: the
        // width is, and a 16/9 box drawn from it is never tall enough to
        // overflow — which is why this is two regimes rather than one clamp.
        aspectRatio: '16/9',
        height: '100%',
        width: 'auto',
        maxWidth: `min(100%, ${maxWidth}px)`,
        '@media (orientation: portrait)': {
          height: 'auto',
          width: '100%',
        },
        bgcolor: colors.playerBg,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/noise.gif")',
          backgroundSize: 'cover',
          opacity: 0.2,
        }}
      />
      <Stack sx={{ zIndex: 1 }} spacing={2} alignItems="center">
        <Alert severity="warning" variant="filled" sx={{ maxWidth: { xs: '90%', sm: 360 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          Signal jam! Time to reload and retry!
        </Alert>
        <Button
          color="warning"
          variant="outlined"
          startIcon={<ReplayCircleFilledIcon />}
          onClick={() => window.location.reload()}
        >
          Reload Stream
        </Button>
      </Stack>
    </Box>
  );
}
