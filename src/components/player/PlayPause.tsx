import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { IconButton } from "@mui/material";
import { colors } from "../../theme";

interface Props {
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export function PlayPause({ isPaused, onPlay, onPause }: Props) {
  return (
    <IconButton
      onClick={isPaused ? onPlay : onPause}
      disableRipple
      sx={playBtnSx}
    >
      {isPaused
        ? <PlayArrowIcon sx={{ fontSize: 32 }} />
        : <PauseIcon sx={{ fontSize: 32 }} />}
    </IconButton>
  );
}

const playBtnSx = {
  color: colors.playerText,
  transition: "transform 0.15s ease, background-color 0.15s ease",
  "&:hover": {
    bgcolor: colors.playerAccentGlow,
    transform: "scale(1.08)",
  },
} as const;
