import { describe, it, expect } from "vitest";
import { ConfigManager } from "./manager.js";

describe("ConfigManager", () => {
  it("should load default config", async () => {
    const manager = new ConfigManager();
    const config = await manager.load();

    expect(config.version).toBe("0.1.0");
    expect(config.theme.mode).toBe("dark");
    expect(config.theme.accentColor).toBe("#FF6B35");
  });

  it("should update theme", async () => {
    const manager = new ConfigManager();
    await manager.load();
    await manager.updateTheme({ mode: "light" });

    const config = manager.get();
    expect(config.theme.mode).toBe("light");
  });

  it("should update sound settings", async () => {
    const manager = new ConfigManager();
    await manager.load();
    await manager.updateSound({ volume: 80 });

    const config = manager.get();
    expect(config.sound.volume).toBe(80);
  });
});
