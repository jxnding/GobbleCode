import { v4 as uuid } from "uuid";
import type { Agent, CreateAgent, AgentGraph } from "./types.js";

export class AgentManager {
  private agents: Map<string, Agent> = new Map();

  constructor() {
    this.loadDefaults();
  }

  private loadDefaults(): void {
    const buildAgent: Agent = {
      id: "build",
      name: "Build",
      description: "Full-access agent for development work",
      mode: "build",
      systemPrompt: `You are GobbleCode's build agent. You have full access to make changes.
Always create a new git branch first. Follow AGENTS.md rules strictly.
After changes: commit with clear message, then report results.`,
      tools: [
        { name: "write", enabled: true },
        { name: "edit", enabled: true },
        { name: "bash", enabled: true },
        { name: "git", enabled: true },
        { name: "search", enabled: true },
        { name: "browser", enabled: true },
      ],
      subagents: ["worker", "tester", "reviewer"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const planAgent: Agent = {
      id: "plan",
      name: "Plan",
      description: "Read-only agent for analysis and exploration",
      mode: "plan",
      systemPrompt: `You are GobbleCode's planning agent. You are read-only.
Analyze code, plan changes, but never modify files directly.
Ask permission before running bash commands.`,
      tools: [
        { name: "read", enabled: true },
        { name: "glob", enabled: true },
        { name: "grep", enabled: true },
        { name: "bash", enabled: false },
        { name: "write", enabled: false },
        { name: "edit", enabled: false },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.agents.set(buildAgent.id, buildAgent);
    this.agents.set(planAgent.id, planAgent);
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  listAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  createAgent(data: CreateAgent): Agent {
    const agent: Agent = {
      ...data,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.agents.set(agent.id, agent);
    return agent;
  }

  updateAgent(id: string, updates: Partial<Agent>): Agent | undefined {
    const existing = this.agents.get(id);
    if (!existing) return undefined;

    const updated: Agent = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.agents.set(id, updated);
    return updated;
  }

  deleteAgent(id: string): boolean {
    return this.agents.delete(id);
  }

  getAgentGraph(id: string): AgentGraph | undefined {
    return this.agents.get(id)?.graph;
  }

  updateAgentGraph(id: string, graph: AgentGraph): Agent | undefined {
    return this.updateAgent(id, { graph });
  }
}
