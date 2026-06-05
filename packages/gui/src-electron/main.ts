import { app, BrowserWindow, ipcMain, shell } from "electron";
import { join } from "path";
import { ConfigManager, ModelManager, type GobbleCodeConfig } from "@gobblecode/core";

let mainWindow: BrowserWindow | null = null;
const configManager = new ConfigManager();
const modelManager = new ModelManager(configManager);

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
    backgroundColor: "#0a0a0a",
    show: false,
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (process.env["VITE_DEV_SERVER_URL"]) {
    mainWindow.loadURL(process.env["VITE_DEV_SERVER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(async () => {
  await configManager.load();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("shell:openExternal", (_, url: string) => {
  shell.openExternal(url);
});

ipcMain.handle("config:get", () => configManager.get());

ipcMain.handle("config:update", async (_, updates: Partial<GobbleCodeConfig>) => {
  return configManager.update(updates);
});

ipcMain.handle("config:getModels", () => modelManager.listModels());

ipcMain.handle("config:listProviders", () => modelManager.list());

ipcMain.handle("config:updateProvider", async (_, providerId: string, credentials: { apiKey?: string; baseURL?: string }) => {
  return modelManager.updateProvider(providerId, credentials);
});

ipcMain.handle("config:setProviderApiKey", async (_, providerId: string, apiKey: string) => {
  return modelManager.updateProvider(providerId, { apiKey });
});

ipcMain.handle("config:removeProviderCredentials", async (_, providerId: string) => {
  return modelManager.removeProviderCredentials(providerId);
});
