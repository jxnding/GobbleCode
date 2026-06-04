import { create } from "zustand";
import { v4 as uuid } from "uuid";

export type AgentRole = "orchestrator" | "worker" | "tester" | "searcher" | "custom";

export interface AgentModel {
  id: string;
  name: string;
  provider: string;
  maxTokens?: number;
}

export interface AgentSocket {
  id: string;
  name: string;
  type: "input" | "output";
  dataType: "task" | "result" | "context" | "error" | "search";
}

export interface AgentNodeData {
  id: string;
  role: AgentRole;
  label: string;
  description: string;
  model: AgentModel;
  systemPrompt: string;
  tools: string[];
  sockets: {
    inputs: AgentSocket[];
    outputs: AgentSocket[];
  };
  color: string;
  icon: string;
  position: { x: number; y: number };
}

export interface AgentEdge {
  id: string;
  source: string;
  sourceSocket: string;
  target: string;
  targetSocket: string;
}

export const AVAILABLE_MODELS: AgentModel[] = [
  { id: "claude-sonnet-4", name: "Claude Sonnet 4", provider: "anthropic" },
  { id: "claude-opus-4", name: "Claude Opus 4", provider: "anthropic" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
  { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash", provider: "deepseek" },
  { id: "deepseek-v4", name: "DeepSeek V4", provider: "deepseek" },
  { id: "mimo-v2.5-pro", name: "Mimo V2.5 Pro", provider: "xiaomi" },
  { id: "qwen3-235b", name: "Qwen3 235B", provider: "alibaba" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "google" },
  { id: "llama-4-maverick", name: "Llama 4 Maverick", provider: "meta" },
];

const ROLE_CONFIG: Record<AgentRole, { color: string; icon: string; defaultModel: string }> = {
  orchestrator: { color: "#8B5CF6", icon: "🎯", defaultModel: "claude-sonnet-4" },
  worker: { color: "#3B82F6", icon: "⚡", defaultModel: "deepseek-v4-flash" },
  tester: { color: "#10B981", icon: "🧪", defaultModel: "gpt-4o-mini" },
  searcher: { color: "#F59E0B", icon: "🔍", defaultModel: "gemini-2.5-pro" },
  custom: { color: "#6B7280", icon: "🤖", defaultModel: "gpt-4o" },
};

function createSockets(role: AgentRole): { inputs: AgentSocket[]; outputs: AgentSocket[] } {
  const base: { inputs: AgentSocket[]; outputs: AgentSocket[] } = {
    inputs: [],
    outputs: [],
  };

  switch (role) {
    case "orchestrator":
      return {
        inputs: [
          { id: "task-in", name: "Task", type: "input", dataType: "task" },
          { id: "context-in", name: "Context", type: "input", dataType: "context" },
        ],
        outputs: [
          { id: "task-out", name: "Task", type: "output", dataType: "task" },
          { id: "context-out", name: "Context", type: "output", dataType: "context" },
        ],
      };
    case "worker":
      return {
        inputs: [
          { id: "task-in", name: "Task", type: "input", dataType: "task" },
          { id: "context-in", name: "Context", type: "input", dataType: "context" },
          { id: "search-in", name: "Search", type: "input", dataType: "search" },
        ],
        outputs: [
          { id: "result-out", name: "Result", type: "output", dataType: "result" },
          { id: "error-out", name: "Error", type: "output", dataType: "error" },
        ],
      };
    case "tester":
      return {
        inputs: [
          { id: "result-in", name: "Result", type: "input", dataType: "result" },
          { id: "context-in", name: "Context", type: "input", dataType: "context" },
        ],
        outputs: [
          { id: "result-out", name: "Pass", type: "output", dataType: "result" },
          { id: "error-out", name: "Fail", type: "output", dataType: "error" },
        ],
      };
    case "searcher":
      return {
        inputs: [
          { id: "query-in", name: "Query", type: "input", dataType: "task" },
        ],
        outputs: [
          { id: "results-out", name: "Results", type: "output", dataType: "search" },
          { id: "context-out", name: "Context", type: "output", dataType: "context" },
        ],
      };
    default:
      return base;
  }
}

export interface AgentStore {
  nodes: AgentNodeData[];
  edges: AgentEdge[];
  selectedNode: string | null;
  realModels: AgentModel[];
  loadModels: () => Promise<void>;
  addNode: (role: AgentRole, position?: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<AgentNodeData>) => void;
  updateNodeModel: (id: string, modelId: string) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  selectNode: (id: string | null) => void;
  addEdge: (edge: Omit<AgentEdge, "id">) => void;
  removeEdge: (id: string) => void;
  getNodeById: (id: string) => AgentNodeData | undefined;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  nodes: [
    {
      id: "orchestrator-1",
      role: "orchestrator",
      label: "Orchestrator",
      description: "Coordinates the workflow between agents",
      model: AVAILABLE_MODELS.find((m) => m.id === "claude-sonnet-4")!,
      systemPrompt: "You are the orchestrator. Delegate tasks to workers and testers.",
      tools: ["read", "glob", "grep", "bash"],
      sockets: createSockets("orchestrator"),
      color: ROLE_CONFIG.orchestrator.color,
      icon: ROLE_CONFIG.orchestrator.icon,
      position: { x: 400, y: 50 },
    },
    {
      id: "worker-1",
      role: "worker",
      label: "Worker",
      description: "Implements code changes on git branches",
      model: AVAILABLE_MODELS.find((m) => m.id === "deepseek-v4-flash")!,
      systemPrompt: "You are the worker. Create a branch, implement changes, commit.",
      tools: ["write", "edit", "bash", "git"],
      sockets: createSockets("worker"),
      color: ROLE_CONFIG.worker.color,
      icon: ROLE_CONFIG.worker.icon,
      position: { x: 150, y: 300 },
    },
    {
      id: "tester-1",
      role: "tester",
      label: "Tester",
      description: "Runs tests and validates changes",
      model: AVAILABLE_MODELS.find((m) => m.id === "gpt-4o-mini")!,
      systemPrompt: "You are the tester. Run tests, verify changes pass.",
      tools: ["bash", "read", "glob", "grep"],
      sockets: createSockets("tester"),
      color: ROLE_CONFIG.tester.color,
      icon: ROLE_CONFIG.tester.icon,
      position: { x: 650, y: 300 },
    },
  ],
  edges: [
    {
      id: "edge-1",
      source: "orchestrator-1",
      sourceSocket: "task-out",
      target: "worker-1",
      targetSocket: "task-in",
    },
    {
      id: "edge-2",
      source: "orchestrator-1",
      sourceSocket: "context-out",
      target: "worker-1",
      targetSocket: "context-in",
    },
    {
      id: "edge-3",
      source: "worker-1",
      sourceSocket: "result-out",
      target: "tester-1",
      targetSocket: "result-in",
    },
    {
      id: "edge-4",
      source: "orchestrator-1",
      sourceSocket: "context-out",
      target: "tester-1",
      targetSocket: "context-in",
    },
    {
      id: "edge-5",
      source: "tester-1",
      sourceSocket: "error-out",
      target: "orchestrator-1",
      targetSocket: "context-in",
    },
  ],
  selectedNode: null,
  realModels: [],

  loadModels: async () => {
    const api = (window as unknown as { electronAPI?: { getModels?: () => Promise<AgentModel[]> } })
      .electronAPI;
    if (!api?.getModels) return;
    try {
      const models = await api.getModels();
      if (Array.isArray(models)) set({ realModels: models });
    } catch {
      // ignore — fall back to no configured models
    }
  },

  addNode: (role, position) => {
    const config = ROLE_CONFIG[role];
    const id = `${role}-${Date.now()}`;
    const newNode: AgentNodeData = {
      id,
      role,
      label: role.charAt(0).toUpperCase() + role.slice(1),
      description: "",
      model: AVAILABLE_MODELS.find((m) => m.id === config.defaultModel)!,
      systemPrompt: "",
      tools: [],
      sockets: createSockets(role),
      color: config.color,
      icon: config.icon,
      position: position || { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  removeNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNode: state.selectedNode === id ? null : state.selectedNode,
    }));
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  },

  updateNodeModel: (id, modelId) => {
    const model = [...get().realModels, ...AVAILABLE_MODELS].find((m) => m.id === modelId);
    if (model) {
      set((state) => ({
        nodes: state.nodes.map((n) => (n.id === id ? { ...n, model } : n)),
      }));
    }
  },

  updateNodePosition: (id, position) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
    }));
  },

  selectNode: (id) => set({ selectedNode: id }),

  addEdge: (edge) => {
    const id = `edge-${Date.now()}`;
    set((state) => ({ edges: [...state.edges, { ...edge, id }] }));
  },

  removeEdge: (id) => {
    set((state) => ({ edges: state.edges.filter((e) => e.id !== id) }));
  },

  getNodeById: (id) => get().nodes.find((n) => n.id === id),
}));
