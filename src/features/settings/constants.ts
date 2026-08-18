export const SETTINGS_THEMES = {
  light: "light",
  dark: "dark",
  system: "system",
} as const;

export const SETTINGS_THEME_OPTIONS = [
  {
    description: "Always use light mode",
    label: "Light",
    value: SETTINGS_THEMES.light,
  },
  {
    description: "Always use dark mode",
    label: "Dark",
    value: SETTINGS_THEMES.dark,
  },
  {
    description: "Use system preference",
    label: "System",
    value: SETTINGS_THEMES.system,
  },
] as const;
