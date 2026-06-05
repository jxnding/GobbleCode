import { create } from "zustand";

interface SettingsStore {
  hints: boolean;
  loaded: boolean;
  loadSettings: () => Promise<void>;
  setHints: (hints: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  hints: true,
  loaded: false,

  loadSettings: async () => {
    const api = window.electronAPI;
    if (api?.getConfig) {
      try {
        const config = await api.getConfig();
        if (typeof config.hints === "boolean") {
          set({ hints: config.hints, loaded: true });
          document.documentElement.toggleAttribute("data-hints", config.hints);
          return;
        }
      } catch {
        // fall through to default
      }
    }
    set({ loaded: true });
    document.documentElement.toggleAttribute("data-hints", get().hints);
  },

  setHints: async (hints) => {
    set({ hints });
    document.documentElement.toggleAttribute("data-hints", hints);
    const api = window.electronAPI;
    if (api?.updateConfig) {
      await api.updateConfig({ hints });
    }
  },
}));

declare global {
  interface Window {
    electronAPI?: {
      getConfig?: () => Promise<{ hints?: boolean }>;
      updateConfig?: (updates: { hints?: boolean }) => Promise<unknown>;
    };
  }
}
