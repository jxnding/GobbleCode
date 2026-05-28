import { useState } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import chalk from "chalk";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = async (value: string) => {
    if (!value.trim()) return;

    const userMessage: Message = { role: "user", content: value };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    // Simulate response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const assistantMessage: Message = {
      role: "assistant",
      content: `I'll help you with "${value}". Let me analyze this...`,
    };
    setMessages((prev) => [...prev, assistantMessage]);
    setIsThinking(false);
  };

  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1}>
      <Box flexDirection="column" flexGrow={1} overflowY="auto">
        {messages.map((msg, i) => (
          <Box key={i} marginBottom={1}>
            <Text color={msg.role === "user" ? "orange" : "cyan"} bold>
              {msg.role === "user" ? "You: " : "Gobble: "}
            </Text>
            <Text>{msg.content}</Text>
          </Box>
        ))}
        {isThinking && (
          <Box>
            <Text color="orange">
              {chalk.italic("Gobbling...")}
            </Text>
          </Box>
        )}
      </Box>
      <Box borderStyle="round" borderColor="orange" paddingX={1}>
        <Text color="orange">{"> "}</Text>
        <TextInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          placeholder="Ask GobbleCode anything..."
        />
      </Box>
    </Box>
  );
}
