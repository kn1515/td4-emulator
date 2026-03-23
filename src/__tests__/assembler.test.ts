/**
 * TD4 アセンブラのテスト
 */
import { describe, it, expect } from 'vitest';
import { assemble } from '../emulator/assembler';
import { OPCODES } from '../emulator/types';

describe('Assembler', () => {
  describe('ADD命令', () => {
    it('ADD A, 3 を正しくアセンブルする', () => {
      const result = assemble('ADD A, 3');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.ADD_A << 4) | 3]);
    });

    it('ADD B, 5 を正しくアセンブルする', () => {
      const result = assemble('ADD B, 5');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.ADD_B << 4) | 5]);
    });
  });

  describe('MOV命令', () => {
    it('MOV A, 10 を正しくアセンブルする', () => {
      const result = assemble('MOV A, 10');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.MOV_A << 4) | 10]);
    });

    it('MOV B, 7 を正しくアセンブルする', () => {
      const result = assemble('MOV B, 7');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.MOV_B << 4) | 7]);
    });

    it('MOV A, B を正しくアセンブルする', () => {
      const result = assemble('MOV A, B');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.MOV_A_B << 4) | 0]);
    });

    it('MOV B, A を正しくアセンブルする', () => {
      const result = assemble('MOV B, A');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.MOV_B_A << 4) | 0]);
    });
  });

  describe('IN命令', () => {
    it('IN A を正しくアセンブルする', () => {
      const result = assemble('IN A');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.IN_A << 4) | 0]);
    });

    it('IN B を正しくアセンブルする', () => {
      const result = assemble('IN B');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.IN_B << 4) | 0]);
    });
  });

  describe('OUT命令', () => {
    it('OUT 5 を正しくアセンブルする', () => {
      const result = assemble('OUT 5');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.OUT << 4) | 5]);
    });

    it('OUT B を正しくアセンブルする', () => {
      const result = assemble('OUT B');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.OUT_B << 4) | 0]);
    });
  });

  describe('ジャンプ命令', () => {
    it('JMP 0 を正しくアセンブルする', () => {
      const result = assemble('JMP 0');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.JMP << 4) | 0]);
    });

    it('JNC 3 を正しくアセンブルする', () => {
      const result = assemble('JNC 3');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.JNC << 4) | 3]);
    });
  });

  describe('コメントと空行', () => {
    it('コメントを無視する', () => {
      const result = assemble('MOV A, 1 ; コメント');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.MOV_A << 4) | 1]);
    });

    it('コメントのみの行を無視する', () => {
      const result = assemble('; これはコメント');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toHaveLength(0);
    });

    it('空行を無視する', () => {
      const result = assemble('MOV A, 1\n\nADD A, 2');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toHaveLength(2);
    });
  });

  describe('数値リテラル', () => {
    it('2進数リテラル(0b)を解釈する', () => {
      const result = assemble('MOV A, 0b1010');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.MOV_A << 4) | 10]);
    });

    it('16進数リテラル(0x)を解釈する', () => {
      const result = assemble('MOV A, 0xF');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.MOV_A << 4) | 15]);
    });
  });

  describe('大文字小文字', () => {
    it('小文字の命令を正しくアセンブルする', () => {
      const result = assemble('mov a, 5');
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode).toEqual([(OPCODES.MOV_A << 4) | 5]);
    });
  });

  describe('エラーハンドリング', () => {
    it('不明な命令でエラーを報告する', () => {
      const result = assemble('HALT');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('不明な命令');
    });

    it('範囲外のイミディエイト値でエラーを報告する', () => {
      const result = assemble('MOV A, 16');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('0〜15');
    });

    it('16命令を超えた場合にエラーを報告する', () => {
      const lines = new Array(17).fill('MOV A, 1').join('\n');
      const result = assemble(lines);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('複合プログラム', () => {
    it('LEDカウントアッププログラムをアセンブルする', () => {
      const source = `
; LEDカウントアッププログラム
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
JMP 0
`;
      const result = assemble(source);
      expect(result.errors).toHaveLength(0);
      expect(result.machineCode.length).toBe(11);
    });
  });
});
