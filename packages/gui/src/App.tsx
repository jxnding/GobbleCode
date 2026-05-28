import { Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "./components/layout/Layout.js";
import { ChatView } from "./components/chat/ChatView.js";
import { AgentEditor } from "./components/agents/AgentEditor.js";
import { SettingsView } from "./components/settings/SettingsView.js";
import { MrGobble } from "./components/ui/MrGobble.js";
import { SubagentPanel } from "./components/subagents/SubagentPanel.js";
import { SubagentDetail } from "./components/subagents/SubagentDetail.js";

export default function App() {
  return (
    <Layout>
      <div className="flex h-full">
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<ChatView />} />
              <Route path="/agents" element={<AgentEditor />} />
              <Route path="/settings" element={<SettingsView />} />
            </Routes>
          </AnimatePresence>
        </div>
        <SubagentPanel />
        <SubagentDetail />
      </div>
      <MrGobble />
    </Layout>
  );
}
