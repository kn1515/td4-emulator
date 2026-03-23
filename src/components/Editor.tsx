/**
 * エディタコンポーネント
 * アセンブリコードの入力エリアとアセンブルボタン
 */
import { useState } from 'react';

/** サンプルプログラム: LEDナイトライダー風 */
const SAMPLE_PROGRAM = `; LEDカウントアッププログラム
; 出力ポートのLEDが順番に点灯します
OUT 0b0001
ADD A, 1
OUT 0b0010
ADD A, 1
OUT 0b0100
ADD A, 1
OUT 0b1000
ADD A, 1
JNC 0
OUT 0b1111
JMP 0`;

interface EditorProps {
  /** アセンブルボタン押下時のコールバック */
  onAssemble: (source: string) => void;
  /** アセンブルエラーメッセージ */
  errors: { line: number; message: string }[];
}

export default function Editor({ onAssemble, errors }: EditorProps) {
  const [source, setSource] = useState(SAMPLE_PROGRAM);

  return (
    <div className="editor-panel">
      <h2>アセンブリエディタ</h2>
      <textarea
        className="code-editor"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        spellCheck={false}
        placeholder="ここにアセンブリコードを入力..."
        rows={16}
      />
      <button className="btn btn-primary" onClick={() => onAssemble(source)}>
        アセンブル &amp; ロード
      </button>
      {errors.length > 0 && (
        <div className="error-list">
          <h3>エラー</h3>
          {errors.map((err, i) => (
            <div key={i} className="error-item">
              行 {err.line + 1}: {err.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
