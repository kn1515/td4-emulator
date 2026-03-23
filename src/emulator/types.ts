/**
 * TD4 エミュレータの型定義
 * TD4は4ビットCPUで、教育用に設計されたシンプルなプロセッサです。
 */

/** CPUの状態を表す型 */
export interface CpuState {
  /** レジスタA（4ビット、0-15） */
  regA: number;
  /** レジスタB（4ビット、0-15） */
  regB: number;
  /** プログラムカウンタ（4ビット、0-15） */
  pc: number;
  /** キャリーフラグ */
  carry: boolean;
  /** 出力ポート（4ビット、0-15） */
  outPort: number;
  /** 入力ポート（4ビット、0-15） */
  inPort: number;
  /** ROM（16バイト、各8ビット） */
  rom: number[];
  /** 実行停止フラグ */
  halted: boolean;
}

/** アセンブル結果の型 */
export interface AssembleResult {
  /** 成功した場合のマシンコード配列 */
  machineCode: number[];
  /** エラーメッセージ（エラーがある場合） */
  errors: AssembleError[];
}

/** アセンブルエラーの型 */
export interface AssembleError {
  /** エラーが発生した行番号（0始まり） */
  line: number;
  /** エラーメッセージ */
  message: string;
}

/**
 * TD4の命令セット
 * 上位4ビットがオペコード、下位4ビットがイミディエイト値
 */
export const OPCODES = {
  ADD_A: 0b0000,  // ADD A, Im
  MOV_A_B: 0b0001, // MOV A, B
  IN_A: 0b0010,   // IN A
  MOV_A: 0b0011,  // MOV A, Im
  MOV_B_A: 0b0100, // MOV B, A
  ADD_B: 0b0101,  // ADD B, Im
  IN_B: 0b0110,   // IN B
  MOV_B: 0b0111,  // MOV B, Im
  OUT_B: 0b1001,  // OUT B
  OUT: 0b1011,    // OUT Im
  JNC: 0b1110,    // JNC Im
  JMP: 0b1111,    // JMP Im
} as const;
