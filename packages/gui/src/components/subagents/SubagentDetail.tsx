import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Bot,
  Zap,
  Clock,
  Coins,
  Hash,
  CheckCircle2,
  XCircle,
  Loader2,
  BarChart3,
  TrendingUp,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useSubagentStore, type Subagent } from "../../stores/subagentStore.js";

export function SubagentDetail() {
  const { subagents, selectedSubagent, selectSubagent } = useSubagentStore();
  const agent = subagents.find((s) => s.id === selectedSubagent);

  return (
    <AnimatePresence>
      {agent && (
        <motion.div
          initial={{ opacity: 0, x: 320 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 320 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-80 top-10 bottom-0 w-80 bg-[var(--bg-elevated)] border-l border-[var(--border)] shadow-2xl z-30 flex flex-col"
        >
          <DetailHeader agent={agent} onClose={() => selectSubagent(null)} />
          <DetailContent agent={agent} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailHeader({ agent, onClose }: { agent: Subagent; onClose: () => void }) {
  const ROLE_ICONS: Record<string, string> = {
    orchestrator: "🎯",
    worker: "⚡",
    tester: "🧪",
    searcher: "🔍",
    custom: "🤖",
  };

  return (
    <div className="p-4 border-b border-[var(--border)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{ROLE_ICONS[agent.role] || "🤖"}</span>
          <div>
            <h3 className="font-semibold">{agent.name}</h3>
            <div className="text-xs text-[var(--text-muted)] capitalize">{agent.role}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[var(--surface)] transition-colors"
        >
          <X className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <StatusBadge status={agent.status} />
        <span className="text-xs text-[var(--text-muted)]">
          {agent.currentTask || "No active task"}
        </span>
      </div>
    </div>
  );
}

function DetailContent({ agent }: { agent: Subagent }) {
  const formatTokens = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const formatCost = (n: number) => `$${n.toFixed(4)}`;

  const formatDuration = (start: string, end?: string) => {
    const ms = (end ? new Date(end) : new Date()).getTime() - new Date(start).getTime();
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Calculate stats for this agent
  const completedTasks = agent.tasks.filter((t) => t.status === "completed").length;
  const failedTasks = agent.tasks.filter((t) => t.status === "error").length;
  const successRate = agent.tasks.length > 0 ? (completedTasks / agent.tasks.length) * 100 : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Stats Grid */}
      <div className="p-4 border-b border-[var(--border)]">
        <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Statistics
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Hash}
            label="Total Tasks"
            value={agent.tasks.length.toString()}
            color="var(--info)"
          />
          <StatCard
            icon={CheckCircle2}
            label="Success Rate"
            value={`${successRate.toFixed(0)}%`}
            color="var(--success)"
          />
          <StatCard
            icon={Zap}
            label="Tokens Used"
            value={formatTokens(agent.totalTokens)}
            color="var(--accent)"
          />
          <StatCard
            icon={Coins}
            label="Total Cost"
            value={formatCost(agent.totalCost)}
            color="var(--warning)"
          />
        </div>
      </div>

      {/* Model Info */}
      <div className="p-4 border-b border-[var(--border)]">
        <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
          Configuration
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Model</span>
            <span className="font-medium">{agent.model}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Created</span>
            <span>{new Date(agent.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-muted)]">Last Active</span>
            <span>{new Date(agent.lastActiveAt).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Task History */}
      <div className="p-4">
        <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
          Task History
        </h4>
        <div className="space-y-2">
          {[...agent.tasks].reverse().map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <TaskStatusIcon status={task.status} />
                    <span className="text-sm font-medium truncate">{task.description}</span>
                  </div>
                  {task.output && (
                    <div className="mt-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg)] rounded p-2 font-mono">
                      {task.output}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--text-muted)]">
                <span>{formatDuration(task.startedAt, task.completedAt)}</span>
                {task.tokensUsed > 0 && <span>{formatTokens(task.tokensUsed)} tokens</span>}
                {task.cost > 0 && <span>{formatCost(task.cost)}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[10px] text-[var(--text-muted)]">{label}</span>
      </div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: typeof Bot }> = {
    running: { color: "var(--accent)", icon: Loader2 },
    idle: { color: "var(--text-muted)", icon: Clock },
    completed: { color: "var(--success)", icon: CheckCircle2 },
    error: { color: "var(--error)", icon: XCircle },
    cancelled: { color: "var(--warning)", icon: XCircle },
  };

  const { color, icon: Icon } = config[status] || config.idle;

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
      style={{ background: color + "15", color }}
    >
      <Icon className={`w-3 h-3 ${status === "running" ? "animate-spin" : ""}`} />
      <span className="capitalize">{status}</span>
    </div>
  );
}

function TaskStatusIcon({ status }: { status: string }) {
  const config: Record<string, { color: string; icon: typeof Bot }> = {
    running: { color: "var(--accent)", icon: Loader2 },
    completed: { color: "var(--success)", icon: CheckCircle2 },
    error: { color: "var(--error)", icon: XCircle },
  };

  const { color, icon: Icon } = config[status] || { color: "var(--text-muted)", icon: Clock };

  return <Icon className={`w-3.5 h-3.5 ${status === "running" ? "animate-spin" : ""}`} style={{ color }} />;
}
