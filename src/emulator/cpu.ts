/**
 * TD4 CPUエミュレータ
 * 4ビットCPU「TD4」のエミュレーションを行うモジュール
 */

import type { CpuState } from './types';
import { OPCODES } from './types';

/** 4ビットマスク（0-15の範囲に制限するため） */
const MASK_4BIT = 0x0F;

/**
 * CPUの初期状態を生成する
 * @returns 初期化されたCPU状態
 */
export function createInitialState(): CpuState {
  return {
    regA: 0,
    regB: 0,
    pc: 0,
    carry: false,
    outPort: 0,
    inPort: 0,
    rom: new Array(16).fill(0),
    halted: false,
  };
}

/**
 * ROMにマシンコードをロードする
 * @param state 現在のCPU状態
 * @param machineCode ロードするマシンコード配列
 * @returns ROMが更新されたCPU状態
 */
export function loadRom(state: CpuState, machineCode: number[]): CpuState {
  const rom = new Array(16).fill(0);
  // マシンコードをROMにコピー（最大16バイト）
  for (let i = 0; i < Math.min(machineCode.length, 16); i++) {
    rom[i] = machineCode[i] & 0xFF;
  }
  return { ...state, rom };
}

/**
 * 1命令を実行する（ステップ実行）
 * @param state 現在のCPU状態
 * @returns 命令実行後のCPU状態
 */
export function step(state: CpuState): CpuState {
  // 停止中は何もしない
  if (state.halted) {
    return state;
  }

  // 現在のPCから命令をフェッチ
  const instruction = state.rom[state.pc];
  // 上位4ビット: オペコード
  const opcode = (instruction >> 4) & MASK_4BIT;
  // 下位4ビット: イミディエイト値
  const immediate = instruction & MASK_4BIT;

  // 次の状態を作成（不変性を保つ）
  const next: CpuState = { ...state, rom: [...state.rom] };

  // 次のPCをデフォルトでインクリメント
  let nextPc = (state.pc + 1) & MASK_4BIT;

  switch (opcode) {
    case OPCODES.ADD_A: {
      // ADD A, Im: レジスタAにイミディエイト値を加算
      const result = state.regA + immediate;
      next.regA = result & MASK_4BIT;
      next.carry = result > MASK_4BIT;
      break;
    }
    case OPCODES.MOV_A_B: {
      // MOV A, B: レジスタBの値をレジスタAにコピー
      next.regA = state.regB;
      next.carry = false;
      break;
    }
    case OPCODES.IN_A: {
      // IN A: 入力ポートの値をレジスタAに読み込み
      next.regA = state.inPort & MASK_4BIT;
      next.carry = false;
      break;
    }
    case OPCODES.MOV_A: {
      // MOV A, Im: イミディエイト値をレジスタAに設定
      next.regA = immediate;
      next.carry = false;
      break;
    }
    case OPCODES.MOV_B_A: {
      // MOV B, A: レジスタAの値をレジスタBにコピー
      next.regB = state.regA;
      next.carry = false;
      break;
    }
    case OPCODES.ADD_B: {
      // ADD B, Im: レジスタBにイミディエイト値を加算
      const result = state.regB + immediate;
      next.regB = result & MASK_4BIT;
      next.carry = result > MASK_4BIT;
      break;
    }
    case OPCODES.IN_B: {
      // IN B: 入力ポートの値をレジスタBに読み込み
      next.regB = state.inPort & MASK_4BIT;
      next.carry = false;
      break;
    }
    case OPCODES.MOV_B: {
      // MOV B, Im: イミディエイト値をレジスタBに設定
      next.regB = immediate;
      next.carry = false;
      break;
    }
    case OPCODES.OUT_B: {
      // OUT B: レジスタBの値を出力ポートに書き込み
      next.outPort = state.regB;
      next.carry = false;
      break;
    }
    case OPCODES.OUT: {
      // OUT Im: イミディエイト値を出力ポートに書き込み
      next.outPort = immediate;
      next.carry = false;
      break;
    }
    case OPCODES.JNC: {
      // JNC Im: キャリーフラグが0の場合、指定アドレスにジャンプ
      if (!state.carry) {
        nextPc = immediate;
      }
      next.carry = false;
      break;
    }
    case OPCODES.JMP: {
      // JMP Im: 無条件ジャンプ
      nextPc = immediate;
      next.carry = false;
      break;
    }
    default: {
      // 未定義命令: NOP（何もしない）として扱う
      next.carry = false;
      break;
    }
  }

  next.pc = nextPc;

  // PCが16を超えた場合は停止（実際にはMASK_4BITで0に戻る）
  if (next.pc >= 16) {
    next.pc = 0;
  }

  return next;
}

/**
 * CPUをリセットする（ROMは保持）
 * @param state 現在のCPU状態
 * @returns リセットされたCPU状態
 */
export function reset(state: CpuState): CpuState {
  return {
    ...createInitialState(),
    rom: [...state.rom],
    inPort: state.inPort,
  };
}
