# MGSF Local Agent Bridge M0.1

**Status:** experimental, opt-in, read-only source review. This does not change the Cockpit UI and does not send source files to cloud APIs.

## Purpose
First probe for connecting local Antigravity SDK models to Godot project inspection. This is a deliberately small adapter, not a finished MCP orchestrator or autonomous code editor.

## Prerequisites
- Python supported by current `google-antigravity` and `litert-lm` wheels
- Compatible machine and imported LiteRT model; Google's Gemma 4 26B A4B example recommends >=24GB VRAM/shared memory and 64K context
- Antigravity SDK's native runtime is distributed in its PyPI wheels; cloning its source alone does not install it

## Run
```bash
cd experiments/local-agent-bridge
python -m unittest -v test_inspect_godot.py
python inspect_godot.py --project /path/to/godot-project --dry-run

python -m venv .venv
source .venv/bin/activate
pip install google-antigravity litert-lm

litert-lm import \
  --from-huggingface-repo=litert-community/gemma-4-26B-A4B-it-litert-lm \
  gemma-4-26B-A4B-it-gpu.litertlm \
  gemma4-26b

python inspect_godot.py --project /path/to/godot-project \
  --model-path ~/.litert-lm/models/gemma4-26b/model.litertlm
```

The script scans up to 20 ordinary `.gd` files, bounded to 12,000 characters per file / 60,000 overall, skips symlinks and hidden engine directories, then sends the collected source as *data* to a local model. It does not execute generated commands and makes no edits. Run on a copy of sensitive projects until the model/runtime is validated.

## Acceptance criteria
- [x] Offline source collection and SDK-free unit tests added
- [x] SDK adapter using `Agent(LiteRTAgentConfig(...).lightweight())` added
- [ ] Unit tests run in local checkout / CI
- [ ] Real LiteRT runtime + GPU smoke test
- [ ] Quality, latency, VRAM, and cost compared with a cloud-agent baseline
- [ ] Human-approved findings optionally ingested into Shared Brain
- [ ] Godot MCP and Game Test Player adapter with explicit permission boundary

## Design notes
Routing beyond LiteRT (Ollama, LM Studio, vLLM, Codex) is deferred until a separately tested configuration exists. Avoid assuming every OpenAI-compatible endpoint is SDK-compatible.

Official references:
- https://developers.googleblog.com/introducing-support-for-local-ai-models-in-the-antigravity-sdk/
- https://github.com/google-antigravity/antigravity-sdk-python
