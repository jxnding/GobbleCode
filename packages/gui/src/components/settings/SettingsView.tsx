import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Palette,
  Globe,
  Cloud,
  Shield,
  Zap,
  Sun,
  Moon,
  Monitor,
  Check,
  AlertTriangle,
} from "lucide-react";
import { WavyText } from "../ui/WavyText.js";

type Theme = "dark" | "light" | "auto";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState("permissions");
  const [theme, setTheme] = useState<Theme>("dark");
  const [yoloMode, setYoloMode] = useState(true);

  const tabs = [
    { id: "permissions", label: "Permissions", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "sound", label: "Sound", icon: Volume2 },
    { id: "search", label: "Search", icon: Globe },
    { id: "sync", label: "Sync", icon: Cloud },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="text-sm">⚙️</span>
          </motion.div>
          <div>
            <h1 className="font-semibold">
              <WavyText text="Settings" />
            </h1>
            <p className="text-xs text-[var(--text-muted)]">Customize your GobbleCode</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tabs */}
        <aside className="w-52 border-r border-[var(--border)] p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ x: 4 }}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[var(--accent)] text-[var(--bg)] font-medium"
                    : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            );
          })}
        </aside>

        {/* Settings Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === "permissions" && <PermissionsSettings yoloMode={yoloMode} setYoloMode={setYoloMode} />}
            {activeTab === "appearance" && <AppearanceSettings theme={theme} setTheme={setTheme} />}
            {activeTab === "sound" && <SoundSettings />}
            {activeTab === "search" && <SearchSettings />}
            {activeTab === "sync" && <SyncSettings />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────── PERMISSIONS ─────────────────────────── */

function PermissionsSettings({
  yoloMode,
  setYoloMode,
}: {
  yoloMode: boolean;
  setYoloMode: (v: boolean) => void;
}) {
  const permissions = [
    { id: "write", label: "Write Files", description: "Create and modify files", yolo: true },
    { id: "edit", label: "Edit Files", description: "Edit existing files", yolo: true },
    { id: "bash", label: "Run Commands", description: "Execute shell commands", yolo: true },
    { id: "git", label: "Git Operations", description: "Commit, branch, push", yolo: true },
    { id: "browser", label: "Browser Control", description: "Open URLs, automate browser", yolo: true },
    { id: "search", label: "Web Search", description: "Search the internet", yolo: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* YOLO Mode Banner */}
      <section>
        <div
          className={`rounded-xl p-5 border transition-colors ${
            yoloMode
              ? "bg-[var(--accent)]/10 border-[var(--accent)]/30"
              : "bg-[var(--surface)] border-[var(--border)]"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  yoloMode ? "bg-[var(--accent)]/20" : "bg-[var(--surface-hover)]"
                }`}
              >
                <Zap className={`w-5 h-5 ${yoloMode ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`} />
              </div>
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  YOLO Mode
                  {yoloMode && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--bg)] font-medium">
                      ACTIVE
                    </span>
                  )}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-1 max-w-md">
                  No permission prompts. GobbleCode can do everything without asking.
                  Fast and frictionless — just like eating dots.
                </p>
                {!yoloMode && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-[var(--warning)]">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Permissions will be requested individually</span>
                  </div>
                )}
              </div>
            </div>
            <Toggle enabled={yoloMode} onToggle={() => setYoloMode(!yoloMode)} />
          </div>
        </div>
      </section>

      {/* Individual Permissions */}
      <section>
        <h2 className="text-base font-semibold mb-1">Tool Permissions</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          {yoloMode
            ? "All tools allowed by default (YOLO mode is on)"
            : "Toggle individual tool permissions"}
        </p>
        <div className="space-y-2">
          {permissions.map((perm) => (
            <div
              key={perm.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                yoloMode
                  ? "bg-[var(--accent)]/5 border-[var(--accent)]/10"
                  : "bg-[var(--surface)] border-[var(--border)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    yoloMode ? "bg-[var(--accent)]" : "bg-[var(--text-muted)]"
                  }`}
                />
                <div>
                  <div className="text-sm font-medium">{perm.label}</div>
                  <div className="text-xs text-[var(--text-muted)]">{perm.description}</div>
                </div>
              </div>
              {yoloMode ? (
                <Check className="w-4 h-4 text-[var(--accent)]" />
              ) : (
                <Toggle enabled={false} onToggle={() => {}} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Branch Safety */}
      <section>
        <h2 className="text-base font-semibold mb-1">Git Safety</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">Protect important branches</p>
        <div className="space-y-2">
          {["main", "master", "develop"].map((branch) => (
            <div
              key={branch}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--surface-hover)]">
                  {branch}
                </span>
                <span className="text-xs text-[var(--text-muted)]">protected</span>
              </div>
              <Toggle enabled={true} onToggle={() => {}} />
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

/* ─────────────────────────── APPEARANCE ─────────────────────────── */

function AppearanceSettings({
  theme,
  setTheme,
}: {
  theme: Theme;
  setTheme: (t: Theme) => void;
}) {
  const themes = [
    {
      id: "dark" as Theme,
      label: "Dusk",
      description: "Warm dark with golden tint",
      icon: Moon,
      preview: {
        bg: "#1a1814",
        surface: "#242018",
        text: "#e8e0d0",
        accent: "#fbbf24",
      },
    },
    {
      id: "light" as Theme,
      label: "Dawn",
      description: "Cream light with amber accents",
      icon: Sun,
      preview: {
        bg: "#faf6ee",
        surface: "#f0ead8",
        text: "#3d3520",
        accent: "#d97706",
      },
    },
    {
      id: "auto" as Theme,
      label: "Auto",
      description: "Follow system preference",
      icon: Monitor,
      preview: {
        bg: "#2a2520",
        surface: "#352f28",
        text: "#d0c8b8",
        accent: "#fbbf24",
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Theme Selection */}
      <section>
        <h2 className="text-base font-semibold mb-1">Theme</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Warm, pleasant tones — never harsh black or white
        </p>
        <div className="grid grid-cols-3 gap-4">
          {themes.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <motion.button
                key={t.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTheme(t.id)}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? "border-[var(--accent)] shadow-lg shadow-[var(--accent)]/10"
                    : "border-[var(--border)] hover:border-[var(--text-muted)]"
                }`}
              >
                {/* Theme Preview */}
                <div
                  className="rounded-lg overflow-hidden mb-3 border border-black/10"
                  style={{ background: t.preview.bg }}
                >
                  <div className="p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ background: t.preview.accent }}
                      />
                      <div
                        className="h-2 rounded-full flex-1"
                        style={{ background: t.preview.text, opacity: 0.3 }}
                      />
                    </div>
                    <div
                      className="rounded p-2"
                      style={{ background: t.preview.surface }}
                    >
                      <div
                        className="h-1.5 rounded-full w-3/4 mb-1"
                        style={{ background: t.preview.text, opacity: 0.2 }}
                      />
                      <div
                        className="h-1.5 rounded-full w-1/2"
                        style={{ background: t.preview.text, opacity: 0.15 }}
                      />
                    </div>
                    <div className="flex gap-1">
                      <div
                        className="h-1.5 rounded-full flex-1"
                        style={{ background: t.preview.accent, opacity: 0.4 }}
                      />
                      <div
                        className="h-1.5 rounded-full w-8"
                        style={{ background: t.preview.surface }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[var(--text-muted)]" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{t.description}</div>
                  </div>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="theme-check"
                    className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-[var(--bg)]" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Accent Color */}
      <section>
        <h2 className="text-base font-semibold mb-1">Accent Color</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">Primary highlight color</p>
        <div className="flex gap-3">
          {[
            { color: "#fbbf24", label: "Amber" },
            { color: "#f59e0b", label: "Golden" },
            { color: "#fb923c", label: "Orange" },
            { color: "#a78bfa", label: "Violet" },
            { color: "#34d399", label: "Emerald" },
            { color: "#60a5fa", label: "Sky" },
          ].map(({ color, label }) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="group flex flex-col items-center gap-1"
            >
              <div
                className="w-10 h-10 rounded-full border-2 border-transparent hover:border-white/30 transition-colors"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text)]">
                {label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Font */}
      <section>
        <h2 className="text-base font-semibold mb-1">Code Font</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">Monospace font for code blocks</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "JetBrains Mono", sample: "const x = 42;" },
            { name: "Fira Code", sample: "const x => 42;" },
            { name: "Cascadia Code", sample: "const x >= 42;" },
            { name: "IBM Plex Mono", sample: "const x != 42;" },
          ].map((font) => (
            <button
              key={font.name}
              className="p-3 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] text-left transition-colors"
            >
              <div className="text-sm font-medium mb-1">{font.name}</div>
              <div className="text-xs text-[var(--text-muted)] font-mono">{font.sample}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Animation Speed */}
      <section>
        <h2 className="text-base font-semibold mb-4">Animation Speed</h2>
        <div className="flex gap-3">
          {["Slow", "Normal", "Fast"].map((speed) => (
            <button
              key={speed}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                speed === "Normal"
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                  : "border-[var(--border)] hover:border-[var(--text-muted)]"
              }`}
            >
              {speed}
            </button>
          ))}
        </div>
      </section>

      {/* Wavy Intensity */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold">WAKA Intensity</h2>
          <span className="text-sm text-[var(--text-muted)]">50%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          defaultValue="50"
          className="w-full accent-[var(--accent)]"
        />
        <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
          <span>Chill</span>
          <span>WAKA WAKA WAKA</span>
        </div>
      </section>
    </motion.div>
  );
}

/* ─────────────────────────── SOUND ─────────────────────────── */

function SoundSettings() {
  const effects = [
    { id: "start", label: "Start", description: "When GobbleCode starts", emoji: "🚀" },
    { id: "complete", label: "Complete", description: "When a task finishes", emoji: "✅" },
    { id: "error", label: "Error", description: "When something fails", emoji: "💥" },
    { id: "thinking", label: "Thinking", description: "While processing", emoji: "💭" },
    { id: "gobble", label: "Gobble", description: "Mr. Gobble's signature", emoji: "🟡" },
    { id: "waka", label: "WAKA", description: "Dot munching sound", emoji: "🟣" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <section>
        <h2 className="text-base font-semibold mb-1">Sound Effects</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">Audio feedback for actions</p>
        <div className="space-y-2">
          {effects.map((effect) => (
            <div
              key={effect.id}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{effect.emoji}</span>
                <div>
                  <div className="text-sm font-medium">{effect.label}</div>
                  <div className="text-xs text-[var(--text-muted)]">{effect.description}</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium hover:bg-[var(--accent)]/20 transition-colors"
              >
                Play
              </motion.button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold">Volume</h2>
          <span className="text-sm text-[var(--text-muted)]">50%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          defaultValue="50"
          className="w-full accent-[var(--accent)]"
        />
      </section>

      <section>
        <h2 className="text-base font-semibold mb-4">Mute All</h2>
        <Toggle enabled={false} onToggle={() => {}} />
      </section>
    </motion.div>
  );
}

/* ─────────────────────────── SEARCH ─────────────────────────── */

function SearchSettings() {
  const providers = [
    { name: "Google", enabled: true, icon: "🔍" },
    { name: "DuckDuckGo", enabled: true, icon: "🦆" },
    { name: "Perplexity", enabled: true, icon: "🔮" },
    { name: "GitHub", enabled: true, icon: "🐙" },
    { name: "Stack Overflow", enabled: true, icon: "📚" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <section>
        <h2 className="text-base font-semibold mb-1">Search Providers</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Sources for boosting AI responses with web context
        </p>
        <div className="space-y-2">
          {providers.map((provider) => (
            <div
              key={provider.name}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
            >
              <div className="flex items-center gap-3">
                <span>{provider.icon}</span>
                <span className="text-sm font-medium">{provider.name}</span>
              </div>
              <Toggle enabled={provider.enabled} onToggle={() => {}} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Auto-Search</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Automatically search the web to boost responses
            </p>
          </div>
          <Toggle enabled={true} onToggle={() => {}} />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold">Max Results</h2>
          <span className="text-sm text-[var(--text-muted)]">5</span>
        </div>
        <input
          type="range"
          min="1"
          max="20"
          defaultValue="5"
          className="w-full accent-[var(--accent)]"
        />
      </section>
    </motion.div>
  );
}

/* ─────────────────────────── SYNC ─────────────────────────── */

function SyncSettings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <section>
        <h2 className="text-base font-semibold mb-1">Cloud Sync</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Sync your agents, models, and settings across devices
        </p>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--text-muted)]">Server URL</label>
            <input
              type="text"
              placeholder="https://sync.gobblecode.dev"
              className="w-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="text-sm text-[var(--text-muted)]">API Key</label>
            <input
              type="password"
              placeholder="Your API key"
              className="w-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-2 text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]"
            />
          </div>
          <button className="w-full py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg)] font-medium transition-colors">
            Connect & Sync
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold mb-1">Sync Items</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">Choose what to sync</p>
        <div className="space-y-2">
          {[
            { label: "Agents", description: "Custom agent configurations", enabled: true },
            { label: "Models", description: "Provider settings and models", enabled: true },
            { label: "Skills", description: "Installed skills", enabled: true },
            { label: "Config", description: "General settings", enabled: true },
            { label: "Theme", description: "Appearance preferences", enabled: false },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
            >
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-[var(--text-muted)]">{item.description}</div>
              </div>
              <Toggle enabled={item.enabled} onToggle={() => {}} />
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

/* ─────────────────────────── TOGGLE COMPONENT ─────────────────────────── */

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? "bg-[var(--accent)]" : "bg-[var(--surface-hover)]"
      }`}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ left: enabled ? 26 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
