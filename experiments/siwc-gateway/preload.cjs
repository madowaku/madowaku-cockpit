const { contextBridge, ipcRenderer } = require("electron");

const call = (action, payload) => ipcRenderer.invoke("gateway:" + action, payload);
contextBridge.exposeInMainWorld("gateway", Object.freeze({
  getState: () => call("state"),
  signIn: () => call("sign-in"),
  reconsent: () => call("reconsent"),
  refreshModels: () => call("models"),
  generate: (prompt, model) => call("generate", { prompt, model }),
  disconnect: () => call("disconnect"),
  openUsage: () => call("usage"),
  onState: (callback) => {
    if (typeof callback !== "function") throw new Error("A listener is required.");
    const listener = (_event, value) => callback(value);
    ipcRenderer.on("gateway:state", listener);
    return () => ipcRenderer.removeListener("gateway:state", listener);
  }
}));
