/** The viewer's volume (0–100) and whether they chose silence, kept between visits. */
export type Sound = { volume: number; muted: boolean };

const STORAGE_KEY = 'playerSound';
const DEFAULT: Sound = { volume: 80, muted: false };

export function loadSound(): Sound {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (typeof stored !== 'object' || stored === null) return DEFAULT;
    const { volume, muted } = stored as Partial<Sound>;
    if (typeof volume !== 'number' || !(volume >= 0 && volume <= 100)) return DEFAULT;

    return { volume, muted: muted === true };
  } catch {
    return DEFAULT; // private mode, blocked storage, or something else's value
  }
}

export function saveSound(sound: Sound) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sound));
  } catch {
    // a lost preference is not worth breaking the player over
  }
}
