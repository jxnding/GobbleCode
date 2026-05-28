import { motion } from "framer-motion";
import { Minus, Square, X, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export function Titlebar() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="h-10 flex items-center justify-between px-4 bg-[var(--bg-elevated)] border-b border-[var(--border)] select-none drag">
      <div className="flex items-center gap-2 no-drag">
        <motion.svg
          viewBox="0 0 100 100"
          className="w-6 h-6"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <path
            d="M 50 50 L 85 20 A 45 45 0 1 0 85 80 Z"
            fill="var(--accent)"
            stroke="var(--accent-hover)"
            strokeWidth="5"
          />
          <circle cx="60" cy="30" r="5" fill="white" />
          <circle cx="62" cy="28" r="2.5" fill="black" />
        </motion.svg>
        <span className="text-sm font-semibold text-[var(--text-secondary)]">GobbleCode</span>
      </div>

      <div className="flex items-center gap-1 no-drag">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-1.5 hover:bg-[var(--surface-hover)] rounded transition-colors"
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="p-1.5 hover:bg-[var(--surface-hover)] rounded transition-colors"
        >
          <Minus className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="p-1.5 hover:bg-[var(--surface-hover)] rounded transition-colors"
        >
          <Square className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        </button>
        <button
          onClick={() => window.electronAPI?.close()}
          className="p-1.5 hover:bg-[var(--error)]/20 rounded transition-colors"
        >
          <X className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>
    </div>
  );
}
