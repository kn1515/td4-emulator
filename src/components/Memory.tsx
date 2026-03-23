/**
 * メモリ表示コンポーネント
 * ROMの内容をアドレスとともに表示する
 */
import type { CpuState } from '../emulator/types';

interface MemoryProps {
  /** CPUの現在の状態 */
  state: CpuState;
}

/** 数値を8ビット2進数文字列に変換する */
function toBin8(n: number): string {
  return n.toString(2).padStart(8, '0');
}

/** 数値を2桁の16進数文字列に変換する */
function toHex2(n: number): string {
  return n.toString(16).toUpperCase().padStart(2, '0');
}

export default function Memory({ state }: MemoryProps) {
  return (
    <div className="memory-panel">
      <h2>ROM</h2>
      <table className="memory-table">
        <thead>
          <tr>
            <th>アドレス</th>
            <th>HEX</th>
            <th>BIN</th>
          </tr>
        </thead>
        <tbody>
          {state.rom.map((byte, addr) => (
            <tr key={addr} className={addr === state.pc ? 'current-pc' : ''}>
              <td className="mem-addr">{addr.toString(16).toUpperCase()}</td>
              <td className="mem-hex">{toHex2(byte)}</td>
              <td className="mem-bin">{toBin8(byte)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
