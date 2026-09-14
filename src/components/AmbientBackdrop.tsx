import { Box } from '@mui/material';

/**
 * Decorative accents behind the stream: slim diagonal bars, thin rings and a
 * dense confetti of small sparkles, crosses and dots, in the same vocabulary
 * as the hostel front-end. Purely ornamental, so it is hidden from assistive
 * tech and never intercepts a click meant for the player.
 *
 * It is drawn in one viewBox and sliced, so the composition keeps its
 * proportions at any window size rather than stretching with the page.
 */

const WIDTH = 1440;
const HEIGHT = 900;

/*
 * A jittered grid rather than plain random placement. Pure randomness clumps —
 * it leaves bald patches next to knots of three — and at this density that is
 * exactly what the eye picks out. One particle per cell, nudged off centre,
 * covers the whole field evenly while still looking strewn by hand.
 */
const CELL = 74;
const COLUMNS = Math.ceil(WIDTH / CELL);
const ROWS = Math.ceil(HEIGHT / CELL);

/** How far off its cell centre a particle may wander, as a share of the cell. */
const JITTER = 0.42;

type Particle = {
  kind: 'sparkle' | 'cross' | 'dot';
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
};

/*
 * Seeded, so the scatter is fixed: it is part of the design, and a field that
 * reshuffled on every render would flicker between hot reloads and make the
 * layout impossible to tune by eye.
 */
function randomiser(seed: number) {
  // A Lehmer generator: no bitwise arithmetic, and the intermediate product
  // stays well inside the range a double represents exactly.
  let state = seed % 2147483647;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

/** Dots outnumber the rest: they are the quiet filler between the marks that
 *  actually have a shape. */
function pickKind(roll: number): Particle['kind'] {
  if (roll < 0.52) return 'dot';
  if (roll < 0.8) return 'sparkle';
  return 'cross';
}

function buildField(): Particle[] {
  const random = randomiser(20260914);
  const particles: Particle[] = [];

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLUMNS; column += 1) {
      // A few gaps keep the grid from showing through as a texture.
      const skip = random() < 0.12;
      const kind = pickKind(random());
      const jitterX = random();
      const jitterY = random();
      const scale = random();
      const rotation = random();
      const opacity = random();

      if (!skip) {
        particles.push({
          kind,
          x: (column + 0.5 + (jitterX - 0.5) * 2 * JITTER) * CELL,
          y: (row + 0.5 + (jitterY - 0.5) * 2 * JITTER) * CELL,
          // Squared, so small is the common case and the occasional larger mark
          // reads as a deliberate accent rather than one of a crowd.
          scale: 0.3 + scale ** 2 * 0.95,
          rotation: (rotation - 0.5) * 70,
          opacity: 0.45 + opacity * 0.55,
        });
      }
    }
  }

  return particles;
}

/** Built once at module load, not per render — the field never changes. */
const FIELD = buildField();

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
        color: (theme) => (theme.palette.mode === 'light' ? theme.palette.secondary.main : theme.palette.info.main),
        // Lower than a sparse field would want: a few hundred marks accumulate
        // into real weight, and the tile still has to be the brightest thing.
        opacity: (theme) => (theme.palette.mode === 'light' ? 0.09 : 0.07),
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        sx={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          {/* Each mark is drawn once at its natural size and scattered by
              <use>: the sparkle is a unit of about 22, the cross about 12. */}
          <path
            id="ambient-sparkle"
            d="M12 0c1.3 7.4 3.3 9.4 10.7 10.7C15.3 12 13.3 14 12 21.4 10.7 14 8.7 12 1.3 10.7 8.7 9.4 10.7 7.4 12 0Z"
          />
          <path id="ambient-cross" d="M5 0h2v5h5v2H7v5H5V7H0V5h5Z" />
          <circle id="ambient-dot" cx="3" cy="3" r="3" />
        </defs>

        {/* The bars sit furthest back and stay faintest: they are the ground
            the confetti is scattered on, not a shape in their own right. */}
        <g fill="currentColor" fillOpacity="0.4">
          <rect x="880" y="-200" width="96" height="820" rx="48" transform="rotate(38 928 210)" />
          <rect x="1216" y="300" width="70" height="520" rx="35" transform="rotate(38 1251 560)" />
          <rect x="-120" y="540" width="62" height="440" rx="31" transform="rotate(38 -89 760)" />
          <rect x="160" y="-160" width="54" height="360" rx="27" transform="rotate(38 187 20)" />
        </g>

        {/* Rings rather than discs: at this size an outline keeps its shape
            where a filled circle would just read as a smudge. These few are
            placed by hand — they are the only marks big enough to compose. */}
        <g fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.6">
          <circle cx="188" cy="592" r="58" />
          <circle cx="1298" cy="168" r="42" />
          <circle cx="452" cy="806" r="27" />
          <circle cx="1146" cy="726" r="18" />
          <circle cx="96" cy="212" r="14" />
          <circle cx="1372" cy="470" r="11" />
          <circle cx="700" cy="330" r="34" />
          <circle cx="980" cy="640" r="22" />
        </g>

        <g fill="currentColor">
          {FIELD.map((particle) => (
            <use
              key={`${particle.x}-${particle.y}`}
              href={`#ambient-${particle.kind}`}
              fillOpacity={particle.opacity}
              transform={`translate(${particle.x.toFixed(1)} ${particle.y.toFixed(1)}) rotate(${particle.rotation.toFixed(1)}) scale(${particle.scale.toFixed(2)})`}
            />
          ))}
        </g>
      </Box>
    </Box>
  );
}
