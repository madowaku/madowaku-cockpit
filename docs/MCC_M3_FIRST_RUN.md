# MCC-M3.0 Cockpit First Run / Harness Usability Bridge

## はじめる

MCCフォルダで Node.js 22以上とnpmを用意し、初回だけ `npm ci`、次に `npm run dev -- --host 127.0.0.1` を実行する。表示されたローカルURLを開く。

1. 「今日は何をしたいですか？」に目的を書く。例：素材を画面で見たい。
2. 候補を選ぶ。複数なら自分で選び、該当なしなら言い換える。入力だけでは操作を実行しない。
3. 準備・実行場所・期待する結果を読む。コマンドをコピーし、指定リポジトリの端末で実行する。
4. 端末の結果を確認し、結果欄を選ぶ。失敗なら診断と準備を再確認する。
5. 続きは既存のLogs / 次の一手に記録する。First Runの目的・選択・結果・診断はページを閉じると消える。既存のプロジェクト保存形式は変更しない。

初回診断はMCCの端末で以下を実行し、画面の「診断JSONを読み込む」で選ぶ。

```powershell
node scripts/first-run-doctor.mjs --projects-root "C:\Dev\Projects" > first-run-report.json
```

親フォルダ直下の既定の4リポジトリだけを検査する。独自のフォルダ名・複数の配置先の自動探索は未実装。診断の不足表示にはアクセス権不足も含む。Node未導入で診断が起動しない場合はNode 22以上を先に用意する。診断は24時間で古い扱いとなる。更新後は再診断する。

## GitHub調査（2026-10-22）

GitHub connectorでmainのREADME、package.jsonまたはpyproject.toml、CLI登録箇所を確認。下記は調査時点のmain参照。READMEの検証実績は過去の申告であり、この変更で再実行した結果とは区別する。

| 資産 / 調査ref | 何ができる / いつ使う | 起動 / 依存 | 実装・検証の境界 |
|---|---|---|---|
| [MCC](https://github.com/madowaku/madowaku-cockpit/tree/a42994ef89f0b8030ac40a28ed4c0699cfb7e2de) | 目的・文脈・レビューの保持、Codex/ローカルLLM/GitHub/Obsidianへの引き継ぎ、バックアップ | `npm ci` → `npm run dev`; React 19 / Vite 7 / TS / Node 22推奨 | UI・prompt生成・localStorage実装あり。各外部ツールの接続・実行は実装されていない。Plugin Readyは設計用文面 |
| MCC読み取り専用bridge | リポジトリを読み、context packを作る | `npm run mcp:local`; 確認は `npm run mcp:smoke` | 5ツール実装あり。shell/write/authなし。stdio smokeとChatGPTからの接続成功は別 |
| MCC UI Librarian Skills | UI設計時に既存のicon/font/component/motion資産を選ぶ | `skills/README.md`の手順でSkillフォルダを導入しCodexで呼ぶ | Skill資料あり。First Runからの自動インストール・実行はない |
| [MSO](https://github.com/madowaku/mado-system-one/tree/4d432daec107f00aefb97e8e834e0d9dd1738d18) | typed decisionの評価、比較、shadow、promotion、lineage、context整理 | `npm ci`; `npm run mso -- ...`; Node >=22 / TS、Layaはoptional peer | Replay/eval/複数provider境界はコードあり。live model・認証・費用・品質は今回未検証。READMEロードマップだけで利用可能とは判定しない |
| MSO無料エージェント実験 | 無料候補の資格評価・dogfood | ローカル作業ブランチに `dm:free-*` 等がある | 調査mainのpackage.jsonには当該scriptsなし。M3.0の起動候補にしない。無料モデルから有料モデルへのfallbackも追加しない |
| MSO Multi-Agent Forge | multi-agent契約・schema fixture | `docs/MADO_MULTI_AGENT_FORGE_SPEC.md` | MAFという略称がAsset Foundryと重なる。ForgeのロードマップとAsset Foundryの実装状態を混同しない |
| [MGSF](https://github.com/madowaku/mado-game-service-factory/tree/11c0a0e5043de89806052af00ac7158962d5ad00) | 試遊記録、capture、Godot adapter、証跡レポート | Python >=3.11 / PyYAML; `python -m pip install -e .`; `mgsf playtest-report <bundle>` / `mgsf gameplay-capture <capture-root>` | CLI登録あり。READMEのWindows preview検証は履歴。今回ゲーム操作・EXE・Godotを再検証していない |
| MGSF EdenSpark | 自律試作の計画・実行・評価・promotion gate | `mgsf edenspark-plan fixtures/edenspark/mission-neon-001.json`; live loopはCodexとEdenSpark MCPが別途必要 | plan/loopコードあり、incubation。fixtureはHOLD、live PASSにはrunner＋artifact証拠が必要。M3はplanだけ案内 |
| [MAF Asset Foundry](https://github.com/madowaku/mado-asset-foundry/tree/8d2558928dbf66744d12e937d6670f5ed2e4eacb) | 素材生成計画・curation・QA・package・Godot・権利レビュー | Python >=3.11; `python -m pip install -e .`; FastAPI/Pillow/Pydantic/PyYAML/Typer/Uvicorn/OpenAI SDK | CLIコードあり。生成providerには有料経路あり。`--live`や生成コマンドは本入口から案内しない |
| MAF素材Cockpit | 既存結果の一覧・画像と権利確認 | `maf cockpit serve --recipes recipes/asset-flows --workspace runs/asset-flows`; 127.0.0.1:4174 | 既存画面を流用。Godot未指定のread-only。READMEのE2E/golden実績は履歴、今回のローカル起動は未検証 |
| MAF Skills / VFX | intake、scan、registry、preflight、明示的なローカルprobe | `maf skill list` / `maf skill preflight <id>`; 実行にはpin済みtool/weights/Godot等 | intake_only/contract_only/readyは別。Stable Fast 3Dはcontract-only。TripoSR・VFXは別途準備とレビューが必要 |

参照したCLI source: MSO `src/cli.ts` blob `8905b2db53db780c12e27b98de91add9cc684aff`、MGSF `src/mgsf/cli.py` blob `ed31ffce63125add3d2ccd79077db72e18ff1b1f`、MAF `src/mado_asset_foundry/cockpit_cli.py` blob `6d7110f3967f921b1a9eb806ee5b1694c8e4e3c3`。

## 最小設計と境界

- `firstRunCatalog.json`を唯一の4候補カタログとして画面・診断で共有。自然言語はNFKC正規化と語句照合。曖昧なら複数候補、未知ならNONE。語句一致は実行許可にならない。
- 既存MCC内のReact部品。新サーバー・新agent・新provider・新依存なし。既存MCPのツールとセキュリティ境界を変更しない。
- doctorは明示された親フォルダから既知ファイルだけを読み、存在とSHA-256を出力。shell、network、環境変数、秘密、インストール、モデル呼出しなし。symlinkの外部逸脱と大きなファイルを拒否する。
- ブラウザは手動で選んだ最大32KBのJSONをローカルで解析。schema/date/候補ID/ファイル名/hash/状態整合を検査。外から持ち込まれたcommandやURLを操作にしない。
- `detected`はファイル検出のみ。依存解決・version互換・実行成功・実品質を意味しない。reportは署名済みattestationではなく、改変や24時間内の環境変化もありうる。
- 4コマンドはsmoke、explicit Replay、ミッションplan、read-only素材画面。生成・live loop・publishはない。実行は人間の端末。既存checkoutの変更やCLI差替えまでは保護できないため起動前に信頼できるソースを使う。
- 自動実行・実行ログ回収・意味理解LLM・依存自動修復・認証診断は未実装。First Runは案内・診断結果表示・自己申告後の次操作まで。人間が迷わないかの受入試験は別途必要。

## 品質ゲート / ロールバック

既存CIの `npm test` / `npm run build` / `npm run mcp:smoke` に新テストが含まれる。unknown/ambiguous/injection、古い/不正/重複report、不足ファイル、bounded read、symlink外部逸脱を検証する。手動browser journeyは [証跡](MCC_M3_VERIFICATION.md) に記録。

運用開始はまずローカル。取り消すにはFirstRun部品のimport/renderを外すかこのPRをrevertする。既存MCP、保存データ、各ハーネスは変更していない。自然言語を使わず4つの目的ボタンを直接選ぶBYPASSもある。
