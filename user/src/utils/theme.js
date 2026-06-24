export const THEME_STORAGE_KEY = "quickdeal_theme";

const LEGACY_THEME_KEY = "theme";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

const getSystemTheme = () => (window.matchMedia?.(DARK_MEDIA_QUERY).matches ? "dark" : "light");

export const getPreferredTheme = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_THEME_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return getSystemTheme();
};

export const applyTheme = (theme) => {
  const nextTheme = theme === "dark" ? "dark" : "light";

  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  document.documentElement.style.colorScheme = nextTheme;
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  localStorage.setItem(LEGACY_THEME_KEY, nextTheme);

  return nextTheme;
};

export const toggleTheme = (theme) => applyTheme(theme === "dark" ? "light" : "dark");
