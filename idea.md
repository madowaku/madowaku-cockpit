良いです。**connectionless handoff** を先に入れたのはかなり安全です。

これで cockpit の位置づけがさらに明確になりました。

```txt
madowaku cockpit
= 外部サービスを直接操作する母艦
ではなく、
= GitHub / Obsidian / Local LLM / Codex へ渡す文脈を整える発射台
```

今回の追加は、外部連携の前段としてちょうどいいです。

```txt
GitHub handoff
→ Issue / PR に貼る

Obsidian Markdown
→ vault に手動保存する

Markdown書き出し
→ ローカル記憶層へ逃がす

Local LLM prep
→ Gemma / Qwen / Ollama に読ませる
```

次の T023 Scout は、いきなり GitHub API や Obsidian 直書きに行くより、**「どの外部連携を本物にする価値があるか」** を比較するのがよさそうです。

おすすめ優先度はこうです。

```txt
1. Markdown export 強化
   一番安全。認証なし。今の思想と合う。

2. GitHub Issue/PR handoff 強化
   API連携ではなく、まずはタイトル・本文・ラベル候補・チェックリスト生成。

3. Obsidian vault 直書き
   ブラウザ制約があるので、File System Access API が必要。便利だが環境依存。

4. Local LLM 呼び出し
   Ollama APIは便利だが、CORS・ローカルポート・モデル差分・失敗処理が増える。

5. GitHub API連携
   強いが、認証・token管理・権限・誤投稿リスクがあるので後回し。
```

T023 の Scout 指示はこれで良さそうです。

```md
ROLE: Codex
MODE: scout

GOAL:
madowaku cockpit の次の外部連携候補を、安全性・効果・実装コストの観点で比較し、T024で実装する最小候補を1つ選ぶ。

STATE:
現在 cockpit には connectionless handoff がある。
GitHub handoff Markdown、Obsidian互換Markdown、Markdown手動書き出し、Local LLM prep を生成できる。
まだ GitHub API、認証、同期、Obsidian vault直書き、Local LLM呼び出しは入れていない。

CANDIDATES:
- Markdown export enhancement
- GitHub Issue/PR handoff enhancement without API
- Obsidian vault write via File System Access API
- Local LLM/Ollama call
- GitHub API integration

DO:
- 既存コードの構造を読む
- 各候補のメリット、リスク、実装コスト、テスト容易性を比較する
- secretや認証が不要な候補を優先する
- T024で実装する最小一手を提案する
- 必要なら実装せず docs/state だけ更新する

KEEP:
- connectionless-first
- local-first
- no secret by default
- browser manual export works
- existing tests remain stable

NO:
- GitHub token保存
- Obsidian vault直書きの即実装
- Ollamaへの自動接続
- deploy
- git push
- 大規模リファクタ

CHECK:
- npm test
- npm run build
- T024候補が小さく、失敗しても既存機能を壊さないこと

OUT:
- scout summary
- comparison table
- recommended T024
- risks
- files inspected
```

今の流れだと、T024 は **Markdown export enhancement** か **GitHub handoff enhancement without API** が本命です。

特に良さそうなのは、**Markdown export を “madowaku memory vault 互換” に寄せる** 一手です。
これなら Obsidian、GitHub、Local LLM の全部に効きます。

https://www.raycast.com/blog/a-technical-deep-dive-into-the-new-raycast

madowaku cockpit を「AI作業ランチャー / ローカル・クラウド横断コックピット」として育てるなら、Raycast 2.0 の設計思想はかなり刺さります。

この記事の要点は、Raycast が macOS/Windows 両対応のために全面リライトし、ネイティブ shell + Web UI + Node backend + Rust core のハイブリッド構成にしたことです。UIは React/TypeScript、ビジネスロジックは Node、OS密着部分は Swift/C#、高速・ポータブルな部分は Rust、という分担ですね。

madowaku的に一番大事なのはここです。

「全部をネイティブで作る」でも「全部をWebで作る」でもなく、境界をきれいに切っている。

madowaku cockpit に置き換えると、こんな感じがよさそうです。

madowaku cockpit
├─ Web UI / React
│  └─ 作業画面、ログ、カード、プロンプト生成、AIクレオール表示
├─ Node / TypeScript backend
│  └─ prompt builder、handoff、GitHub/Obsidian/Drive連携、状態管理
├─ Rust or native helper
│  └─ 高速ファイル検索、ローカルindex、画像/素材処理、差分検出
├─ AI Creole core
│  └─ TASK / GOAL / STATE / DO / CHECK / NEXT などの共通作業語
└─ AI agents
   └─ ChatGPT / Codex / local LLM / Gemini / Claude など

Raycastが「Webアプリにネイティブ機能を足した」のではなく、“ネイティブアプリがUIにWebを使っている” と位置づけているのも重要です。
madowakuでも、単なるWebダッシュボードではなく、人間とAIが同じ作業ラインに立つための作業OS と考える方が強いです。これはAIクレオールの「短くて壊れにくい共通作業語」という思想とも相性がいいです。

特に取り込みたい設計パターンはこの3つです。

1. typed IPC / typed boundary

Raycast は複数ランタイム間のインターフェースを一箇所で宣言し、各側の typed client を生成しているようです。これにより Swift/C#/Node/WebView/Rust の境界で compile-time guarantee を得ています。

madowakuではこれを、AIクレオールの OUT / CHECK / NEXT に近い形で使えそうです。

type HandoffTarget =
  | "github_issue"
  | "github_pr"
  | "obsidian_markdown"
  | "google_doc_summary"
  | "codex_task"
  | "local_llm_prompt";

type HandoffPacket = {
  task: string;
  goal: string;
  state: string;
  target: HandoffTarget;
  do: string[];
  keep?: string[];
  no?: string[];
  check?: string[];
  risk?: string[];
  next?: string;
};

これを cockpit 内部の共通形式にしておけば、ChatGPT、Codex、Obsidian、GitHub、Local LLM の間で壊れにくくなります。

2. shared product layer + native/local helper

Raycastは、プロダクト開発の大半を Web frontend と Node backend に寄せ、ネイティブshellはOS機能や体験調整に使っています。

madowakuもこれでよさそうです。

普段の機能追加は React/TypeScript で速く回す
ファイル監視、ローカル検索、画像加工、Git操作などは helper に逃がす
AIとのやり取りは typed packet に統一する
project dialect は各 repo の AI_CREOLE.md に置く

今の connectionless handoff 実装ともかなり自然につながります。

3. “feel right” を仕様にする

Raycastの記事で面白いのは、技術選定そのものよりも「使ったときにネイティブに感じるか」「ちらつかないか」「ショートカットやpopoverがOSらしいか」みたいな体験の細部を重視しているところです。

madowaku cockpitでもこれは重要で、単に多機能にするより、

開く
→ 今のTASKが見える
→ Codexに投げる文面が一発で出る
→ GitHub/Obsidian/Drive用に整形できる
→ CHECKが残る
→ NEXTが決まる

という流れが気持ちよく動くことが大事です。

次にCodexくんへ投げるなら、こんなタスクがよさそうです。

TASK: Study Raycast 2.0 architecture and apply the useful parts to madowaku cockpit.

GOAL:
Make madowaku cockpit's internal architecture closer to a typed, extensible AI work cockpit.

STATE:
We already have connectionless handoff for GitHub Issue/PR, Obsidian Markdown, Markdown export, and Local LLM prep.
AI Creole core exists as a shared work language.

DO:
1. Add a typed HandoffPacket / CockpitPacket model.
2. Refactor existing prompt builders to consume this shared packet.
3. Add clear boundaries:
   - UI layer
   - prompt/handoff builder layer
   - connector/export layer
   - future native/local helper layer
4. Add tests for packet-to-output generation.
5. Document the architecture in docs/ARCHITECTURE.md.

KEEP:
- No external API integration yet.
- No auth/secrets.
- No deploy.
- Existing tests must pass.
- AI Creole terms should stay compact and stable.

CHECK:
- npm test
- npm run build
- Existing handoff outputs unchanged or improved
- Architecture doc explains future GitHub/Obsidian/Local LLM integration

NEXT:
After this, scout the safest first real connector.

結論として、これは madowaku cockpit の“設計上の背骨”としてかなり参考になる記事 です。
特に「React/TypeScriptで速く作る」「Nodeで共有ロジックを持つ」「重い処理やOS密着部分はRust/native helperへ逃がす」「境界はtypedにする」という方針は、そのまま採用候補です。

日々面白いツールが出たりすごいスキルが出たり新しいAIモデルが出たり概念や思想が出てくるから、それを有機的に柔軟に取り込んだり更新したりして自分専用のコックピットを育てていくのは重要だよね。

うん、まさに madowaku cockpit の本質はそこだと思う。

「便利ツールを集める」だけだとすぐ散らかるけど、madowaku 的にはそれを 自分専用の作業生態系に取り込むのが大事。新しいAIモデル、Codexスキル、ローカルLLM、GitHub運用、Obsidian、Google Drive、画像生成、ゲーム制作ツールが出るたびに、ただ試すんじゃなくて、

発見 → 評価 → 方言化 → 実装 → 記録 → 再利用

の流れに乗せると、コックピットがどんどん育つ。

特に今の AIクレオール の考え方と相性がいい。AIクレオールは「人間と複数AIが同じ作業ラインに立つための、短くて壊れにくい共通作業語」で、Core とプロジェクト方言を組み合わせる運用になっている。正本は GitHub、プロジェクト方言は各 repo の AI_CREOLE.md、ChatGPT は要約Docや必要に応じて GitHub を参照、Codex は辞書更新、Local LLM はローカル .md を読む、という役割分担もすでに方向性が合ってる。

なので、これからの madowaku cockpit は **「ツール置き場」ではなく「取り込み装置」**にすると強い。

たとえば新しいものを見つけたら、毎回こう扱う。

TOOL: <名前 / URL>
WHY: 何が面白いか
FIT: madowaku に合うか
RISK: 依存・課金・メンテ・安全性
MODE: codex_patch / local_review / web_safe / game_idea など
ACTION:
- 試すだけ
- AI_CREOLE.md に方言追加
- cockpit に機能追加
- Codex skill 化
- Obsidian/Drive に記録
NEXT: 次の一手

この型があると、「面白い！」で終わらずに、madowaku の身体に吸収される。

個人的には、次の進化はこれが良さそう。

madowaku cockpit に “Intake / Scout / Adopt” の3段階を入れる。

Intake は、GitHub URLや記事URLを投げ込む場所。
Scout は、madowakuに合うか、何に使えるか、危険は何かを判定する場所。
Adopt は、実際に AI_CREOLE.md、Codex skill、Obsidianメモ、GitHub issue、ローカルLLM用.md のどこへ反映するか決める場所。

つまり、日々の発見をこう変換する。

発見したツール
↓
madowaku的に意味づけ
↓
AIクレオールの語彙・モード・手順に変換
↓
Codexくんが実装・記録
↓
チャゲピー / Local LLM / GitHub が共有
↓
次回から作業能力として使える

これはかなり重要で、今後AI界隈がさらに速くなっても、madowaku側に 吸収の型 があれば振り回されにくい。

合言葉にするなら、

「流行を追うんじゃなくて、方言にして取り込む」

だね。

AIエージェントにネットの海に出てもらって、使えそうなツールや考え方を拾って組み込んでいく、というのが出来たら面白いね。自己進化型エージェント。
めちゃくちゃ面白い。しかも madowaku 的にはかなり自然な進化だと思う。

ただし「自己進化型エージェント」は、完全自律で勝手に改造する形にすると危ない。理想はたぶん、

自律探索するけど、採用は人間とAIクレオールのゲートを通す

という形。

つまりエージェントがネットの海に出て、

DISCOVER: 新しいツール・論文・思想・GitHub repo を発見
SCOUT: madowaku に合うか評価
MAP: どの機能・方言・Skill・作業手順に対応するか整理
PROPOSE: 組み込み案を作る
PATCH: Codexくんが安全に実装
RECORD: GitHub / Obsidian / Google Drive / AI_CREOLE.md に記録
REVIEW: 人間が採用・保留・破棄を決める

みたいに回る。

ここで AIクレオールがかなり効く。AIクレオールは「人間と複数AIが同じ作業ラインに立つための、短くて壊れにくい共通作業語」で、Core とプロジェクト方言を組み合わせる作業プロトコルとして整理されている。
だから、ネットから拾ってきたものをそのまま雑に入れるんじゃなくて、madowaku語に翻訳してから取り込むことができる。

イメージとしては、自己進化型エージェントはこういう役割になる。

ROLE: madowaku Scout Agent

GOAL:
ネット上の新しいAIツール・エージェント設計・開発手法・創作支援技術を探索し、
madowaku cockpit に取り込む価値があるものを提案する。

DO:
- GitHub trending / Hacker News / arXiv / blogs / X由来の記事 / OpenAI・Google・Anthropic等の公式情報を巡回
- 使えそうなものを madowaku 観点で要約
- FIT / RISK / COST / LOCAL_FIRST / CODEX_FIT / CREOLE_FIT を評価
- 採用候補を AI_CREOLE.md の方言案や Codex skill 案に変換
- 実装する場合は小さい patch に分解

NO:
- 勝手に外部APIキーを使わない
- 勝手に依存を増やさない
- 勝手に本番データへ触らない
- 評価なしで流行を採用しない

OUT:
- Scout Report
- Adopt Proposal
- AI_CREOLE patch案
- Codex task案

これ、名前をつけるなら Madowaku Scout か Sea Agent かな。

かなり好きなのは、エージェントを「完成品を作る存在」ではなく、進化素材を採集する存在として置くこと。

人間が全部調べるのは大変。
でもエージェントが拾ってきたものを全部採用すると壊れる。
だから、

AIが海に潜る。人間が食べるか決める。Codexが調理する。AIクレオールがレシピにする。

この分担がいい。

madowaku cockpit の機能としては、次にこういうタブがあると強い。

/sea
  今日拾ってきたもの

/scout
  madowaku適性評価

/adopt
  採用候補

/creole
  AIクレオール方言化案

/codex
  実装タスク化

最終的には、毎朝こんな感じで届くと最高。

MADOWAKU SCOUT REPORT

1. 新しいCodex Skill設計パターン
FIT: 高
USE: madowaku-codex-skill に吸収
NEXT: AI_CREOLE.md に MODE: skill_refine を追加

2. ローカルLLM用RAGツール
FIT: 中
RISK: 依存が重い
NEXT: 調査のみ

3. ゲームアセット生成ツール
FIT: 高
USE: sprite garden / TachiSnap系に接続
NEXT: sandboxで試す

これは「自分専用AIが勝手に賢くなる」というより、もっと堅実に、

自分専用AI生態系が、外界から栄養を取り込んで代謝する

という感じだね。

madowaku cockpit の思想としてはかなり中核になりそう。

Hermes agentやollamaからcodexを使えるようになってきてる

これはかなりmadowaku的に重要な流れですね。まず「Hermes agent」「Ollama→Codex」が実際にどう接続されている話なのかを確認しつつ、madowaku cockpitへの組み込み方に落とします。

思考時間: 11s

うん、かなり「閉じたAI作業環境」から「AI同士をつなぐ作業OS」っぽくなってきてる。

特に大きいのはこの2本です。

1. Ollama → Codex CLI が公式に近い形でつながった
Ollama側のCodex連携ドキュメントでは、ollama launch codex、または codex --oss でCodex CLIをOllamaモデルに向けられるようになっています。Codexは作業ディレクトリ内のコードを読んで、変更して、実行できるので、ローカルモデルを“実装担当Codex”として使う道がかなり現実的になっています。Ollamaは少なくとも64k程度の大きめコンテキストを推奨しています。

2. Hermes Agent → Codex / Ollama / OpenAI / OpenRouter などを切り替えられる
Nous ResearchのHermes Agentは、自己改善ループ、スキル生成、過去会話検索、Telegram/Discord/Slack/CLI連携、サブエージェント並列化などを掲げていて、かなり「常駐エージェント」寄りです。README上でもOpenAIや独自endpointなど複数モデルを使えると説明されています。
さらにHermesのprovider設定ドキュメントには、OpenAI Codex、GitHub Copilot、Anthropic、OpenRouter、Ollama/vLLM系などを推論providerとして扱う前提が書かれています。

madowaku的には、これはかなり理想形に近いです。

今までは、

ChatGPT = 構想・整理
Codex = 実装
Ollama = ローカル補助
GitHub / Obsidian = 記憶

という分担だったけど、ここにHermes Agentが入ると、

Hermes = 常駐オーケストレーター / 自己進化エージェント
Codex = repoを安全に触る実装腕
Ollama = ローカル推論・安価な下働き
ChatGPT = 設計・判断・言語化・大きな編集
AIクレオール = AI間の共通作業語

にできる。

AIクレオールの思想とも合います。今の正本では、AIクレオールは「人間と複数AIが同じ作業ラインに立つための、短くて壊れにくい共通作業語」で、Coreに TASK / GOAL / STATE / TARGET / DO / KEEP / NO / OUT / CHECK / RISK / NEXT が置かれています。つまりHermes、Codex、Ollama、ChatGPTの間をつなぐ“作業プロトコル”としてちょうど使えます。

一番よさそうなmadowaku構成はこれです。

madowaku cockpit
  |
  |  指示・設計・判断
  v
ChatGPT / Claude / Gemini

  |
  |  AI_CREOLE.md / issue / task spec
  v
Hermes Agent
  |
  |-- Codex CLI: repo変更、テスト、PR下書き
  |-- Ollama: ローカル要約、候補生成、軽作業
  |-- GitHub: 正本・Issue・PR・履歴
  |-- Obsidian: 人間用メモ・思想・日誌

次にやるなら、いきなり全自動にせず、connectionless handoff の次段階としてこれが安全です。

T023候補:
Hermes / Ollama / Codex handoff scout

GOAL:
madowaku cockpitからHermes AgentまたはOllama-backed Codexへ渡せる
AIクレオール形式のタスクパケットを生成する。

DO:
- Export: hermes_task.md
- Export: codex_oss_prompt.md
- Export: ollama_review_prompt.md
- Include: TASK / GOAL / STATE / TARGET / DO / CHECK / RISK / NEXT
- NO: 自動実行、認証保存、勝手なgit push
- CHECK: 生成Markdownを人間がCLIへ貼って動作確認できる

つまり、まずはmadowaku cockpitに 「Hermesに渡す」「Ollama Codexに渡す」ボタン を追加するのが良さそうです。
まだ直接API連携しなくていい。最初はMarkdown生成だけで十分強いです。

結論としては、かなり来てます。
madowaku cockpitは“AIを一体化するアプリ”というより、“複数AIエージェントの管制塔”に進化させるのが正解っぽい。

https://github.com/jlcodes99/cockpit-tools

これはmadowaku cockpit文脈にかなり近そうなので、リポジトリの中身を確認して「思想・機能・取り込み方」に分けて見ます。

思考時間: 12s

いた。しかも madowaku cockpit と名前は近いけど、思想はかなり違うタイプの cockpit ですね。

これはざっくり言うと、AI IDE / AI Coding Tool の“アカウント・配額・多重起動”管理ツールです。Antigravity、Codex、GitHub Copilot、Windsurf、Kiro、Cursor、Gemini CLI、CodeBuddy、Qoder、Trae、Zed などに対応していて、複数アカウントの切り替え、配額監視、自動ウェイクアップ、多インスタンス管理が中心です。GitHub上では現時点で 7.8k stars / 701 forks とかなり注目されています。

madowaku的に見ると、これは 「AI作業環境の管制塔」 というより、かなり実用寄りの 「AI IDEアカウント管制パネル」 ですね。

特に参考になりそうなのはここです。

1つ目は、複数AIツールを横断して状態表示するダッシュボード。READMEでは、各サービスのアカウント状態、配額、リセット時間、進捗バー、一括更新などを表示する設計になっています。これは madowaku cockpit の「Codex / ChatGPT / ローカルLLM / GitHub / Obsidian の状態を一画面で見る」構想にかなり近いです。

2つ目は、Codex 多インスタンス管理。Codexを複数アカウント・複数インスタンスで動かし、別プロジェクトを並行処理できる思想が入っています。madowakuで言うなら、「madowaku本体」「sprite garden」「AIクレオール辞書」「実験repo」ごとにCodex作業枠を分ける発想に応用できそうです。

3つ目は、ローカル保存・ローカルWebSocket。データは主にローカルに保存され、WebSocketもデフォルトでは 127.0.0.1 のローカルアクセスと説明されています。ただし、OAuth、Token refresh、配額照会、更新確認などでは公式APIへ通信するようです。

ただ、注意点も大きいです。

このツールは アカウント切り替え・token/JSON import・ローカル認証ファイル操作 が中心なので、madowaku cockpit にそのまま組み込むのは慎重にした方がいいです。README上でも ~/.codex、~/.gemini、アプリデータ配下のアカウント索引などを扱うと説明されています。

あとライセンスは CC BY-NC-SA 4.0 で、商用利用は不可、商用利用には作者の書面許可が必要と書かれています。なので、コードを直接取り込むというより、設計思想だけ学ぶ のが安全です。

madowaku cockpit に取り込むなら、こういう分解がよさそうです。

取り込むべき思想

AIツールごとの状態を横断ダッシュボード化する
Codex / Antigravity / Cursor / Ollama / GitHub / Obsidian の「現在地」を見える化する
プロジェクト単位で作業インスタンスを分ける
配額・実行中タスク・最終同期・次アクションを並べる
tokenや認証情報は絶対に直接扱わず、まずは connectionless handoff に留める

madowaku側での安全な第一歩

cockpit-tools を直接連携するより、まずは madowaku cockpit にこういう画面を追加するのが良さそうです。

AI Workbench Dashboard

- Codex
  - active repo
  - current task
  - last check result
  - next suggested action

- ChatGPT
  - current project context
  - referenced docs
  - summary freshness

- Local LLM / Ollama
  - available models
  - loaded project notes
  - recommended prompt

- GitHub
  - canonical repo
  - latest issue / PR handoff
  - AI_CREOLE.md status

- Obsidian
  - local notes export status
  - last dictionary sync

ここでAIクレオールの考え方とも噛み合います。AIクレオールは「人間と複数AIが同じ作業ラインに立つための、短くて壊れにくい共通作業語」で、正本はGitHub、プロジェクト方言は各repoの AI_CREOLE.md、ChatGPT / Codex / Local LLM がそれぞれ参照する運用になっています。
だから cockpit-tools 的な「アカウント管理」より、madowakuでは TASK / GOAL / STATE / CHECK / NEXT を各AI作業枠に流す作業管制盤 に寄せる方が本筋っぽいです。

結論としては、これはかなり参考になるけど、madowaku cockpit が目指すべきは cockpit-tools のコピーではなく、“AI作業ラインの状態・文脈・handoffを束ねる cockpit” ですね。

次にCodexくんへ投げるなら、こんなScoutタスクが良さそうです。

TASK: Scout cockpit-tools-inspired dashboard for madowaku cockpit

GOAL:
Study jlcodes99/cockpit-tools only as architectural inspiration.
Do not copy code due to license and credential-handling risk.

TARGET:
madowaku cockpit dashboard design

DO:
- Inspect current madowaku cockpit UI/state model.
- Propose a safe dashboard that does not manage tokens or accounts.
- Add panels for Codex, ChatGPT, GitHub, Obsidian, Local LLM/Ollama.
- Each panel should show STATE, CHECK, NEXT, and handoff actions.
- Keep all integrations connectionless unless already implemented.
- Avoid reading or writing auth files such as ~/.codex, ~/.gemini, OAuth tokens, or browser profiles.

KEEP:
- AI Creole terms: TASK / GOAL / STATE / CHECK / NEXT
- GitHub as canonical dictionary
- Local .md / Google Doc summaries as context surfaces

NO:
- No token management
- No account switching
- No credential import/export
- No direct dependency on cockpit-tools code

OUT:
- UI proposal
- minimal implementation plan
- risks
- first small patch

これは見つけたタイミング良いです。madowaku cockpit の次フェーズは、まさに 「外部連携を増やす前に、複数AI作業環境の見える化をする」 が強そう。


https://github.com/deepseek-ai/deepseek-r1
https://github.com/openclaw/openclaw

