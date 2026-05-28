import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { createHash } from "node:crypto";
import type { SyncItem, SyncState, SyncResponse } from "./types.js";

const SYNC_DIR = join(homedir(), ".config", "gobblecode", "sync");
const SYNC_STATE_FILE = "sync-state.json";

export class SyncManager {
  private state: SyncState = {
    pendingChanges: [],
    conflictResolution: "merge",
  };
  private serverUrl: string = "";
  private apiKey: string = "";

  constructor() {}

  async initialize(serverUrl: string, apiKey: string): Promise<void> {
    this.serverUrl = serverUrl;
    this.apiKey = apiKey;

    try {
      await mkdir(SYNC_DIR, { recursive: true });
      const statePath = join(SYNC_DIR, SYNC_STATE_FILE);
      const data = await readFile(statePath, "utf-8");
      this.state = JSON.parse(data);
    } catch {
      await this.saveState();
    }
  }

  private async saveState(): Promise<void> {
    const statePath = join(SYNC_DIR, SYNC_STATE_FILE);
    await writeFile(statePath, JSON.stringify(this.state, null, 2));
  }

  private calculateChecksum(data: unknown): string {
    const hash = createHash("sha256");
    hash.update(JSON.stringify(data));
    return hash.digest("hex");
  }

  async queueChange(type: SyncItem["type"], id: string, data: unknown): Promise<void> {
    const item: SyncItem = {
      id,
      type,
      data,
      version: Date.now(),
      lastModified: new Date().toISOString(),
      checksum: this.calculateChecksum(data),
    };

    this.state.pendingChanges.push(item);
    await this.saveState();
  }

  async sync(): Promise<SyncResponse> {
    if (!this.serverUrl || !this.apiKey) {
      throw new Error("Sync not configured");
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          changes: this.state.pendingChanges,
          lastSync: this.state.lastSync,
        }),
      });

      const result: SyncResponse = await response.json();

      if (result.success) {
        this.state.lastSync = new Date().toISOString();
        this.state.pendingChanges = [];
        await this.saveState();
      }

      return result;
    } catch (error) {
      console.error("Sync failed:", error);
      throw error;
    }
  }

  async pullRemote(): Promise<SyncItem[]> {
    if (!this.serverUrl || !this.apiKey) {
      throw new Error("Sync not configured");
    }

    try {
      const response = await fetch(`${this.serverUrl}/api/sync/pull`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      const result = await response.json();
      return result.items || [];
    } catch (error) {
      console.error("Pull failed:", error);
      throw error;
    }
  }

  getPendingChanges(): SyncItem[] {
    return [...this.state.pendingChanges];
  }

  getLastSync(): string | undefined {
    return this.state.lastSync;
  }

  async clearPending(): Promise<void> {
    this.state.pendingChanges = [];
    await this.saveState();
  }

  isConfigured(): boolean {
    return Boolean(this.serverUrl && this.apiKey);
  }
}
