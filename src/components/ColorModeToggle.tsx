import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { IconButton, Tooltip } from '@mui/material';
import { useColorMode } from '../theme';

/**
 * One button, not a three-way picker: until it is pressed the app follows the
 * OS, and pressing it is what makes a choice explicit. The icon shows the mode
 * being switched *to*, which is what the user is reaching for.
 */
interface Props {
  /** The icon's height, matching whatever it sits beside. */
  size?: number | Record<string, number>;
  ink?: string;
}

export function ColorModeToggle({ size = 20, ink }: Props) {
  const { mode, toggleColorMode } = useColorMode();
  const next = mode === 'light' ? 'dark' : 'light';

  return (
    <Tooltip title={`Switch to ${next} theme`}>
      <IconButton
        onClick={toggleColorMode}
        aria-label={`Switch to ${next} theme`}
        sx={{
          color: ink ?? 'text.secondary',
          borderRadius: 0,
          transition: 'color 0.15s ease, background-color 0.15s ease',
          '&:hover': { color: 'primary.main', bgcolor: 'rgba(226,82,31,0.12)' },
        }}
      >
        {mode === 'light'
          ? <DarkModeOutlinedIcon sx={{ fontSize: size }} />
          : <LightModeOutlinedIcon sx={{ fontSize: size }} />}
      </IconButton>
    </Tooltip>
  );
}
