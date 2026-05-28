import { Box, Text } from "ink";
import chalk from "chalk";
import { useSubagentStore } from "../stores/subagentStore.js";
import { formatTokens } from "../utils/format.js";

export function SubagentStatsBar() {
  const { subagents, getStats } = useSubagentStore();
  const stats = getStats();

  const mostUsedId = Object.entries(stats.agentUsage)
    .sort((a, b) => b[1].tasks - a[1].tasks)
    .map(([id]) => id)[0];
  const mostUsedName = mostUsedId
    ? subagents.find((a) => a.id === mostUsedId)?.name ?? mostUsedId
    : undefined;

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
      {mostUsedName && <Text>{chalk.dim.white(mostUsedName)}</Text>}
      <Text>{chalk.dim("[Tab] Subagents")}</Text>
    </Box>
  );
}
