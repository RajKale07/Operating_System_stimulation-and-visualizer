import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ALGORITHMS,
  selectNextProcess,
  calculateSchedulingMetrics,
  runBatchSimulation,
} from '../src/algorithms/scheduling.js';

describe('CPU Scheduling Algorithms', () => {
  test('selectNextProcess chooses smallest remaining job in SRTF', () => {
    const queue = [
      { id: 'p1', name: 'P1', remaining: 5, arrival: 0 },
      { id: 'p2', name: 'P2', remaining: 2, arrival: 1 },
    ];
    const chosen = selectNextProcess(ALGORITHMS.SRTF, queue, null);
    assert.equal(chosen.id, 'p2');
  });

  test('calculateSchedulingMetrics computes valid numbers on empty list', () => {
    const metrics = calculateSchedulingMetrics([], 0);
    assert.equal(metrics.avgWaiting, 0);
    assert.equal(metrics.cpuUtilization, 0);
  });

  test('FCFS executes in order of arrival', () => {
    const processes = [
      { id: 'p1', name: 'P1', arrival: 0, burst: 4 },
      { id: 'p2', name: 'P2', arrival: 1, burst: 3 },
      { id: 'p3', name: 'P3', arrival: 2, burst: 1 },
    ];

    const result = runBatchSimulation({
      processes,
      algorithm: ALGORITHMS.FCFS,
    });

    // P1 runs 0-4, P2 runs 4-7, P3 runs 7-8
    assert.equal(result.totalTime, 8);
    assert.equal(result.processes.find(p => p.id === 'p1').completionTime, 4);
    assert.equal(result.processes.find(p => p.id === 'p2').completionTime, 7);
    assert.equal(result.processes.find(p => p.id === 'p3').completionTime, 8);

    // Turnaround times: P1: 4-0=4, P2: 7-1=6, P3: 8-2=6. Avg TAT = (4+6+6)/3 = 5.33
    assert.equal(result.metrics.avgTurnaround, 5.33);
    // Waiting times: P1: 4-4=0, P2: 6-3=3, P3: 6-1=5. Avg WT = (0+3+5)/3 = 2.67
    assert.equal(result.metrics.avgWaiting, 2.67);
  });

  test('SRTF preempts running process when shorter job arrives', () => {
    const processes = [
      { id: 'p1', name: 'P1', arrival: 0, burst: 8 },
      { id: 'p2', name: 'P2', arrival: 1, burst: 2 },
    ];

    const result = runBatchSimulation({
      processes,
      algorithm: ALGORITHMS.SRTF,
    });

    // At t=0, P1 starts (remaining becomes 7 at t=1)
    // At t=1, P2 arrives with burst 2 < remaining 7. P1 is preempted!
    // P2 runs 1-3 (completes at 3)
    // P1 resumes 3-10 (completes at 10)
    assert.equal(result.totalTime, 10);
    assert.equal(result.processes.find(p => p.id === 'p2').completionTime, 3);
    assert.equal(result.processes.find(p => p.id === 'p1').completionTime, 10);
    assert.ok(result.metrics.preemptions >= 1);
  });

  test('Round Robin respects quantum and rotates processes', () => {
    const processes = [
      { id: 'p1', name: 'P1', arrival: 0, burst: 4 },
      { id: 'p2', name: 'P2', arrival: 0, burst: 3 },
    ];

    const result = runBatchSimulation({
      processes,
      algorithm: ALGORITHMS.RR,
      quantum: 2,
    });

    // t=0..2: P1 (rem: 2) -> preempted
    // t=2..4: P2 (rem: 1) -> preempted
    // t=4..6: P1 (rem: 0) -> finishes at 6
    // t=6..7: P2 (rem: 0) -> finishes at 7
    assert.equal(result.totalTime, 7);
    assert.equal(result.processes.find(p => p.id === 'p1').completionTime, 6);
    assert.equal(result.processes.find(p => p.id === 'p2').completionTime, 7);
  });

  test('Handles CPU idle intervals when arrivals have gaps', () => {
    const processes = [
      { id: 'p1', name: 'P1', arrival: 0, burst: 2 },
      { id: 'p2', name: 'P2', arrival: 5, burst: 2 },
    ];

    const result = runBatchSimulation({
      processes,
      algorithm: ALGORITHMS.FCFS,
    });

    // P1 runs 0-2
    // Idle 2-5 (3 ticks idle)
    // P2 runs 5-7
    assert.equal(result.totalTime, 7);
    assert.equal(result.metrics.idleTicks, 3);
    assert.equal(result.metrics.cpuUtilization, 57.1); // 4 / 7 = 57.1%
  });
});
