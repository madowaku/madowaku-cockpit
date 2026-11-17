import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';

export function Lab() {
  const [count, setCount] = useState(0);

  return (
    <main className="lab-shell">
      <div className="lab-header">
        <p className="eyebrow">MGSF / Design Bridge M0.1</p>
        <h1>小さな部品から、いい窓を。</h1>
        <p>
          AstryxのUI部品を独立した実験室で試しています。
          ここでの変更はcockpitや公開サイトには反映されません。
        </p>
      </div>
      <Card elevation="low">
        <div className="lab-card">
          <h2>ひとつ目の実験: Button</h2>
          <p>ラベル付きの操作部品。クリックやキーボード操作で状態が更新されます。</p>
          <div className="action-row">
            <Button label="窓をひらく" variant="primary" onClick={() => setCount((value) => value + 1)} />
            <Button label="リセット" variant="secondary" onClick={() => setCount(0)} />
          </div>
          <p role="status" aria-live="polite" className="lab-status">
            {count === 0 ? 'まだ開いていません。' : '窓を開いた回数: ' + count}
          </p>
        </div>
      </Card>
      <div className="lab-footer">
        <p>検証対象: レスポンシブ、フォーカス、読み上げ、テーマ、依存サイズ</p>
        <p>採用判断前に既存のmadowaku UIと比較します。</p>
      </div>
    </main>
  );
}
