import { useState } from "react";
import { Box, Text, useApp } from "ink";
import { Chat } from "./components/Chat.js";
import { Header } from "./components/Header.js";
import { StatusBar } from "./components/StatusBar.js";

export function App() {
  const { exit } = useApp();
  const [mode, setMode] = useState<"chat" | "agent" | "settings">("chat");

  return (
    <Box flexDirection="column" height="100%">
      <Header />
      <Box flexDirection="column" flexGrow={1}>
        {mode === "chat" && <Chat />}
      </Box>
      <StatusBar mode={mode} onModeChange={setMode} />
    </Box>
  );
}
