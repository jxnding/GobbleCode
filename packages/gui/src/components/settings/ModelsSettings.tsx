import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, Key, Check, AlertCircle, Search, Pencil, Globe, X } from "lucide-react";
import { useAgentStore, type ProviderSummary } from "../../stores/agentStore.js";
import { hintClass } from "../../lib/hintClass.js";

interface ProviderDraft {
  baseURL: string;
  apiKey: string;
}

function effectiveEndpoint(provider: ProviderSummary): string | undefined {
  return provider.baseURL ?? provider.catalogEndpoint;
}

function canSave(provider: ProviderSummary, draft: ProviderDraft): boolean {
  const hasKey = draft.apiKey.trim().length > 0;
  const hasEndpointChange =
    draft.baseURL.trim() !== (effectiveEndpoint(provider) ?? "").trim();
  if (provider.connectedViaEnv || provider.hasStoredKey) {
    return hasKey || hasEndpointChange;
  }
  return hasKey;
}

export function ModelsSettings() {
  const providers = useAgentStore((s) => s.providers);
  const connectedProviders = useAgentStore((s) => s.connectedProviders);
  const modelsLoaded = useAgentStore((s) => s.modelsLoaded);
  const loadModels = useAgentStore((s) => s.loadModels);
  const updateProvider = useAgentStore((s) => s.updateProvider);
  const [filter, setFilter] = useState("");
  const [drafts, setDrafts] = useState<Record<string, ProviderDraft>>({});
  const [editing, setEditing] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  const filtered = providers.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.id.toLowerCase().includes(filter.toLowerCase()),
  );

  const getDraft = (provider: ProviderSummary): ProviderDraft =>
    drafts[provider.id] ?? {
      baseURL: effectiveEndpoint(provider) ?? "",
      apiKey: "",
    };

  const setDraft = (provider: ProviderSummary, patch: Partial<ProviderDraft>) => {
    setDrafts((prev) => {
      const current = prev[provider.id] ?? {
        baseURL: effectiveEndpoint(provider) ?? "",
        apiKey: "",
      };
      return { ...prev, [provider.id]: { ...current, ...patch } };
    });
  };

  const startEditing = (provider: ProviderSummary) => {
    setDrafts((prev) => ({
      ...prev,
      [provider.id]: {
        baseURL: effectiveEndpoint(provider) ?? "",
        apiKey: "",
      },
    }));
    setEditing((prev) => new Set(prev).add(provider.id));
  };

  const stopEditing = (providerId: string) => {
    setEditing((prev) => {
      const next = new Set(prev);
      next.delete(providerId);
      return next;
    });
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[providerId];
      return next;
    });
  };

  const handleSave = async (provider: ProviderSummary) => {
    const draft = getDraft(provider);
    if (!canSave(provider, draft)) return;

    setSaving(provider.id);
    try {
      await updateProvider(provider.id, {
        apiKey: draft.apiKey.trim() || undefined,
        baseURL: draft.baseURL.trim(),
      });
      stopEditing(provider.id);
    } finally {
      setSaving(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${hintClass("models-settings", "root")} max-w-2xl`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Cpu className="w-5 h-5 text-[var(--accent)]" />
        <h2 className="text-base font-semibold">Models & Providers</h2>
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-4">
        Provider catalog from{" "}
        <a
          href="https://models.dev"
          className="text-[var(--accent)] hover:underline"
          onClick={(e) => {
            e.preventDefault();
            window.electronAPI?.openExternal("https://models.dev");
          }}
        >
          models.dev
        </a>
        . Set an API key or export the env var to enable a provider.
      </p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search providers…"
          className={`${hintClass("models-settings", "search")} w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent)]`}
        />
      </div>

      {!modelsLoaded && (
        <p className="text-sm text-[var(--text-muted)]">Loading provider catalog…</p>
      )}

      <div className="space-y-2">
        {filtered.map((provider) => {
          const connected = connectedProviders.includes(provider.id);
          const isEditing = editing.has(provider.id) || !connected;
          const draft = getDraft(provider);
          const endpoint = effectiveEndpoint(provider);

          return (
            <div
              key={provider.id}
              className={`${hintClass("models-settings", `provider-${provider.id}`)} p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)]`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{provider.name}</span>
                    {connected ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                        <Check className="w-3 h-3" />
                        Connected
                        {provider.connectedViaEnv && !provider.hasStoredKey && (
                          <span className="text-[var(--text-muted)]">via env</span>
                        )}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                        <AlertCircle className="w-3 h-3" />
                        Not connected
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {provider.modelCount} models
                    {provider.env.length > 0 && <> · env: {provider.env.join(", ")}</>}
                  </div>
                </div>

                {connected && !isEditing && (
                  <button
                    onClick={() => startEditing(provider)}
                    className={`${hintClass("models-settings", `edit-${provider.id}`)} flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] transition-colors shrink-0`}
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>

              {!isEditing && (
                <div className="mt-2 flex items-start gap-1.5 text-[11px]">
                  <Globe className="w-3 h-3 text-[var(--text-muted)] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[var(--text-muted)]">Endpoint: </span>
                    {endpoint ? (
                      <code className="text-[var(--text)] break-all">{endpoint}</code>
                    ) : (
                      <span className="text-[var(--text-muted)] italic">Not set — use Edit to add one</span>
                    )}
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="mt-3 space-y-2">
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      API endpoint
                    </label>
                    <input
                      type="url"
                      value={draft.baseURL}
                      onChange={(e) => setDraft(provider, { baseURL: e.target.value })}
                      placeholder={provider.catalogEndpoint ?? "https://api.example.com/v1"}
                      className={`${hintClass("models-settings", `endpoint-${provider.id}`)} w-full px-2 py-1.5 rounded text-xs bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] font-mono`}
                    />
                    {provider.catalogEndpoint && draft.baseURL !== provider.catalogEndpoint && (
                      <button
                        type="button"
                        onClick={() => setDraft(provider, { baseURL: provider.catalogEndpoint ?? "" })}
                        className="text-[10px] text-[var(--accent)] mt-1 hover:underline"
                      >
                        Reset to catalog default ({provider.catalogEndpoint})
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Key className="w-3 h-3" />
                      API key
                    </label>
                    <input
                      type="password"
                      value={draft.apiKey}
                      onChange={(e) => setDraft(provider, { apiKey: e.target.value })}
                      placeholder={
                        provider.hasStoredKey || provider.connectedViaEnv
                          ? "Leave blank to keep existing key"
                          : "sk-…"
                      }
                      className={`${hintClass("models-settings", `api-key-${provider.id}`)} w-full px-2 py-1.5 rounded text-xs bg-[var(--bg)] border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]`}
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleSave(provider)}
                      disabled={saving === provider.id || !canSave(provider, draft)}
                      className={`${hintClass("models-settings", `save-${provider.id}`)} px-3 py-1.5 rounded text-xs font-medium bg-[var(--accent)] text-[var(--bg)] disabled:opacity-40`}
                    >
                      {saving === provider.id ? "Saving…" : "Save"}
                    </button>
                    {connected && (
                      <button
                        onClick={() => stopEditing(provider.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]"
                      >
                        <X className="w-3 h-3" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modelsLoaded && filtered.length === 0 && (
        <p className="text-sm text-[var(--text-muted)]">No providers match your search.</p>
      )}
    </motion.div>
  );
}

declare global {
  interface Window {
    electronAPI?: {
      openExternal: (url: string) => Promise<void>;
    };
  }
}
