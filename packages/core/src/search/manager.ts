import type { SearchResult, SearchQuery, SearchResponse, SearchProvider } from "./types.js";

export class SearchManager {
  private providers: Map<string, SearchProvider> = new Map();
  private cache: Map<string, SearchResponse> = new Map();

  constructor() {
    this.loadDefaults();
  }

  private loadDefaults(): void {
    const defaults: SearchProvider[] = [
      {
        id: "google",
        name: "Google",
        url: "https://www.google.com/search?q=",
        enabled: true,
        rateLimit: 100,
      },
      {
        id: "duckduckgo",
        name: "DuckDuckGo",
        url: "https://duckduckgo.com/?q=",
        enabled: true,
        rateLimit: 30,
      },
      {
        id: "perplexity",
        name: "Perplexity",
        url: "https://www.perplexity.ai/search?q=",
        enabled: true,
        rateLimit: 20,
      },
      {
        id: "github",
        name: "GitHub",
        url: "https://github.com/search?q=",
        enabled: true,
        rateLimit: 30,
      },
      {
        id: "stackoverflow",
        name: "Stack Overflow",
        url: "https://stackoverflow.com/search?q=",
        enabled: true,
        rateLimit: 30,
      },
    ];

    for (const provider of defaults) {
      this.providers.set(provider.id, provider);
    }
  }

  getProvider(id: string): SearchProvider | undefined {
    return this.providers.get(id);
  }

  listProviders(): SearchProvider[] {
    return Array.from(this.providers.values());
  }

  async search(query: SearchQuery): Promise<SearchResponse[]> {
    const cacheKey = JSON.stringify(query);
    const cached = this.cache.get(cacheKey);
    if (cached) return [cached];

    const providers = query.providers
      ? query.providers.map((id) => this.providers.get(id)).filter(Boolean)
      : Array.from(this.providers.values()).filter((p) => p.enabled);

    const results: SearchResponse[] = [];

    for (const provider of providers) {
      if (!provider) continue;

      try {
        const response = await this.searchProvider(provider, query);
        results.push(response);
        this.cache.set(cacheKey, response);
      } catch (error) {
        console.error(`Search failed for ${provider.name}:`, error);
      }
    }

    return results;
  }

  private async searchProvider(
    provider: SearchProvider,
    query: SearchQuery
  ): Promise<SearchResponse> {
    const url = `${provider.url}${encodeURIComponent(query.query)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "GobbleCode/0.1.0",
      },
    });

    const html = await response.text();
    const results = this.parseResults(html, provider.id);

    return {
      results: results.slice(0, query.maxResults || 10),
      provider: provider.id,
      timestamp: new Date().toISOString(),
      totalResults: results.length,
    };
  }

  private parseResults(html: string, providerId: string): SearchResult[] {
    const results: SearchResult[] = [];

    const titleRegex = /<h3[^>]*>(.*?)<\/h3>/gi;
    const linkRegex = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>/gi;
    const snippetRegex = /<span[^>]*class="[^"]*st[^"]*"[^>]*>(.*?)<\/span>/gi;

    let titleMatch;
    while ((titleMatch = titleRegex.exec(html)) !== null) {
      const linkMatch = linkRegex.exec(html);
      const snippetMatch = snippetRegex.exec(html);

      if (linkMatch) {
        results.push({
          title: this.cleanHtml(titleMatch[1]),
          url: linkMatch[1],
          snippet: snippetMatch ? this.cleanHtml(snippetMatch[1]) : "",
          source: providerId,
        });
      }
    }

    return results;
  }

  private cleanHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  }

  async searchWithBrowser(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    for (const provider of this.providers.values()) {
      if (!provider.enabled) continue;

      const url = `${provider.url}${encodeURIComponent(query)}`;
      results.push({
        title: `Search ${provider.name}: ${query}`,
        url,
        snippet: `Open in ${provider.name} to search for "${query}"`,
        source: provider.id,
      });
    }

    return results;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
