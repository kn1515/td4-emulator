/**
 * TD4 アセンブラ
 * TD4のアセンブリ言語をマシンコードに変換するモジュール
 */

import type { AssembleResult, AssembleError } from './types';
import { OPCODES } from './types';

/**
 * イミディエイト値をパースする
 * 10進数、2進数(0b)、16進数(0x)に対応
 * @param token イミディエイト値の文字列
 * @returns パースされた数値、無効な場合はNaN
 */
function parseImmediate(token: string): number {
  const s = token.trim();
  if (s.toLowerCase().startsWith('0b')) {
    // 2進数リテラル
    return parseInt(s.slice(2), 2);
  } else if (s.toLowerCase().startsWith('0x')) {
    // 16進数リテラル
    return parseInt(s.slice(2), 16);
  } else {
    // 10進数リテラル
    return parseInt(s, 10);
  }
}

/**
 * アセンブリ言語のソースコードをマシンコードに変換する
 * @param source アセンブリ言語のソースコード
 * @returns アセンブル結果（マシンコードとエラー情報）
 */
export function assemble(source: string): AssembleResult {
  const lines = source.split('\n');
  const machineCode: number[] = [];
  const errors: AssembleError[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // コメントを除去（;以降はコメント）
    const commentIndex = line.indexOf(';');
    const codePart = commentIndex >= 0 ? line.slice(0, commentIndex) : line;

    // 前後の空白を除去
    const trimmed = codePart.trim();

    // 空行はスキップ
    if (trimmed === '') {
      continue;
    }

    // ROMが16命令を超えた場合はエラー
    if (machineCode.length >= 16) {
      errors.push({ line: i, message: 'プログラムが16命令を超えています' });
      continue;
    }

    // 命令をパース
    const result = parseLine(trimmed, i);
    if (result.error) {
      errors.push(result.error);
    } else {
      machineCode.push(result.code!);
    }
  }

  return { machineCode, errors };
}

/**
 * 1行のアセンブリコードをパースする
 * @param line パースする行（トリム済み）
 * @param lineNum 行番号
 * @returns パース結果
 */
function parseLine(
  line: string,
  lineNum: number
): { code?: number; error?: AssembleError } {
  // 大文字に正規化してトークンに分割
  const upper = line.toUpperCase();

  // カンマをスペースに置換してトークン分割
  const tokens = upper.replace(/,/g, ' ').split(/\s+/).filter(t => t !== '');

  if (tokens.length === 0) {
    return { error: { line: lineNum, message: '命令が空です' } };
  }

  const mnemonic = tokens[0];

  switch (mnemonic) {
    case 'ADD': {
      // ADD A, Im または ADD B, Im
      if (tokens.length < 3) {
        return { error: { line: lineNum, message: 'ADD命令にはレジスタとイミディエイト値が必要です' } };
      }
      const reg = tokens[1];
      const imm = parseImmediate(tokens[2]);
      if (isNaN(imm) || imm < 0 || imm > 15) {
        return { error: { line: lineNum, message: 'イミディエイト値は0〜15の範囲で指定してください' } };
      }
      if (reg === 'A') {
        return { code: (OPCODES.ADD_A << 4) | imm };
      } else if (reg === 'B') {
        return { code: (OPCODES.ADD_B << 4) | imm };
      } else {
        return { error: { line: lineNum, message: 'ADD命令のレジスタはAまたはBを指定してください' } };
      }
    }

    case 'MOV': {
      // MOV A, Im / MOV B, Im / MOV A, B / MOV B, A
      if (tokens.length < 3) {
        return { error: { line: lineNum, message: 'MOV命令には引数が2つ必要です' } };
      }
      const dst = tokens[1];
      const src = tokens[2];

      if (dst === 'A' && src === 'B') {
        // MOV A, B
        return { code: (OPCODES.MOV_A_B << 4) | 0 };
      } else if (dst === 'B' && src === 'A') {
        // MOV B, A
        return { code: (OPCODES.MOV_B_A << 4) | 0 };
      } else if (dst === 'A') {
        // MOV A, Im
        const imm = parseImmediate(src);
        if (isNaN(imm) || imm < 0 || imm > 15) {
          return { error: { line: lineNum, message: 'イミディエイト値は0〜15の範囲で指定してください' } };
        }
        return { code: (OPCODES.MOV_A << 4) | imm };
      } else if (dst === 'B') {
        // MOV B, Im
        const imm = parseImmediate(src);
        if (isNaN(imm) || imm < 0 || imm > 15) {
          return { error: { line: lineNum, message: 'イミディエイト値は0〜15の範囲で指定してください' } };
        }
        return { code: (OPCODES.MOV_B << 4) | imm };
      } else {
        return { error: { line: lineNum, message: 'MOV命令のレジスタはAまたはBを指定してください' } };
      }
    }

    case 'IN': {
      // IN A または IN B
      if (tokens.length < 2) {
        return { error: { line: lineNum, message: 'IN命令にはレジスタの指定が必要です' } };
      }
      const reg = tokens[1];
      if (reg === 'A') {
        return { code: (OPCODES.IN_A << 4) | 0 };
      } else if (reg === 'B') {
        return { code: (OPCODES.IN_B << 4) | 0 };
      } else {
        return { error: { line: lineNum, message: 'IN命令のレジスタはAまたはBを指定してください' } };
      }
    }

    case 'OUT': {
      // OUT Im または OUT B
      if (tokens.length < 2) {
        return { error: { line: lineNum, message: 'OUT命令には引数が必要です' } };
      }
      const arg = tokens[1];
      if (arg === 'B') {
        return { code: (OPCODES.OUT_B << 4) | 0 };
      } else {
        const imm = parseImmediate(arg);
        if (isNaN(imm) || imm < 0 || imm > 15) {
          return { error: { line: lineNum, message: 'イミディエイト値は0〜15の範囲で指定してください' } };
        }
        return { code: (OPCODES.OUT << 4) | imm };
      }
    }

    case 'JMP': {
      // JMP Im: 無条件ジャンプ
      if (tokens.length < 2) {
        return { error: { line: lineNum, message: 'JMP命令にはジャンプ先アドレスが必要です' } };
      }
      const imm = parseImmediate(tokens[1]);
      if (isNaN(imm) || imm < 0 || imm > 15) {
        return { error: { line: lineNum, message: 'ジャンプ先アドレスは0〜15の範囲で指定してください' } };
      }
      return { code: (OPCODES.JMP << 4) | imm };
    }

    case 'JNC': {
      // JNC Im: キャリーなしジャンプ
      if (tokens.length < 2) {
        return { error: { line: lineNum, message: 'JNC命令にはジャンプ先アドレスが必要です' } };
      }
      const imm = parseImmediate(tokens[1]);
      if (isNaN(imm) || imm < 0 || imm > 15) {
        return { error: { line: lineNum, message: 'ジャンプ先アドレスは0〜15の範囲で指定してください' } };
      }
      return { code: (OPCODES.JNC << 4) | imm };
    }

    default:
      return { error: { line: lineNum, message: `不明な命令: ${mnemonic}` } };
  }
}
