/**
 * Workload Presets & Guided Experiments for OS Laboratory
 * Each preset demonstrates a specific operating systems principle.
 */

export const CPU_PRESETS = [
  {
    id: 'convoy-effect',
    title: 'Convoy Effect (FCFS vs SRTF)',
    description:
      'A long process (P1, burst=12) arrives first, followed by rapid short processes (P2, P3, P4). Demonstrates how FCFS causes long waiting times for short jobs compared to SRTF.',
    algorithm: 'FCFS',
    quantum: 2,
    processes: [
      { id: 'p1', name: 'P1', arrival: 0, burst: 12, pages: [1, 2, 3] },
      { id: 'p2', name: 'P2', arrival: 1, burst: 2, pages: [2, 4] },
      { id: 'p3', name: 'P3', arrival: 2, burst: 2, pages: [1, 3] },
      { id: 'p4', name: 'P4', arrival: 3, burst: 1, pages: [5] },
    ],
  },
  {
    id: 'simultaneous-arrivals',
    title: 'Simultaneous Arrivals & Order of Execution',
    description:
      'Four processes arrive simultaneously at t=0 with varied burst times. Illustrates execution order differences between FCFS, SRTF, and Round Robin.',
    algorithm: 'RR',
    quantum: 3,
    processes: [
      { id: 'p1', name: 'P1', arrival: 0, burst: 5, pages: [1, 2] },
      { id: 'p2', name: 'P2', arrival: 0, burst: 8, pages: [2, 3, 4] },
      { id: 'p3', name: 'P3', arrival: 0, burst: 2, pages: [1, 4] },
      { id: 'p4', name: 'P4', arrival: 0, burst: 4, pages: [3, 5] },
    ],
  },
  {
    id: 'cpu-idle-gaps',
    title: 'Staggered Arrivals with CPU Idle Gaps',
    description:
      'Processes arrive with significant time intervals, forcing the CPU into idle periods. Tests idle-time accounting and CPU utilization calculations.',
    algorithm: 'FCFS',
    quantum: 2,
    processes: [
      { id: 'p1', name: 'P1', arrival: 0, burst: 3, pages: [1, 2] },
      { id: 'p2', name: 'P2', arrival: 6, burst: 4, pages: [2, 3] },
      { id: 'p3', name: 'P3', arrival: 14, burst: 2, pages: [1, 4] },
    ],
  },
  {
    id: 'rr-quantum-dynamics',
    title: 'Round Robin Quantum Dynamics (Time Slicing)',
    description:
      'Processes with burst times that span multiple quantum slices. Demonstrates preemption, round-robin rotation, and context-switch frequency.',
    algorithm: 'RR',
    quantum: 2,
    processes: [
      { id: 'p1', name: 'P1', arrival: 0, burst: 6, pages: [1, 2, 3] },
      { id: 'p2', name: 'P2', arrival: 1, burst: 5, pages: [2, 4] },
      { id: 'p3', name: 'P3', arrival: 2, burst: 4, pages: [1, 5] },
    ],
  },
  {
    id: 'preemption-cascade',
    title: 'SRTF Preemption Cascade',
    description:
      'Successive arrivals with progressively shorter remaining burst times repeatedly preempt the running process.',
    algorithm: 'SRTF',
    quantum: 2,
    processes: [
      { id: 'p1', name: 'P1', arrival: 0, burst: 10, pages: [1, 2] },
      { id: 'p2', name: 'P2', arrival: 2, burst: 4, pages: [2, 3] },
      { id: 'p3', name: 'P3', arrival: 4, burst: 1, pages: [1] },
      { id: 'p4', name: 'P4', arrival: 6, burst: 2, pages: [3, 4] },
    ],
  },
];

export const MEMORY_PRESETS = [
  {
    id: 'high-locality',
    title: 'High Locality of Reference (High Hit Ratio)',
    description:
      'A working set of pages [1, 2, 3, 2, 1, 3] repeated multiple times. Demonstrates low page fault frequency when the working set fits into physical frames.',
    referenceString: [1, 2, 3, 2, 1, 3, 1, 2, 3, 2, 1, 3],
  },
  {
    id: 'thrashing-loop',
    title: 'Working Set Exceeds Frames (Thrashing)',
    description:
      'Sequence of 9 unique pages cycling through 8 frames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8]. Illustrates continuous page faults and evictions.',
    referenceString: [0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: 'fifo-vs-lru-divergence',
    title: 'FIFO vs. LRU Divergence',
    description:
      'A page sequence where FIFO repeatedly evicts a heavily referenced older page, whereas LRU maintains it resident in physical memory due to recency.',
    referenceString: [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5],
  },
  {
    id: 'cold-start-saturation',
    title: 'Cold Start to Saturation',
    description:
      'Eight distinct pages fill all 8 empty frames without eviction, followed by requests that trigger the first page replacements.',
    referenceString: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2],
  },
];
