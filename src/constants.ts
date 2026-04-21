// Shared data: color palette and app defaults.
// Fork-point: add PATTERNS or other app-specific constants here.

export type AccentKey = "sage" | "blue" | "lavender" | "beige";
export type ThemeMode = "light" | "dark" | "auto";
export type Theme = "light" | "dark";

export interface Accent {
  label: string;
  hex: string;
}

export const ACCENTS: Record<AccentKey, Accent> = {
  sage:     { label: "Sage",     hex: "#B8C4A9" },
  blue:     { label: "Blue",     hex: "#A9B6C4" },
  lavender: { label: "Lavender", hex: "#C9BFD3" },
  beige:    { label: "Beige",    hex: "#D4C9B5" },
};

export interface Reminder {
  enabled: boolean;
  days: number[]; // 0 = Sunday ... 6 = Saturday
  hour: number;   // 0-23
}

export interface Prefs {
  accent: AccentKey;
  themeMode: ThemeMode;
  reminder: Reminder;
}

export const DEFAULTS: Prefs = {
  accent: "sage",
  themeMode: "auto",
  reminder: {
    enabled: false,
    days: [1, 2, 3, 4, 5], // Mon-Fri
    hour: 9,
  },
};

export const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
export const DAY_LABELS_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
