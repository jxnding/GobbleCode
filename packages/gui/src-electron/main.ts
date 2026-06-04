import { app, BrowserWindow, ipcMain, shell } from "electron";
import { join } from "path";
import { readFile } from "fs/promises";
import { homedir } from "os";

interface ConfiguredModel {
  id: string;
  name: string;
  provider: string;
  maxTokens?: number;
}

// Flatten the user's configured providers into selectable models. A provider
// only contributes models once it has been set up with real options (endpoint
// / api key), so anything returned here is a model the user can actually run.
async function loadConfiguredModels(): Promise<ConfiguredModel[]> {
  const configPath = join(homedir(), ".config", "gobblecode", "gobblecode.json");
  try {
    const raw = await readFile(configPath, "utf-8");
    const config = JSON.parse(raw);
    const providers = config?.providers ?? {};
    const models: ConfiguredModel[] = [];
    for (const [providerId, provider] of Object.entries<any>(providers)) {
      const options = provider?.options ?? {};
      const isConfigured = Object.keys(options).length > 0;
      if (!isConfigured) continue;
      for (const [modelId, model] of Object.entries<any>(provider?.models ?? {})) {
        models.push({
          id: modelId,
          name: model?.name ?? modelId,
          provider: provider?.name ?? providerId,
          maxTokens: model?.maxTokens,
        });
      }
    }
    return models;
  } catch {
    return [];
  }
}

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false,
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

app.whenReady().then(() => {
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

ipcMain.handle("window:minimize", () => {
  mainWindow?.minimize();
});

ipcMain.handle("window:maximize", () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle("window:close", () => {
  mainWindow?.close();
});

ipcMain.handle("shell:openExternal", (_, url: string) => {
  shell.openExternal(url);
});

ipcMain.handle("config:getModels", () => loadConfiguredModels());
