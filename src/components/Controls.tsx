/**
 * 操作パネルコンポーネント
 * ステップ実行、連続実行、リセットなどの制御ボタン
 */

interface ControlsProps {
  /** ステップ実行のコールバック */
  onStep: () => void;
  /** 連続実行のコールバック */
  onRun: () => void;
  /** 実行停止のコールバック */
  onStop: () => void;
  /** リセットのコールバック */
  onReset: () => void;
  /** 現在実行中かどうか */
  running: boolean;
}

export default function Controls({
  onStep,
  onRun,
  onStop,
  onReset,
  running,
}: ControlsProps) {
  return (
    <div className="controls-panel">
      <h2>操作</h2>
      <div className="controls-buttons">
        <button className="btn" onClick={onStep} disabled={running}>
          ステップ実行
        </button>
        {running ? (
          <button className="btn btn-danger" onClick={onStop}>
            停止
          </button>
        ) : (
          <button className="btn btn-success" onClick={onRun}>
            連続実行
          </button>
        )}
        <button className="btn btn-warning" onClick={onReset}>
          リセット
        </button>
      </div>
    </div>
  );
}
