import { Box, ButtonBase } from '@mui/material';
import { colors } from '../../theme';
import { breathe, DURATION, EASE_OUT } from '../../theme/motion';

interface Props {
  /** Playing, and at the live edge. */
  live: boolean;
  onGoLive: () => void;
}

/**
 * The hostel app's Live chip, over video: a square pip that breathes while
 * the picture is the broadcast as it happens. Paused or fallen behind, the
 * pip goes still and the chip becomes the way back to the live edge.
 */
export function LiveBadge({ live, onGoLive }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <ButtonBase
        onClick={onGoLive}
        disabled={live}
        aria-label={live ? 'Live' : 'Go to live'}
        sx={{
          gap: '7px',
          px: '9px',
          height: 26,
          fontSize: '0.75rem',
          fontWeight: 400,
          letterSpacing: '0.01em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          color: colors.playerText,
          bgcolor: colors.playerWash,
          userSelect: 'none',
          transition: `background-color ${DURATION.hover}ms ${EASE_OUT}`,
          '&:hover': { bgcolor: colors.playerWashStrong },
        }}
      >
        <Box
          component="span"
          sx={{
            width: 8,
            height: 8,
            flexShrink: 0,
            bgcolor: live ? colors.playerLive : colors.playerIdle,
            ...(live && { animation: `${breathe} 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite` }),
          }}
        />
        {live ? 'Live' : 'Go live'}
      </ButtonBase>
    </Box>
  );
}
