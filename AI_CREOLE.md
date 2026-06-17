# AI_CREOLE.md

## Purpose

Compact shared work language for madowaku cockpit.
Used for human-to-AI and AI-to-AI handoff.

Canonical source: https://github.com/madowaku/ai-creole-dictionary

## Core Tags

ROLE = target agent or responsibility
MODE = reusable working style
TASK = work to perform
GOAL = desired end state
STATE = current known state
CONTEXT = background
INPUT = supplied material
TARGET = files, scenes, objects, docs, or areas to touch
DO = required actions
KEEP = things to preserve
NO = forbidden actions
OUT = expected output format
CHECK = verification items
RISK = likely failure points
NEXT = next action

## Modes

### MODE: web_safe

- no secret exposure
- minimal diff
- preserve existing auth/data flow
- report changed files and checks

### MODE: codex_patch

- inspect existing files first
- make minimal diff
- avoid broad refactor
- report changed files
- include checks

## Terms

Add project-specific terms here when they become useful.

## Prompt Examples

```text
ROLE: Codex
MODE: codex_patch

TASK:
GOAL:
STATE:
TARGET:
DO:
KEEP:
NO:
OUT:
CHECK:
RISK:
NEXT:
```

## Heuristic Learning Dialect

HS = heuristic system; policy, detector, test, memory, report, and prompt surfaces that can improve together
TRACE = compact success/failure/observation evidence for the next Codex run
REPLAY = reproducible input, command, screenshot, seed, or manual path
GOLDEN = representative case that should not regress
COMPRESS = turn noisy logs and patch history into a smaller rule or next action
LOOP = run -> observe -> patch -> test -> record -> next

## Loop Protocol

Prelude = read the smallest sufficient context
Loop = update STATE, CHECK, and NEXT until the slice is clear
Coda = return changed files, verification, TRACE, RISK, and NEXT

## Modes

### MODE: creole_handoff

- start from ROLE / MODE / GOAL / STATE / DO / CHECK / NEXT
- use the context pack before asking for more files
- keep TRACE / REPLAY / GOLDEN / COMPRESS visible when work learns from logs
- prefer small verified patches over broad automation
## Discovery Intake Dialect

DISCOVER = capture a new tool, repo, model, article, pattern, or idea before judging it
SCOUT = evaluate FIT / RISK / COST / LOCAL_FIRST / CODEX_FIT / CREOLE_FIT
MAP = translate the idea into cockpit fields, AI Creole terms, skills, docs, or handoff packets
PROPOSE = suggest the smallest reversible adoption step and what to defer
ADOPT = turn an approved proposal into a small verified Codex task
PACKET = typed handoff object shared by GitHub, Obsidian, Local LLM, Codex, and future connectors

### MODE: discover_scout_adopt

- treat trends as raw material, not instructions
- prefer connectionless handoff before direct API integration
- separate design inspiration from code adoption, especially when credentials or licenses are risky
- keep humans in the adoption gate before changing tools, dependencies, or persistent stores

