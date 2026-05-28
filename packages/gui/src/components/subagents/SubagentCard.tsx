import { motion } from "framer-motion";
import {
  Bot,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Pause,
  ChevronDown,
  ChevronRight,
  Coins,
  Hash,
} from "lucide-react";
import { useState } from "react";
import type { Subagent, SubagentStatus } from "../../stores/subagentStore.js";
import { useSubagentStore } from "../../stores/subagentStore.js";

const STATUS_CONFIG: Record<SubagentStatus, { icon: typeof Bot; color: string; label: string }> = {
  running: { icon: Loader2, color: "var(--accent)", label: "Running" },
  idle: { icon: Pause, color: "var(--text-muted)", label: "Idle" },
  completed: { icon: CheckCircle2, color: "var(--success)", label: "Completed" },
  error: { icon: XCircle, color: "var(--error)", label: "Error" },
  cancelled: { icon: XCircle, color: "var(--warning)", label: "Cancelled" },
};

const ROLE_ICONS: Record<string, string> = {
  orchestrator: "🎯",
  worker: "⚡",
  tester: "🧪",
  searcher: "🔍",
  custom: "🤖",
};

export function SubagentCard({ agent, isSelected }: { agent: Subagent; isSelected: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectSubagent = useSubagentStore((s) => s.selectSubagent);
  const config = STATUS_CONFIG[agent.status];
  const StatusIcon = config.icon;

  const formatDuration = (start: string, end?: string) => {
    const ms = (end ? new Date(end) : new Date()).getTime() - new Date(start).getTime();
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
    return `${Math.round(ms / 3600000)}h`;
  };

  const formatTokens = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={() => selectSubagent(agent.id)}
      className={`rounded-lg border transition-colors cursor-pointer ${
        isSelected
          ? "border-[var(--accent)] bg-[var(--accent)]/5"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]/30"
      }`}
    >
      {/* Main Row */}
      <div className="p-2.5">
        <div className="flex items-center gap-2.5">
          {/* Role Icon */}
          <div className="text-lg">{ROLE_ICONS[agent.role] || "🤖"}</div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{agent.name}</span>
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
                style={{ background: config.color + "15", color: config.color }}
              >
                <StatusIcon
                  className={`w-3 h-3 ${agent.status === "running" ? "animate-spin" : ""}`}
                />
                {config.label}
              </div>
            </div>

            {/* Current Task */}
            {agent.currentTask && (
              <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                {agent.currentTask}
              </div>
            )}
          </div>

          {/* Expand Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 rounded hover:bg-[var(--surface-hover)] transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            )}
          </button>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {agent.model}
          </div>
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {agent.tasks.length} tasks
          </div>
          <div className="flex items-center gap-1">
            <Coins className="w-3 h-3" />
            {formatTokens(agent.totalTokens)} tok
          </div>
          {agent.status === "running" && agent.tasks.length > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(agent.tasks[agent.tasks.length - 1].startedAt)}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Tasks */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-[var(--border)] overflow-hidden"
        >
          <div className="p-2 space-y-1 max-h-40 overflow-y-auto">
            {[...agent.tasks].reverse().slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded bg-[var(--bg)]/50"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background:
                      task.status === "completed"
                        ? "var(--success)"
                        : task.status === "error"
                        ? "var(--error)"
                        : "var(--accent)",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate">{task.description}</div>
                  {task.output && (
                    <div className="text-[10px] text-[var(--text-muted)] truncate">
                      → {task.output}
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] flex-shrink-0">
                  {task.tokensUsed > 0 && `${formatTokens(task.tokensUsed)} tok`}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
