import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialSnapshot,
  stepSimulation,
} from '../src/simulation/engine.js';
import { ALGORITHMS } from '../src/algorithms/scheduling.js';
import { MEMORY_ALGORITHMS } from '../src/algorithms/pageReplacement.js';

describe('Deterministic Simulation Engine & Time Travel', () => {
  test('Step simulation advances systemTime by exactly 1 tick', () => {
    const processes = [
      { id: 'p1', name: 'P1', arrival: 0, burst: 2, pages: [1, 2] },
    ];

    const state0 = createInitialSnapshot({
      processes,
      algorithm: ALGORITHMS.FCFS,
      memAlgorithm: MEMORY_ALGORITHMS.FIFO,
    });

    assert.equal(state0.systemTime, 0);
    assert.equal(state0.runningProcessId, null);
    assert.equal(state0.readyQueue.length, 1);

    const state1 = stepSimulation(state0);
    assert.equal(state1.systemTime, 1);
    assert.equal(state1.processes.find(p => p.id === 'p1').remaining, 1);

    const state2 = stepSimulation(state1);
    assert.equal(state2.systemTime, 2);
    assert.equal(state2.processes.find(p => p.id === 'p1').remaining, 0);
    assert.equal(state2.isCompleted, true);
  });

  test('Continuous stepping produces deterministic history stack allowing backward inspection', () => {
    const processes = [
      { id: 'p1', name: 'P1', arrival: 0, burst: 3, pages: [1] },
      { id: 'p2', name: 'P2', arrival: 1, burst: 2, pages: [2] },
    ];

    const history = [];
    let state = createInitialSnapshot({
      processes,
      algorithm: ALGORITHMS.FCFS,
    });
    history.push(state);

    while (!state.isCompleted && state.systemTime < 20) {
      state = stepSimulation(state);
      history.push(state);
    }

    // Full execution finished
    assert.equal(state.isCompleted, true);
    assert.equal(state.systemTime, 5); // 3 + 2 = 5
    assert.equal(history.length, 6); // tick 0 to 5

    // Verify historical snapshot at tick 2: P1 is running, remaining = 1, P2 is in ready queue
    const tick2 = history[2];
    assert.equal(tick2.systemTime, 2);
    assert.equal(tick2.processes.find(p => p.id === 'p1').remaining, 1);
    assert.equal(tick2.processes.find(p => p.id === 'p2').remaining, 2);
    assert.equal(tick2.readyQueue.includes('p2'), true);

    // Verify historical snapshot at tick 0: both bursts at original values
    const tick0 = history[0];
    assert.equal(tick0.processes.find(p => p.id === 'p1').remaining, 3);
    assert.equal(tick0.processes.find(p => p.id === 'p2').remaining, 2);
  });
});
