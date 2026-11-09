import { Box } from '@mui/material';

/*
 * Two pieces of the logo, enlarged until they run off the page: the house's
 * 2x2 window in the bottom-left corner and the tower in the bottom-right.
 * Both are drawn on a 1440x900 desktop frame. Each is fitted to the page
 * through its own 1000-wide slice of that frame, pinned to its own bottom
 * corner: on a wide screen the height sets the scale and they land where they
 * are drawn; on a phone the width does, and they shrink into the two corners,
 * well apart, instead of being cropped away from the middle.
 */
const FRAME = { width: 1440, height: 900 };
const SLICE = 1000;

/** The house window: four square panes and the gutters between them. */
const PANE = 200;
const GUTTER = 28;
/** Its top-left corner; the left column and the bottom row run off the page. */
const WINDOW = { x: -96, y: 604 };

/**
 * The tower at twice the logo's size, with its windows where the logo has
 * them: the same inset from its left edge and top, the same spacing between.
 * It runs off the right edge and the bottom, so the last window is cut short.
 */
const TOWER = {
  x: 1160, y: 240, width: 310, height: 900,
};
const TOWER_WINDOW = {
  inset: 114, top: 216, size: 120, pitch: 176,
};

const square = (x: number, y: number, size: number) => `M${x} ${y}h${size}v${size}h${-size}z`;

const PANES = [0, 1].flatMap((row) => [0, 1].map((column) => ({
  x: WINDOW.x + column * (PANE + GUTTER),
  y: WINDOW.y + row * (PANE + GUTTER),
})));

// The windows are knocked out of the block, so the page shows through them.
const TOWER_PATH = [
  `M${TOWER.x} ${TOWER.y}h${TOWER.width}v${TOWER.height}h${-TOWER.width}z`,
  ...[0, 1, 2].map((index) => square(
    TOWER.x + TOWER_WINDOW.inset,
    TOWER.y + TOWER_WINDOW.top + index * TOWER_WINDOW.pitch,
    TOWER_WINDOW.size,
  )),
].join('');

/**
 * The backdrop behind the stream: the logo's window and tower in one faint tone of
 * the ink, square like everything else. Purely ornamental, so it is hidden
 * from assistive tech and never intercepts clicks.
 */
export function AmbientBackdrop() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        color: 'text.primary',
        opacity: (theme) => (theme.palette.mode === 'light' ? 0.08 : 0.06),
      }}
    >
      <Box component="svg" sx={{ width: '100%', height: '100%', display: 'block' }}>
        <g fill="currentColor">
          {/* Each slice scales to fit the page and holds its own bottom corner. */}
          <svg width="100%" height="100%" viewBox={`0 0 ${SLICE} ${FRAME.height}`} preserveAspectRatio="xMinYMax meet">
            {PANES.map((pane) => (
              <rect key={`${pane.x} ${pane.y}`} x={pane.x} y={pane.y} width={PANE} height={PANE} />
            ))}
          </svg>
          <svg width="100%" height="100%" viewBox={`${FRAME.width - SLICE} 0 ${SLICE} ${FRAME.height}`} preserveAspectRatio="xMaxYMax meet">
            <path fillRule="evenodd" d={TOWER_PATH} />
          </svg>
        </g>
      </Box>
    </Box>
  );
}
