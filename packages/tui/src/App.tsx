import { useState } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Chat } from "./components/Chat.js";
import { Header } from "./components/Header.js";
import { StatusBar } from "./components/StatusBar.js";
import { SubagentProvider, useSubagentStore } from "./stores/subagentStore.js";
import { SubagentStatsBar } from "./components/SubagentStatsBar.js";
import { SubagentPanel } from "./components/SubagentPanel.js";

function AppContent() {
  const { exit } = useApp();
  const [mode, setMode] = useState<"chat" | "agent" | "settings">("chat");
  const { panelOpen, togglePanel } = useSubagentStore();

  useInput((input, key) => {
    if (key.tab) {
      togglePanel();
    }
  });

  return (
    <Box flexDirection="column" height="100%">
      <Header />
      <Box flexDirection="row" flexGrow={1}>
        <Box flexDirection="column" flexGrow={1}>
          {mode === "chat" && <Chat />}
        </Box>
        {panelOpen && (
          <Box width={50}>
            <SubagentPanel />
          </Box>
        )}
      </Box>
      <SubagentStatsBar />
      <StatusBar mode={mode} onModeChange={setMode} />
    </Box>
  );
}

export function App() {
  return (
    <SubagentProvider>
      <AppContent />
    </SubagentProvider>
  );
}
