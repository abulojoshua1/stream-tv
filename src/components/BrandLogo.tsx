import { Box } from '@mui/material';
import {
  BRAND_LOGO_ACCENT_PATH,
  BRAND_LOGO_ASPECT,
  BRAND_LOGO_INK_PATH,
  BRAND_LOGO_VIEWBOX,
  BRAND_MARK_ASPECT,
  BRAND_MARK_VIEWBOX,
  BRAND_ORANGE,
} from '../assets/brandLogoPaths';

/** A plain pixel height, or one per MUI breakpoint. */
type Size = number | Record<string, number>;

interface LogoProps {
  /**
   * The rendered *height* in pixels, plain or per-breakpoint. Height rather
   * than width because the logo is sized against the text and controls beside
   * it, and it is their height it has to agree with; the width then follows
   * the artwork's own proportions.
   */
  height: Size;
  /** Overrides the ink colour, for the logo sitting on top of video. */
  ink?: string;
}

/**
 * The logo, drawn inline rather than loaded as an image. The artwork is one
 * shape in both themes — only the ink colour differs — so it is a single SVG
 * whose ink follows the theme's text colour. Switching theme then recolours it
 * on the spot, with nothing to fetch or decode.
 */
export function BrandLogo({ height, ink = 'text.primary' }: LogoProps) {
  return (
    <Box
      component="svg"
      viewBox={BRAND_LOGO_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Baraka TV"
      sx={{
        height,
        // Let the browser derive the width, so a responsive height stays
        // registered instead of needing the ratio applied at every breakpoint.
        width: 'auto',
        aspectRatio: `${BRAND_LOGO_ASPECT}`,
        color: ink,
        display: 'block',
      }}
    >
      <path fill="currentColor" fillRule="evenodd" d={BRAND_LOGO_INK_PATH} />
      <path fill={BRAND_ORANGE} fillRule="evenodd" d={BRAND_LOGO_ACCENT_PATH} />
    </Box>
  );
}

/**
 * The house and sun without the wordmark, for places that set their own
 * headline beside or beneath it. Shares the logo's paths, so it recolours with
 * the theme exactly the same way.
 */
export function BrandMark({ height, ink = 'text.primary' }: LogoProps) {
  return (
    <Box
      component="svg"
      viewBox={BRAND_MARK_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      sx={{
        height,
        width: 'auto',
        aspectRatio: `${BRAND_MARK_ASPECT}`,
        color: ink,
        display: 'block',
      }}
    >
      <path fill="currentColor" fillRule="evenodd" d={BRAND_LOGO_INK_PATH} />
      <path fill={BRAND_ORANGE} fillRule="evenodd" d={BRAND_LOGO_ACCENT_PATH} />
    </Box>
  );
}
