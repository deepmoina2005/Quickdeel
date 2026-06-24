export const THEME_STORAGE_KEY = 'quickdeal_theme';

const LEGACY_DARK_MODE_KEY = 'quickdeal_dark_mode';
const LEGACY_THEME_KEY = 'theme';

export const getPreferredTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_THEME_KEY);

  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  const legacyDarkMode = localStorage.getItem(LEGACY_DARK_MODE_KEY);

  if (legacyDarkMode === 'true' || legacyDarkMode === 'false') {
    return legacyDarkMode === 'true' ? 'dark' : 'light';
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const applyTheme = (theme) => {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';

  document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  localStorage.setItem(LEGACY_THEME_KEY, nextTheme);
  localStorage.setItem(LEGACY_DARK_MODE_KEY, String(nextTheme === 'dark'));

  return nextTheme;
};
