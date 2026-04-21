// Hidden Dev panel. Triple-tap the v1.0 footer in Settings to reveal.
// Diagnostics you'd otherwise reach for via browser devtools — surfaced
// in-app so you can debug on a phone or an installed PWA.

import { useEffect, useState, type ReactNode } from "react";
import type { Theme } from "./constants.ts";
import { hapticsSupported, pulse } from "./lib/haptics.ts";
import { audioSupported, chime, alarm } from "./lib/audio.ts";
import {
  notificationsSupported,
  permissionState,
  requestPermission,
  notify,
  type PermissionState,
} from "./lib/notifications.ts";

// ─────────────────────────────────────────────────────────────
// Shared bits (local — don't leak into Settings.tsx)
// ─────────────────────────────────────────────────────────────

interface RowProps {
  label: string;
  children: ReactNode;
  last?: boolean;
  theme: Theme;
}

function Row({ label, children, last, theme }: RowProps) {
  const isDark = theme === "dark";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 20px", gap: 12,
      borderBottom: last ? "none" : (isDark ? "0.5px solid rgba(255,255,255,0.06)" : "0.5px solid rgba(58,58,54,0.06)"),
      fontSize: 14, color: isDark ? "#E9E4D7" : "#3A3A36",
    }}>
      <span style={{ flexShrink: 0 }}>{label}</span>
      <div style={{ textAlign: "right", minWidth: 0, overflow: "hidden" }}>{children}</div>
    </div>
  );
}

interface ActionBtnProps {
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  theme: Theme;
  children: ReactNode;
}

function ActionBtn({ onClick, disabled, danger, theme, children }: ActionBtnProps) {
  const isDark = theme === "dark";
  const muted = isDark ? "rgba(233,228,215,0.5)" : "#3A3A3680";
  const bg = disabled
    ? (isDark ? "rgba(255,255,255,0.06)" : "rgba(58,58,54,0.06)")
    : danger
      ? (isDark ? "#C9A9A9" : "#8A3A3A")
      : (isDark ? "#E9E4D7" : "#3A3A36");
  const fg = disabled
    ? muted
    : danger
      ? (isDark ? "#1F1E1A" : "#F6F1E8")
      : (isDark ? "#1F1E1A" : "#F6F1E8");
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 12px", borderRadius: 999, border: "none",
        background: bg, color: fg,
        fontFamily: "inherit", fontSize: 12, fontWeight: 500,
        cursor: disabled ? "default" : "pointer",
      }}
    >{children}</button>
  );
}

function Mono({ children, muted, theme }: { children: ReactNode; muted?: boolean; theme: Theme }) {
  const color = muted
    ? (theme === "dark" ? "rgba(233,228,215,0.5)" : "#3A3A3680")
    : (theme === "dark" ? "#E9E4D7" : "#3A3A36");
  return (
    <span style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: 12, color,
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      display: "inline-block", maxWidth: "100%",
    }}>{children}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// Section: Capabilities
// ─────────────────────────────────────────────────────────────

function CapabilitiesSection({ theme }: { theme: Theme }) {
  const [notifPerm, setNotifPerm] = useState<PermissionState>(permissionState());

  const onNotifClick = async (): Promise<void> => {
    if (!notificationsSupported()) return;
    if (Notification.permission === "default") {
      const granted = await requestPermission();
      setNotifPerm(granted ? "granted" : "denied");
      if (granted) notify("Notifications enabled", { body: "You'll see messages like this." });
    } else if (Notification.permission === "granted") {
      notify("Test notification", { body: "Fired from the Dev panel." });
    }
  };

  const notifLabel = !notificationsSupported()
    ? "Unsupported"
    : notifPerm === "granted" ? "Send test"
    : notifPerm === "denied" ? "Blocked"
    : "Enable";

  return (
    <Row label="Capabilities" last theme={theme}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>
        <ActionBtn onClick={() => pulse("medium")} disabled={!hapticsSupported()} theme={theme}>Haptic</ActionBtn>
        <ActionBtn onClick={() => chime()} disabled={!audioSupported()} theme={theme}>Chime</ActionBtn>
        <ActionBtn onClick={() => alarm(4)} disabled={!audioSupported()} theme={theme}>Alarm</ActionBtn>
        <ActionBtn onClick={() => { void onNotifClick(); }} disabled={!notificationsSupported() || notifPerm === "denied"} theme={theme}>{notifLabel}</ActionBtn>
      </div>
    </Row>
  );
}

// ─────────────────────────────────────────────────────────────
// Section: Storage
// ─────────────────────────────────────────────────────────────

function StorageSection({ theme }: { theme: Theme }) {
  const [bump, setBump] = useState(0);
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) keys.push(k);
    }
  } catch { /* private mode */ }

  const onClear = (): void => {
    if (!confirm("Clear all localStorage keys? This cannot be undone.")) return;
    try { localStorage.clear(); } catch { /* ignored */ }
    setBump(b => b + 1);
  };

  return (
    <>
      <Row label="Storage" theme={theme}>
        <Mono muted theme={theme}>{keys.length} key{keys.length === 1 ? "" : "s"}</Mono>
      </Row>
      {keys.map(k => {
        const v = (() => { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } })();
        const preview = v.length > 40 ? v.slice(0, 40) + "…" : v;
        return (
          <Row key={`${k}-${bump}`} label={k} theme={theme}>
            <Mono muted theme={theme}>{preview}</Mono>
          </Row>
        );
      })}
      <Row label="Clear storage" last theme={theme}>
        <ActionBtn onClick={onClear} disabled={keys.length === 0} danger theme={theme}>Clear</ActionBtn>
      </Row>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Section: Service Worker
// ─────────────────────────────────────────────────────────────

interface SwInfo {
  supported: boolean;
  registered: boolean;
  state: string;
  scope: string;
}

function useSwInfo(): [SwInfo, () => Promise<void>] {
  const [info, setInfo] = useState<SwInfo>({ supported: "serviceWorker" in navigator, registered: false, state: "unknown", scope: "" });

  const refresh = async (): Promise<void> => {
    if (!("serviceWorker" in navigator)) {
      setInfo({ supported: false, registered: false, state: "unsupported", scope: "" });
      return;
    }
    const regs = await navigator.serviceWorker.getRegistrations();
    const reg = regs[0];
    if (!reg) {
      setInfo({ supported: true, registered: false, state: "none", scope: "" });
      return;
    }
    const state = reg.active?.state ?? (reg.installing ? "installing" : reg.waiting ? "waiting" : "unknown");
    setInfo({ supported: true, registered: true, state, scope: reg.scope });
  };

  useEffect(() => { void refresh(); }, []);
  return [info, refresh];
}

function ServiceWorkerSection({ theme }: { theme: Theme }) {
  const [info, refresh] = useSwInfo();

  const onUnregister = async (): Promise<void> => {
    if (!confirm("Unregister the service worker? Offline support will stop until next reload.")) return;
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => r.unregister()));
    await refresh();
  };

  return (
    <>
      <Row label="Service Worker" theme={theme}>
        <Mono muted theme={theme}>{info.supported ? info.state : "unsupported"}</Mono>
      </Row>
      {info.registered && (
        <Row label="SW scope" theme={theme}>
          <Mono muted theme={theme}>{info.scope}</Mono>
        </Row>
      )}
      <Row label="Unregister SW" last theme={theme}>
        <ActionBtn onClick={() => { void onUnregister(); }} disabled={!info.registered} danger theme={theme}>Unregister</ActionBtn>
      </Row>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Section: PWA state
// ─────────────────────────────────────────────────────────────

function PwaStateSection({ theme }: { theme: Theme }) {
  const [state, setState] = useState(() => snapshot());

  useEffect(() => {
    const sync = (): void => setState(snapshot());
    window.addEventListener("pwa-availability-change", sync);
    const mq = window.matchMedia?.("(display-mode: standalone)");
    mq?.addEventListener?.("change", sync);
    return () => {
      window.removeEventListener("pwa-availability-change", sync);
      mq?.removeEventListener?.("change", sync);
    };
  }, []);

  function snapshot() {
    return {
      installed: window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true,
      promptAvailable: !!window.__pwa?.deferredPrompt,
      displayMode:
        window.matchMedia?.("(display-mode: standalone)").matches ? "standalone"
          : window.matchMedia?.("(display-mode: minimal-ui)").matches ? "minimal-ui"
          : window.matchMedia?.("(display-mode: fullscreen)").matches ? "fullscreen"
          : "browser",
    };
  }

  return (
    <>
      <Row label="Display mode" theme={theme}>
        <Mono muted theme={theme}>{state.displayMode}</Mono>
      </Row>
      <Row label="Installed" theme={theme}>
        <Mono muted theme={theme}>{state.installed ? "yes" : "no"}</Mono>
      </Row>
      <Row label="Install prompt" last theme={theme}>
        <Mono muted theme={theme}>{state.promptAvailable ? "available" : "not available"}</Mono>
      </Row>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Section: Viewport
// ─────────────────────────────────────────────────────────────

interface ViewportInfo {
  w: number;
  h: number;
  dpr: number;
  orientation: string;
}

function useViewport(): ViewportInfo {
  const read = (): ViewportInfo => ({
    w: window.innerWidth,
    h: window.innerHeight,
    dpr: window.devicePixelRatio,
    orientation: window.screen?.orientation?.type ?? (window.innerWidth > window.innerHeight ? "landscape" : "portrait"),
  });
  const [vp, setVp] = useState<ViewportInfo>(read);
  useEffect(() => {
    const sync = (): void => setVp(read());
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
    };
  }, []);
  return vp;
}

function ViewportSection({ theme }: { theme: Theme }) {
  const vp = useViewport();
  return (
    <>
      <Row label="Window" theme={theme}>
        <Mono muted theme={theme}>{vp.w} × {vp.h}</Mono>
      </Row>
      <Row label="Pixel ratio" theme={theme}>
        <Mono muted theme={theme}>{vp.dpr.toFixed(2)}</Mono>
      </Row>
      <Row label="Orientation" last theme={theme}>
        <Mono muted theme={theme}>{vp.orientation}</Mono>
      </Row>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Section: Build info
// ─────────────────────────────────────────────────────────────

function BuildInfoSection({ theme }: { theme: Theme }) {
  const built = new Date(__APP_BUILT_AT__);
  const builtStr = Number.isNaN(built.getTime())
    ? __APP_BUILT_AT__
    : built.toISOString().replace("T", " ").slice(0, 16) + "Z";
  const ua = navigator.userAgent;
  const uaShort = ua.length > 40 ? ua.slice(0, 40) + "…" : ua;
  return (
    <>
      <Row label="Commit" theme={theme}>
        <Mono muted theme={theme}>{__APP_COMMIT__}</Mono>
      </Row>
      <Row label="Built at" theme={theme}>
        <Mono muted theme={theme}>{builtStr}</Mono>
      </Row>
      <Row label="User agent" last theme={theme}>
        <Mono muted theme={theme}>{uaShort}</Mono>
      </Row>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Section: Reset
// ─────────────────────────────────────────────────────────────

function ResetSection({ theme }: { theme: Theme }) {
  const onReset = async (): Promise<void> => {
    if (!confirm("Reset everything? This clears storage, unregisters the service worker, and reloads. Cannot be undone.")) return;
    try { localStorage.clear(); } catch { /* ignored */ }
    try { sessionStorage.clear(); } catch { /* ignored */ }
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map(n => caches.delete(n)));
    }
    location.reload();
  };

  return (
    <Row label="Reset app" last theme={theme}>
      <ActionBtn onClick={() => { void onReset(); }} danger theme={theme}>Reset all</ActionBtn>
    </Row>
  );
}

// ─────────────────────────────────────────────────────────────
// DevPanel — composed sections
// ─────────────────────────────────────────────────────────────

interface DevPanelProps {
  visible: boolean;
  theme: Theme;
}

export default function DevPanel({ visible, theme }: DevPanelProps) {
  if (!visible) return null;

  const isDark = theme === "dark";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.65)";
  const border = isDark ? "0.5px solid rgba(255,255,255,0.08)" : "0.5px solid rgba(58,58,54,0.06)";
  const muted = isDark ? "rgba(233,228,215,0.5)" : "#3A3A3680";

  const Card = ({ title, children }: { title: string; children: ReactNode }) => (
    <>
      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: muted, marginBottom: 8, paddingLeft: 4 }}>{title}</div>
      <div style={{ background: cardBg, border, borderRadius: 16, marginBottom: 20, overflow: "hidden" }}>
        {children}
      </div>
    </>
  );

  return (
    <>
      <Card title="Dev · Capabilities"><CapabilitiesSection theme={theme} /></Card>
      <Card title="Dev · Storage"><StorageSection theme={theme} /></Card>
      <Card title="Dev · Service Worker"><ServiceWorkerSection theme={theme} /></Card>
      <Card title="Dev · PWA"><PwaStateSection theme={theme} /></Card>
      <Card title="Dev · Viewport"><ViewportSection theme={theme} /></Card>
      <Card title="Dev · Build"><BuildInfoSection theme={theme} /></Card>
      <Card title="Dev · Danger zone"><ResetSection theme={theme} /></Card>
      <div style={{ fontSize: 11, color: muted, marginBottom: 20, paddingLeft: 4, lineHeight: 1.5 }}>
        Capabilities dormant by default. Imports: <code>src/lib/haptics.ts</code>, <code>src/lib/audio.ts</code>, <code>src/lib/notifications.ts</code>. Wire them into your fork's logic when needed.
      </div>
    </>
  );
}
