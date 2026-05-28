import { z } from "zod";

export const EmbeddedChunkSchema = z.object({
  id: z.string(),
  filePath: z.string(),
  startLine: z.number(),
  endLine: z.number(),
  content: z.string(),
  embedding: z.array(z.number()),
  metadata: z.record(z.string()).optional(),
});
export type EmbeddedChunk = z.infer<typeof EmbeddedChunkSchema>;

export const SemanticIndexSchema = z.object({
  version: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  provider: z.string(),
  model: z.string(),
  chunks: z.array(EmbeddedChunkSchema),
  stats: z.object({
    totalChunks: z.number(),
    totalFiles: z.number(),
    totalTokens: z.number().optional(),
  }),
});
export type SemanticIndex = z.infer<typeof SemanticIndexSchema>;

export interface SemanticSearchResult {
  chunk: EmbeddedChunk;
  score: number;
}

export interface EmbeddingProvider {
  name: string;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}
