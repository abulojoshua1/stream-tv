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
        // Sized from the height it is given, so the tile always fits the space
        // between header and footer. On a narrow screen `maxWidth` clamps it
        // instead and the video letterboxes inside, which is the right
        // trade: a fitted page beats a strictly 16/9 box that overflows.
        height: '100%',
        width: 'auto',
        aspectRatio: '16/9',
        maxWidth: `min(100%, ${maxWidth}px)`,
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
