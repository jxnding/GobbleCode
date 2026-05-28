import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import chalk from "chalk";
import { useSubagentStore } from "../stores/subagentStore.js";

const STATUS_ICONS: Record<string, string> = {
  running: "⚡",
  idle: "○",
  completed: "✓",
  error: "✗",
  cancelled: "⊘",
};

function statusColor(status: string, text: string): string {
  switch (status) {
    case "running":
      return chalk.green(text);
    case "idle":
      return chalk.gray(text);
    case "completed":
      return chalk.cyan(text);
    case "error":
      return chalk.red(text);
    default:
      return text;
  }
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatCost(n: number): string {
  return `$${n.toFixed(2)}`;
}

function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

export default function SubagentPanel() {
  const { subagents, selectedId, selectSubagent, togglePanel, getStats, getRecentActivity } =
    useSubagentStore();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const stats = getStats();
  const recent = getRecentActivity(6);

  useInput((input, key) => {
    if (input === "q" || key.tab) {
      togglePanel();
      return;
    }
    if (input === "j" || key.downArrow) {
      setSelectedIndex((i) => Math.min(i + 1, subagents.length - 1));
    }
    if (input === "k" || key.upArrow) {
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (key.return && subagents[selectedIndex]) {
      selectSubagent(subagents[selectedIndex].id);
    }
  });

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="cyan" paddingX={1}>
      {/* Header */}
      <Box justifyContent="space-between">
        <Text>
          {chalk.bold.cyan("Subagents")} {chalk.gray(`(${stats.totalAgents})`)}
        </Text>
        <Text>{chalk.gray("[Tab] Close")}</Text>
      </Box>

      {/* Stats summary */}
      <Box>
        <Text>
          {chalk.cyan("Active:")}
          {chalk.green(` ${stats.activeAgents}`)}
          {chalk.gray(" | ")}
          {chalk.cyan("Tasks:")}
          {chalk.yellow(` ${stats.completedTasks}/${stats.totalTasks}`)}
          {chalk.gray(" | ")}
          {chalk.cyan("Tokens:")}
          {chalk.yellow(` ${formatTokens(stats.totalTokens)}`)}
          {chalk.gray(" | ")}
          {chalk.cyan("Cost:")}
          {chalk.magenta(` ${formatCost(stats.totalCost)}`)}
        </Text>
      </Box>

      <Text>{chalk.gray("─".repeat(40))}</Text>

      {/* Agent list */}
      <Box flexDirection="column" minHeight={1}>
        {subagents.length === 0 && (
          <Text>{chalk.gray("No subagents")}</Text>
        )}
        {subagents.map((agent, i) => {
          const icon = STATUS_ICONS[agent.status] ?? " ";
          const isSelected = i === selectedIndex;
          const prefix = isSelected ? chalk.cyan("▸ ") : "  ";
          const name = statusColor(agent.status, agent.name);
          const role = chalk.gray(` [${agent.role}]`);
          const task =
            agent.status === "running" && agent.currentTask
              ? chalk.gray(` → ${agent.currentTask}`)
              : "";
          const statsStr =
            chalk.yellow(` ${formatTokens(agent.totalTokens)}`) +
            chalk.magenta(` ${formatCost(agent.totalCost)}`);
          return (
            <Text key={agent.id}>
              {prefix}
              {statusColor(agent.status, icon)} {name}
              {role}
              {task}
              {statsStr}
            </Text>
          );
        })}
      </Box>

      <Text>{chalk.gray("─".repeat(40))}</Text>

      {/* Recent Activity */}
      <Box flexDirection="column">
        <Text>{chalk.bold.cyan("Recent Activity")}</Text>
        {recent.length === 0 && (
          <Text>{chalk.gray("No recent activity")}</Text>
        )}
        {recent.map(({ subagent, task }, i) => (
          <Text key={i}>
            {chalk.white(subagent.name)} {chalk.gray("→")} {task.description}{" "}
            {chalk.gray(`(${timeAgo(task.startedAt)}, ${formatTokens(task.tokensUsed)} tok)`)}
          </Text>
        ))}
      </Box>
    </Box>
  );
}
