import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Network, Settings, Search, Zap } from "lucide-react";
import { hintClass } from "../../lib/hintClass.js";

const navItems = [
  { path: "/", icon: MessageSquare, label: "Chat" },
  { path: "/agents", icon: Network, label: "Pipeline" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className={`${hintClass("sidebar", "root")} w-16 bg-[var(--bg-elevated)] border-r border-[var(--border)] flex flex-col items-center py-4 gap-2`}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <Link key={item.path} to={item.path} className={hintClass("sidebar", `nav-${item.label.toLowerCase()}`)}>
            <motion.div
              className={`${hintClass("sidebar", `nav-${item.label.toLowerCase()}-hit`)} relative p-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-[var(--accent)] text-[var(--bg)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-5 h-5" />
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-[var(--accent)] rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.div>
          </Link>
        );
      })}

      <div className="flex-1" />

      <motion.div
        className={`${hintClass("sidebar", "yolo-badge")} p-3 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]`}
        whileHover={{ scale: 1.05, rotate: 10 }}
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Zap className="w-5 h-5" />
      </motion.div>
    </aside>
  );
}
