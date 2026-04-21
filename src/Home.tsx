// Home screen — centered wordmark, soft accent orb, one primary action.
// Fork-point #2: replace this screen with your app's main content.

import type { ReactNode } from "react";
import type { Theme } from "./constants.ts";

interface HomeScreenProps {
  accent: string;
  wordmark: string;
  theme: Theme;
  onOpenSettings: () => void;
  onBegin: () => void;
}

interface NavIconBtnProps {
  onClick: () => void;
  children: ReactNode;
  isDark: boolean;
}

function NavIconBtn({ onClick, children, isDark }: NavIconBtnProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40, height: 40, borderRadius: 999,
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.55)",
        border: isDark ? "0.5px solid rgba(255,255,255,0.08)" : "0.5px solid rgba(0,0,0,0.05)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", padding: 0,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >{children}</button>
  );
}

export default function HomeScreen({ accent, wordmark, theme, onOpenSettings, onBegin }: HomeScreenProps) {
  const isDark = theme === "dark";
  const fg = isDark ? "#E9E4D7" : "#3A3A36";
  const subtle = isDark ? "rgba(233,228,215,0.35)" : "#3A3A3666";

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      padding: "0 28px",
      color: fg,
      fontFamily: '"Geist", -apple-system, system-ui, sans-serif',
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 62, paddingBottom: 4,
      }}>
        <div style={{ width: 40 }} />
        <div style={{
          fontSize: 13, letterSpacing: 2, textTransform: "lowercase",
          color: subtle, fontWeight: 500,
        }}>{wordmark}</div>
        <NavIconBtn onClick={onOpenSettings} isDark={isDark}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="3" r="1.2" fill={fg} fillOpacity="0.7"/>
            <circle cx="7" cy="7" r="1.2" fill={fg} fillOpacity="0.7"/>
            <circle cx="7" cy="11" r="1.2" fill={fg} fillOpacity="0.7"/>
          </svg>
        </NavIconBtn>
      </div>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 260, height: 260,
        }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: `radial-gradient(circle at 50% 45%, ${accent}33 0%, ${accent}00 70%)`,
            animation: "orbIdle 6s ease-in-out infinite",
          }} />
          <div style={{
            fontSize: 56, fontWeight: 300, letterSpacing: -1.5,
            textTransform: "lowercase",
            color: fg,
          }}>{wordmark}</div>
        </div>
      </div>

      <div style={{ paddingBottom: 44, display: "flex", justifyContent: "center" }}>
        <button
          onClick={onBegin}
          style={{
            width: "100%", maxWidth: 320, height: 56,
            borderRadius: 999, border: "none",
            background: isDark ? "#E9E4D7" : "#3A3A36",
            color: isDark ? "#1F1E1A" : "#F6F1E8",
            fontFamily: "inherit", fontSize: 16, fontWeight: 500,
            letterSpacing: 0.3, cursor: "pointer",
            boxShadow: isDark
              ? "0 6px 20px -6px rgba(0,0,0,0.5)"
              : "0 6px 20px -6px rgba(58,58,54,0.4)",
            transition: "transform 200ms ease, box-shadow 200ms ease",
          }}
          onMouseDown={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          Begin
        </button>
      </div>
    </div>
  );
}
