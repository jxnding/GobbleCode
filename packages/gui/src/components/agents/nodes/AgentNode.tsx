import { memo, useState, useRef } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Cpu, Zap, Wrench } from "lucide-react";
import type { AgentNodeData, AgentModel } from "../../../stores/agentStore.js";
import { useAgentStore } from "../../../stores/agentStore.js";
import { ModelPickerList } from "../ModelPickerList.js";
import { hintClass } from "../../../lib/hintClass.js";

const SOCKET_COLORS: Record<string, string> = {
  task: "#F59E0B",
  result: "#10B981",
  context: "#8B5CF6",
  error: "#EF4444",
  search: "#3B82F6",
};

const AgentNodeComponent = memo(({ data, id, selected }: NodeProps<AgentNodeData>) => {
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const updateNodeModel = useAgentStore((s) => s.updateNodeModel);
  const selectNode = useAgentStore((s) => s.selectNode);
  const models = useAgentStore((s) => s.models);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleModelChange = (model: AgentModel) => {
    updateNodeModel(id, model.id);
    setShowModelPicker(false);
  };

  return (
    <div
      className="relative group"
      onClick={() => selectNode(id)}
    >
      {/* Input Handles */}
      {data.sockets.inputs.map((socket, i) => (
        <Handle
          key={socket.id}
          type="target"
          position={Position.Left}
          id={socket.id}
          style={{
            background: SOCKET_COLORS[socket.dataType],
            width: 12,
            height: 12,
            border: "2px solid #0a0a0a",
            top: `${30 + i * 28}px`,
            left: -6,
          }}
        />
      ))}

      {/* Output Handles */}
      {data.sockets.outputs.map((socket, i) => (
        <Handle
          key={socket.id}
          type="source"
          position={Position.Right}
          id={socket.id}
          style={{
            background: SOCKET_COLORS[socket.dataType],
            width: 12,
            height: 12,
            border: "2px solid #0a0a0a",
            top: `${30 + i * 28}px`,
            right: -6,
          }}
        />
      ))}

      {/* Node Body */}
      <motion.div
        className={`${hintClass("agent-node", id)} rounded-lg overflow-hidden shadow-2xl`}
        style={{
          width: 280,
          background: "#1a1a1a",
          border: `2px solid ${selected ? "#FFD700" : data.color + "40"}`,
          boxShadow: selected
            ? `0 0 20px ${data.color}40, 0 0 40px ${data.color}20`
            : `0 4px 20px rgba(0,0,0,0.5)`,
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.15 }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing"
          style={{ background: data.color + "20" }}
        >
          <span className="text-lg">{data.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-white truncate">{data.label}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-wider">{data.role}</div>
          </div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: data.color }}
          />
        </div>

        {/* Socket Labels - Inputs */}
        <div className="px-3 py-1">
          {data.sockets.inputs.map((socket) => (
            <div key={socket.id} className="flex items-center gap-2 py-0.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: SOCKET_COLORS[socket.dataType] }}
              />
              <span className="text-[10px] text-white/60">{socket.name}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mx-3" />

        {/* Model Selector */}
        <div className="px-3 py-2 relative" ref={dropdownRef}>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            Model
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowModelPicker(!showModelPicker);
            }}
            className={`${hintClass("agent-node", `${id}-model-picker`)} w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors text-left`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: data.color }}
              />
              <span className="text-xs text-white truncate">{data.model.name}</span>
            </div>
            <ChevronDown className="w-3 h-3 text-white/40 flex-shrink-0" />
          </button>

          {/* Model Dropdown */}
          <AnimatePresence>
            {showModelPicker && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg overflow-hidden shadow-2xl"
                style={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.1)",
                  width: "calc(100% - 24px)",
                  marginLeft: "12px",
                }}
              >
                <div className="p-1 max-h-56 overflow-y-auto">
                  <ModelPickerList
                    models={models}
                    selectedId={data.model.id}
                    onSelect={handleModelChange}
                    accentColor={data.color}
                    compact
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tools */}
        <div className="px-3 py-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTools(!showTools);
            }}
            className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white/60 transition-colors"
          >
            <Wrench className="w-3 h-3" />
            {data.tools.length} tools
            <ChevronDown className={`w-3 h-3 transition-transform ${showTools ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showTools && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/50"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Socket Labels - Outputs */}
        <div className="px-3 py-1 border-t border-white/5">
          {data.sockets.outputs.map((socket) => (
            <div key={socket.id} className="flex items-center justify-end gap-2 py-0.5">
              <span className="text-[10px] text-white/60">{socket.name}</span>
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: SOCKET_COLORS[socket.dataType] }}
              />
            </div>
          ))}
        </div>

        {/* Status Bar */}
        <div
          className="flex items-center justify-between px-3 py-1.5"
          style={{ background: data.color + "10" }}
        >
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" style={{ color: data.color }} />
            <span className="text-[10px] text-white/40">Ready</span>
          </div>
          <span className="text-[10px] text-white/30">{data.model.provider}</span>
        </div>
      </motion.div>
    </div>
  );
});

AgentNodeComponent.displayName = "AgentNode";

export default AgentNodeComponent;
