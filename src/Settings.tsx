// Settings screen — Appearance (Mode + Accent) + Install + hidden Dev panel.

import { useRef, useState, type ReactNode } from "react";
import { usePwaInstall } from "./usePwaInstall.ts";
import type { AccentKey, Accent, Prefs, Theme, ThemeMode, Reminder } from "./constants.ts";
import { DAY_LABELS } from "./constants.ts";
import { nextFireTime, formatNextFire } from "./lib/reminder.ts";
import { notificationsSupported, requestPermission } from "./lib/notifications.ts";
import DevPanel from "./DevPanel.tsx";

interface SettingItemProps {
  label: string;
  children: ReactNode;
  last?: boolean;
  theme: Theme;
}

function SettingItem({ label, children, last, theme }: SettingItemProps) {
  const isDark = theme === "dark";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 20px",
      borderBottom: last ? "none" : (isDark ? "0.5px solid rgba(255,255,255,0.08)" : "0.5px solid rgba(58,58,54,0.08)"),
      fontSize: 15, color: isDark ? "#E9E4D7" : "#3A3A36",
    }}>
      <span>{label}</span>
      <div>{children}</div>
    </div>
  );
}

interface SegmentedProps<T extends string> {
  options: Array<[T, string]>;
  value: T;
  onChange: (v: T) => void;
  theme: Theme;
}

function Segmented<T extends string>({ options, value, onChange, theme }: SegmentedProps<T>) {
  const fg = theme === "dark" ? "#E9E4D7" : "#3A3A36";
  const activeBg = theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(58,58,54,0.08)";
  return (
    <div style={{
      display: "inline-flex",
      background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(58,58,54,0.04)",
      borderRadius: 999, padding: 3,
    }}>
      {options.map(([k, label]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          style={{
            padding: "6px 12px", borderRadius: 999, border: "none",
            background: value === k ? activeBg : "transparent",
            color: fg, fontFamily: "inherit", fontSize: 12,
            letterSpacing: 0.2, cursor: "pointer",
            transition: "background 180ms ease",
          }}
        >{label}</button>
      ))}
    </div>
  );
}

interface RemindersCardProps {
  reminder: Reminder;
  update: (r: Reminder) => void;
  theme: Theme;
}

function RemindersCard({ reminder, update, theme }: RemindersCardProps) {
  const isDark = theme === "dark";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.65)";
  const border = isDark ? "0.5px solid rgba(255,255,255,0.08)" : "0.5px solid rgba(58,58,54,0.06)";
  const fg = isDark ? "#E9E4D7" : "#3A3A36";
  const muted = isDark ? "rgba(233,228,215,0.5)" : "#3A3A3680";

  const toggleDay = (d: number): void => {
    const days = reminder.days.includes(d)
      ? reminder.days.filter(x => x !== d)
      : [...reminder.days, d].sort((a, b) => a - b);
    update({ ...reminder, days });
  };

  const toggleEnabled = async (): Promise<void> => {
    const next = !reminder.enabled;
    if (next && notificationsSupported() && Notification.permission === "default") {
      await requestPermission();
    }
    update({ ...reminder, enabled: next });
  };

  const setHour = (h: number): void => update({ ...reminder, hour: h });

  const next = nextFireTime(reminder);

  return (
    <>
      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: muted, marginBottom: 8, paddingLeft: 4 }}>Reminders</div>
      <div style={{ background: cardBg, border, borderRadius: 16, marginBottom: 20, overflow: "hidden" }}>
        <SettingItem label="Daily reminder" theme={theme} last={!reminder.enabled}>
          <button
            onClick={() => { void toggleEnabled(); }}
            style={{
              width: 44, height: 26, borderRadius: 999, border: "none",
              background: reminder.enabled
                ? (isDark ? "#B8C4A9" : "#3A3A36")
                : (isDark ? "rgba(255,255,255,0.14)" : "rgba(58,58,54,0.14)"),
              position: "relative", cursor: "pointer", padding: 0,
              transition: "background 200ms ease",
            }}
          >
            <span style={{
              position: "absolute", top: 3, left: reminder.enabled ? 21 : 3,
              width: 20, height: 20, borderRadius: "50%",
              background: isDark ? "#F6F1E8" : "#fff",
              transition: "left 200ms cubic-bezier(0.3, 0, 0.3, 1)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
            }} />
          </button>
        </SettingItem>

        {reminder.enabled && (
          <>
            <SettingItem label="Days" theme={theme}>
              <div style={{ display: "flex", gap: 4 }}>
                {DAY_LABELS.map((lbl, i) => {
                  const active = reminder.days.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      aria-label={`Toggle day ${i}`}
                      style={{
                        width: 28, height: 28, borderRadius: "50%", border: "none",
                        background: active
                          ? (isDark ? "#E9E4D7" : "#3A3A36")
                          : (isDark ? "rgba(255,255,255,0.06)" : "rgba(58,58,54,0.06)"),
                        color: active
                          ? (isDark ? "#1F1E1A" : "#F6F1E8")
                          : fg,
                        fontFamily: "inherit", fontSize: 12, fontWeight: 500,
                        cursor: "pointer", padding: 0,
                        transition: "background 180ms ease",
                      }}
                    >{lbl}</button>
                  );
                })}
              </div>
            </SettingItem>
            <SettingItem label="Time" theme={theme}>
              <select
                value={reminder.hour}
                onChange={e => setHour(Number(e.target.value))}
                style={{
                  padding: "6px 10px", borderRadius: 10, border: "none",
                  background: isDark ? "rgba(255,255,255,0.08)" : "rgba(58,58,54,0.06)",
                  color: fg,
                  fontFamily: "inherit", fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {Array.from({ length: 24 }, (_, h) => (
                  <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
                ))}
              </select>
            </SettingItem>
            <SettingItem label="Next" last theme={theme}>
              <span style={{ fontSize: 13, color: muted }}>{formatNextFire(next)}</span>
            </SettingItem>
          </>
        )}
      </div>
      {reminder.enabled && (
        <div style={{ fontSize: 11, color: muted, marginBottom: 20, paddingLeft: 4, lineHeight: 1.5 }}>
          Reminders fire while the app is open (or in a backgrounded tab with notifications allowed). Closed-tab reminders need a push server, which this template does not include.
        </div>
      )}
    </>
  );
}

interface SettingsScreenProps {
  state: Prefs;
  update: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
  accents: Record<AccentKey, Accent>;
  theme: Theme;
  onClose: () => void;
}

export default function SettingsScreen({ state, update, accents, theme, onClose }: SettingsScreenProps) {
  const { available: pwaAvailable, installed: pwaInstalled, install: pwaInstall } = usePwaInstall();
  const [pwaHint, setPwaHint] = useState<string | null>(null);

  const [devVisible, setDevVisible] = useState<boolean>(false);
  const tapCount = useRef<number>(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDevTap = (): void => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 800);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      setDevVisible(v => !v);
    }
  };

  const onInstallClick = async (): Promise<void> => {
    if (pwaInstalled) return;
    if (!pwaAvailable) {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      setPwaHint(ios
        ? "In Safari: tap Share → Add to Home Screen."
        : "Open in Chrome or Edge, or use the browser menu → Install.");
      setTimeout(() => setPwaHint(null), 4000);
      return;
    }
    const outcome = await pwaInstall();
    if (outcome === "dismissed") {
      setPwaHint("Install dismissed.");
      setTimeout(() => setPwaHint(null), 2500);
    }
  };

  const isDark = theme === "dark";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.65)";
  const border = isDark ? "0.5px solid rgba(255,255,255,0.08)" : "0.5px solid rgba(58,58,54,0.06)";
  const fg = isDark ? "#E9E4D7" : "#3A3A36";
  const muted = isDark ? "rgba(233,228,215,0.5)" : "#3A3A3680";

  const themeOptions: Array<[ThemeMode, string]> = [
    ["light", "Light"], ["dark", "Dark"], ["auto", "Auto"],
  ];

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      padding: "0 20px", overflowY: "auto",
      fontFamily: '"Geist", -apple-system, system-ui, sans-serif',
      color: fg,
    }}>
      <div style={{
        paddingTop: 62, paddingBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontSize: 28, fontWeight: 400, letterSpacing: -0.6 }}>Settings</div>
        <button
          onClick={onClose}
          style={{
            width: 36, height: 36, borderRadius: 999,
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(58,58,54,0.06)",
            border: "none", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          title="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 2l8 8M10 2l-8 8" stroke={fg} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: muted, marginBottom: 8, paddingLeft: 4 }}>Appearance</div>
      <div style={{ background: cardBg, border, borderRadius: 16, marginBottom: 20, overflow: "hidden" }}>
        <SettingItem label="Mode" theme={theme}>
          <Segmented<ThemeMode>
            options={themeOptions}
            value={state.themeMode}
            onChange={v => update("themeMode", v)}
            theme={theme}
          />
        </SettingItem>
        <SettingItem label="Accent" last theme={theme}>
          <div style={{ display: "flex", gap: 8 }}>
            {(Object.entries(accents) as Array<[AccentKey, Accent]>).map(([k, a]) => (
              <button
                key={k}
                onClick={() => update("accent", k)}
                title={a.label}
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: a.hex,
                  border: state.accent === k
                    ? `2px solid ${fg}`
                    : (isDark ? "0.5px solid rgba(255,255,255,0.15)" : "0.5px solid rgba(0,0,0,0.1)"),
                  cursor: "pointer", padding: 0,
                  transition: "transform 150ms ease",
                }}
              />
            ))}
          </div>
        </SettingItem>
      </div>

      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: muted, marginBottom: 8, paddingLeft: 4 }}>Install</div>
      <div style={{ background: cardBg, border, borderRadius: 16, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, color: fg }}>
                {pwaInstalled ? "Installed" : "Add to home screen"}
              </div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2, lineHeight: 1.4 }}>
                {pwaInstalled
                  ? "Running as an installed app."
                  : "Run offline in its own window."}
              </div>
            </div>
            <button
              onClick={onInstallClick}
              disabled={pwaInstalled}
              style={{
                flexShrink: 0,
                padding: "10px 16px", borderRadius: 999, border: "none",
                background: pwaInstalled
                  ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(58,58,54,0.06)")
                  : (isDark ? "#E9E4D7" : "#3A3A36"),
                color: pwaInstalled ? muted : (isDark ? "#1F1E1A" : "#F6F1E8"),
                fontFamily: "inherit", fontSize: 13, fontWeight: 500,
                letterSpacing: 0.3,
                cursor: pwaInstalled ? "default" : "pointer",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}
            >
              {!pwaInstalled && (
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M6 1.5v6M3.5 5.5L6 8l2.5-2.5M2 10h8"
                    stroke="currentColor" strokeWidth="1.3"
                    strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              )}
              {pwaInstalled ? "Installed" : "Install"}
            </button>
          </div>
          {pwaHint && (
            <div style={{
              marginTop: 12, fontSize: 12, lineHeight: 1.5, color: muted,
              padding: "8px 12px", borderRadius: 10,
              background: isDark ? "rgba(255,255,255,0.04)" : "rgba(58,58,54,0.04)",
            }}>
              {pwaHint}
            </div>
          )}
        </div>
      </div>

      <RemindersCard
        reminder={state.reminder}
        update={(r) => update("reminder", r)}
        theme={theme}
      />

      <DevPanel visible={devVisible} theme={theme} onClose={() => setDevVisible(false)} />

      <button
        onClick={onDevTap}
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          textAlign: "center", fontSize: 11, color: muted,
          letterSpacing: 1, marginTop: "auto", paddingBottom: 40, paddingTop: 8,
          fontFamily: "inherit",
          userSelect: "none", WebkitUserSelect: "none",
        }}
        title="Tap three times to toggle dev panel"
      >
        v1.0{devVisible ? " · dev" : ""}
      </button>
    </div>
  );
}
