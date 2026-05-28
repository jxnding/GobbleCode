import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Search, Globe } from "lucide-react";
import { WavyText } from "../ui/WavyText.js";
import { ThinkingAnimation } from "../ui/ThinkingAnimation.js";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    setIsSearching(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSearching(false);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `I'll help you with that! Let me analyze your request: "${input}"\n\nBased on my search results and code analysis, here's what I found...`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsThinking(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg viewBox="0 0 100 100" className="w-5 h-5">
              <path d="M 50 50 L 85 20 A 45 45 0 1 0 85 80 Z" fill="var(--bg)" />
            </svg>
          </motion.div>
          <div>
            <h1 className="font-semibold">
              <WavyText text="GobbleChat" />
            </h1>
            <p className="text-xs text-[var(--text-muted)]">WAKA WAKA - Search-boosted AI</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            {/* Pac-Man Mr. Gobble */}
            <div className="relative mb-6">
              <div className="flex gap-3 mb-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 rounded-full bg-[var(--accent)]/80"
                    animate={{ opacity: [1, 0], scale: [1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  />
                ))}
              </div>

              <motion.svg
                viewBox="0 0 100 100"
                className="w-32 h-32"
                animate={{ x: [0, 10, 0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.path
                  fill="var(--accent)"
                  stroke="var(--accent-hover)"
                  strokeWidth="2"
                  animate={{
                    d: [
                      "M 50 50 L 85 20 A 45 45 0 1 0 85 80 Z",
                      "M 50 50 L 95 40 A 45 45 0 1 0 95 60 Z",
                    ],
                  }}
                  transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
                />
                <circle cx="60" cy="30" r="6" fill="white" />
                <circle cx="62" cy="28" r="3" fill="black" />
              </motion.svg>

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"].map((color, i) => (
                  <motion.div
                    key={i}
                    className="w-6 h-6"
                    animate={{ y: [0, -5, 0], x: [0, 3, 0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <path
                        d="M 10 60 L 10 30 Q 10 10 30 10 L 70 10 Q 90 10 90 30 L 90 60 L 80 50 L 70 60 L 60 50 L 50 60 L 40 50 L 30 60 L 20 50 Z"
                        fill={color}
                      />
                      <circle cx="35" cy="35" r="8" fill="white" />
                      <circle cx="65" cy="35" r="8" fill="white" />
                      <circle cx="37" cy="35" r="4" fill="black" />
                      <circle cx="67" cy="35" r="4" fill="black" />
                    </svg>
                  </motion.div>
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2 text-[var(--accent)]">
              <WavyText text="WAKA WAKA!" />
            </h2>
            <p className="text-[var(--text-secondary)] max-w-md mb-2">
              I'm Mr. Gobble, your Pac-Man AI coding companion!
            </p>
            <p className="text-[var(--text-muted)] max-w-md text-sm">
              I munch through code and search the web to give you better answers.
            </p>

            <div className="flex gap-3 mt-8">
              {[
                { label: "Fix my code", icon: "🐛" },
                { label: "Explain this", icon: "💡" },
                { label: "Write tests", icon: "🧪" },
              ].map((suggestion) => (
                <motion.button
                  key={suggestion.label}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setInput(suggestion.label)}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 border border-[var(--accent)]/20 transition-colors text-sm text-[var(--accent)]"
                >
                  <span>{suggestion.icon}</span>
                  {suggestion.label}
                </motion.button>
              ))}
            </div>

            <motion.div
              className="mt-8 flex items-center gap-2 text-xs text-[var(--text-muted)]"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              Press Enter to start gobbling
            </motion.div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === "user"
                    ? "bg-[var(--accent)] text-[var(--bg)]"
                    : "bg-[var(--surface)] border border-[var(--border)]"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === "user" ? "opacity-60" : "text-[var(--text-muted)]"}`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
              {isSearching ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Globe className="w-4 h-4 text-[var(--accent)]" />
                  </motion.div>
                  <span className="text-sm text-[var(--text-muted)]">Searching the web...</span>
                </div>
              ) : (
                <ThinkingAnimation />
              )}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-colors"
          >
            <Search className="w-5 h-5 text-[var(--text-muted)]" />
          </motion.button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask GobbleCode anything..."
            className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]/50 text-[var(--text)]"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
