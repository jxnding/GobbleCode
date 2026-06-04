import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge as rfAddEdge,
  Connection,
  NodeTypes,
  EdgeTypes,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { Save, Play, RotateCcw, Maximize2 } from "lucide-react";
import { useAgentStore } from "../../stores/agentStore.js";
import AgentNodeComponent from "./nodes/AgentNode.js";
import AnimatedEdge from "./nodes/AnimatedEdge.js";
import { NodeSidebar } from "./NodeSidebar.js";
import { PropertiesPanel } from "./PropertiesPanel.js";
import { WavyText } from "../ui/WavyText.js";

const nodeTypes: NodeTypes = {
  agent: AgentNodeComponent,
};

const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
};

const SOCKET_COLORS: Record<string, string> = {
  task: "#F59E0B",
  result: "#10B981",
  context: "#8B5CF6",
  error: "#EF4444",
  search: "#3B82F6",
};

export function AgentEditor() {
  const storeNodes = useAgentStore((s) => s.nodes);
  const storeEdges = useAgentStore((s) => s.edges);
  const addEdgeToStore = useAgentStore((s) => s.addEdge);
  const updateNodePosition = useAgentStore((s) => s.updateNodePosition);
  const selectedNode = useAgentStore((s) => s.selectedNode);
  const loadModels = useAgentStore((s) => s.loadModels);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Convert store nodes to ReactFlow nodes
  const nodes = useMemo(
    () =>
      storeNodes.map((n) => ({
        id: n.id,
        type: "agent",
        position: n.position,
        data: n,
        selected: n.id === selectedNode,
      })),
    [storeNodes, selectedNode]
  );

  // Convert store edges to ReactFlow edges
  const edges = useMemo(
    () =>
      storeEdges.map((e) => {
        const sourceNode = storeNodes.find((n) => n.id === e.source);
        const socket = sourceNode?.sockets.outputs.find((s) => s.id === e.sourceSocket);
        return {
          id: e.id,
          source: e.source,
          sourceHandle: e.sourceSocket,
          target: e.target,
          targetHandle: e.targetSocket,
          type: "animated",
          data: { color: socket ? SOCKET_COLORS[socket.dataType] : "#FFD700" },
        };
      }),
    [storeEdges, storeNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target && params.sourceHandle && params.targetHandle) {
        addEdgeToStore({
          source: params.source,
          sourceSocket: params.sourceHandle,
          target: params.target,
          targetSocket: params.targetHandle,
        });
      }
    },
    [addEdgeToStore]
  );

  const onNodeDragStop = useCallback(
    (_: any, node: any) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );

  return (
    <div className="h-full flex">
      {/* Node Sidebar */}
      <NodeSidebar />

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 bg-[#111] border-b border-white/5">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-7 h-7 rounded-lg bg-yellow-400 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-xs">🎯</span>
            </motion.div>
            <h1 className="text-sm font-semibold">
              <WavyText text="Agent Pipeline" />
            </h1>
            <span className="text-xs text-white/30">
              {storeNodes.length} agents · {storeEdges.length} connections
            </span>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-xs"
            >
              <Play className="w-3.5 h-3.5" />
              Run Pipeline
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 text-black hover:bg-yellow-500 transition-colors text-xs font-medium"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </motion.button>
          </div>
        </div>

        {/* Graph Editor */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onConnect={onConnect}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            snapToGrid
            snapGrid={[16, 16]}
            defaultEdgeOptions={{ type: "animated" }}
            className="bg-[#0a0a0a]"
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1}
              color="#ffffff08"
            />
            <Controls
              className="!bg-[#1a1a1a] !border-white/10 !rounded-lg !shadow-xl"
              showInteractive={false}
            />
            <MiniMap
              nodeColor={(n) => n.data?.color || "#333"}
              maskColor="rgba(0,0,0,0.7)"
              className="!bg-[#111] !border-white/10 !rounded-lg"
              style={{ width: 150, height: 100 }}
            />

            {/* Legend */}
            <Panel position="bottom-left" className="!m-3">
              <div className="bg-[#111]/90 backdrop-blur-sm rounded-lg p-3 border border-white/5">
                <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                  Socket Types
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SOCKET_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: color }}
                      />
                      <span className="text-[10px] text-white/50 capitalize">{type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>

            {/* Quick Info */}
            <Panel position="top-center" className="!m-3">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111]/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/5 flex items-center gap-3"
              >
                <span className="text-xs text-white/40">
                  Drag to connect sockets · Click node to edit · Scroll to zoom
                </span>
              </motion.div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Properties Panel */}
      <PropertiesPanel />
    </div>
  );
}
