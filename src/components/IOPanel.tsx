/**
 * 入出力パネルコンポーネント
 * 入力スイッチ（4ビット）と出力LED（4ビット）を表示する
 */

interface IOPanelProps {
  /** 入力ポートの値（4ビット） */
  inPort: number;
  /** 出力ポートの値（4ビット） */
  outPort: number;
  /** 入力ポートの値変更コールバック */
  onInputChange: (value: number) => void;
}

export default function IOPanel({ inPort, outPort, onInputChange }: IOPanelProps) {
  /**
   * 入力スイッチのトグル処理
   * @param bit トグルするビット位置（0-3）
   */
  const toggleInput = (bit: number) => {
    onInputChange(inPort ^ (1 << bit));
  };

  return (
    <div className="io-panel">
      {/* 出力LED表示 */}
      <div className="io-section">
        <h2>出力 (LED)</h2>
        <div className="led-row">
          {[3, 2, 1, 0].map((bit) => (
            <div
              key={bit}
              className={`led ${(outPort >> bit) & 1 ? 'led-on' : 'led-off'}`}
              title={`ビット${bit}`}
            >
              {(outPort >> bit) & 1 ? '●' : '○'}
            </div>
          ))}
        </div>
        <div className="io-value">
          値: {outPort} (0b{outPort.toString(2).padStart(4, '0')})
        </div>
      </div>

      {/* 入力スイッチ */}
      <div className="io-section">
        <h2>入力 (スイッチ)</h2>
        <div className="switch-row">
          {[3, 2, 1, 0].map((bit) => (
            <button
              key={bit}
              className={`switch ${(inPort >> bit) & 1 ? 'switch-on' : 'switch-off'}`}
              onClick={() => toggleInput(bit)}
              title={`ビット${bit}`}
            >
              {(inPort >> bit) & 1 ? 'ON' : 'OFF'}
            </button>
          ))}
        </div>
        <div className="io-value">
          値: {inPort} (0b{inPort.toString(2).padStart(4, '0')})
        </div>
      </div>
    </div>
  );
}
