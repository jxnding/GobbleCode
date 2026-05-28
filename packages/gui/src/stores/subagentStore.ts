import { create } from "zustand";

export type SubagentStatus = "idle" | "running" | "completed" | "error" | "cancelled";

export interface SubagentTask {
  id: string;
  description: string;
  startedAt: string;
  completedAt?: string;
  status: SubagentStatus;
  output?: string;
  tokensUsed: number;
  cost: number;
}

export interface Subagent {
  id: string;
  name: string;
  role: string;
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

export interface SubagentStats {
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

export interface SubagentStore {
  subagents: Subagent[];
  selectedSubagent: string | null;
  isPanelOpen: boolean;
  filterStatus: SubagentStatus | "all";

  // Actions
  addSubagent: (subagent: Omit<Subagent, "tasks" | "totalTokens" | "totalCost" | "createdAt" | "lastActiveAt">) => void;
  removeSubagent: (id: string) => void;
  updateSubagent: (id: string, updates: Partial<Subagent>) => void;
  setSubagentStatus: (id: string, status: SubagentStatus) => void;
  setCurrentTask: (id: string, task: string | undefined) => void;
  addTask: (subagentId: string, task: Omit<SubagentTask, "id" | "startedAt" | "tokensUsed" | "cost">) => void;
  completeTask: (subagentId: string, taskId: string, output: string, tokens: number, cost: number) => void;
  selectSubagent: (id: string | null) => void;
  togglePanel: () => void;
  setFilterStatus: (status: SubagentStatus | "all") => void;
  getStats: () => SubagentStats;
  getRecentActivity: (limit?: number) => { subagent: Subagent; task: SubagentTask }[];
  getSubagentsByParent: (parentId: string) => Subagent[];
}

export const useSubagentStore = create<SubagentStore>((set, get) => ({
  subagents: [
    // Demo data
    {
      id: "orchestrator-1",
      name: "Orchestrator",
      role: "orchestrator",
      model: "Claude Sonnet 4",
      status: "idle",
      tasks: [
        {
          id: "task-1",
          description: "Coordinate feature implementation",
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          completedAt: new Date(Date.now() - 3000000).toISOString(),
          status: "completed",
          tokensUsed: 1250,
          cost: 0.003,
        },
      ],
      totalTokens: 4500,
      totalCost: 0.012,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lastActiveAt: new Date(Date.now() - 3000000).toISOString(),
    },
    {
      id: "worker-1",
      name: "Worker",
      role: "worker",
      model: "DeepSeek V4 Flash",
      status: "running",
      parentId: "orchestrator-1",
      currentTask: "Implementing user authentication",
      tasks: [
        {
          id: "task-2",
          description: "Create auth middleware",
          startedAt: new Date(Date.now() - 7200000).toISOString(),
          completedAt: new Date(Date.now() - 6000000).toISOString(),
          status: "completed",
          tokensUsed: 2100,
          cost: 0.001,
        },
        {
          id: "task-3",
          description: "Implementing user authentication",
          startedAt: new Date(Date.now() - 1800000).toISOString(),
          status: "running",
          tokensUsed: 890,
          cost: 0.0005,
        },
      ],
      totalTokens: 8900,
      totalCost: 0.005,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lastActiveAt: new Date().toISOString(),
    },
    {
      id: "tester-1",
      name: "Tester",
      role: "tester",
      model: "GPT-4o Mini",
      status: "idle",
      parentId: "orchestrator-1",
      tasks: [
        {
          id: "task-4",
          description: "Run auth test suite",
          startedAt: new Date(Date.now() - 5400000).toISOString(),
          completedAt: new Date(Date.now() - 4800000).toISOString(),
          status: "completed",
          output: "All 24 tests passed",
          tokensUsed: 450,
          cost: 0.0002,
        },
      ],
      totalTokens: 2400,
      totalCost: 0.001,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lastActiveAt: new Date(Date.now() - 4800000).toISOString(),
    },
    {
      id: "worker-2",
      name: "Worker (Search)",
      role: "worker",
      model: "Gemini 2.5 Pro",
      status: "completed",
      parentId: "orchestrator-1",
      tasks: [
        {
          id: "task-5",
          description: "Search for OAuth2 best practices",
          startedAt: new Date(Date.now() - 9000000).toISOString(),
          completedAt: new Date(Date.now() - 8400000).toISOString(),
          status: "completed",
          output: "Found 5 relevant resources",
          tokensUsed: 3200,
          cost: 0.002,
        },
      ],
      totalTokens: 3200,
      totalCost: 0.002,
      createdAt: new Date(Date.now() - 9000000).toISOString(),
      lastActiveAt: new Date(Date.now() - 8400000).toISOString(),
    },
  ],
  selectedSubagent: null,
  isPanelOpen: true,
  filterStatus: "all",

  addSubagent: (subagent) => {
    const now = new Date().toISOString();
    set((state) => ({
      subagents: [
        ...state.subagents,
        {
          ...subagent,
          tasks: [],
          totalTokens: 0,
          totalCost: 0,
          createdAt: now,
          lastActiveAt: now,
        },
      ],
    }));
  },

  removeSubagent: (id) => {
    set((state) => ({
      subagents: state.subagents.filter((s) => s.id !== id),
      selectedSubagent: state.selectedSubagent === id ? null : state.selectedSubagent,
    }));
  },

  updateSubagent: (id, updates) => {
    set((state) => ({
      subagents: state.subagents.map((s) =>
        s.id === id ? { ...s, ...updates, lastActiveAt: new Date().toISOString() } : s
      ),
    }));
  },

  setSubagentStatus: (id, status) => {
    set((state) => ({
      subagents: state.subagents.map((s) =>
        s.id === id ? { ...s, status, lastActiveAt: new Date().toISOString() } : s
      ),
    }));
  },

  setCurrentTask: (id, task) => {
    set((state) => ({
      subagents: state.subagents.map((s) =>
        s.id === id ? { ...s, currentTask: task, lastActiveAt: new Date().toISOString() } : s
      ),
    }));
  },

  addTask: (subagentId, task) => {
    const taskId = `task-${Date.now()}`;
    set((state) => ({
      subagents: state.subagents.map((s) =>
        s.id === subagentId
          ? {
              ...s,
              status: "running",
              currentTask: task.description,
              tasks: [
                ...s.tasks,
                {
                  ...task,
                  id: taskId,
                  startedAt: new Date().toISOString(),
                  tokensUsed: 0,
                  cost: 0,
                },
              ],
              lastActiveAt: new Date().toISOString(),
            }
          : s
      ),
    }));
  },

  completeTask: (subagentId, taskId, output, tokens, cost) => {
    set((state) => ({
      subagents: state.subagents.map((s) =>
        s.id === subagentId
          ? {
              ...s,
              status: "idle",
              currentTask: undefined,
              totalTokens: s.totalTokens + tokens,
              totalCost: s.totalCost + cost,
              tasks: s.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      status: "completed",
                      completedAt: new Date().toISOString(),
                      output,
                      tokensUsed: tokens,
                      cost,
                    }
                  : t
              ),
              lastActiveAt: new Date().toISOString(),
            }
          : s
      ),
    }));
  },

  selectSubagent: (id) => set({ selectedSubagent: id }),

  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),

  setFilterStatus: (status) => set({ filterStatus: status }),

  getStats: () => {
    const { subagents } = get();
    const allTasks = subagents.flatMap((s) => s.tasks);
    const completedTasks = allTasks.filter((t) => t.status === "completed");
    const failedTasks = allTasks.filter((t) => t.status === "error");

    const durations = completedTasks
      .filter((t) => t.completedAt)
      .map((t) => new Date(t.completedAt!).getTime() - new Date(t.startedAt).getTime());

    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    const agentUsage: Record<string, { tasks: number; tokens: number; cost: number }> = {};
    for (const s of subagents) {
      agentUsage[s.name] = {
        tasks: s.tasks.length,
        tokens: s.totalTokens,
        cost: s.totalCost,
      };
    }

    return {
      totalAgents: subagents.length,
      activeAgents: subagents.filter((s) => s.status === "running").length,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      failedTasks: failedTasks.length,
      totalTokens: subagents.reduce((acc, s) => acc + s.totalTokens, 0),
      totalCost: subagents.reduce((acc, s) => acc + s.totalCost, 0),
      avgTaskDuration: avgDuration,
      agentUsage,
    };
  },

  getRecentActivity: (limit = 10) => {
    const { subagents } = get();
    const activities: { subagent: Subagent; task: SubagentTask }[] = [];

    for (const subagent of subagents) {
      for (const task of subagent.tasks) {
        activities.push({ subagent, task });
      }
    }

    return activities
      .sort((a, b) => new Date(b.task.startedAt).getTime() - new Date(a.task.startedAt).getTime())
      .slice(0, limit);
  },

  getSubagentsByParent: (parentId) => {
    return get().subagents.filter((s) => s.parentId === parentId);
  },
}));
