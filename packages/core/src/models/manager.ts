import type { ConfigManager } from "../config/manager.js";
import type { GobbleCodeConfig, ModelProvider } from "../config/types.js";
import { ModelsCatalog, normalizeCatalogProvider } from "./catalog.js";
import type {
  ListedModel,
  ProviderCredentials,
  ProviderListResult,
  PublicProvider,
} from "./types.js";

function modelKey(providerId: string, modelId: string): string {
  return `${providerId}/${modelId}`;
}

function hasConfiguredOptions(options: Record<string, unknown>): boolean {
  return Object.entries(options).some(
    ([key, value]) =>
      key !== "timeout" &&
      key !== "baseURL" &&
      value !== undefined &&
      value !== null &&
      value !== "",
  );
}

function isConnectedViaEnv(
  env: string[],
  envVars: Record<string, string | undefined>,
): boolean {
  return env.some((name) => Boolean(envVars[name]));
}

function hasStoredApiKey(userProvider: ModelProvider | undefined): boolean {
  const key = userProvider?.options?.apiKey;
  return typeof key === "string" && key.length > 0;
}

function isProviderConnected(
  env: string[],
  userProvider: ModelProvider | undefined,
  envVars: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): boolean {
  if (isConnectedViaEnv(env, envVars)) return true;
  if (hasStoredApiKey(userProvider)) return true;
  if (userProvider && hasConfiguredOptions(userProvider.options ?? {})) return true;
  return false;
}

function resolveBaseURL(
  catalogApi: string | undefined,
  userProvider: ModelProvider | undefined,
): string | undefined {
  const override = userProvider?.options?.baseURL;
  if (typeof override === "string" && override.trim()) return override.trim();
  if (catalogApi) return catalogApi;
  return undefined;
}

function mergeProvider(
  catalogId: string,
  catalog: { id: string; name: string; env: string[]; npm?: string },
  userProvider: ModelProvider | undefined,
): ModelProvider {
  return {
    id: catalogId,
    name: userProvider?.name ?? catalog.name,
    npm: userProvider?.npm ?? catalog.npm ?? "",
    env: catalog.env,
    options: userProvider?.options ?? {},
    models: userProvider?.models ?? {},
  };
}

export class ModelManager {
  constructor(
    private configManager: ConfigManager,
    private catalog = new ModelsCatalog(),
  ) {}

  async list(envVars?: Record<string, string | undefined>): Promise<ProviderListResult> {
    const config = this.configManager.get();
    const catalog = await this.catalog.get();
    const disabled = new Set(config.disabledProviders ?? []);
    const enabled = config.enabledProviders ? new Set(config.enabledProviders) : undefined;

    const models: ListedModel[] = [];
    const providers: PublicProvider[] = [];
    const connected: string[] = [];

    for (const [providerId, raw] of Object.entries(catalog)) {
      if (enabled && !enabled.has(providerId)) continue;
      if (disabled.has(providerId)) continue;

      const normalized = normalizeCatalogProvider(providerId, raw);
      if (!normalized) continue;

      const userProvider = config.providers[providerId];
      const merged = mergeProvider(providerId, normalized, userProvider);
      const envVarsRecord = envVars ?? (process.env as Record<string, string | undefined>);
      const connectedViaEnv = isConnectedViaEnv(normalized.env, envVarsRecord);
      const providerConnected = isProviderConnected(normalized.env, merged, envVarsRecord);
      if (providerConnected) connected.push(providerId);

      const providerModels: ListedModel[] = [];
      for (const [modelId, model] of Object.entries(normalized.models)) {
        if (model.status === "deprecated") continue;
        const listed: ListedModel = {
          id: modelKey(providerId, modelId),
          modelId,
          providerId,
          name: model.name ?? modelId,
          provider: normalized.name,
          connected: providerConnected,
          maxTokens: model.limit?.output,
          contextWindow: model.limit?.context,
        };
        providerModels.push(listed);
        models.push(listed);
      }

      providerModels.sort((a, b) => a.name.localeCompare(b.name));

      providers.push({
        id: providerId,
        name: normalized.name,
        env: normalized.env,
        npm: normalized.npm,
        connected: providerConnected,
        modelCount: providerModels.length,
        catalogEndpoint: normalized.api,
        baseURL: resolveBaseURL(normalized.api, userProvider),
        hasStoredKey: hasStoredApiKey(userProvider),
        connectedViaEnv,
      });
    }

    providers.sort((a, b) => a.name.localeCompare(b.name));
    models.sort((a, b) => a.name.localeCompare(b.name));

    return {
      providers,
      models,
      connected,
      defaultModel: pickDefaultModel(config, models, connected),
    };
  }

  async listModels(envVars?: Record<string, string | undefined>): Promise<ListedModel[]> {
    const result = await this.list(envVars);
    return result.models;
  }

  async updateProvider(
    providerId: string,
    credentials: ProviderCredentials,
  ): Promise<ProviderListResult> {
    const catalog = await this.catalog.get();
    const raw = catalog[providerId];
    const normalized = raw ? normalizeCatalogProvider(providerId, raw) : null;
    const config = this.configManager.get();
    const existing = config.providers[providerId];
    const options: Record<string, unknown> = { ...(existing?.options ?? {}) };

    if (credentials.apiKey !== undefined && credentials.apiKey.trim()) {
      options.apiKey = credentials.apiKey.trim();
    }

    if (credentials.baseURL !== undefined) {
      const trimmed = credentials.baseURL.trim();
      if (trimmed) options.baseURL = trimmed;
      else delete options.baseURL;
    }

    const provider: ModelProvider = {
      id: providerId,
      name: normalized?.name ?? existing?.name ?? providerId,
      npm: normalized?.npm ?? existing?.npm ?? "",
      env: normalized?.env ?? existing?.env ?? [],
      options,
      models: existing?.models ?? {},
    };

    await this.configManager.update({
      providers: { ...config.providers, [providerId]: provider },
    });

    return this.list();
  }

  /** @deprecated Use updateProvider */
  async setProviderApiKey(providerId: string, apiKey: string): Promise<ProviderListResult> {
    return this.updateProvider(providerId, { apiKey });
  }

  async removeProviderCredentials(providerId: string): Promise<ProviderListResult> {
    const config = this.configManager.get();
    const existing = config.providers[providerId];
    if (!existing) return this.list();

    const { apiKey: _key, baseURL: _url, ...restOptions } = existing.options as Record<
      string,
      unknown
    >;
    await this.configManager.update({
      providers: {
        ...config.providers,
        [providerId]: { ...existing, options: restOptions },
      },
    });

    return this.list();
  }
}

function pickDefaultModel(
  config: GobbleCodeConfig,
  models: ListedModel[],
  connected: string[],
): string | null {
  if (config.defaultProvider && config.defaultModel) {
    const explicit = modelKey(config.defaultProvider, config.defaultModel);
    if (models.some((m) => m.id === explicit)) return explicit;
  }

  const connectedModels = models.filter((m) => connected.includes(m.providerId));
  if (connectedModels.length > 0) return connectedModels[0]!.id;

  return models[0]?.id ?? null;
}
