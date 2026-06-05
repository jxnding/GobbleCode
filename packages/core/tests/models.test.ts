import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfigManager } from "../src/config/manager.js";
import { ModelManager } from "../src/models/manager.js";
import type { CatalogRecord } from "../src/models/types.js";

const FIXTURE_CATALOG: CatalogRecord = {
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    env: ["ANTHROPIC_API_KEY"],
    npm: "@ai-sdk/anthropic",
    models: {
      "claude-sonnet-4-20250514": {
        id: "claude-sonnet-4-20250514",
        name: "Claude Sonnet 4",
        limit: { context: 200000, output: 8192 },
      },
      "claude-opus-4-20250514": {
        id: "claude-opus-4-20250514",
        name: "Claude Opus 4",
        limit: { context: 200000, output: 8192 },
        status: "deprecated",
      },
    },
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    env: ["OPENAI_API_KEY"],
    npm: "@ai-sdk/openai",
    api: "https://api.openai.com/v1",
    models: {
      "gpt-4o": {
        id: "gpt-4o",
        name: "GPT-4o",
        limit: { context: 128000, output: 16384 },
      },
    },
  },
};

describe("ModelManager", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    const configManager = new ConfigManager();
    await configManager.load();
    await configManager.update({ providers: {} });
  });

  it("lists models from catalog and marks connected providers via env", async () => {
    const configManager = new ConfigManager();
    await configManager.load();

    const catalog = {
      get: vi.fn().mockResolvedValue(FIXTURE_CATALOG),
    };
    const manager = new ModelManager(configManager, catalog as never);

    const result = await manager.list({ ANTHROPIC_API_KEY: "sk-test" });

    expect(result.connected).toEqual(["anthropic"]);
    expect(result.providers).toHaveLength(2);
    expect(result.models.map((m) => m.id)).toEqual([
      "anthropic/claude-sonnet-4-20250514",
      "openai/gpt-4o",
    ]);
    expect(result.models.find((m) => m.id === "anthropic/claude-sonnet-4-20250514")?.connected).toBe(
      true,
    );
    expect(result.models.find((m) => m.id === "openai/gpt-4o")?.connected).toBe(false);
  });

  it("excludes deprecated models", async () => {
    const configManager = new ConfigManager();
    await configManager.load();
    const catalog = { get: vi.fn().mockResolvedValue(FIXTURE_CATALOG) };
    const manager = new ModelManager(configManager, catalog as never);

    const models = await manager.listModels({});
    expect(models.some((m) => m.modelId === "claude-opus-4-20250514")).toBe(false);
  });

  it("persists provider api keys to config", async () => {
    const configManager = new ConfigManager();
    await configManager.load();
    const catalog = { get: vi.fn().mockResolvedValue(FIXTURE_CATALOG) };
    const manager = new ModelManager(configManager, catalog as never);

    await manager.updateProvider("openai", { apiKey: "sk-openai" });

    const config = configManager.get();
    expect(config.providers.openai?.options.apiKey).toBe("sk-openai");
    expect(config.providers.openai?.name).toBe("OpenAI");

    const result = await manager.list({});
    expect(result.connected).toContain("openai");
    expect(result.providers.find((p) => p.id === "openai")?.baseURL).toBe(
      "https://api.openai.com/v1",
    );
  });

  it("persists custom baseURL and returns it in provider list", async () => {
    const configManager = new ConfigManager();
    await configManager.load();
    const catalog = { get: vi.fn().mockResolvedValue(FIXTURE_CATALOG) };
    const manager = new ModelManager(configManager, catalog as never);

    await manager.updateProvider("openai", {
      apiKey: "sk-openai",
      baseURL: "https://proxy.example.com/v1",
    });

    const result = await manager.list({});
    const openai = result.providers.find((p) => p.id === "openai");
    expect(openai?.baseURL).toBe("https://proxy.example.com/v1");
    expect(openai?.catalogEndpoint).toBe("https://api.openai.com/v1");
  });
});
