import ReplayIcon from '@mui/icons-material/Replay';
import {
  Box, Button, Stack, Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { colors } from '../../theme';
import { EASE_OUT, rise } from '../../theme/motion';
import type { Failure } from './useHlsStream';

/** Seconds between one attempt at the feed and the next. */
const RETRY_EVERY = 5;

interface Props {
  failure: Failure;
  onRetry: () => void;
}

/**
 * No picture: static over the tile, what went wrong, and the way out. A feed
 * that cannot be reached is tried again on its own, so a screen left on comes
 * back by itself once the broadcast does.
 */
export function ErrorState({ failure, onRetry }: Props) {
  const retries = failure === 'signal';
  const [secondsLeft, setSecondsLeft] = useState(RETRY_EVERY);

  useEffect(() => {
    if (!retries) return undefined;
    const timer = setInterval(() => setSecondsLeft((seconds) => seconds - 1), 1000);

    return () => clearInterval(timer);
  }, [retries]);

  useEffect(() => {
    if (retries && secondsLeft <= 0) onRetry();
  }, [retries, secondsLeft, onRetry]);

  return (
    <Box
      role="alert"
      sx={{
        position: 'absolute',
        inset: 0,
        bgcolor: colors.playerBg,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2,
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
      <Stack
        spacing={0.75}
        alignItems="center"
        sx={{
          position: 'relative',
          textAlign: 'center',
          color: colors.playerText,
          animation: `${rise} 320ms ${EASE_OUT} backwards`,
        }}
      >
        <Typography variant="h6" component="p">
          {retries ? 'Signal jam' : 'This browser cannot play live streams'}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.playerTextDim, fontVariantNumeric: 'tabular-nums' }}>
          {retries
            ? `The stream is not reaching us. Trying again in ${Math.max(secondsLeft, 0)} s.`
            : 'Open this page in a recent Chrome, Firefox, Edge or Safari.'}
        </Typography>
        {retries && (
          <Button variant="contained" startIcon={<ReplayIcon />} onClick={onRetry} sx={{ mt: '16px !important' }}>
            Try now
          </Button>
        )}
      </Stack>
    </Box>
  );
}
