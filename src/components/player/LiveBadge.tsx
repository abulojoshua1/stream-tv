import { Box, Stack } from '@mui/material';
import { colors } from '../../theme';

export function LiveBadge() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          gap: '6px',
          px: '10px',
          py: '5px',
          border: `1px solid ${colors.playerLiveBorder}`,
          borderRadius: '4px',
          userSelect: 'none',
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: colors.playerLive,
            boxShadow: `0 0 6px ${colors.playerLive}`,
            animation: 'livePulse 2s ease-in-out infinite',
            '@keyframes livePulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.25 },
            },
          }}
        />
        <Box
          component="span"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: colors.playerText,
            lineHeight: 1,
          }}
        >
          LIVE
        </Box>
      </Stack>
    </Box>
  );
}
