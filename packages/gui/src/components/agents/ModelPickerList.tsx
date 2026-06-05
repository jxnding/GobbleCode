import { useMemo, useState } from "react";
import type { AgentModel } from "../../stores/agentStore.js";
import { hintClass } from "../../lib/hintClass.js";

interface ModelPickerListProps {
  models: AgentModel[];
  selectedId: string;
  onSelect: (model: AgentModel) => void;
  accentColor?: string;
  compact?: boolean;
}

export function ModelPickerList({
  models,
  selectedId,
  onSelect,
  accentColor = "#fbbf24",
  compact = false,
}: ModelPickerListProps) {
  const [filter, setFilter] = useState("");

  const { connected, other } = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = models.filter(
      (m) =>
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q),
    );
    return {
      connected: filtered.filter((m) => m.connected),
      other: filtered.filter((m) => !m.connected),
    };
  }, [models, filter]);

  if (models.length === 0) {
    return (
      <p className="text-[10px] text-white/30 px-1 pb-1 leading-relaxed">
        Loading models… Open Settings → Models to add an API key.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {models.length > 12 && (
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter models…"
          className="w-full mb-1 px-2 py-1 rounded text-[10px] bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-yellow-400/40"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {connected.length > 0 && (
        <>
          <div className="text-[9px] text-emerald-400/80 uppercase tracking-wider px-1 pt-1">
            Connected
          </div>
          {connected.map((model) => (
            <ModelRow
              key={model.id}
              model={model}
              selected={model.id === selectedId}
              accentColor={accentColor}
              compact={compact}
              onSelect={onSelect}
            />
          ))}
        </>
      )}

      {other.length > 0 && (
        <>
          <div className="text-[9px] text-white/25 uppercase tracking-wider px-1 pt-2 pb-1">
            {connected.length > 0 ? "All models" : "Models"}
          </div>
          <div className={compact ? "max-h-36 overflow-y-auto" : "max-h-48 overflow-y-auto"}>
            {other.map((model) => (
              <ModelRow
                key={model.id}
                model={model}
                selected={model.id === selectedId}
                accentColor={accentColor}
                compact={compact}
                onSelect={onSelect}
                muted
              />
            ))}
          </div>
        </>
      )}

      {connected.length === 0 && other.length === 0 && (
        <p className="text-[10px] text-white/30 px-1">No models match your filter.</p>
      )}
    </div>
  );
}

function ModelRow({
  model,
  selected,
  accentColor,
  compact,
  onSelect,
  muted = false,
}: {
  model: AgentModel;
  selected: boolean;
  accentColor: string;
  compact: boolean;
  onSelect: (model: AgentModel) => void;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect(model);
      }}
      className={`${hintClass("model-picker", model.id.replace(/\//g, "-"))} w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
        selected
          ? "bg-white/10 text-white"
          : muted
            ? "text-white/50 hover:bg-white/5 hover:text-white/70"
            : "text-white/70 hover:bg-white/5 hover:text-white"
      }`}
    >
      <div
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{
          background: model.connected ? "#34d399" : selected ? accentColor : "transparent",
          border: `1px solid ${selected ? accentColor : model.connected ? "#34d399" : "#333"}`,
        }}
      />
      <div className="flex-1 min-w-0">
        <div className={`truncate ${compact ? "text-xs" : "text-xs"}`}>{model.name}</div>
        <div className="text-[10px] text-white/40 truncate">{model.provider}</div>
      </div>
    </button>
  );
}
