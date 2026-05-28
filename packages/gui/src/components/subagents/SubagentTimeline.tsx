import { motion } from "framer-motion";
import { Clock, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import { useSubagentStore } from "../../stores/subagentStore.js";

export function SubagentTimeline() {
  const getRecentActivity = useSubagentStore((s) => s.getRecentActivity);
  const activities = getRecentActivity(6);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (start: string, end?: string) => {
    const ms = (end ? new Date(end) : new Date()).getTime() - new Date(start).getTime();
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
    return `${Math.round(ms / 3600000)}h`;
  };

  return (
    <div className="border-t border-[var(--border)]">
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span className="text-xs font-medium text-[var(--text-muted)]">Recent Activity</span>
        </div>

        <div className="space-y-1.5">
          {activities.map(({ subagent, task }, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2 text-xs"
            >
              {/* Timeline Line */}
              <div className="flex flex-col items-center mt-1">
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
                {i < activities.length - 1 && (
                  <div className="w-px h-4 bg-[var(--border)] mt-0.5" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-[var(--text)]">{subagent.name}</span>
                  <ArrowRight className="w-3 h-3 text-[var(--text-muted)]" />
                  <span className="truncate text-[var(--text-secondary)]">
                    {task.description}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--text-muted)]">
                  <span>{formatTime(task.startedAt)}</span>
                  {task.completedAt && (
                    <>
                      <span>·</span>
                      <span>{formatDuration(task.startedAt, task.completedAt)}</span>
                    </>
                  )}
                  {task.tokensUsed > 0 && (
                    <>
                      <span>·</span>
                      <span>{task.tokensUsed} tok</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
