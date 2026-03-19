"use client";

import { useState, useEffect } from "react";
import { Bell, ShieldCheck, ChevronRight, Palette, SlidersHorizontal, User } from "lucide-react";
import { showToast } from "@/components/Toast";

const SECTIONS = [
  {
    label: "Appearance", icon: Palette, color: "#C96442",
    settings: [
      { key: "theme", title: "Theme", description: "Choose your preferred color scheme", type: "select", options: ["Dark (Warm)", "Dark (Cool)", "Light", "System"] },
      { key: "fontSize", title: "Font size", description: "Adjust text size across the interface", type: "select", options: ["Small", "Medium", "Large"] },
    ],
  },
  {
    label: "Privacy", icon: ShieldCheck, color: "#3EA86A",
    settings: [
      { key: "history", title: "Save conversation history", description: "Store your chat history for future reference", type: "toggle" },
      { key: "improve", title: "Help improve CapFolio", description: "Share anonymized data to improve model quality", type: "toggle" },
    ],
  },
  {
    label: "Notifications", icon: Bell, color: "#5B8DEF",
    settings: [
      { key: "email", title: "Email notifications", description: "Receive updates and tips via email", type: "toggle" },
      { key: "desktop", title: "Desktop notifications", description: "Show browser push notifications", type: "toggle" },
    ],
  },
  {
    label: "Account", icon: User, color: "#7C5CBF",
    settings: [
      { key: "lang", title: "Language", description: "Interface and response language", type: "select", options: ["English", "Spanish", "French", "German", "Japanese"] },
      { key: "timezone", title: "Timezone", description: "Used for scheduling and timestamps", type: "select", options: ["Asia/Kolkata (IST)", "UTC", "America/New_York", "Europe/London"] },
    ],
  },
] as const;

type SettingKey = "theme" | "fontSize" | "history" | "improve" | "email" | "desktop" | "lang" | "timezone";

const DEFAULTS: Record<SettingKey, string | boolean> = {
  theme: "Dark (Warm)", fontSize: "Medium", history: true, improve: false,
  email: true, desktop: false, lang: "English", timezone: "Asia/Kolkata (IST)",
};

const FONT_SIZE_MAP: Record<string, string> = { Small: "13px", Medium: "15px", Large: "17px" };

function loadSettings(): Record<SettingKey, string | boolean> {
  try {
    const s = localStorage.getItem("capfolio_settings");
    return s ? { ...DEFAULTS, ...JSON.parse(s) } : DEFAULTS;
  } catch { return DEFAULTS; }
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200"
      style={{ background: on ? "var(--accent-orange)" : "rgba(255,255,255,0.12)" }}>
      <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );
}

export default function CustomizeView() {
  const [values, setValues] = useState<Record<SettingKey, string | boolean>>(DEFAULTS);
  const [activeSection, setActiveSection] = useState("Appearance");
  const [saved, setSaved] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadSettings();
    setValues(loaded);
    // Apply font size immediately
    document.documentElement.style.fontSize = FONT_SIZE_MAP[loaded.fontSize as string] ?? "15px";
  }, []);

  const currentSection = SECTIONS.find(s => s.label === activeSection)!;

  const updateValue = (key: SettingKey, val: string | boolean) => {
    const next = { ...values, [key]: val };
    setValues(next);
    // Apply font size in real time
    if (key === "fontSize") {
      document.documentElement.style.fontSize = FONT_SIZE_MAP[val as string] ?? "15px";
    }
    // Auto-save
    try { localStorage.setItem("capfolio_settings", JSON.stringify(next)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left nav */}
      <div className="w-56 flex flex-col border-r flex-shrink-0"
        style={{ borderColor: "var(--border-color)", background: "rgba(0,0,0,0.1)" }}>
        <div className="px-4 py-5 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Customize</span>
          </div>
        </div>
        <div className="flex flex-col py-2">
          {SECTIONS.map(({ label, icon: Icon, color }) => (
            <button key={label} onClick={() => setActiveSection(label)}
              className="flex items-center gap-3 px-4 py-3 text-left transition-all duration-150"
              style={{
                background: activeSection === label ? "rgba(255,255,255,0.06)" : "transparent",
                borderLeft: activeSection === label ? "2px solid var(--accent-orange)" : "2px solid transparent",
                color: activeSection === label ? "var(--text-primary)" : "var(--text-secondary)",
              }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
                <Icon size={14} style={{ color }} />
              </div>
              <span className="text-sm font-medium">{label}</span>
              {activeSection === label && <ChevronRight size={14} className="ml-auto" style={{ color: "var(--text-muted)" }} />}
            </button>
          ))}
        </div>
        <div className="mt-auto px-4 py-4 flex items-center gap-2">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>CapFolio v1.0.0 · Free Plan</p>
          {saved && <span className="text-xs" style={{ color: "#3EA86A" }}>✓ Saved</span>}
        </div>
      </div>

      {/* Settings panel */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${currentSection.color}22` }}>
              <currentSection.icon size={20} style={{ color: currentSection.color }} />
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{currentSection.label}</h1>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Manage your {currentSection.label.toLowerCase()} preferences</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {currentSection.settings.map(setting => (
              <div key={setting.key} className="flex items-center justify-between p-5 rounded-2xl gap-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{setting.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{setting.description}</p>
                </div>
                {setting.type === "toggle" ? (
                  <Toggle on={values[setting.key as SettingKey] as boolean}
                    onToggle={() => updateValue(setting.key as SettingKey, !values[setting.key as SettingKey])} />
                ) : (
                  <select value={values[setting.key as SettingKey] as string}
                    onChange={e => updateValue(setting.key as SettingKey, e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-sm outline-none cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-primary)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {"options" in setting && setting.options?.map((o: string) => (
                      <option key={o} value={o} style={{ background: "#2A2924" }}>{o}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
