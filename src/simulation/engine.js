/**
 * Core Deterministic Simulation Engine with Full Time-Travel Snapshots
 * Integrates CPU scheduling, physical memory frames, and structured events.
 */

import {
  ALGORITHMS,
  selectNextProcess,
  calculateSchedulingMetrics,
  cloneProcess,
} from '../algorithms/scheduling.js';
import {
  MEMORY_ALGORITHMS,
  createInitialFrames,
  stepPageReplacement,
} from '../algorithms/pageReplacement.js';

let eventCounter = 1;
export function createEventId() {
  return `evt_${Date.now()}_${eventCounter++}`;
}

/**
 * Creates the initial snapshot at tick 0.
 */
export function createInitialSnapshot({
  processes = [],
  algorithm = ALGORITHMS.FCFS,
  quantum = 2,
  memAlgorithm = MEMORY_ALGORITHMS.FIFO,
  frameCount = 8,
}) {
  const initialProcesses = processes.map(p => ({
    ...cloneProcess(p),
    remaining: p.burst,
    firstStartTime: undefined,
    completionTime: undefined,
    timeInQuantum: 0,
    state: p.arrival === 0 ? 'ready' : 'new',
  }));

  const readyQueue = [];
  const events = [];

  // Enqueue t=0 arrivals
  initialProcesses.forEach(p => {
    if (p.arrival === 0) {
      readyQueue.push(p.id);
      events.push({
        id: createEventId(),
        time: 0,
        type: 'ARRIVAL',
        category: 'cpu',
        processId: p.id,
        processName: p.name,
        message: `Process ${p.name} arrived at ready queue (burst: ${p.burst}).`,
        details: { arrival: 0, burst: p.burst, pages: p.pages },
      });
    }
  });

  const frames = createInitialFrames(frameCount);

  return {
    systemTime: 0,
    algorithm,
    quantum,
    memAlgorithm,
    frameCount,
    processes: initialProcesses,
    readyQueue, // Array of process IDs
    runningProcessId: null,
    gantt: [],
    frames,
    events,
    idleTicks: 0,
    contextSwitches: 0,
    preemptions: 0,
    memoryStats: {
      totalReferences: 0,
      hits: 0,
      faults: 0,
      evictions: 0,
    },
    metrics: calculateSchedulingMetrics(initialProcesses, 0, 0, 0, 0),
    isCompleted: false,
  };
}

/**
 * Step forward by exactly 1 tick. Pure and deterministic.
 * @param {Object} state - The current snapshot
 * @returns {Object} nextSnapshot
 */
export function stepSimulation(state) {
  if (state.isCompleted) {
    return state;
  }

  const {
    systemTime,
    algorithm,
    quantum,
    memAlgorithm,
    frameCount,
  } = state;

  // Clone processes deeply
  const processes = state.processes.map(p => ({
    ...p,
    pages: Array.isArray(p.pages) ? [...p.pages] : [],
  }));

  let readyQueue = [...state.readyQueue];
  let runningProcessId = state.runningProcessId;
  let idleTicks = state.idleTicks;
  let contextSwitches = state.contextSwitches;
  let preemptions = state.preemptions;
  let frames = state.frames.map(f => ({ ...f }));
  const gantt = state.gantt.map(g => ({ ...g }));
  const events = [...state.events];
  const memoryStats = { ...state.memoryStats };

  // 1. Process arrivals occurring at systemTime
  processes.forEach(p => {
    if (p.arrival === systemTime && !readyQueue.includes(p.id) && runningProcessId !== p.id && p.remaining > 0) {
      p.state = 'ready';
      readyQueue.push(p.id);
      events.push({
        id: createEventId(),
        time: systemTime,
        type: 'ARRIVAL',
        category: 'cpu',
        processId: p.id,
        processName: p.name,
        message: `Process ${p.name} arrived at ready queue (burst: ${p.burst}).`,
        details: { arrival: p.arrival, burst: p.burst, pages: p.pages },
      });
    }
  });

  // 2. Select process to run
  const readyProcessObjects = readyQueue
    .map(id => processes.find(p => p.id === id))
    .filter(Boolean);

  const currentRunningObj = runningProcessId
    ? processes.find(p => p.id === runningProcessId)
    : null;

  const selected = selectNextProcess(algorithm, readyProcessObjects, currentRunningObj);

  // Detect preemption / context switches
  if (selected && currentRunningObj && selected.id !== currentRunningObj.id && currentRunningObj.remaining > 0) {
    preemptions++;
    contextSwitches++;
    currentRunningObj.state = 'ready';
    events.push({
      id: createEventId(),
      time: systemTime,
      type: 'PREEMPTION',
      category: 'cpu',
      processId: currentRunningObj.id,
      processName: currentRunningObj.name,
      message: `Process ${currentRunningObj.name} preempted by ${selected.name} (remaining: ${currentRunningObj.remaining}).`,
      details: { preemptedBy: selected.id, remaining: currentRunningObj.remaining },
    });
    if (!readyQueue.includes(currentRunningObj.id)) {
      readyQueue.push(currentRunningObj.id);
    }
  } else if (selected && (!currentRunningObj || currentRunningObj.id !== selected.id)) {
    contextSwitches++;
    events.push({
      id: createEventId(),
      time: systemTime,
      type: 'DISPATCH',
      category: 'cpu',
      processId: selected.id,
      processName: selected.name,
      message: `CPU dispatched to ${selected.name} at tick ${systemTime}.`,
      details: { processId: selected.id, remaining: selected.remaining },
    });
  }

  runningProcessId = selected ? selected.id : null;

  if (runningProcessId) {
    readyQueue = readyQueue.filter(id => id !== runningProcessId);
    const proc = processes.find(p => p.id === runningProcessId);
    proc.state = 'running';

    if (proc.firstStartTime === undefined) {
      proc.firstStartTime = systemTime;
    }
  } else {
    idleTicks++;
    events.push({
      id: createEventId(),
      time: systemTime,
      type: 'IDLE',
      category: 'cpu',
      message: `CPU idle at tick ${systemTime}.`,
      details: {},
    });
  }

  // 3. Record Gantt timeline
  const activeName = runningProcessId
    ? processes.find(p => p.id === runningProcessId).name
    : 'IDLE';

  const lastGantt = gantt[gantt.length - 1];
  if (lastGantt && lastGantt.processId === (runningProcessId || 'IDLE')) {
    lastGantt.duration += 1;
  } else {
    gantt.push({
      processId: runningProcessId || 'IDLE',
      name: activeName,
      startTime: systemTime,
      duration: 1,
    });
  }

  // 4. Memory Paging Access for the executing process
  if (runningProcessId) {
    const runningProc = processes.find(p => p.id === runningProcessId);
    if (runningProc.pages && runningProc.pages.length > 0) {
      const executedUnits = runningProc.burst - runningProc.remaining;
      const pageIndex = executedUnits % runningProc.pages.length;
      const requestedPage = runningProc.pages[pageIndex];

      memoryStats.totalReferences += 1;

      const memResult = stepPageReplacement({
        frames,
        page: requestedPage,
        algorithm: memAlgorithm,
        currentTime: systemTime,
      });

      frames = memResult.frames;

      if (memResult.hit) {
        memoryStats.hits += 1;
        events.push({
          id: createEventId(),
          time: systemTime,
          type: 'PAGE_HIT',
          category: 'memory',
          processId: runningProc.id,
          processName: runningProc.name,
          page: requestedPage,
          frameIndex: memResult.frameIndex,
          message: `${runningProc.name} referenced Page ${requestedPage} -> HIT in Frame ${memResult.frameIndex}.`,
          details: { requestedPage, frameIndex: memResult.frameIndex },
        });
      } else {
        memoryStats.faults += 1;
        if (memResult.evicted) {
          memoryStats.evictions += 1;
          events.push({
            id: createEventId(),
            time: systemTime,
            type: 'PAGE_EVICTION',
            category: 'memory',
            processId: runningProc.id,
            processName: runningProc.name,
            page: requestedPage,
            frameIndex: memResult.frameIndex,
            message: `${runningProc.name} triggered page fault: Page ${memResult.evicted.page} evicted from Frame ${memResult.evicted.frameIndex} -> allocated Page ${requestedPage}.`,
            details: {
              requestedPage,
              evictedPage: memResult.evicted.page,
              frameIndex: memResult.evicted.frameIndex,
              reason: memResult.evicted.reason,
            },
          });
        } else {
          events.push({
            id: createEventId(),
            time: systemTime,
            type: 'PAGE_FAULT',
            category: 'memory',
            processId: runningProc.id,
            processName: runningProc.name,
            page: requestedPage,
            frameIndex: memResult.frameIndex,
            message: `${runningProc.name} triggered page fault: Allocated Page ${requestedPage} into empty Frame ${memResult.frameIndex}.`,
            details: { requestedPage, frameIndex: memResult.frameIndex },
          });
        }
      }
    }
  }

  // 5. Execute 1 unit of CPU burst
  if (runningProcessId) {
    const runningProc = processes.find(p => p.id === runningProcessId);
    runningProc.remaining -= 1;
    runningProc.timeInQuantum = (runningProc.timeInQuantum || 0) + 1;

    // Check completion
    if (runningProc.remaining <= 0) {
      runningProc.completionTime = systemTime + 1;
      runningProc.state = 'terminated';
      events.push({
        id: createEventId(),
        time: systemTime + 1,
        type: 'COMPLETION',
        category: 'cpu',
        processId: runningProc.id,
        processName: runningProc.name,
        message: `Process ${runningProc.name} completed at tick ${systemTime + 1}.`,
        details: {
          completionTime: systemTime + 1,
          turnaround: (systemTime + 1) - runningProc.arrival,
          waiting: ((systemTime + 1) - runningProc.arrival) - runningProc.burst,
        },
      });
      runningProcessId = null;
    } else if (algorithm === ALGORITHMS.RR && runningProc.timeInQuantum >= quantum) {
      // Round robin slice complete
      runningProc.timeInQuantum = 0;
      runningProc.state = 'ready';
      preemptions++;
      events.push({
        id: createEventId(),
        time: systemTime + 1,
        type: 'QUANTUM_EXPIRED',
        category: 'cpu',
        processId: runningProc.id,
        processName: runningProc.name,
        message: `Process ${runningProc.name} time quantum (${quantum}) expired at tick ${systemTime + 1}.`,
        details: { quantum, remaining: runningProc.remaining },
      });
      readyQueue.push(runningProc.id);
      runningProcessId = null;
    }
  }

  const nextSystemTime = systemTime + 1;
  const isCompleted = processes.every(p => p.remaining === 0);

  if (isCompleted && !state.isCompleted) {
    events.push({
      id: createEventId(),
      time: nextSystemTime,
      type: 'SIMULATION_COMPLETE',
      category: 'system',
      message: `All processes terminated. Simulation completed at tick ${nextSystemTime}.`,
      details: {},
    });
  }

  const metrics = calculateSchedulingMetrics(
    processes,
    nextSystemTime,
    idleTicks,
    contextSwitches,
    preemptions
  );

  return {
    systemTime: nextSystemTime,
    algorithm,
    quantum,
    memAlgorithm,
    frameCount,
    processes,
    readyQueue,
    runningProcessId,
    gantt,
    frames,
    events,
    idleTicks,
    contextSwitches,
    preemptions,
    memoryStats,
    metrics,
    isCompleted,
  };
}
