/**
 * CPU Scheduling Algorithms & Metrics
 * Supported: FCFS (First-Come, First-Served), SRTF (Shortest Remaining Time First), RR (Round Robin)
 * Pure, deterministic functions decoupled from UI rendering.
 */

export const ALGORITHMS = {
  FCFS: 'FCFS',
  SRTF: 'SRTF',
  RR: 'RR',
};

/**
 * Deep clone a process object
 */
export function cloneProcess(p) {
  return {
    ...p,
    pages: Array.isArray(p.pages) ? [...p.pages] : [],
  };
}

/**
 * Select the next process to execute.
 * @param {string} algorithm - 'FCFS' | 'SRTF' | 'RR'
 * @param {Array} readyQueue - Array of processes currently ready
 * @param {Object|null} currentRunning - Process currently on CPU, if any
 * @returns {Object|null} The process selected for execution, or null if idle
 */
export function selectNextProcess(algorithm, readyQueue, currentRunning = null) {
  if (algorithm === ALGORITHMS.FCFS) {
    // Non-preemptive: keep running if still has remaining time
    if (currentRunning && currentRunning.remaining > 0) {
      return currentRunning;
    }
    return readyQueue.length > 0 ? readyQueue[0] : null;
  }

  if (algorithm === ALGORITHMS.SRTF) {
    // Preemptive Shortest Remaining Time First
    const candidates = [];
    if (currentRunning && currentRunning.remaining > 0) {
      candidates.push(currentRunning);
    }
    candidates.push(...readyQueue);

    if (candidates.length === 0) return null;

    // Smallest remaining time wins.
    // Tie-breaker: earlier arrival, then id string comparison
    candidates.sort((a, b) => {
      if (a.remaining !== b.remaining) {
        return a.remaining - b.remaining;
      }
      if (a.arrival !== b.arrival) {
        return a.arrival - b.arrival;
      }
      return a.id.localeCompare(b.id);
    });

    return candidates[0];
  }

  if (algorithm === ALGORITHMS.RR) {
    // Round robin relies on the head of ready queue or existing process if within quantum
    if (currentRunning && currentRunning.remaining > 0) {
      return currentRunning;
    }
    return readyQueue.length > 0 ? readyQueue[0] : null;
  }

  return readyQueue[0] || null;
}

/**
 * Calculate standard scheduling metrics for all completed processes
 * @param {Array} processes - Array of processes with arrival, burst, completionTime, firstStartTime
 * @param {number} totalTime - Total simulated time (makespan)
 * @param {number} idleTicks - Total time CPU spent idle
 * @param {number} contextSwitches - Total context switches
 * @param {number} preemptions - Total preemptions
 */
export function calculateSchedulingMetrics(processes, totalTime, idleTicks = 0, contextSwitches = 0, preemptions = 0) {
  if (!processes || processes.length === 0) {
    return {
      avgWaiting: 0,
      avgTurnaround: 0,
      avgResponse: 0,
      cpuUtilization: 0,
      makespan: 0,
      contextSwitches: 0,
      preemptions: 0,
      perProcess: [],
      isComplete: false,
    };
  }

  const isComplete = processes.every(p => p.remaining === 0 && p.completionTime !== undefined);

  const perProcess = processes.map(p => {
    const completion = p.completionTime !== undefined ? p.completionTime : totalTime;
    const turnaround = Math.max(0, completion - p.arrival);
    const waiting = Math.max(0, turnaround - p.burst);
    const response = p.firstStartTime !== undefined ? Math.max(0, p.firstStartTime - p.arrival) : 0;

    return {
      id: p.id,
      name: p.name,
      arrival: p.arrival,
      burst: p.burst,
      remaining: p.remaining,
      completion,
      turnaround,
      waiting,
      response,
      state: p.remaining === 0 ? 'terminated' : (p.state || 'ready'),
    };
  });

  const count = perProcess.length;
  const avgTurnaround = count > 0 ? perProcess.reduce((s, p) => s + p.turnaround, 0) / count : 0;
  const avgWaiting = count > 0 ? perProcess.reduce((s, p) => s + p.waiting, 0) / count : 0;
  const avgResponse = count > 0 ? perProcess.reduce((s, p) => s + p.response, 0) / count : 0;

  const busyTicks = Math.max(0, totalTime - idleTicks);
  const cpuUtilization = totalTime > 0 ? (busyTicks / totalTime) * 100 : 0;

  return {
    avgWaiting: Number(avgWaiting.toFixed(2)),
    avgTurnaround: Number(avgTurnaround.toFixed(2)),
    avgResponse: Number(avgResponse.toFixed(2)),
    cpuUtilization: Number(cpuUtilization.toFixed(1)),
    makespan: totalTime,
    idleTicks,
    contextSwitches,
    preemptions,
    perProcess,
    isComplete,
  };
}

/**
 * Runs a complete batch simulation for a given algorithm and workload.
 * Deterministic and used by Algorithm Battle Mode and automated testing.
 */
export function runBatchSimulation({ processes: initialProcesses, algorithm, quantum = 2, maxTicks = 500 }) {
  // Deep clone processes
  let processes = initialProcesses.map(p => ({
    ...cloneProcess(p),
    remaining: p.burst,
    firstStartTime: undefined,
    completionTime: undefined,
    timeInQuantum: 0,
    state: p.arrival === 0 ? 'ready' : 'new',
  }));

  let systemTime = 0;
  let readyQueue = [];
  let currentRunning = null;
  let idleTicks = 0;
  let contextSwitches = 0;
  let preemptions = 0;

  const gantt = [];
  const timelineTicks = []; // snapshot per tick
  const events = [];

  // Enqueue initial arrivals at t = 0
  const initialArrivals = processes.filter(p => p.arrival === 0);
  initialArrivals.forEach(p => {
    p.state = 'ready';
    readyQueue.push(p);
    events.push({
      time: 0,
      type: 'ARRIVAL',
      processId: p.id,
      processName: p.name,
      message: `Process ${p.name} arrived at ready queue (burst=${p.burst}).`,
    });
  });

  while (systemTime < maxTicks) {
    const allFinished = processes.every(p => p.remaining === 0);
    if (allFinished) {
      break;
    }

    // 1. Check for newly arriving processes at systemTime (if systemTime > 0)
    if (systemTime > 0) {
      const arriving = processes.filter(p => p.arrival === systemTime);
      for (const p of arriving) {
        p.state = 'ready';
        readyQueue.push(p);
        events.push({
          time: systemTime,
          type: 'ARRIVAL',
          processId: p.id,
          processName: p.name,
          message: `Process ${p.name} arrived at ready queue (burst=${p.burst}).`,
        });
      }
    }

    // 2. Select next process to run
    const selected = selectNextProcess(algorithm, readyQueue, currentRunning);

    // Track preemptions and context switches
    if (selected && currentRunning && selected.id !== currentRunning.id && currentRunning.remaining > 0) {
      preemptions++;
      contextSwitches++;
      currentRunning.state = 'ready';
      events.push({
        time: systemTime,
        type: 'PREEMPTION',
        processId: currentRunning.id,
        processName: currentRunning.name,
        message: `Process ${currentRunning.name} preempted by ${selected.name} (remaining: ${currentRunning.remaining}).`,
      });
      // Return previous running to readyQueue if not already there
      if (!readyQueue.some(p => p.id === currentRunning.id)) {
        readyQueue.push(currentRunning);
      }
    } else if (selected && (!currentRunning || currentRunning.id !== selected.id)) {
      contextSwitches++;
      events.push({
        time: systemTime,
        type: 'DISPATCH',
        processId: selected.id,
        processName: selected.name,
        message: `CPU dispatched to ${selected.name} at tick ${systemTime}.`,
      });
    }

    currentRunning = selected;

    // Remove selected from readyQueue while it runs
    if (currentRunning) {
      readyQueue = readyQueue.filter(p => p.id !== currentRunning.id);
      currentRunning.state = 'running';

      if (currentRunning.firstStartTime === undefined) {
        currentRunning.firstStartTime = systemTime;
      }
    } else {
      idleTicks++;
      events.push({
        time: systemTime,
        type: 'IDLE',
        message: `CPU idle at tick ${systemTime}.`,
      });
    }

    // 3. Record Gantt segment
    if (currentRunning) {
      const lastGantt = gantt[gantt.length - 1];
      if (lastGantt && lastGantt.processId === currentRunning.id) {
        lastGantt.duration += 1;
      } else {
        gantt.push({
          processId: currentRunning.id,
          name: currentRunning.name,
          startTime: systemTime,
          duration: 1,
        });
      }
    } else {
      const lastGantt = gantt[gantt.length - 1];
      if (lastGantt && lastGantt.processId === 'IDLE') {
        lastGantt.duration += 1;
      } else {
        gantt.push({
          processId: 'IDLE',
          name: 'IDLE',
          startTime: systemTime,
          duration: 1,
        });
      }
    }

    // 4. Save timeline tick record
    timelineTicks.push({
      time: systemTime,
      runningProcessId: currentRunning ? currentRunning.id : null,
      runningProcessName: currentRunning ? currentRunning.name : 'IDLE',
      readyQueueIds: readyQueue.map(p => p.id),
      processStates: processes.map(p => ({
        id: p.id,
        name: p.name,
        state: p.remaining === 0 ? 'terminated' : (currentRunning && p.id === currentRunning.id ? 'running' : (p.arrival <= systemTime ? 'ready' : 'new')),
        remaining: p.remaining,
      })),
    });

    // 5. Execute 1 unit of CPU burst
    if (currentRunning) {
      currentRunning.remaining -= 1;
      currentRunning.timeInQuantum = (currentRunning.timeInQuantum || 0) + 1;

      // Check completion
      if (currentRunning.remaining === 0) {
        currentRunning.completionTime = systemTime + 1;
        currentRunning.state = 'terminated';
        events.push({
          time: systemTime + 1,
          type: 'COMPLETION',
          processId: currentRunning.id,
          processName: currentRunning.name,
          message: `Process ${currentRunning.name} completed execution at tick ${systemTime + 1}.`,
        });
        currentRunning = null;
      } else if (algorithm === ALGORITHMS.RR && currentRunning.timeInQuantum >= quantum) {
        // RR Quantum expired
        currentRunning.timeInQuantum = 0;
        currentRunning.state = 'ready';
        preemptions++;
        events.push({
          time: systemTime + 1,
          type: 'QUANTUM_EXPIRED',
          processId: currentRunning.id,
          processName: currentRunning.name,
          message: `Process ${currentRunning.name} quantum (${quantum}) expired at tick ${systemTime + 1}.`,
        });
        // Put at tail of readyQueue for next tick
        readyQueue.push(currentRunning);
        currentRunning = null;
      }
    }

    systemTime++;
  }

  const metrics = calculateSchedulingMetrics(processes, systemTime, idleTicks, contextSwitches, preemptions);

  return {
    algorithm,
    quantum,
    totalTime: systemTime,
    processes,
    gantt,
    timelineTicks,
    events,
    metrics,
  };
}
