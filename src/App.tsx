/**
 * TD4エミュレータ メインアプリケーション
 * アセンブリエディタ、CPU状態表示、操作パネルを統合する
 */
import { useState, useRef, useCallback } from 'react';
import Editor from './components/Editor';
import Registers from './components/Registers';
import Memory from './components/Memory';
import Controls from './components/Controls';
import IOPanel from './components/IOPanel';
import { createInitialState, loadRom, step, reset } from './emulator/cpu';
import { assemble } from './emulator/assembler';
import type { CpuState, AssembleError } from './emulator/types';
import './App.css';

/** 連続実行時のインターバル（ミリ秒） */
const RUN_INTERVAL_MS = 200;

function App() {
  // CPUの状態
  const [cpuState, setCpuState] = useState<CpuState>(createInitialState());
  // アセンブルエラー
  const [errors, setErrors] = useState<AssembleError[]>([]);
  // 連続実行中フラグ
  const [running, setRunning] = useState(false);
  // 連続実行用のタイマーID
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * アセンブルしてROMにロードする
   */
  const handleAssemble = useCallback((source: string) => {
    // 連続実行中なら停止
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setRunning(false);
    }

    const result = assemble(source);
    setErrors(result.errors);

    if (result.errors.length === 0) {
      // アセンブル成功: ROMにロードしてリセット
      const newState = loadRom(createInitialState(), result.machineCode);
      setCpuState((prev) => ({ ...newState, inPort: prev.inPort }));
    }
  }, []);

  /**
   * 1命令をステップ実行する
   */
  const handleStep = useCallback(() => {
    setCpuState((prev) => step(prev));
  }, []);

  /**
   * 連続実行を開始する
   */
  const handleRun = useCallback(() => {
    if (timerRef.current) return;
    setRunning(true);
    timerRef.current = setInterval(() => {
      setCpuState((prev) => step(prev));
    }, RUN_INTERVAL_MS);
  }, []);

  /**
   * 連続実行を停止する
   */
  const handleStop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
  }, []);

  /**
   * CPUをリセットする
   */
  const handleReset = useCallback(() => {
    // 連続実行中なら停止
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setRunning(false);
    }
    setCpuState((prev) => reset(prev));
  }, []);

  /**
   * 入力ポートの値を変更する
   */
  const handleInputChange = useCallback((value: number) => {
    setCpuState((prev) => ({ ...prev, inPort: value }));
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>TD4 エミュレータ</h1>
        <p className="subtitle">4ビットCPU TD4のエミュレータ &amp; アセンブラ</p>
      </header>

      <main className="app-main">
        {/* 左側: エディタ */}
        <div className="left-panel">
          <Editor onAssemble={handleAssemble} errors={errors} />
        </div>

        {/* 右側: CPU状態と操作 */}
        <div className="right-panel">
          <Controls
            onStep={handleStep}
            onRun={handleRun}
            onStop={handleStop}
            onReset={handleReset}
            running={running}
          />
          <IOPanel
            inPort={cpuState.inPort}
            outPort={cpuState.outPort}
            onInputChange={handleInputChange}
          />
          <Registers state={cpuState} />
          <Memory state={cpuState} />
        </div>
      </main>
    </div>
  );
}

export default App;
