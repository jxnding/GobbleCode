import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import type { CatalogProvider, CatalogRecord } from "./types.js";

const MODELS_URL = "https://models.dev/api.json";
const CACHE_DIR = join(homedir(), ".cache", "gobblecode");
const CACHE_FILE = join(CACHE_DIR, "models.json");
const CACHE_TTL_MS = 5 * 60 * 1000;

export class ModelsCatalog {
  private memory: CatalogRecord | null = null;

  async get(force = false): Promise<CatalogRecord> {
    if (!force && this.memory) return this.memory;

    const cached = await this.readCache();
    if (cached && !force) {
      this.memory = cached;
      return cached;
    }

    const fetched = await this.fetchRemote();
    this.memory = fetched;
    return fetched;
  }

  private async readCache(): Promise<CatalogRecord | null> {
    try {
      const fileStat = await stat(CACHE_FILE);
      if (Date.now() - fileStat.mtimeMs > CACHE_TTL_MS) return null;
      const raw = await readFile(CACHE_FILE, "utf-8");
      return JSON.parse(raw) as CatalogRecord;
    } catch {
      return null;
    }
  }

  private async fetchRemote(): Promise<CatalogRecord> {
    try {
      const response = await fetch(MODELS_URL, {
        headers: { "User-Agent": "gobblecode/0.1.0" },
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(CACHE_FILE, text);
      return JSON.parse(text) as CatalogRecord;
    } catch {
      try {
        const raw = await readFile(CACHE_FILE, "utf-8");
        return JSON.parse(raw) as CatalogRecord;
      } catch {
        return {};
      }
    }
  }
}

export function normalizeCatalogProvider(id: string, raw: Partial<CatalogProvider>): CatalogProvider | null {
  if (!raw.name || !raw.models) return null;
  return {
    id: raw.id ?? id,
    name: raw.name,
    env: raw.env ?? [],
    npm: raw.npm,
    api: raw.api,
    models: raw.models,
  };
}
