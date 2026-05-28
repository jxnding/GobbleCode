import { Box, Text } from "ink";
import chalk from "chalk";

interface StatusBarProps {
  mode: "chat" | "agent" | "settings";
  onModeChange: (mode: "chat" | "agent" | "settings") => void;
}

export function StatusBar({ mode, onModeChange }: StatusBarProps) {
  return (
    <Box
      borderStyle="round"
      borderColor="orange"
      paddingX={1}
      justifyContent="space-between"
    >
      <Box gap={2}>
        <Text color={mode === "chat" ? "orange" : "gray"} bold>
          [C]hat
        </Text>
        <Text color={mode === "agent" ? "orange" : "gray"} bold>
          [A]gent
        </Text>
        <Text color={mode === "settings" ? "orange" : "gray"} bold>
          [S]ettings
        </Text>
      </Box>
      <Box>
        <Text color="gray">
          {chalk.dim("Press Ctrl+C to exit")}
        </Text>
      </Box>
    </Box>
  );
}
