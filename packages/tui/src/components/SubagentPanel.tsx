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

function timeAgo(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  return `${hr}h ago`;
}

export default function SubagentPanel() {
  const { agents, selectedId, setSelectedId, getRecentActivity } =
    useSubagentStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [closed, setClosed] = useState(false);

  const list = Object.values(agents);
  const recent = getRecentActivity(6);

  const activeCount = list.filter((a) => a.status === "running").length;
  const totalTasks = list.reduce((s, a) => s + (a.tasksCompleted ?? 0), 0);
  const totalAssigned = list.reduce((s, a) => s + (a.tasksAssigned ?? 0), 0);
  const totalTokens = list.reduce((s, a) => s + (a.tokensUsed ?? 0), 0);
  const totalCost = list.reduce((s, a) => s + (a.cost ?? 0), 0);

  useInput((input, key) => {
    if (input === "q" || key.tab) {
      setClosed((c) => !c);
      return;
    }
    if (closed) return;

    if (input === "j" || key.downArrow) {
      setSelectedIndex((i) => Math.min(i + 1, list.length - 1));
    }
    if (input === "k" || key.upArrow) {
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (key.return && list[selectedIndex]) {
      setSelectedId(list[selectedIndex].id);
    }
  });

  if (closed) return null;

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="cyan" paddingX={1}>
      {/* Header */}
      <Box justifyContent="space-between">
        <Text>
          {chalk.bold.cyan("Subagents")} {chalk.gray(`(${list.length})`)}
        </Text>
        <Text>{chalk.gray("[Tab] Close")}</Text>
      </Box>

      {/* Stats summary */}
      <Box>
        <Text>
          {chalk.cyan("Active:")}
          {chalk.green(` ${activeCount}`)}
          {chalk.gray(" | ")}
          {chalk.cyan("Tasks:")}
          {chalk.yellow(` ${totalTasks}/${totalAssigned}`)}
          {chalk.gray(" | ")}
          {chalk.cyan("Tokens:")}
          {chalk.yellow(` ${formatTokens(totalTokens)}`)}
          {chalk.gray(" | ")}
          {chalk.cyan("Cost:")}
          {chalk.magenta(` ${formatCost(totalCost)}`)}
        </Text>
      </Box>

      {/* Divider */}
      <Text>{chalk.gray("─".repeat(40))}</Text>

      {/* Agent list */}
      <Box flexDirection="column" minHeight={1}>
        {list.length === 0 && (
          <Text>{chalk.gray("No subagents")}</Text>
        )}
        {list.map((agent, i) => {
          const icon = STATUS_ICONS[agent.status] ?? " ";
          const isSelected = i === selectedIndex;
          const prefix = isSelected ? chalk.cyan("▸ ") : "  ";
          const name = statusColor(agent.status, agent.name);
          const role = chalk.gray(agent.role ? ` [${agent.role}]` : "");
          const task =
            agent.status === "running" && agent.currentTask
              ? chalk.gray(` → ${agent.currentTask}`)
              : "";
          const stats = chalk.yellow(` ${formatTokens(agent.tokensUsed ?? 0)}`) +
            chalk.magenta(` ${formatCost(agent.cost ?? 0)}`);
          return (
            <Text key={agent.id}>
              {prefix}
              {statusColor(agent.status, icon)} {name}
              {role}
              {task}
              {stats}
            </Text>
          );
        })}
      </Box>

      {/* Divider */}
      <Text>{chalk.gray("─".repeat(40))}</Text>

      {/* Recent Activity */}
      <Box flexDirection="column">
        <Text>{chalk.bold.cyan("Recent Activity")}</Text>
        {recent.length === 0 && (
          <Text>{chalk.gray("No recent activity")}</Text>
        )}
        {recent.map((act, i) => (
          <Text key={i}>
            {chalk.white(act.agentName)} {chalk.gray("→")} {act.description}{" "}
            {chalk.gray(`(${timeAgo(act.timestamp)}, ${formatTokens(act.tokensUsed ?? 0)} tok)`)}
          </Text>
        ))}
      </Box>
    </Box>
  );
}
