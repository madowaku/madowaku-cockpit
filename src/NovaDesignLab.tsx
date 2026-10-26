import { useState, type CSSProperties } from 'react';
import {
  buildNovaDesignHandoff,
  getNovaContrastChecks,
  NOVA_LAB_PALETTES,
  NOVA_TOKEN_CROSSWALK,
  type NovaLabTheme
} from './novaBridge';
import './novaDesignLab.css';

type Props = {
  projectName: string;
  taskTitle: string;
  onCopy: (label: string, value: string) => Promise<void>;
};

export default function NovaDesignLab({ projectName, taskTitle, onCopy }: Props) {
  const [theme, setTheme] = useState<NovaLabTheme>('light');
  const [demoName, setDemoName] = useState('サンプルプロジェクト');
  const [demoMessage, setDemoMessage] = useState('');
  const palette = NOVA_LAB_PALETTES[theme];
  const contrastChecks = getNovaContrastChecks(theme);
  const vars = {
    '--nova-bg': palette.background,
    '--nova-surface': palette.surface,
    '--nova-text': palette.text,
    '--nova-muted': palette.muted,
    '--nova-primary': palette.primary,
    '--nova-on-primary': palette.onPrimary,
    '--nova-border': palette.border,
    '--nova-focus': palette.focus
  } as CSSProperties;

  return (
    <details className="nova-lab" data-theme={theme} style={vars}>
      <summary>
        <strong>Nova Bridge Lab</strong>
        <span>隔離トークン・UIプレビュー・AIレビュー指示</span>
        <small>Reference-only · No vendor dependency</small>
      </summary>
      <div className="nova-lab__body">
        <p className="nova-lab__disclaimer">
          Sun* Novaの公式コンポーネントではありません。公開ガイドのセマンティックトークン設計を参考にした、
          cockpit独自の隔離プロトタイプです。
        </p>
        <div className="nova-lab__tools">
          <fieldset className="nova-lab__theme">
            <legend>プレビューテーマ</legend>
            <label>
              <input
                type="radio"
                name="nova-lab-theme"
                checked={theme === 'light'}
                onChange={() => setTheme('light')}
              />
              <span>Light</span>
            </label>
            <label>
              <input
                type="radio"
                name="nova-lab-theme"
                checked={theme === 'dark'}
                onChange={() => setTheme('dark')}
              />
              <span>Dark</span>
            </label>
          </fieldset>
          <button
            type="button"
            className="nova-lab__copy"
            onClick={() => void onCopy('Nova design review', buildNovaDesignHandoff(projectName, taskTitle, theme))}
          >
            Codexレビュー指示をコピー
          </button>
        </div>
        <div className="nova-lab__grid">
          <div className="nova-lab__preview" aria-label="Sample components">
            <h3>Component preview</h3>
            <p>実験用のローカルUI。既存データは変更しません。</p>
            <label htmlFor="nova-lab-sample-name">プロジェクト名（デモ）</label>
            <input
              id="nova-lab-sample-name"
              value={demoName}
              onChange={(event) => {
                setDemoName(event.target.value);
                setDemoMessage('');
              }}
            />
            <button
              className="nova-lab__primary"
              type="button"
              onClick={() => setDemoMessage(demoName.trim() ? 'デモで確認しました。保存はしていません。' : '名前を入力してください。')}
            >
              プレビューを確認
            </button>
            <p className="nova-lab__status" role="status" aria-live="polite">{demoMessage || '入力・フォーカス・ボタン状態を試せます。'}</p>
          </div>
          <div className="nova-lab__audit">
            <h3>Contrast quick check</h3>
            <ul>
              {contrastChecks.map((check) => (
                <li key={check.label}>
                  <span>{check.label}</span>
                  <strong>{check.ratio.toFixed(2)}:1 · {check.passesAA ? 'AA色比OK' : '要修正'}</strong>
                </li>
              ))}
            </ul>
            <p>通常テキストの4.5:1のみを検査。操作・実画面・全WCAG適合は別途検証が必要です。</p>
          </div>
        </div>
        <p className="nova-lab__mapping">
          Nova参照例: {NOVA_TOKEN_CROSSWALK.map((item) => item.novaExample).join(' / ')}
        </p>
        <a href="https://nova.sun-asterisk.com/guide/09-theming/" target="_blank" rel="noreferrer">
          Nova公式テーマガイドを見る
        </a>
      </div>
    </details>
  );
}
