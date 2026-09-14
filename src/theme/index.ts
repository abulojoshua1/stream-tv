import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { darkTheme } from './darkTheme';
import { lightTheme } from './lightTheme';

export { colors } from './colors';
export { darkTheme, lightTheme };

type ColorMode = 'light' | 'dark'
type ColorModeContextValue = {
  mode: ColorMode
  toggleColorMode: () => void
  /** True while no explicit choice has been made, so the OS setting is being followed. */
  followsSystem: boolean
  matchSystemColorMode: () => void
}

export const COLOR_MODE_STORAGE_KEY = 'colorMode';

const systemMode = (): ColorMode => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const storedMode = (): ColorMode | null => {
  try {
    const stored = localStorage.getItem(COLOR_MODE_STORAGE_KEY);

    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null; // private mode or blocked storage
  }
};

export const ColorModeContext = createContext<ColorModeContextValue>({
  mode: 'light',
  toggleColorMode: () => undefined,
  followsSystem: true,
  matchSystemColorMode: () => undefined,
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  // null means "no explicit choice yet", which is what makes the OS setting win.
  const [preference, setPreference] = useState<ColorMode | null>(storedMode);
  const [osMode, setOsMode] = useState<ColorMode>(systemMode);

  const mode = preference ?? osMode;

  // Keep following the OS while the user has not picked a side themselves.
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!query) return undefined;

    const onChange = (event: MediaQueryListEvent) => setOsMode(event.matches ? 'dark' : 'light');
    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    try {
      if (preference) localStorage.setItem(COLOR_MODE_STORAGE_KEY, preference);
      else localStorage.removeItem(COLOR_MODE_STORAGE_KEY);
    } catch {
      // a lost preference is not worth breaking the page over
    }
  }, [preference]);

  // The page behind the app (and form controls, scrollbars) must match the mode.
  useEffect(() => {
    const theme = mode === 'light' ? lightTheme : darkTheme;
    document.documentElement.style.background = theme.palette.background.default;
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      followsSystem: preference === null,
      toggleColorMode: () => setPreference(mode === 'light' ? 'dark' : 'light'),
      matchSystemColorMode: () => setPreference(null),
    }),
    [mode, preference],
  );

  return createElement(
    ColorModeContext.Provider,
    { value: contextValue },
    createElement(MuiThemeProvider, { theme: mode === 'light' ? lightTheme : darkTheme }, children),
  );
}

export function useColorMode() {
  return useContext(ColorModeContext);
}
