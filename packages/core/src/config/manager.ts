import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import type { GobbleCodeConfig } from "./types.js";
import { DEFAULT_CONFIG } from "./types.js";

const CONFIG_DIR = join(homedir(), ".config", "gobblecode");
const CONFIG_FILE = "gobblecode.json";

export class ConfigManager {
  private config: GobbleCodeConfig = DEFAULT_CONFIG;
  private configPath: string;

  constructor() {
    this.configPath = join(CONFIG_DIR, CONFIG_FILE);
  }

  async load(): Promise<GobbleCodeConfig> {
    try {
      const data = await readFile(this.configPath, "utf-8");
      this.config = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch {
      await this.save();
    }
    return this.config;
  }

  async save(): Promise<void> {
    await mkdir(CONFIG_DIR, { recursive: true });
    await writeFile(this.configPath, JSON.stringify(this.config, null, 2));
  }

  get(): GobbleCodeConfig {
    return this.config;
  }

  async update(updates: Partial<GobbleCodeConfig>): Promise<GobbleCodeConfig> {
    this.config = { ...this.config, ...updates };
    await this.save();
    return this.config;
  }

  async updateTheme(theme: Partial<GobbleCodeConfig["theme"]>): Promise<void> {
    this.config.theme = { ...this.config.theme, ...theme };
    await this.save();
  }

  async updateSound(sound: Partial<GobbleCodeConfig["sound"]>): Promise<void> {
    this.config.sound = { ...this.config.sound, ...sound };
    await this.save();
  }

  async updateSync(sync: Partial<GobbleCodeConfig["sync"]>): Promise<void> {
    this.config.sync = { ...this.config.sync, ...sync };
    await this.save();
  }

  async updateBrowser(browser: Partial<GobbleCodeConfig["browser"]>): Promise<void> {
    this.config.browser = { ...this.config.browser, ...browser };
    await this.save();
  }

  async updateSemantic(semantic: Partial<GobbleCodeConfig["semantic"]>): Promise<void> {
    this.config.semantic = { ...this.config.semantic, ...semantic } as any;
    await this.save();
  }

  getConfigPath(): string {
    return this.configPath;
  }

  getConfigDir(): string {
    return CONFIG_DIR;
  }
}
