import { z } from "zod";

export const SearchResultSchema = z.object({
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
  source: z.string(),
  relevance: z.number().optional(),
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

export const SearchQuerySchema = z.object({
  query: z.string(),
  providers: z.array(z.string()).optional(),
  maxResults: z.number().optional(),
  filters: z
    .object({
      dateRange: z.enum(["day", "week", "month", "year", "all"]).optional(),
      language: z.string().optional(),
      site: z.string().optional(),
    })
    .optional(),
});
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const SearchProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  enabled: z.boolean(),
  rateLimit: z.number().optional(),
});
export type SearchProvider = z.infer<typeof SearchProviderSchema>;

export interface SearchResponse {
  results: SearchResult[];
  provider: string;
  timestamp: string;
  totalResults: number;
}
