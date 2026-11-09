import { IconButton, Tooltip } from '@mui/material';
import type { ReactNode } from 'react';
import { colors } from '../../theme';

interface Props {
  /** What it does, and the key that does the same. */
  label: string;
  onClick: () => void;
  children: ReactNode;
  /** The control the bar is built around: full strength at rest. */
  prominent?: boolean;
}

/** One square control on the bar over the video, named for pointer and screen reader alike. */
export function ControlButton({
  label, onClick, children, prominent = false,
}: Props) {
  return (
    // Kept inside the tile: in full screen only the tile is drawn, and a
    // tooltip portalled to the page would be left behind.
    <Tooltip title={label} placement="top" slotProps={{ popper: { disablePortal: true } }}>
      <IconButton
        onClick={onClick}
        aria-label={label}
        sx={{
          color: prominent ? colors.playerText : colors.playerTextDim,
          '&:hover': { color: colors.playerText, bgcolor: colors.playerWash },
          '&:active': { bgcolor: colors.playerWashStrong },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}
