import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SubagentStatus = "idle" | "running" | "completed" | "error" | "cancelled";

interface SubagentTask {
  id: string;
  description: string;
  startedAt: string;
  completedAt?: string;
  status: SubagentStatus;
  output?: string;
  tokensUsed: number;
  cost: number;
}

interface Subagent {
  id: string;
  name: string;
  role: string; // "orchestrator" | "worker" | "tester" | "reviewer" | "searcher"
  model: string;
  status: SubagentStatus;
  parentId?: string;
  currentTask?: string;
  tasks: SubagentTask[];
  totalTokens: number;
  totalCost: number;
  createdAt: string;
  lastActiveAt: string;
}

interface SubagentStats {
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalTokens: number;
  totalCost: number;
  avgTaskDuration: number;
  agentUsage: Record<string, { tasks: number; tokens: number; cost: number }>;
}

// ─── Store Shape ─────────────────────────────────────────────────────────────

interface SubagentStoreState {
  subagents: Subagent[];
  selectedId: string | null;
  panelOpen: boolean;
  filterStatus: SubagentStatus | null;

  addSubagent: (subagent: Subagent) => void;
  removeSubagent: (id: string) => void;
  updateSubagent: (id: string, updates: Partial<Subagent>) => void;
  setSubagentStatus: (id: string, status: SubagentStatus) => void;
  setCurrentTask: (id: string, task: string | undefined) => void;
  addTask: (subagentId: string, task: SubagentTask) => void;
  completeTask: (subagentId: string, taskId: string, output: string, tokens: number, cost: number) => void;
  selectSubagent: (id: string | null) => void;
  togglePanel: () => void;
  setFilterStatus: (status: SubagentStatus | null) => void;
  getStats: () => SubagentStats;
  getRecentActivity: (limit?: number) => { subagent: Subagent; task: SubagentTask }[];
  getSubagentsByParent: (parentId: string) => Subagent[];
}

// ─── Demo Data ───────────────────────────────────────────────────────────────

const now = new Date().toISOString();
const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();
const fifteenMinAgo = new Date(Date.now() - 15 * 60_000).toISOString();

const DEMO_SUBAGENTS: Subagent[] = [
  {
    id: "orchestrator-1",
    name: "Orchestrator",
    role: "orchestrator",
    model: "claude-sonnet-4-20250514",
    status: "idle",
    currentTask: undefined,
    tasks: [
      {
        id: "task-orch-1",
        description: "Coordinate subagent workflow",
        startedAt: fifteenMinAgo,
        completedAt: tenMinAgo,
        status: "completed",
        output: "Workflow coordinated successfully",
        tokensUsed: 4500,
        cost: 0.0135,
      },
    ],
    totalTokens: 4500,
    totalCost: 0.0135,
    createdAt: fifteenMinAgo,
    lastActiveAt: tenMinAgo,
  },
  {
    id: "worker-1",
    name: "Worker Alpha",
    role: "worker",
    model: "claude-sonnet-4-20250514",
    status: "running",
    currentTask: "Implementing feature branch",
    tasks: [
      {
        id: "task-work1-1",
        description: "Scaffold module structure",
        startedAt: fifteenMinAgo,
        completedAt: tenMinAgo,
        status: "completed",
        output: "Module structure created",
        tokensUsed: 3200,
        cost: 0.0096,
      },
      {
        id: "task-work1-2",
        description: "Implement feature branch",
        startedAt: fiveMinAgo,
        status: "running",
        tokensUsed: 5700,
        cost: 0.0171,
      },
    ],
    totalTokens: 8900,
    totalCost: 0.0267,
    createdAt: fifteenMinAgo,
    lastActiveAt: now,
  },
  {
    id: "tester-1",
    name: "Tester",
    role: "tester",
    model: "claude-haiku-4-20250414",
    status: "idle",
    currentTask: undefined,
    tasks: [
      {
        id: "task-test-1",
        description: "Run unit test suite",
        startedAt: tenMinAgo,
        completedAt: fiveMinAgo,
        status: "completed",
        output: "All 42 tests passed",
        tokensUsed: 2400,
        cost: 0.0012,
      },
    ],
    totalTokens: 2400,
    totalCost: 0.0012,
    createdAt: tenMinAgo,
    lastActiveAt: fiveMinAgo,
  },
  {
    id: "worker-2",
    name: "Worker Beta",
    role: "worker",
    model: "claude-sonnet-4-20250514",
    status: "completed",
    parentId: "orchestrator-1",
    currentTask: undefined,
    tasks: [
      {
        id: "task-work2-1",
        description: "Fix bug in parser",
        startedAt: fifteenMinAgo,
        completedAt: tenMinAgo,
        status: "completed",
        output: "Parser bug fixed and verified",
        tokensUsed: 3200,
        cost: 0.0096,
      },
    ],
    totalTokens: 3200,
    totalCost: 0.0096,
    createdAt: fifteenMinAgo,
    lastActiveAt: tenMinAgo,
  },
];

// ─── Context ─────────────────────────────────────────────────────────────────

const SubagentContext = createContext<SubagentStoreState | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

function SubagentProvider({ children }: { children: ReactNode }) {
  const [subagents, setSubagents] = useState<Subagent[]>(DEMO_SUBAGENTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<SubagentStatus | null>(null);

  const nowIso = () => new Date().toISOString();

  const addSubagent = useCallback((subagent: Subagent) => {
    setSubagents((prev) => [...prev, subagent]);
  }, []);

  const removeSubagent = useCallback((id: string) => {
    setSubagents((prev) => prev.filter((a) => a.id !== id));
    setSelectedId((prev) => (prev === id ? null : prev));
  }, []);

  const updateSubagent = useCallback((id: string, updates: Partial<Subagent>) => {
    setSubagents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, lastActiveAt: nowIso() } : a)),
    );
  }, []);

  const setSubagentStatus = useCallback((id: string, status: SubagentStatus) => {
    setSubagents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status, lastActiveAt: nowIso() } : a)),
    );
  }, []);

  const setCurrentTask = useCallback((id: string, task: string | undefined) => {
    setSubagents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, currentTask: task, lastActiveAt: nowIso() } : a)),
    );
  }, []);

  const addTask = useCallback((subagentId: string, task: SubagentTask) => {
    setSubagents((prev) =>
      prev.map((a) =>
        a.id === subagentId
          ? { ...a, tasks: [...a.tasks, task], lastActiveAt: nowIso() }
          : a,
      ),
    );
  }, []);

  const completeTask = useCallback(
    (subagentId: string, taskId: string, output: string, tokens: number, cost: number) => {
      setSubagents((prev) =>
        prev.map((a) => {
          if (a.id !== subagentId) return a;
          const tasks = a.tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: "completed" as SubagentStatus, completedAt: nowIso(), output, tokensUsed: tokens, cost }
              : t,
          );
          return {
            ...a,
            tasks,
            totalTokens: a.totalTokens + tokens,
            totalCost: a.totalCost + cost,
            lastActiveAt: nowIso(),
          };
        }),
      );
    },
    [],
  );

  const selectSubagent = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const togglePanel = useCallback(() => {
    setPanelOpen((prev) => !prev);
  }, []);

  const getStats = useCallback((): SubagentStats => {
    const allTasks = subagents.flatMap((a) => a.tasks);
    const completedTasks = allTasks.filter((t) => t.status === "completed");
    const failedTasks = allTasks.filter((t) => t.status === "error");

    const totalDuration = completedTasks.reduce((sum, t) => {
      if (!t.completedAt) return sum;
      return sum + (new Date(t.completedAt).getTime() - new Date(t.startedAt).getTime());
    }, 0);

    const agentUsage: SubagentStats["agentUsage"] = {};
    for (const a of subagents) {
      agentUsage[a.name] = {
        tasks: a.tasks.length,
        tokens: a.totalTokens,
        cost: a.totalCost,
      };
    }

    return {
      totalAgents: subagents.length,
      activeAgents: subagents.filter((a) => a.status === "running").length,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      failedTasks: failedTasks.length,
      totalTokens: subagents.reduce((s, a) => s + a.totalTokens, 0),
      totalCost: subagents.reduce((s, a) => s + a.totalCost, 0),
      avgTaskDuration: completedTasks.length > 0 ? totalDuration / completedTasks.length : 0,
      agentUsage,
    };
  }, [subagents]);

  const getRecentActivity = useCallback(
    (limit = 10): { subagent: Subagent; task: SubagentTask }[] => {
      const entries: { subagent: Subagent; task: SubagentTask }[] = [];
      for (const a of subagents) {
        for (const t of a.tasks) {
          entries.push({ subagent: a, task: t });
        }
      }
      entries.sort(
        (a, b) =>
          new Date(b.task.startedAt).getTime() - new Date(a.task.startedAt).getTime(),
      );
      return entries.slice(0, limit);
    },
    [subagents],
  );

  const getSubagentsByParent = useCallback(
    (parentId: string): Subagent[] => subagents.filter((a) => a.parentId === parentId),
    [subagents],
  );

  const value: SubagentStoreState = useMemo(
    () => ({
      subagents,
      selectedId,
      panelOpen,
      filterStatus,
      addSubagent,
      removeSubagent,
      updateSubagent,
      setSubagentStatus,
      setCurrentTask,
      addTask,
      completeTask,
      selectSubagent,
      togglePanel,
      setFilterStatus,
      getStats,
      getRecentActivity,
      getSubagentsByParent,
    }),
    [
      subagents,
      selectedId,
      panelOpen,
      filterStatus,
      addSubagent,
      removeSubagent,
      updateSubagent,
      setSubagentStatus,
      setCurrentTask,
      addTask,
      completeTask,
      selectSubagent,
      togglePanel,
      getStats,
      getRecentActivity,
      getSubagentsByParent,
    ],
  );

  return <SubagentContext.Provider value={value}>{children}</SubagentContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

function useSubagentStore(): SubagentStoreState {
  const ctx = useContext(SubagentContext);
  if (!ctx) {
    throw new Error("useSubagentStore must be used within <SubagentProvider>");
  }
  return ctx;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export type { SubagentStatus, SubagentTask, Subagent, SubagentStats };
export { SubagentProvider, useSubagentStore };
