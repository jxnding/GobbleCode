export interface CatalogModel {
  id: string;
  name: string;
  limit?: {
    context?: number;
    output?: number;
  };
  status?: string;
}

export interface CatalogProvider {
  id: string;
  name: string;
  env: string[];
  npm?: string;
  api?: string;
  models: Record<string, CatalogModel>;
}

export type CatalogRecord = Record<string, CatalogProvider>;

export interface ListedModel {
  /** Composite id: `providerId/modelId` */
  id: string;
  modelId: string;
  providerId: string;
  name: string;
  provider: string;
  connected: boolean;
  maxTokens?: number;
  contextWindow?: number;
}

export interface ProviderCredentials {
  apiKey?: string;
  baseURL?: string;
}

export interface PublicProvider {
  id: string;
  name: string;
  env: string[];
  npm?: string;
  connected: boolean;
  modelCount: number;
  /** Default endpoint from models.dev catalog */
  catalogEndpoint?: string;
  /** User override from config, or catalog default when set */
  baseURL?: string;
  hasStoredKey: boolean;
  connectedViaEnv: boolean;
}

export interface ProviderListResult {
  providers: PublicProvider[];
  models: ListedModel[];
  connected: string[];
  defaultModel: string | null;
}
