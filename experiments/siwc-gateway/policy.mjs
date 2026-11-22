// Pure policy layer: safe to test without Electron, credentials or a network.
const AUTH_ORIGIN = "https://auth.openai.com";
const LINUX_SECURE_BACKENDS = new Set(["gnome_libsecret", "kwallet", "kwallet5", "kwallet6"]);
const SESSION_STATUSES = new Set(["disconnected", "connecting", "connected", "reauth_required"]);

export function isAllowedAuthUrl(value) {
  try {
    const url = new URL(value);
    return url.origin === AUTH_ORIGIN && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function hasSecureStorage(platform, encryptionAvailable, backend) {
  if (!encryptionAvailable) return false;
  return platform !== "linux" || LINUX_SECURE_BACKENDS.has(backend);
}

// Explicitly pick safe fields. Never send SDK objects, tokens or errors through IPC.
export function publicSession(input) {
  const status = SESSION_STATUSES.has(input?.status) ? input.status : "disconnected";
  return {
    status,
    sharing: status === "connected" && input?.sharing === true,
    label: typeof input?.profileLabel === "string" ? input.profileLabel.slice(0, 100) : ""
  };
}

export function validateGeneration(input, model, availableModels) {
  if (typeof input !== "string" || input.trim().length < 1 || input.length > 500) {
    throw new Error("入力は1〜500文字にしてください。");
  }
  if (typeof model !== "string" ||
      !Array.isArray(availableModels) ||
      !availableModels.some((item) => item.slug === model)) {
    throw new Error("接続中のアカウントで利用可能なモデルを選んでください。");
  }
  return { input: input.trim(), model };
}
