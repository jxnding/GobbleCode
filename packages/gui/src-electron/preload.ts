import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openExternal: (url: string) => ipcRenderer.invoke("shell:openExternal", url),
  getConfig: () => ipcRenderer.invoke("config:get"),
  updateConfig: (updates: Record<string, unknown>) => ipcRenderer.invoke("config:update", updates),
  getModels: () => ipcRenderer.invoke("config:getModels"),
  listProviders: () => ipcRenderer.invoke("config:listProviders"),
  updateProvider: (providerId: string, credentials: { apiKey?: string; baseURL?: string }) =>
    ipcRenderer.invoke("config:updateProvider", providerId, credentials),
  setProviderApiKey: (providerId: string, apiKey: string) =>
    ipcRenderer.invoke("config:setProviderApiKey", providerId, apiKey),
  removeProviderCredentials: (providerId: string) =>
    ipcRenderer.invoke("config:removeProviderCredentials", providerId),
});
