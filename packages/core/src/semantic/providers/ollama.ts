import type { EmbeddingProvider } from "../types.js";
import type { OllamaConfig } from "../../config/types.js";

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  name = "ollama";
  model: string;
  private baseUrl: string;

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

  async embedBatch(texts: string[], concurrency = 5): Promise<number[][]> {
    const results: number[][] = new Array(texts.length);
    let i = 0;

    const worker = async () => {
      while (i < texts.length) {
        const idx = i++;
        results[idx] = await this.embed(texts[idx]);
      }
    };

    const workers = Array.from(
      { length: Math.min(concurrency, texts.length) },
      () => worker(),
    );
    await Promise.all(workers);

    return results;
  }
}
