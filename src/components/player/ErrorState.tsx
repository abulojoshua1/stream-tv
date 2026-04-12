import ReplayCircleFilledIcon from "@mui/icons-material/ReplayCircleFilled";
import { Alert, Box, Button, Stack } from "@mui/material";

export function ErrorState() {
  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 1280,
        aspectRatio: "16/9",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: 'url("/noise.gif")',
          backgroundSize: "cover",
          opacity: 0.2,
        }}
      />
      <Stack sx={{ zIndex: 1 }} spacing={2} alignItems="center">
        <Alert severity="warning" variant="filled" sx={{ maxWidth: 360 }}>
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
