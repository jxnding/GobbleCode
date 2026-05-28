import type { SemanticConfig } from "../config/types.js";
import type { EmbeddingProvider, SemanticIndex, SemanticSearchResult } from "./types.js";
import { OllamaEmbeddingProvider } from "./providers/ollama.js";
import { OpenAICompatEmbeddingProvider } from "./providers/openai-compat.js";
import { SemanticIndexer } from "./indexer.js";

export class SemanticManager {
  private config: SemanticConfig;
  private provider: EmbeddingProvider;
  private indexer: SemanticIndexer;

  constructor(config: SemanticConfig, projectRoot: string) {
    this.config = config;
    this.provider = this.createProvider(config);
    this.indexer = new SemanticIndexer(this.provider, projectRoot);
  }

  private createProvider(config: SemanticConfig): EmbeddingProvider {
    switch (config.provider) {
      case "ollama":
        return new OllamaEmbeddingProvider(
          config.ollama ?? { baseUrl: "http://localhost:11434", model: "nomic-embed-text" }
        );
      case "openai-compat":
        if (!config.openaiCompat) {
          throw new Error("openaiCompat config required for openai-compat provider");
        }
        return new OpenAICompatEmbeddingProvider(config.openaiCompat);
      default:
        throw new Error(`Unknown semantic provider: ${config.provider}`);
    }
  }

  async buildIndex(progress?: (msg: string) => void): Promise<SemanticIndex> {
    return this.indexer.buildIndex(progress);
  }

  async query(query: string, topK?: number): Promise<SemanticSearchResult[]> {
    return this.indexer.query(query, topK);
  }

  async getIndex(): Promise<SemanticIndex | null> {
    return this.indexer.loadIndex();
  }
}
