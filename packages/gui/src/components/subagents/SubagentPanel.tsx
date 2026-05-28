import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  ChevronRight,
  ChevronLeft,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Pause,
  Filter,
} from "lucide-react";
import { useSubagentStore, SubagentStatus } from "../../stores/subagentStore.js";
import { SubagentCard } from "./SubagentCard.js";
import { SubagentStats } from "./SubagentStats.js";
import { SubagentTimeline } from "./SubagentTimeline.js";

export function SubagentPanel() {
  const { subagents, isPanelOpen, togglePanel, filterStatus, setFilterStatus, selectedSubagent } =
    useSubagentStore();

  const filteredAgents =
    filterStatus === "all"
      ? subagents
      : subagents.filter((s) => s.status === filterStatus);

  const statusCounts = {
    all: subagents.length,
    running: subagents.filter((s) => s.status === "running").length,
    idle: subagents.filter((s) => s.status === "idle").length,
    completed: subagents.filter((s) => s.status === "completed").length,
    error: subagents.filter((s) => s.status === "error").length,
  };

  return (
    <>
      {/* Toggle Button */}
      {!isPanelOpen && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={togglePanel}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 p-2 bg-[var(--surface)] border border-[var(--border)] rounded-l-lg shadow-lg hover:bg-[var(--surface-hover)] transition-colors"
        >
          <div className="flex flex-col items-center gap-1">
            <ChevronLeft className="w-4 h-4 text-[var(--text-muted)]" />
            <div className="flex flex-col gap-0.5">
              {statusCounts.running > 0 && (
                <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
              )}
              {statusCounts.idle > 0 && (
                <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
              )}
              {statusCounts.error > 0 && (
                <div className="w-2 h-2 rounded-full bg-[var(--error)]" />
              )}
            </div>
          </div>
        </motion.button>
      )}

      {/* Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="h-full bg-[var(--bg-elevated)] border-l border-[var(--border)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 border-b border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[var(--accent)]" />
                  <h2 className="text-sm font-semibold">Subagents</h2>
                  <span className="text-xs text-[var(--text-muted)]">
                    {subagents.length}
                  </span>
                </div>
                <button
                  onClick={togglePanel}
                  className="p-1 rounded hover:bg-[var(--surface-hover)] transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Status Filters */}
              <div className="flex gap-1">
                {(["all", "running", "idle", "completed", "error"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                      filterStatus === status
                        ? "bg-[var(--accent)] text-[var(--bg)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    <StatusDot status={status} />
                    {statusCounts[status]}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Summary */}
            <SubagentStats />

            {/* Agent List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              <AnimatePresence>
                {filteredAgents.map((agent) => (
                  <SubagentCard key={agent.id} agent={agent} isSelected={selectedSubagent === agent.id} />
                ))}
              </AnimatePresence>

              {filteredAgents.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
                  <Bot className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">No subagents</span>
                </div>
              )}
            </div>

            {/* Timeline */}
            <SubagentTimeline />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function StatusDot({ status }: { status: SubagentStatus | "all" }) {
  if (status === "all") return <Filter className="w-3 h-3" />;

  const colors: Record<SubagentStatus, string> = {
    running: "bg-[var(--accent)] animate-pulse",
    idle: "bg-[var(--text-muted)]",
    completed: "bg-[var(--success)]",
    error: "bg-[var(--error)]",
    cancelled: "bg-[var(--warning)]",
  };

  return <div className={`w-2 h-2 rounded-full ${colors[status]}`} />;
}
