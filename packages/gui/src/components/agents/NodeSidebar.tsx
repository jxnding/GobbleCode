import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { AgentRole } from "../../stores/agentStore.js";
import { useAgentStore } from "../../stores/agentStore.js";

const AVAILABLE_AGENTS: { role: AgentRole; label: string; icon: string; color: string; description: string }[] = [
  {
    role: "orchestrator",
    label: "Orchestrator",
    icon: "🎯",
    color: "#8B5CF6",
    description: "Coordinates workflow between agents",
  },
  {
    role: "worker",
    label: "Worker",
    icon: "⚡",
    color: "#3B82F6",
    description: "Implements code changes",
  },
  {
    role: "tester",
    label: "Tester",
    icon: "🧪",
    color: "#10B981",
    description: "Runs tests and validates",
  },
  {
    role: "searcher",
    label: "Searcher",
    icon: "🔍",
    color: "#F59E0B",
    description: "Searches web for context",
  },
  {
    role: "custom",
    label: "Custom",
    icon: "🤖",
    color: "#6B7280",
    description: "Custom agent role",
  },
];

export function NodeSidebar() {
  const addNode = useAgentStore((s) => s.addNode);

  return (
    <div className="w-56 bg-[#111] border-r border-white/5 flex flex-col">
      <div className="p-3 border-b border-white/5">
        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
          Add Agent
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {AVAILABLE_AGENTS.map((agent) => (
          <motion.button
            key={agent.role}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => addNode(agent.role)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: agent.color + "20" }}
            >
              {agent.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white/80 group-hover:text-white">
                {agent.label}
              </div>
              <div className="text-[10px] text-white/40 truncate">{agent.description}</div>
            </div>
            <Plus className="w-3 h-3 text-white/20 group-hover:text-white/40" />
          </motion.button>
        ))}
      </div>

      {/* Presets */}
      <div className="p-2 border-t border-white/5">
        <div className="text-[10px] text-white/40 uppercase tracking-wider px-2 mb-2">
          Presets
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-3 py-2 rounded-lg bg-yellow-400/10 text-yellow-400 text-xs hover:bg-yellow-400/20 transition-colors"
        >
          🎮 Default Pipeline
        </motion.button>
      </div>
    </div>
  );
}
