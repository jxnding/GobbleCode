import { z } from "zod";

export const ModelProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  npm: z.string(),
  options: z.record(z.unknown()),
  models: z.record(
    z.object({
      name: z.string(),
      maxTokens: z.number().optional(),
      contextWindow: z.number().optional(),
    })
  ),
});
export type ModelProvider = z.infer<typeof ModelProviderSchema>;

export const ThemeSchema = z.enum(["dark", "light", "auto"]);
export type Theme = z.infer<typeof ThemeSchema>;

export const AccentColorSchema = z.string();
export type AccentColor = z.infer<typeof AccentColorSchema>;

export const PermissionsConfigSchema = z.object({
  yoloMode: z.boolean(),
  allowedTools: z.array(z.string()),
  protectedBranches: z.array(z.string()),
});
export type PermissionsConfig = z.infer<typeof PermissionsConfigSchema>;

export const SoundConfigSchema = z.object({
  enabled: z.boolean(),
  volume: z.number().min(0).max(100),
  effects: z.object({
    start: z.string().optional(),
    complete: z.string().optional(),
    error: z.string().optional(),
    thinking: z.string().optional(),
    notification: z.string().optional(),
    gobble: z.string().optional(),
    waka: z.string().optional(),
  }),
});
export type SoundConfig = z.infer<typeof SoundConfigSchema>;

export const SyncConfigSchema = z.object({
  enabled: z.boolean(),
  serverUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  syncAgents: z.boolean(),
  syncModels: z.boolean(),
  syncSkills: z.boolean(),
  syncConfig: z.boolean(),
  syncTheme: z.boolean(),
});
export type SyncConfig = z.infer<typeof SyncConfigSchema>;

export const BrowserConfigSchema = z.object({
  enabled: z.boolean(),
  defaultEngine: z.enum(["firefox", "chrome", "safari"]),
  searchProviders: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      enabled: z.boolean(),
    })
  ),
  autoSearch: z.boolean(),
  maxResults: z.number(),
});
export type BrowserConfig = z.infer<typeof BrowserConfigSchema>;

export const SemanticProviderSchema = z.enum(["ollama", "openai-compat"]);
export type SemanticProvider = z.infer<typeof SemanticProviderSchema>;

export const OllamaConfigSchema = z.object({
  baseUrl: z.string().url().default("http://localhost:11434"),
  model: z.string().default("nomic-embed-text"),
});
export type OllamaConfig = z.infer<typeof OllamaConfigSchema>;

export const OpenAICompatConfigSchema = z.object({
  baseUrl: z.string().url(),
  apiKey: z.string(),
  model: z.string().default("text-embedding-3-small"),
});
export type OpenAICompatConfig = z.infer<typeof OpenAICompatConfigSchema>;

export const SemanticConfigSchema = z.object({
  provider: SemanticProviderSchema.default("ollama"),
  ollama: OllamaConfigSchema.optional(),
  openaiCompat: OpenAICompatConfigSchema.optional(),
});
export type SemanticConfig = z.infer<typeof SemanticConfigSchema>;

export const GobbleCodeConfigSchema = z.object({
  version: z.string(),
  providers: z.record(ModelProviderSchema),
  defaultProvider: z.string(),
  defaultModel: z.string(),
  theme: ThemeSchema,
  accentColor: AccentColorSchema,
  permissions: PermissionsConfigSchema,
  sound: SoundConfigSchema,
  sync: SyncConfigSchema,
  browser: BrowserConfigSchema,
  semantic: SemanticConfigSchema.optional(),
  disabledProviders: z.array(z.string()).optional(),
});
export type GobbleCodeConfig = z.infer<typeof GobbleCodeConfigSchema>;

export const DEFAULT_CONFIG: GobbleCodeConfig = {
  version: "0.1.0",
  providers: {},
  defaultProvider: "",
  defaultModel: "",
  theme: "dark",
  accentColor: "#fbbf24",
  permissions: {
    yoloMode: true,
    allowedTools: ["read", "write", "edit", "bash", "git", "glob", "grep", "search", "browser"],
    protectedBranches: ["main", "master", "develop"],
  },
  sound: {
    enabled: true,
    volume: 50,
    effects: {},
  },
  sync: {
    enabled: false,
    syncAgents: true,
    syncModels: true,
    syncSkills: true,
    syncConfig: true,
    syncTheme: false,
  },
  browser: {
    enabled: true,
    defaultEngine: "firefox",
    searchProviders: [
      { name: "Google", url: "https://www.google.com/search?q=", enabled: true },
      { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=", enabled: true },
      { name: "Perplexity", url: "https://www.perplexity.ai/search?q=", enabled: true },
    ],
    autoSearch: true,
    maxResults: 5,
  },
  semantic: {
    provider: "ollama",
    ollama: {
      baseUrl: "http://localhost:11434",
      model: "nomic-embed-text",
    },
  },
};
