import type { EmbeddingProvider } from "../types.js";
import type { OpenAICompatConfig } from "../../config/types.js";

export class OpenAICompatEmbeddingProvider implements EmbeddingProvider {
  name = "openai-compat";
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor(config: OpenAICompatConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.model = config.model;
  }

  async embed(text: string): Promise<number[]> {
    const results = await this.embedBatch([text]);
    return results[0];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ model: this.model, input: texts }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI-compat embedding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.sort((a: any, b: any) => a.index - b.index).map((d: any) => d.embedding);
  }
}
