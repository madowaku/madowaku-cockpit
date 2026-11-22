import { app, BrowserWindow, ipcMain, safeStorage, session, shell } from "electron";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { hasSecureStorage, isAllowedAuthUrl, publicSession, validateGeneration } from "./policy.mjs";

const directory = dirname(fileURLToPath(import.meta.url));
const page = join(directory, "index.html");
const pageUrl = pathToFileURL(page).href;
const usageUrl = "https://chatgpt.com/settings/usage";

app.setName("madowaku AI Gateway M0.1");

let window;
let chatgpt;
let ChatGPTError;
const state = {
  ready: false,
  status: "disconnected",
  sharing: false,
  label: "",
  models: [],
  busy: false,
  output: "",
  notice: ""
};

function snapshot() {
  return { ...state, models: state.models.map((m) => ({ slug: m.slug, displayName: m.displayName })) };
}

function publish() {
  if (window && !window.isDestroyed() && !window.webContents.isLoadingMainFrame()) {
    window.webContents.send("gateway:state", snapshot());
  }
}

function safeError(error) {
  if (ChatGPTError && error instanceof ChatGPTError) {
    return String(error.message).slice(0, 300);
  }
  if (error instanceof Error && error.message.startsWith("入力は")) return error.message;
  if (error instanceof Error && error.message.startsWith("接続中のアカウント")) return error.message;
  return "操作を完了できませんでした。接続状態を確認して再試行してください。";
}

function storageAvailable() {
  const encrypted = safeStorage.isEncryptionAvailable();
  const backend = process.platform === "linux" ? safeStorage.getSelectedStorageBackend() : "";
  return hasSecureStorage(process.platform, encrypted, backend);
}

function encryptionProvider() {
  const requireEncryption = () => {
    if (!storageAvailable()) throw new Error("OS credential encryption is unavailable.");
  };
  return {
    id: "madowaku-electron-safe-storage-v1",
    isAvailable: storageAvailable,
    encrypt(plaintext) {
      requireEncryption();
      return safeStorage.encryptString(plaintext);
    },
    decrypt(ciphertext) {
      requireEncryption();
      return safeStorage.decryptString(Buffer.from(ciphertext));
    }
  };
}

async function syncSession() {
  const result = publicSession(await chatgpt.getSession());
  state.status = result.status;
  state.sharing = result.sharing;
  state.label = result.label;
  if (!state.sharing) state.models = [];
  publish();
}

async function fetchModels() {
  await syncSession();
  if (!state.sharing) {
    state.models = [];
    return;
  }
  const models = await chatgpt.listModels();
  state.models = models
    .filter((model) => typeof model.slug === "string" && typeof model.displayName === "string")
    .map((model) => ({ slug: model.slug, displayName: model.displayName }));
  publish();
}

async function run(action) {
  if (!chatgpt) return snapshot();
  if (state.busy) {
    state.notice = "別の操作が完了してから実行してください。";
    publish();
    return snapshot();
  }
  state.busy = true;
  state.notice = "";
  publish();
  try {
    await action();
  } catch (error) {
    state.notice = safeError(error);
    await syncSession().catch(() => {});
  } finally {
    state.busy = false;
    publish();
  }
  return snapshot();
}

function verifyCaller(event) {
  if (!window ||
      event.sender !== window.webContents ||
      event.senderFrame !== window.webContents.mainFrame ||
      event.senderFrame?.url !== pageUrl) {
    throw new Error("Unauthorized window.");
  }
}

function register(channel, action) {
  ipcMain.handle("gateway:" + channel, (event, ...args) => {
    verifyCaller(event);
    return action(...args);
  });
}

function registerIpc() {
  register("state", () => snapshot());
  register("sign-in", () => run(async () => {
    await chatgpt.signIn();
    await syncSession();
    if (state.sharing) await fetchModels();
  }));
  register("reconsent", () => run(async () => {
    await chatgpt.signIn({ reconsent: true });
    await syncSession();
    if (state.sharing) await fetchModels();
  }));
  register("models", () => run(() => fetchModels()));
  register("generate", (payload) => run(async () => {
    if (!state.sharing) throw new Error("Token sharing is not enabled.");
    const { input, model } = validateGeneration(payload?.prompt, payload?.model, state.models);
    state.output = "";
    publish();
    // Only user-clicked requests: no automatic generation, background task or API-key fallback.
    const completed = await chatgpt.streamResponse({
      model,
      input,
      instructions: "Reply briefly in Japanese. This is a one-request connection smoke test."
    });
    state.output = completed.text.slice(0, 8000);
  }));
  register("disconnect", () => run(async () => {
    await chatgpt.disconnect();
    state.output = "";
    state.models = [];
    await syncSession();
  }));
  register("usage", () => shell.openExternal(usageUrl).then(() => snapshot()));
}

async function initializeSdk() {
  if (!storageAvailable()) {
    state.notice = "OSの安全な資格情報保存が利用できないため、接続を無効にしました。";
    return;
  }
  try {
    // Local workspace dependency from the separately cloned official DevKit.
    const sdk = await import("@siwc/local");
    ChatGPTError = sdk.ChatGPTError;
    chatgpt = sdk.createChatGPT({
      appName: "madowaku AI Gateway",
      appId: "madowaku-siwc-gateway-m01",
      redirectPort: 0,
      storageDir: join(app.getPath("userData"), "chatgpt"),
      credentialEncryption: encryptionProvider(),
      openBrowser: async (url) => {
        if (!isAllowedAuthUrl(url)) throw new Error("Unexpected authorization URL.");
        await shell.openExternal(url);
      }
    });
    state.ready = true;
    await syncSession();
  } catch {
    state.ready = false;
    state.notice = "公式DevKitの読み込みに失敗しました。READMEのセットアップ手順を確認してください。";
  }
}

function createWindow() {
  window = new BrowserWindow({
    width: 700,
    height: 790,
    minWidth: 560,
    minHeight: 580,
    webPreferences: {
      preload: join(directory, "preload.cjs"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true
    }
  });
  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event) => event.preventDefault());
  window.removeMenu();
  void window.loadFile(page);
}

await app.whenReady();
session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
registerIpc();
await initializeSdk();
createWindow();
app.on("window-all-closed", () => app.quit());
app.on("before-quit", () => chatgpt?.cancelSignIn());
