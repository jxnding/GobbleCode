import { describe, it, expect } from "vitest";
import { SearchManager } from "./manager.js";

describe("SearchManager", () => {
  it("should load default providers", () => {
    const manager = new SearchManager();
    const providers = manager.listProviders();

    expect(providers).toHaveLength(5);
    expect(providers.map((p) => p.id)).toContain("google");
    expect(providers.map((p) => p.id)).toContain("duckduckgo");
  });

  it("should get provider by id", () => {
    const manager = new SearchManager();
    const provider = manager.getProvider("google");

    expect(provider).toBeDefined();
    expect(provider?.name).toBe("Google");
  });

  it("should generate browser search URLs", async () => {
    const manager = new SearchManager();
    const results = await manager.searchWithBrowser("test query");

    expect(results).toHaveLength(5);
    expect(results[0].url).toContain("test%20query");
  });
});
