// App root — splash, theme resolution, screen navigation, storage glue.

import { useEffect, useState } from "react";
import HomeScreen from "./Home.tsx";
import SettingsScreen from "./Settings.tsx";
import { ACCENTS, DEFAULTS, type Prefs, type Theme, type ThemeMode } from "./constants.ts";
import { load, save } from "./storage.ts";
import { useReminder } from "./lib/reminder.ts";
import type { AppConfig } from "./app.config.ts";

const PREFS_KEY = "prefs";

function useResolvedTheme(mode: ThemeMode): Theme {
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  );
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  if (mode === "auto") return systemDark ? "dark" : "light";
  return mode;
}

interface SplashProps {
  wordmark: string;
  visible: boolean;
  theme: Theme;
}

function Splash({ wordmark, visible, theme }: SplashProps) {
  const bg = theme === "dark" ? "#1F1E1A" : "#F6F1E8";
  const fg = theme === "dark" ? "#E9E4D7" : "#3A3A36";
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 100,
      background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: visible ? 1 : 0,
      pointerEvents: visible ? "auto" : "none",
      transition: "opacity 700ms ease",
    }}>
      <div style={{
        fontFamily: '"Geist", -apple-system, system-ui, sans-serif',
        fontSize: 28, fontWeight: 400,
        letterSpacing: 6, textTransform: "lowercase",
        color: fg,
        animation: visible ? "splashIn 900ms cubic-bezier(0.2, 0.6, 0.2, 1)" : "none",
      }}>
        {wordmark}
      </div>
    </div>
  );
}

type Screen = "home" | "settings";

interface AppProps {
  appConfig: AppConfig;
}

export default function App({ appConfig }: AppProps) {
  const [state, setState] = useState<Prefs>(() => ({
    ...DEFAULTS,
    ...load<Partial<Prefs>>(PREFS_KEY, {}),
  }));
  const [splashVisible, setSplashVisible] = useState<boolean>(true);
  const [screen, setScreen] = useState<Screen>("home");

  const theme = useResolvedTheme(state.themeMode);

  useReminder(state.reminder, appConfig.name);

  useEffect(() => { save(PREFS_KEY, state); }, [state]);

  useEffect(() => {
    const t = setTimeout(() => setSplashVisible(false), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    document.documentElement.style.background = theme === "dark" ? "#1F1E1A" : "#F6F1E8";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#1F1E1A" : "#F6F1E8");
  }, [theme]);

  const update = <K extends keyof Prefs>(key: K, value: Prefs[K]): void =>
    setState(s => ({ ...s, [key]: value }));

  const accentHex = ACCENTS[state.accent].hex;
  const isDark = theme === "dark";
  const appBg = isDark ? "#1F1E1A" : "#F6F1E8";
  const wordmark = appConfig.name;

  return (
    <div
      data-screen-label={wordmark}
      style={{
        position: "fixed", inset: 0,
        background: appBg,
        fontFamily: '"Geist", -apple-system, system-ui, sans-serif',
        transition: "background 400ms ease",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 70% 50% at 50% 55%, ${accentHex}${isDark ? "22" : "14"} 0%, transparent 70%)`,
        transition: "background 600ms ease",
      }} />

      <div style={{ position: "relative", height: "100%" }}>
        {screen === "home" ? (
          <HomeScreen
            accent={accentHex}
            wordmark={wordmark}
            theme={theme}
            onOpenSettings={() => setScreen("settings")}
            onBegin={() => {}}
          />
        ) : (
          <SettingsScreen
            state={state}
            update={update}
            accents={ACCENTS}
            theme={theme}
            onClose={() => setScreen("home")}
          />
        )}
      </div>

      <Splash wordmark={wordmark} visible={splashVisible} theme={theme} />
    </div>
  );
}
