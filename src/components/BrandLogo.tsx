import { Box } from '@mui/material';
import {
  ANTENNA_BASE_Y,
  ANTENNA_MAST_WIDTH,
  ANTENNA_TIP_RADIUS,
  ANTENNA_TIP_Y,
  ANTENNA_WAVE_END,
  ANTENNA_WAVE_RADII,
  ANTENNA_WAVE_START,
  ANTENNA_WAVE_WIDTH,
  ANTENNA_X,
  BRAND_ICON_ASPECT,
  BRAND_ICON_VIEWBOX,
  BRAND_LOGO_ACCENT_PATH,
  BRAND_LOGO_INK_PATH,
  BRAND_ORANGE,
} from '../assets/brandLogoPaths';

/** A plain pixel height, or one per MUI breakpoint. */
type Size = number | Record<string, number>;

interface LogoProps {
  /**
   * The rendered *height* in pixels, plain or per-breakpoint. Height rather
   * than width because the logo is sized against the controls beside it, and
   * it is their height it has to agree with; the width then follows the
   * artwork's own proportions.
   */
  height: Size;
  /** Overrides the ink colour, for the logo sitting on top of video. */
  ink?: string;
}

/**
 * One arc of the signal, as an SVG path. Angles are degrees clockwise from
 * east in the artwork's own space. Each side is centred on the antenna tip.
 */
function waveArc(radius: number) {
  const point = (deg: number) => {
    const rad = (deg * Math.PI) / 180;

    return [
      ANTENNA_X + radius * Math.cos(rad),
      ANTENNA_TIP_Y + radius * Math.sin(rad),
    ].map((n) => n.toFixed(1));
  };
  const [x0, y0] = point(ANTENNA_WAVE_START);
  const [x1, y1] = point(ANTENNA_WAVE_END);

  return `M ${x0} ${y0} A ${radius} ${radius} 0 0 1 ${x1} ${y1}`;
}

/** Theme-aware building mark with a compact broadcast antenna. */
export function BrandLogo({ height, ink = 'text.primary' }: LogoProps) {
  return (
    <Box
      component="svg"
      viewBox={BRAND_ICON_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Baraka Streaming"
      sx={{
        height,
        // Let the browser derive the width, so a responsive height stays
        // registered instead of needing the ratio applied at every breakpoint.
        width: 'auto',
        aspectRatio: `${BRAND_ICON_ASPECT}`,
        color: ink,
        display: 'block',
      }}
    >
      <path fill="currentColor" fillRule="evenodd" d={BRAND_LOGO_INK_PATH} />
      <path fill={BRAND_ORANGE} fillRule="evenodd" d={BRAND_LOGO_ACCENT_PATH} />

      {/* The mast, planted on the tower's roof peak. */}
      <line
        x1={ANTENNA_X}
        y1={ANTENNA_BASE_Y}
        x2={ANTENNA_X}
        y2={ANTENNA_TIP_Y}
        stroke="currentColor"
        strokeWidth={ANTENNA_MAST_WIDTH}
        strokeLinecap="round"
      />
      <circle cx={ANTENNA_X} cy={ANTENNA_TIP_Y} r={ANTENNA_TIP_RADIUS} fill={BRAND_ORANGE} />

      {/* Mirrored signals share one centre and stroke weight at every size. */}
      <g fill="none" stroke={BRAND_ORANGE} strokeWidth={ANTENNA_WAVE_WIDTH} strokeLinecap="round">
        {ANTENNA_WAVE_RADII.map((radius) => (
          <g key={radius}>
            <path d={waveArc(radius)} />
            <path
              d={waveArc(radius)}
              transform={`rotate(180 ${ANTENNA_X} ${ANTENNA_TIP_Y})`}
            />
          </g>
        ))}
      </g>
    </Box>
  );
}
