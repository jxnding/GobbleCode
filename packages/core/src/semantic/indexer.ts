import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { glob } from "glob";
import type { EmbeddingProvider, SemanticIndex, EmbeddedChunk, SemanticSearchResult } from "./types.js";
import { SemanticIndexSchema } from "./types.js";

const CHUNK_SIZE = 512; // tokens approx
const CHUNK_OVERLAP = 64;
const INDEX_FILE = "semantic-index.json";

export class SemanticIndexer {
  private provider: EmbeddingProvider;
  private projectRoot: string;

  constructor(provider: EmbeddingProvider, projectRoot: string) {
    this.provider = provider;
    this.projectRoot = projectRoot;
  }

  async buildIndex(progress?: (msg: string) => void): Promise<SemanticIndex> {
    progress?.("Scanning files...");

    const files = await this.scanFiles();
    progress?.(`Found ${files.length} files`);

    const chunks: EmbeddedChunk[] = [];
    let totalFiles = 0;

    for (const file of files) {
      try {
        const content = await readFile(file, "utf-8");
        const fileChunks = this.chunkFile(file, content);
        chunks.push(...fileChunks);
        totalFiles++;
        progress?.(`Chunked ${totalFiles}/${files.length}: ${relative(this.projectRoot, file)}`);
      } catch {
        // Skip binary or unreadable files
      }
    }

    progress?.(`Embedding ${chunks.length} chunks...`);

    // Batch embed
    const texts = chunks.map((c) => c.content);
    const embeddings = await this.provider.embedBatch(texts);

    if (embeddings.length !== chunks.length) {
      throw new Error(
        `Embedding count mismatch: expected ${chunks.length}, got ${embeddings.length}`,
      );
    }

    for (let i = 0; i < chunks.length; i++) {
      chunks[i].embedding = embeddings[i];
    }

    const index: SemanticIndex = {
      version: "1.0.0",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      provider: this.provider.name,
      model: this.provider.model,
      chunks,
      stats: {
        totalChunks: chunks.length,
        totalFiles,
      },
    };

    // Save index
    const indexPath = join(this.projectRoot, ".gobblecode", INDEX_FILE);
    await mkdir(join(this.projectRoot, ".gobblecode"), { recursive: true });
    await writeFile(indexPath, JSON.stringify(index));

    progress?.(`Index saved: ${chunks.length} chunks from ${totalFiles} files`);
    return index;
  }

  async loadIndex(): Promise<SemanticIndex | null> {
    try {
      const indexPath = join(this.projectRoot, ".gobblecode", INDEX_FILE);
      const data = await readFile(indexPath, "utf-8");
      const parsed = JSON.parse(data);
      return SemanticIndexSchema.parse(parsed);
    } catch {
      return null;
    }
  }

  async query(query: string, topK = 5): Promise<SemanticSearchResult[]> {
    const index = await this.loadIndex();
    if (!index) {
      throw new Error("No semantic index found. Run 'gobblecode index' first.");
    }

    const queryEmbedding = await this.provider.embed(query);

    const results: SemanticSearchResult[] = index.chunks.map((chunk) => ({
      chunk,
      score: this.cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  private async scanFiles(): Promise<string[]> {
    const patterns = [
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx",
      "**/*.json",
      "**/*.md",
      "**/*.yaml",
      "**/*.yml",
      "**/*.css",
      "**/*.html",
    ];

    const ignore = [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.git/**",
      "**/.gobblecode/**",
      "**/coverage/**",
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: this.projectRoot,
        absolute: true,
        ignore,
      });
      files.push(...matches);
    }

    const unique = [...new Set(files)];
    return this.filterBySize(unique);
  }

  private async filterBySize(files: string[]): Promise<string[]> {
    const MAX_FILE_SIZE = 100 * 1024; // 100KB
    const filesWithSize = await Promise.all(
      files.map(async (f) => {
        try {
          const s = await stat(f);
          return { path: f, size: s.size };
        } catch {
          return { path: f, size: Infinity };
        }
      }),
    );
    return filesWithSize.filter((f) => f.size <= MAX_FILE_SIZE).map((f) => f.path);
  }

  private chunkFile(filePath: string, content: string): EmbeddedChunk[] {
    const lines = content.split("\n");
    const chunks: EmbeddedChunk[] = [];
    const relativePath = relative(this.projectRoot, filePath);

    for (let i = 0; i < lines.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
      const end = Math.min(i + CHUNK_SIZE, lines.length);
      const chunkLines = lines.slice(i, end);
      const chunkContent = chunkLines.join("\n");

      if (chunkContent.trim().length === 0) continue;

      chunks.push({
        id: `${relativePath}:${i + 1}-${end}`,
        filePath: relativePath,
        startLine: i + 1,
        endLine: end,
        content: chunkContent,
        embedding: [], // Will be filled later
      });
    }

    return chunks;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}
