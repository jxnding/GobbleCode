import type { EmbeddingProvider } from "../types.js";
import type { OllamaConfig } from "../../config/types.js";

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  name = "ollama";
  private baseUrl: string;
  private model: string;

  constructor(config: OllamaConfig) {
    this.baseUrl = config.baseUrl;
    this.model = config.model;
  }

  async embed(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, prompt: text }),
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    // Ollama doesn't support batch, so we do them sequentially
    const results: number[][] = [];
    for (const text of texts) {
      results.push(await this.embed(text));
    }
    return results;
  }
}
