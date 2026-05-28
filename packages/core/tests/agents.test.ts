import { describe, it, expect } from "vitest";
import { AgentManager } from "./manager.js";

describe("AgentManager", () => {
  it("should load default agents", () => {
    const manager = new AgentManager();
    const agents = manager.listAgents();

    expect(agents).toHaveLength(2);
    expect(agents[0].id).toBe("build");
    expect(agents[1].id).toBe("plan");
  });

  it("should get agent by id", () => {
    const manager = new AgentManager();
    const agent = manager.getAgent("build");

    expect(agent).toBeDefined();
    expect(agent?.name).toBe("Build");
    expect(agent?.mode).toBe("build");
  });

  it("should create new agent", () => {
    const manager = new AgentManager();
    const agent = manager.createAgent({
      name: "Test Agent",
      description: "A test agent",
      mode: "custom",
      systemPrompt: "You are a test agent",
      tools: [],
    });

    expect(agent.id).toBeDefined();
    expect(agent.name).toBe("Test Agent");
    expect(manager.listAgents()).toHaveLength(3);
  });

  it("should update agent", () => {
    const manager = new AgentManager();
    const updated = manager.updateAgent("build", {
      name: "Updated Build",
    });

    expect(updated).toBeDefined();
    expect(updated?.name).toBe("Updated Build");
  });

  it("should delete agent", () => {
    const manager = new AgentManager();
    const result = manager.deleteAgent("build");

    expect(result).toBe(true);
    expect(manager.listAgents()).toHaveLength(1);
  });
});
