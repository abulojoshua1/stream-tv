import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import {
  Box, IconButton, Stack, Tooltip,
} from '@mui/material';
import { useColorMode } from '../theme';
import { EASE_OUT, turnIn } from '../theme/motion';

/**
 * Until the switch is pressed the app follows the OS, and pressing it is what
 * makes a choice explicit; a second button then appears to hand the choice
 * back. The icon shows the mode being switched *to*, which is what the user
 * is reaching for.
 */
export function ColorModeToggle() {
  const {
    mode, toggleColorMode, followsSystem, matchSystemColorMode,
  } = useColorMode();
  const next = mode === 'light' ? 'dark' : 'light';

  return (
    <Stack direction="row" spacing={0.5}>
      {!followsSystem && (
        <Tooltip title="Match system theme">
          <IconButton onClick={matchSystemColorMode} aria-label="Match system theme" size="small">
            <SettingsBrightnessOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title={`Switch to ${next} mode`}>
        <IconButton onClick={toggleColorMode} aria-label={`Switch to ${next} mode`} size="small">
          {/* Keyed on the mode, so the new icon turns in as it replaces the old. */}
          <Box
            component="span"
            key={mode}
            sx={{ display: 'inline-flex', animation: `${turnIn} 260ms ${EASE_OUT} backwards` }}
          >
            {mode === 'light'
              ? <DarkModeOutlinedIcon fontSize="small" />
              : <LightModeOutlinedIcon fontSize="small" />}
          </Box>
        </IconButton>
      </Tooltip>
    </Stack>
  );
}
