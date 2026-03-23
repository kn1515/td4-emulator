/**
 * TD4 CPUエミュレータのテスト
 */
import { describe, it, expect } from 'vitest';
import { createInitialState, loadRom, step, reset } from '../emulator/cpu';
import { OPCODES } from '../emulator/types';

describe('CPU', () => {
  describe('createInitialState', () => {
    it('初期状態が正しく生成される', () => {
      const state = createInitialState();
      expect(state.regA).toBe(0);
      expect(state.regB).toBe(0);
      expect(state.pc).toBe(0);
      expect(state.carry).toBe(false);
      expect(state.outPort).toBe(0);
      expect(state.inPort).toBe(0);
      expect(state.rom.length).toBe(16);
      expect(state.halted).toBe(false);
    });
  });

  describe('loadRom', () => {
    it('マシンコードをROMにロードできる', () => {
      const state = createInitialState();
      const code = [0x31, 0x52, 0xB3];
      const loaded = loadRom(state, code);
      expect(loaded.rom[0]).toBe(0x31);
      expect(loaded.rom[1]).toBe(0x52);
      expect(loaded.rom[2]).toBe(0xB3);
      expect(loaded.rom[3]).toBe(0);
    });

    it('16バイトを超えるコードは切り捨てられる', () => {
      const state = createInitialState();
      const code = new Array(20).fill(0xFF);
      const loaded = loadRom(state, code);
      expect(loaded.rom.length).toBe(16);
    });
  });

  describe('step - ADD命令', () => {
    it('ADD A, Im: レジスタAにイミディエイト値を加算', () => {
      let state = createInitialState();
      // ADD A, 3 => opcode=0000, imm=0011 => 0x03
      state = loadRom(state, [(OPCODES.ADD_A << 4) | 3]);
      state = step(state);
      expect(state.regA).toBe(3);
      expect(state.carry).toBe(false);
      expect(state.pc).toBe(1);
    });

    it('ADD A, Imでオーバーフロー時にキャリーが立つ', () => {
      let state = createInitialState();
      state.regA = 14;
      // ADD A, 5 => 14 + 5 = 19 => A=3, carry=true
      state = loadRom(state, [(OPCODES.ADD_A << 4) | 5]);
      state = step(state);
      expect(state.regA).toBe(3);
      expect(state.carry).toBe(true);
    });

    it('ADD B, Im: レジスタBにイミディエイト値を加算', () => {
      let state = createInitialState();
      // ADD B, 7
      state = loadRom(state, [(OPCODES.ADD_B << 4) | 7]);
      state = step(state);
      expect(state.regB).toBe(7);
      expect(state.carry).toBe(false);
    });
  });

  describe('step - MOV命令', () => {
    it('MOV A, Im: イミディエイト値をレジスタAに設定', () => {
      let state = createInitialState();
      // MOV A, 10
      state = loadRom(state, [(OPCODES.MOV_A << 4) | 10]);
      state = step(state);
      expect(state.regA).toBe(10);
    });

    it('MOV B, Im: イミディエイト値をレジスタBに設定', () => {
      let state = createInitialState();
      // MOV B, 5
      state = loadRom(state, [(OPCODES.MOV_B << 4) | 5]);
      state = step(state);
      expect(state.regB).toBe(5);
    });

    it('MOV A, B: レジスタBの値をAにコピー', () => {
      let state = createInitialState();
      state.regB = 12;
      state = loadRom(state, [(OPCODES.MOV_A_B << 4) | 0]);
      state = step(state);
      expect(state.regA).toBe(12);
    });

    it('MOV B, A: レジスタAの値をBにコピー', () => {
      let state = createInitialState();
      state.regA = 7;
      state = loadRom(state, [(OPCODES.MOV_B_A << 4) | 0]);
      state = step(state);
      expect(state.regB).toBe(7);
    });
  });

  describe('step - IN命令', () => {
    it('IN A: 入力ポートの値をレジスタAに読み込む', () => {
      let state = createInitialState();
      state.inPort = 9;
      state = loadRom(state, [(OPCODES.IN_A << 4) | 0]);
      state = step(state);
      expect(state.regA).toBe(9);
    });

    it('IN B: 入力ポートの値をレジスタBに読み込む', () => {
      let state = createInitialState();
      state.inPort = 6;
      state = loadRom(state, [(OPCODES.IN_B << 4) | 0]);
      state = step(state);
      expect(state.regB).toBe(6);
    });
  });

  describe('step - OUT命令', () => {
    it('OUT Im: イミディエイト値を出力ポートに書き込む', () => {
      let state = createInitialState();
      // OUT 5
      state = loadRom(state, [(OPCODES.OUT << 4) | 5]);
      state = step(state);
      expect(state.outPort).toBe(5);
    });

    it('OUT B: レジスタBの値を出力ポートに書き込む', () => {
      let state = createInitialState();
      state.regB = 11;
      state = loadRom(state, [(OPCODES.OUT_B << 4) | 0]);
      state = step(state);
      expect(state.outPort).toBe(11);
    });
  });

  describe('step - ジャンプ命令', () => {
    it('JMP Im: 無条件ジャンプ', () => {
      let state = createInitialState();
      // JMP 5
      state = loadRom(state, [(OPCODES.JMP << 4) | 5]);
      state = step(state);
      expect(state.pc).toBe(5);
    });

    it('JNC Im: キャリーなしの場合ジャンプする', () => {
      let state = createInitialState();
      state.carry = false;
      // JNC 8
      state = loadRom(state, [(OPCODES.JNC << 4) | 8]);
      state = step(state);
      expect(state.pc).toBe(8);
    });

    it('JNC Im: キャリーありの場合ジャンプしない', () => {
      let state = createInitialState();
      state.carry = true;
      // JNC 8
      state = loadRom(state, [(OPCODES.JNC << 4) | 8]);
      state = step(state);
      expect(state.pc).toBe(1); // 次の命令へ
    });
  });

  describe('step - 複合テスト', () => {
    it('LEDカウントアッププログラムが正しく動作する', () => {
      // OUT 0b0001 -> ADD A,1 -> JNC 0 のループ
      let state = createInitialState();
      state = loadRom(state, [
        (OPCODES.MOV_A << 4) | 1,    // MOV A, 1
        (OPCODES.ADD_A << 4) | 1,    // ADD A, 1
        (OPCODES.OUT << 4) | 0,      // OUT 0
        (OPCODES.JMP << 4) | 1,      // JMP 1
      ]);

      // 最初のMOV A, 1
      state = step(state);
      expect(state.regA).toBe(1);
      expect(state.pc).toBe(1);

      // ADD A, 1 => A=2
      state = step(state);
      expect(state.regA).toBe(2);
      expect(state.pc).toBe(2);

      // OUT 0
      state = step(state);
      expect(state.outPort).toBe(0);
      expect(state.pc).toBe(3);

      // JMP 1 => PC=1
      state = step(state);
      expect(state.pc).toBe(1);
    });
  });

  describe('reset', () => {
    it('CPUをリセットするとROMは保持される', () => {
      let state = createInitialState();
      state = loadRom(state, [0x31, 0x52]);
      state.regA = 5;
      state.regB = 3;
      state.pc = 10;
      state.carry = true;
      state.outPort = 7;

      const resetState = reset(state);
      expect(resetState.regA).toBe(0);
      expect(resetState.regB).toBe(0);
      expect(resetState.pc).toBe(0);
      expect(resetState.carry).toBe(false);
      expect(resetState.outPort).toBe(0);
      // ROMは保持される
      expect(resetState.rom[0]).toBe(0x31);
      expect(resetState.rom[1]).toBe(0x52);
    });
  });
});
