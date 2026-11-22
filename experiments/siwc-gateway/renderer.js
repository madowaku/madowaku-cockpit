const byId = (id) => document.getElementById(id);
const fields = ["sign-in", "reconsent", "disconnect", "usage", "refresh", "generate"];
const statuses = {
  disconnected: "未接続",
  connecting: "接続中",
  connected: "接続済み",
  reauth_required: "再認証が必要"
};

function render(state) {
  byId("status").textContent = (statuses[state.status] || "未接続") +
    (state.sharing ? " ・ ChatGPT利用枠の使用を許可済み" : " ・ 利用枠は未許可");
  byId("account").textContent = state.label || "";
  byId("notice").textContent = state.notice || "";
  byId("result").textContent = state.output || "ここに生成結果が表示されます。";

  const connected = state.ready && state.status === "connected";
  const canGenerate = connected && state.sharing && state.models.length > 0 && !state.busy;
  byId("sign-in").disabled = !state.ready || state.busy;
  byId("reconsent").disabled = !connected || state.sharing || state.busy;
  byId("disconnect").disabled = !connected || state.busy;
  byId("refresh").disabled = !connected || !state.sharing || state.busy;
  byId("generate").disabled = !canGenerate;
  byId("prompt").disabled = state.busy;

  const modelSelect = byId("model");
  const previouslySelected = modelSelect.value;
  modelSelect.replaceChildren();
  if (!state.models.length) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "接続後に取得";
    modelSelect.append(placeholder);
  }
  for (const model of state.models) {
    const option = document.createElement("option");
    option.value = model.slug;
    option.textContent = model.displayName;
    modelSelect.append(option);
  }
  if (state.models.some((model) => model.slug === previouslySelected)) {
    modelSelect.value = previouslySelected;
  }
  modelSelect.disabled = !canGenerate;
}

async function perform(action) {
  for (const id of fields) byId(id).disabled = true;
  try {
    const state = await action();
    if (state && typeof state === "object" && "status" in state) render(state);
  } catch {
    byId("notice").textContent = "操作に失敗しました。もう一度試してください。";
  }
}

byId("sign-in").addEventListener("click", () => perform(() => window.gateway.signIn()));
byId("reconsent").addEventListener("click", () => perform(() => window.gateway.reconsent()));
byId("disconnect").addEventListener("click", () => {
  if (window.confirm("ChatGPTとの接続を解除しますか？")) {
    void perform(() => window.gateway.disconnect());
  }
});
byId("refresh").addEventListener("click", () => perform(() => window.gateway.refreshModels()));
byId("usage").addEventListener("click", () => perform(() => window.gateway.openUsage()));
byId("generate").addEventListener("click", () => {
  void perform(() => window.gateway.generate(byId("prompt").value, byId("model").value));
});
window.gateway.onState(render);
void window.gateway.getState().then(render);
