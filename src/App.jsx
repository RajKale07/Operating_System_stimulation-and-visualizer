import React, { useState, useEffect, useCallback } from 'react';
import Navigation from './components/Navigation.jsx';
import { SECTIONS } from './constants.js';
import Overview from './pages/Overview.jsx';
import Scheduling from './pages/Scheduling.jsx';
import MemoryManagement from './pages/MemoryManagement.jsx';
import AlgorithmBattle from './pages/AlgorithmBattle.jsx';
import ExecutionHistory from './pages/ExecutionHistory.jsx';
import {
  createInitialSnapshot,
  stepSimulation,
} from './simulation/engine.js';
import { ALGORITHMS } from './algorithms/scheduling.js';
import { MEMORY_ALGORITHMS } from './algorithms/pageReplacement.js';
import { CPU_PRESETS } from './presets/workloads.js';

export default function App() {
  const [activeSection, setActiveSection] = useState(SECTIONS.OVERVIEW);

  // Workload configuration
  const [processes, setProcesses] = useState([
    { id: 'p1', name: 'P1', arrival: 0, burst: 4, pages: [1, 2, 3] },
    { id: 'p2', name: 'P2', arrival: 1, burst: 3, pages: [2, 3, 4] },
    { id: 'p3', name: 'P3', arrival: 2, burst: 5, pages: [1, 4, 5] },
  ]);

  const [algorithm, setAlgorithm] = useState(ALGORITHMS.FCFS);
  const [quantum, setQuantum] = useState(2);
  const [memAlgorithm, setMemAlgorithm] = useState(MEMORY_ALGORITHMS.FIFO);

  // Deterministic Snapshots History Stack
  const [history, setHistory] = useState(() => [
    createInitialSnapshot({
      processes: [
        { id: 'p1', name: 'P1', arrival: 0, burst: 4, pages: [1, 2, 3] },
        { id: 'p2', name: 'P2', arrival: 1, burst: 3, pages: [2, 3, 4] },
        { id: 'p3', name: 'P3', arrival: 2, burst: 5, pages: [1, 4, 5] },
      ],
      algorithm: ALGORITHMS.FCFS,
      quantum: 2,
      memAlgorithm: MEMORY_ALGORITHMS.FIFO,
    }),
  ]);

  // Current inspection cursor in history stack (0 <= activeTick < history.length)
  const [activeTick, setActiveTick] = useState(0);

  // Execution controls
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(800); // ms per tick

  const latestTick = history.length - 1;
  const currentSnapshot = history[activeTick] || history[0];
  const isHistorical = activeTick < latestTick;

  // Reinitialize simulation when base processes or algorithm changes
  const resetSimulationWithParams = useCallback((newProcesses, newAlgorithm, newQuantum, newMemAlgorithm) => {
    const initSnapshot = createInitialSnapshot({
      processes: newProcesses,
      algorithm: newAlgorithm,
      quantum: newQuantum,
      memAlgorithm: newMemAlgorithm,
    });
    setHistory([initSnapshot]);
    setActiveTick(0);
    setRunning(false);
  }, []);

  // Step Forward: Advances active cursor if inspecting past; otherwise computes next snapshot
  const stepForward = useCallback(() => {
    if (activeTick < history.length - 1) {
      setActiveTick(t => t + 1);
      return;
    }

    const currentHead = history[history.length - 1];
    if (currentHead.isCompleted) {
      setRunning(false);
      return;
    }

    const nextSnapshot = stepSimulation(currentHead);
    setHistory(prev => {
      // Bound history to prevent memory leak (500 snapshots)
      if (prev.length > 500) {
        return [...prev.slice(1), nextSnapshot];
      }
      return [...prev, nextSnapshot];
    });
    setActiveTick(nextSnapshot.systemTime);
  }, [activeTick, history]);

  // Step Backward: Deterministic time travel
  const stepBackward = useCallback(() => {
    setRunning(false);
    setActiveTick(t => Math.max(0, t - 1));
  }, []);

  // Jump to beginning (t=0)
  const jumpToBeginning = useCallback(() => {
    setRunning(false);
    setActiveTick(0);
  }, []);

  // Jump to latest simulated state
  const jumpToLatest = useCallback(() => {
    setActiveTick(history.length - 1);
  }, [history.length]);

  // Reset to initial state
  const handleReset = useCallback(() => {
    resetSimulationWithParams(processes, algorithm, quantum, memAlgorithm);
  }, [processes, algorithm, quantum, memAlgorithm, resetSimulationWithParams]);

  // Toggle Play / Pause with historical branching
  const handleToggleRun = useCallback(() => {
    if (currentSnapshot.isCompleted) {
      // If completed and user presses start, reset and start fresh
      handleReset();
      setRunning(true);
      return;
    }

    if (!running && isHistorical) {
      // Branch future history when resuming from a historical inspection point
      const branchedHistory = history.slice(0, activeTick + 1);
      setHistory(branchedHistory);
    }

    setRunning(r => !r);
  }, [running, isHistorical, currentSnapshot.isCompleted, handleReset, history, activeTick]);

  // Continuous Clock Execution
  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setHistory(prevHistory => {
        // Handle historical branching if running was started mid-history
        const head = prevHistory[activeTick] || prevHistory[prevHistory.length - 1];
        if (head.isCompleted) {
          setRunning(false);
          return prevHistory;
        }

        const nextSnapshot = stepSimulation(head);
        const branched = prevHistory.slice(0, activeTick + 1);
        setActiveTick(nextSnapshot.systemTime);
        return [...branched, nextSnapshot];
      });
    }, speed);

    return () => clearInterval(timer);
  }, [running, speed, activeTick]);

  // Process management handlers
  const handleAddProcess = (newProcess) => {
    const updated = [...processes, newProcess];
    setProcesses(updated);
    resetSimulationWithParams(updated, algorithm, quantum, memAlgorithm);
  };

  const handleRemoveProcess = (id) => {
    const updated = processes.filter(p => p.id !== id);
    setProcesses(updated);
    resetSimulationWithParams(updated, algorithm, quantum, memAlgorithm);
  };

  const handleClearProcesses = () => {
    setProcesses([]);
    resetSimulationWithParams([], algorithm, quantum, memAlgorithm);
  };

  const handleChangeAlgorithm = (newAlg) => {
    setAlgorithm(newAlg);
    resetSimulationWithParams(processes, newAlg, quantum, memAlgorithm);
  };

  const handleChangeQuantum = (newQ) => {
    setQuantum(newQ);
    resetSimulationWithParams(processes, algorithm, newQ, memAlgorithm);
  };

  const handleChangeMemAlgorithm = (newMem) => {
    setMemAlgorithm(newMem);
    resetSimulationWithParams(processes, algorithm, quantum, newMem);
  };

  const handleLoadPreset = (preset) => {
    setProcesses(preset.processes);
    if (preset.algorithm) setAlgorithm(preset.algorithm);
    if (preset.quantum) setQuantum(preset.quantum);
    resetSimulationWithParams(
      preset.processes,
      preset.algorithm || algorithm,
      preset.quantum || quantum,
      memAlgorithm
    );
  };

  return (
    <div className="os-lab-root">
      {/* Persistent Navigation Header */}
      <Navigation
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        isHistorical={isHistorical}
        currentTick={activeTick}
        latestTick={latestTick}
      />

      {/* Main Workspace Area */}
      <main className="app-main">
        {activeSection === SECTIONS.OVERVIEW && (
          <Overview
            currentSnapshot={currentSnapshot}
            onNavigateSection={setActiveSection}
            onLoadCpuPreset={handleLoadPreset}
            onStartSimulation={handleToggleRun}
            running={running}
          />
        )}

        {activeSection === SECTIONS.SCHEDULING && (
          <Scheduling
            currentSnapshot={currentSnapshot}
            history={history}
            currentTick={activeTick}
            latestTick={latestTick}
            running={running}
            speed={speed}
            onToggleRun={handleToggleRun}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            onJumpToBeginning={jumpToBeginning}
            onJumpToLatest={jumpToLatest}
            onReset={handleReset}
            onChangeSpeed={setSpeed}
            onSelectTick={setActiveTick}
            onAddProcess={handleAddProcess}
            onRemoveProcess={handleRemoveProcess}
            onClearProcesses={handleClearProcesses}
            onChangeAlgorithm={handleChangeAlgorithm}
            onChangeQuantum={handleChangeQuantum}
            onChangeMemAlgorithm={handleChangeMemAlgorithm}
            onLoadPreset={handleLoadPreset}
          />
        )}

        {activeSection === SECTIONS.MEMORY && (
          <MemoryManagement />
        )}

        {activeSection === SECTIONS.BATTLE && (
          <AlgorithmBattle
            baseProcesses={processes}
            onApplyWorkloadToMain={(wl) => {
              setProcesses(wl);
              resetSimulationWithParams(wl, algorithm, quantum, memAlgorithm);
              setActiveSection(SECTIONS.SCHEDULING);
            }}
          />
        )}

        {activeSection === SECTIONS.HISTORY && (
          <ExecutionHistory
            events={currentSnapshot.events}
            processes={processes}
            onNavigateToTick={(tick) => {
              setActiveTick(Math.min(tick, history.length - 1));
              setActiveSection(SECTIONS.SCHEDULING);
            }}
            currentSnapshot={currentSnapshot}
          />
        )}
      </main>
    </div>
  );
}
