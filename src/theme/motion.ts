import { keyframes } from '@mui/material/styles';

/*
 * One way of moving, shared by everything that moves: quick to start and slow
 * to settle, so a change is seen at once and lands softly. Nothing travels
 * further than a few pixels; motion here says "this arrived" or "this is the
 * one", never "look at me". Every animation is switched off for anyone who
 * asks their system for less motion (see index.css).
 */

/** Arriving, and hovers settling. */
export const EASE_OUT = 'cubic-bezier(0.2, 0, 0, 1)';
/** Leaving. */
export const EASE_IN = 'cubic-bezier(0.3, 0, 1, 1)';

/** In milliseconds. */
export const DURATION = {
  press: 100,
  hover: 150,
  overlay: 160,
  enter: 280,
  exit: 120,
} as const;

/** The gap between neighbours arriving one after another. */
export const STAGGER = 40;

/** In from a few pixels below. */
export const rise = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: none; }
`;

export const fade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/** A menu or popover settling down from its anchor. */
export const drop = keyframes`
  from { transform: translateY(-4px); }
  to { transform: none; }
`;

/** A dialog settling up into place. */
export const lift = keyframes`
  from { transform: translateY(12px); }
  to { transform: none; }
`;

/** A phone's dialog, rising from the bottom edge. */
export const sheet = keyframes`
  from { transform: translateY(32px); }
  to { transform: none; }
`;

/** Something live, slowly breathing. */
export const breathe = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
`;

/** An icon turning in as it replaces another, e.g. the theme switch. */
export const turnIn = keyframes`
  from { opacity: 0; transform: rotate(-45deg) scale(0.85); }
  to { opacity: 1; transform: none; }
`;

/** A rule drawn from its left end. */
export const draw = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

/**
 * Delays that make the children matched by `selector` arrive one after
 * another: the first at once, each next `step` later, and every one past
 * `max` together with the last, so a long list never keeps anyone waiting.
 */
export function staggerSx(selector: string, max = 6, step = STAGGER) {
  const delays: Record<string, { animationDelay: string }> = {};
  for (let index = 0; index < max; index += 1) {
    // nth-of-type, not nth-child, which Emotion warns about; the siblings
    // staggered here share a tag.
    delays[`${selector}:nth-of-type(${index + 1})`] = { animationDelay: `${index * step}ms` };
  }
  delays[`${selector}:nth-of-type(n+${max + 1})`] = { animationDelay: `${max * step}ms` };

  return delays;
}

/**
 * Children arriving one after another when their container first appears:
 * spread into the `sx` of a grid of tiles or a list. Each rises a few pixels
 * and fades in; the fill mode leaves nothing behind once it has landed.
 */
export function arrivalSx(selector = '& > *', max = 6, step = STAGGER, duration = 320) {
  return {
    [selector]: { animation: `${rise} ${duration}ms ${EASE_OUT} backwards` },
    ...staggerSx(selector, max, step),
  };
}
