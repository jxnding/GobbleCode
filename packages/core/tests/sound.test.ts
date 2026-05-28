import { describe, it, expect } from "vitest";
import { SoundManager } from "./manager.js";

describe("SoundManager", () => {
  it("should initialize with defaults", () => {
    const manager = new SoundManager();
    const config = manager.getConfig();

    expect(config.enabled).toBe(true);
    expect(config.volume).toBe(50);
    expect(config.effects.start).toBeDefined();
    expect(config.effects.complete).toBeDefined();
    expect(config.effects.gobble).toBeDefined();
  });

  it("should enable/disable sound", () => {
    const manager = new SoundManager();

    manager.disable();
    expect(manager.isEnabled()).toBe(false);

    manager.enable();
    expect(manager.isEnabled()).toBe(true);
  });

  it("should adjust volume", () => {
    const manager = new SoundManager();

    manager.setVolume(80);
    expect(manager.getVolume()).toBe(80);

    manager.setVolume(150);
    expect(manager.getVolume()).toBe(100);

    manager.setVolume(-10);
    expect(manager.getVolume()).toBe(0);
  });
});
