import { Box, Text } from "ink";
import chalk from "chalk";
import { useSubagentStore } from "../stores/subagentStore.js";

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return `${tokens}`;
}

export function SubagentStatsBar() {
  const { getStats } = useSubagentStore();
  const stats = getStats();

  const mostUsed = Object.entries(stats.agentUsage)
    .sort((a, b) => b[1].tasks - a[1].tasks)
    .map(([name]) => name)[0];

  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={1}
      gap={2}
    >
      <Text>
        {stats.activeAgents > 0
          ? chalk.green(`⚡ ${stats.activeAgents}`)
          : chalk.gray(`⚡ ${stats.activeAgents}`)}
      </Text>
      <Text>{chalk.cyan(`✓ ${stats.completedTasks}/${stats.totalTasks}`)}</Text>
      <Text>{chalk.yellow(`◎ ${formatTokens(stats.totalTokens)}`)}</Text>
      <Text>{chalk.magenta(`$${stats.totalCost.toFixed(3)}`)}</Text>
      {mostUsed && <Text>{chalk.dim.white(mostUsed)}</Text>}
      <Text>{chalk.dim("[Tab] Subagents")}</Text>
    </Box>
  );
}
