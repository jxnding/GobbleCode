import { motion, AnimatePresence } from "framer-motion";
import { X, Cpu, Wrench, FileText, Trash2 } from "lucide-react";
import { useAgentStore, AVAILABLE_MODELS } from "../../../stores/agentStore.js";

export function PropertiesPanel() {
  const selectedNode = useAgentStore((s) => s.selectedNode);
  const nodes = useAgentStore((s) => s.nodes);
  const updateNode = useAgentStore((s) => s.updateNode);
  const updateNodeModel = useAgentStore((s) => s.updateNodeModel);
  const removeNode = useAgentStore((s) => s.removeNode);
  const selectNode = useAgentStore((s) => s.selectNode);

  const node = nodes.find((n) => n.id === selectedNode);

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-72 bg-[#111] border-l border-white/5 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-3 border-b border-white/5"
            style={{ background: node.color + "10" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{node.icon}</span>
              <div>
                <h3 className="text-sm font-semibold text-white">{node.label}</h3>
                <div className="text-[10px] text-white/40 uppercase">{node.role}</div>
              </div>
            </div>
            <button
              onClick={() => selectNode(null)}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/40" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Label */}
            <div className="p-3 border-b border-white/5">
              <label className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 mb-1">
                <FileText className="w-3 h-3" />
                Label
              </label>
              <input
                type="text"
                value={node.label}
                onChange={(e) => updateNode(node.id, { label: e.target.value })}
                className="w-full bg-white/5 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400/50"
              />
            </div>

            {/* Description */}
            <div className="p-3 border-b border-white/5">
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">
                Description
              </label>
              <textarea
                value={node.description}
                onChange={(e) => updateNode(node.id, { description: e.target.value })}
                rows={2}
                className="w-full bg-white/5 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-400/50 resize-none"
              />
            </div>

            {/* Model */}
            <div className="p-3 border-b border-white/5">
              <label className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 mb-2">
                <Cpu className="w-3 h-3" />
                Model
              </label>
              <div className="space-y-1">
                {AVAILABLE_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => updateNodeModel(node.id, model.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                      model.id === node.model.id
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: model.id === node.model.id ? node.color : "transparent",
                        border: `1px solid ${model.id === node.model.id ? node.color : "#333"}`,
                      }}
                    />
                    <div className="flex-1">
                      <div className="text-xs">{model.name}</div>
                      <div className="text-[10px] text-white/30">{model.provider}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="p-3 border-b border-white/5">
              <label className="text-[10px] text-white/40 uppercase tracking-wider flex items-center gap-1 mb-2">
                <Wrench className="w-3 h-3" />
                Tools
              </label>
              <div className="flex flex-wrap gap-1">
                {["read", "write", "edit", "bash", "git", "glob", "grep", "search", "browser"].map(
                  (tool) => (
                    <button
                      key={tool}
                      onClick={() => {
                        const tools = node.tools.includes(tool)
                          ? node.tools.filter((t) => t !== tool)
                          : [...node.tools, tool];
                        updateNode(node.id, { tools });
                      }}
                      className={`px-2 py-1 rounded text-[10px] transition-colors ${
                        node.tools.includes(tool)
                          ? "text-white"
                          : "bg-white/5 text-white/40 hover:text-white/60"
                      }`}
                      style={
                        node.tools.includes(tool)
                          ? { background: node.color + "40" }
                          : undefined
                      }
                    >
                      {tool}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* System Prompt */}
            <div className="p-3">
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">
                System Prompt
              </label>
              <textarea
                value={node.systemPrompt}
                onChange={(e) => updateNode(node.id, { systemPrompt: e.target.value })}
                rows={4}
                className="w-full bg-white/5 rounded px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:ring-1 focus:ring-yellow-400/50 resize-none font-mono"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/5">
            <button
              onClick={() => {
                removeNode(node.id);
                selectNode(null);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs"
            >
              <Trash2 className="w-3 h-3" />
              Delete Agent
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
