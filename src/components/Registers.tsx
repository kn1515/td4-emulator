/**
 * レジスタ表示コンポーネント
 * CPU内部のレジスタ値を表示する
 */
import type { CpuState } from '../emulator/types';

interface RegistersProps {
  /** CPUの現在の状態 */
  state: CpuState;
}

/** 数値を4ビット2進数文字列に変換する */
function toBin4(n: number): string {
  return n.toString(2).padStart(4, '0');
}

export default function Registers({ state }: RegistersProps) {
  return (
    <div className="registers-panel">
      <h2>レジスタ</h2>
      <table className="register-table">
        <tbody>
          <tr>
            <td className="reg-label">A</td>
            <td className="reg-value">{state.regA}</td>
            <td className="reg-binary">{toBin4(state.regA)}</td>
          </tr>
          <tr>
            <td className="reg-label">B</td>
            <td className="reg-value">{state.regB}</td>
            <td className="reg-binary">{toBin4(state.regB)}</td>
          </tr>
          <tr>
            <td className="reg-label">PC</td>
            <td className="reg-value">{state.pc}</td>
            <td className="reg-binary">{toBin4(state.pc)}</td>
          </tr>
          <tr>
            <td className="reg-label">Carry</td>
            <td className="reg-value" colSpan={2}>
              {state.carry ? '1' : '0'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
