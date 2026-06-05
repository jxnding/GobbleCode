import { create } from "zustand";

export type AgentRole = "orchestrator" | "worker" | "tester" | "searcher" | "custom";

export interface AgentModel {
  id: string;
  modelId: string;
  providerId: string;
  name: string;
  provider: string;
  connected: boolean;
  maxTokens?: number;
  contextWindow?: number;
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

export interface ProviderSummary {
  id: string;
  name: string;
  env: string[];
  npm?: string;
  connected: boolean;
  modelCount: number;
  catalogEndpoint?: string;
  baseURL?: string;
  hasStoredKey: boolean;
  connectedViaEnv: boolean;
}

interface ProviderListPayload {
  providers: ProviderSummary[];
  models: AgentModel[];
  connected: string[];
  defaultModel: string | null;
}

const PLACEHOLDER_MODEL: AgentModel = {
  id: "unconfigured",
  modelId: "",
  providerId: "",
  name: "Loading models…",
  provider: "",
  connected: false,
};

const ROLE_CONFIG: Record<AgentRole, { color: string; icon: string; preferredProviders: string[] }> = {
  orchestrator: { color: "#8B5CF6", icon: "🎯", preferredProviders: ["anthropic", "openai"] },
  worker: { color: "#3B82F6", icon: "⚡", preferredProviders: ["deepseek", "anthropic", "openai"] },
  tester: { color: "#10B981", icon: "🧪", preferredProviders: ["openai", "anthropic"] },
  searcher: { color: "#F59E0B", icon: "🔍", preferredProviders: ["google", "openai"] },
  custom: { color: "#6B7280", icon: "🤖", preferredProviders: ["openai"] },
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
        inputs: [{ id: "query-in", name: "Query", type: "input", dataType: "task" }],
        outputs: [
          { id: "results-out", name: "Results", type: "output", dataType: "search" },
          { id: "context-out", name: "Context", type: "output", dataType: "context" },
        ],
      };
    default:
      return base;
  }
}

function pickDefaultModel(role: AgentRole, models: AgentModel[]): AgentModel {
  const config = ROLE_CONFIG[role];
  for (const providerId of config.preferredProviders) {
    const match = models.find((m) => m.providerId === providerId);
    if (match) return match;
  }
  return models[0] ?? PLACEHOLDER_MODEL;
}

interface ElectronAPI {
  getModels?: () => Promise<AgentModel[]>;
  listProviders?: () => Promise<ProviderListPayload>;
  updateProvider?: (
    providerId: string,
    credentials: { apiKey?: string; baseURL?: string },
  ) => Promise<ProviderListPayload>;
  setProviderApiKey?: (providerId: string, apiKey: string) => Promise<ProviderListPayload>;
}

function getElectronAPI(): ElectronAPI | undefined {
  return (window as unknown as { electronAPI?: ElectronAPI }).electronAPI;
}

export interface AgentStore {
  nodes: AgentNodeData[];
  edges: AgentEdge[];
  selectedNode: string | null;
  models: AgentModel[];
  providers: ProviderSummary[];
  connectedProviders: string[];
  defaultModelId: string | null;
  modelsLoaded: boolean;
  loadModels: () => Promise<void>;
  updateProvider: (
    providerId: string,
    credentials: { apiKey?: string; baseURL?: string },
  ) => Promise<void>;
  /** @deprecated Use updateProvider */
  setProviderApiKey: (providerId: string, apiKey: string) => Promise<void>;
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

function createDefaultNode(
  id: string,
  role: AgentRole,
  label: string,
  description: string,
  systemPrompt: string,
  tools: string[],
  position: { x: number; y: number },
  model: AgentModel = PLACEHOLDER_MODEL,
): AgentNodeData {
  const config = ROLE_CONFIG[role];
  return {
    id,
    role,
    label,
    description,
    model,
    systemPrompt,
    tools,
    sockets: createSockets(role),
    color: config.color,
    icon: config.icon,
    position,
  };
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  nodes: [
    createDefaultNode(
      "orchestrator-1",
      "orchestrator",
      "Orchestrator",
      "Coordinates the workflow between agents",
      "You are the orchestrator. Delegate tasks to workers and testers.",
      ["read", "glob", "grep", "bash"],
      { x: 400, y: 50 },
    ),
    createDefaultNode(
      "worker-1",
      "worker",
      "Worker",
      "Implements code changes on git branches",
      "You are the worker. Create a branch, implement changes, commit.",
      ["write", "edit", "bash", "git"],
      { x: 150, y: 300 },
    ),
    createDefaultNode(
      "tester-1",
      "tester",
      "Tester",
      "Runs tests and validates changes",
      "You are the tester. Run tests, verify changes pass.",
      ["bash", "read", "glob", "grep"],
      { x: 650, y: 300 },
    ),
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
  models: [],
  providers: [],
  connectedProviders: [],
  defaultModelId: null,
  modelsLoaded: false,

  loadModels: async () => {
    const api = getElectronAPI();
    if (!api?.listProviders) {
      if (api?.getModels) {
        try {
          const models = await api.getModels();
          if (Array.isArray(models)) {
            set({ models, modelsLoaded: true });
          }
        } catch {
          // ignore
        }
      }
      return;
    }

    try {
      const result = await api.listProviders();
      if (!result) return;

      set({
        models: result.models,
        providers: result.providers,
        connectedProviders: result.connected,
        defaultModelId: result.defaultModel,
        modelsLoaded: true,
      });

      set((state) => ({
        nodes: state.nodes.map((node) => {
          if (node.model.id !== "unconfigured") return node;
          return { ...node, model: pickDefaultModel(node.role, result.models) };
        }),
      }));
    } catch {
      // ignore
    }
  },

  setProviderApiKey: async (providerId, apiKey) => {
    await get().updateProvider(providerId, { apiKey });
  },

  updateProvider: async (providerId, credentials) => {
    const api = getElectronAPI();
    if (!api?.updateProvider && !api?.setProviderApiKey) return;

    const result = api.updateProvider
      ? await api.updateProvider(providerId, credentials)
      : await api.setProviderApiKey!(providerId, credentials.apiKey ?? "");

    set({
      providers: result.providers,
      models: result.models,
      connectedProviders: result.connected,
      defaultModelId: result.defaultModel,
    });
  },

  addNode: (role, position) => {
    const models = get().models;
    const id = `${role}-${Date.now()}`;
    const newNode = createDefaultNode(
      id,
      role,
      role.charAt(0).toUpperCase() + role.slice(1),
      "",
      "",
      [],
      position || { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
      pickDefaultModel(role, models),
    );
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
    const model = get().models.find((m) => m.id === modelId);
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
    const edgeId = `edge-${Date.now()}`;
    set((state) => ({ edges: [...state.edges, { ...edge, id: edgeId }] }));
  },

  removeEdge: (id) => {
    set((state) => ({ edges: state.edges.filter((e) => e.id !== id) }));
  },

  getNodeById: (id) => get().nodes.find((n) => n.id === id),
}));
