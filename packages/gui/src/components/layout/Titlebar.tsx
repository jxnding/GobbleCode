import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { hintClass } from "../../lib/hintClass.js";

const isMac = typeof navigator !== "undefined" && navigator.userAgent.includes("Mac");

export function Titlebar() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div
      className={`${hintClass("titlebar", "root")} h-10 flex items-center justify-between px-4 bg-[var(--bg-elevated)] border-b border-[var(--border)] select-none drag ${
        isMac ? "pl-20" : ""
      }`}
    >
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
          className={`${hintClass("titlebar", "theme-toggle")} p-1.5 hover:bg-[var(--surface-hover)] rounded transition-colors`}
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-[var(--text-muted)]" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>
      </div>
    </div>
  );
}
