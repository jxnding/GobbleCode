import { motion } from "framer-motion";
import { Zap, Clock, Coins, BarChart3, TrendingUp } from "lucide-react";
import { useSubagentStore } from "../../stores/subagentStore.js";

export function SubagentStats() {
  const getStats = useSubagentStore((s) => s.getStats);
  const stats = getStats();

  const formatTokens = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const statItems = [
    {
      label: "Active",
      value: stats.activeAgents.toString(),
      icon: Zap,
      color: "var(--accent)",
    },
    {
      label: "Tasks",
      value: `${stats.completedTasks}/${stats.totalTasks}`,
      icon: BarChart3,
      color: "var(--success)",
    },
    {
      label: "Tokens",
      value: formatTokens(stats.totalTokens),
      icon: TrendingUp,
      color: "var(--info)",
    },
    {
      label: "Avg Time",
      value: formatDuration(stats.avgTaskDuration),
      icon: Clock,
      color: "var(--warning)",
    },
  ];

  // Find most used agent
  const mostUsed = Object.entries(stats.agentUsage).sort((a, b) => b[1].tasks - a[1].tasks)[0];

  return (
    <div className="px-3 py-2 border-b border-[var(--border)]">
      {/* Stat Grid */}
      <div className="grid grid-cols-4 gap-2">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center p-1.5 rounded-lg bg-[var(--surface)]/50"
            >
              <Icon className="w-3.5 h-3.5 mb-1" style={{ color: stat.color }} />
              <span className="text-xs font-medium">{stat.value}</span>
              <span className="text-[9px] text-[var(--text-muted)]">{stat.label}</span>
            </div>
          );
        })}
      </div>

      {/* Usage Bar */}
      {mostUsed && (
        <div className="mt-2 flex items-center gap-2">
          <div className="text-[10px] text-[var(--text-muted)]">Most used:</div>
          <div className="flex-1 h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--accent)] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(mostUsed[1].tasks / stats.totalTasks) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-[10px] text-[var(--accent)]">{mostUsed[0]}</span>
        </div>
      )}
    </div>
  );
}
