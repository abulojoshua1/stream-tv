import FullscreenIcon from "@mui/icons-material/Fullscreen";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { Box, IconButton, Slider } from "@mui/material";
import { colors } from "../../theme";

interface Props {
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (_: any, newValue: number | number[]) => void;
  onFullscreen: () => void;
}

export function VolumeControls({
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  onFullscreen,
}: Props) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>

      <IconButton onClick={onToggleMute} disableRipple sx={iconBtnSx}>
        {isMuted || volume === 0
          ? <VolumeOffIcon sx={{ fontSize: 22 }} />
          : volume < 50
            ? <VolumeDownIcon sx={{ fontSize: 22 }} />
            : <VolumeUpIcon sx={{ fontSize: 22 }} />}
      </IconButton>

      <Slider
        value={volume}
        onChange={onVolumeChange}
        min={0}
        max={100}
        sx={{
          width: 110,
          flexShrink: 0,
          alignSelf: "center",
          color: colors.playerAccent,
          height: 5,
          p: 0,
          borderRadius: 1,
          "& .MuiSlider-thumb": {
            width: 12,
            height: 12,
            opacity: 0,
            bgcolor: colors.playerText,
            boxShadow: "none",
            transition: "opacity 0.2s ease, width 0.2s cubic-bezier(.47,1.64,.41,.8), height 0.2s cubic-bezier(.47,1.64,.41,.8)",
            "&:hover, &.Mui-focusVisible": {
              opacity: 1,
              boxShadow: `0 0 0 6px ${colors.playerAccentGlow}`,
            },
            "&.Mui-active": {
              opacity: 1,
              width: 18,
              height: 18,
            },
          },
          "& .MuiSlider-track": { border: "none", height: 5, borderRadius: 1 },
          "& .MuiSlider-rail": { height: 5, borderRadius: 1, bgcolor: colors.playerRail },
        }}
      />

      <Box sx={{ width: "12px" }} />

      <IconButton onClick={onFullscreen} disableRipple sx={iconBtnSx}>
        <FullscreenIcon sx={{ fontSize: 22 }} />
      </IconButton>

    </Box>
  );
}

const iconBtnSx = {
  color: colors.playerTextDim,
  transition: "color 0.15s ease, transform 0.15s ease, background-color 0.15s ease",
  "&:hover": {
    color: colors.playerText,
    bgcolor: colors.playerAccentGlow,
    transform: "scale(1.1)",
  },
} as const;
