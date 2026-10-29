/**
 * Virtual Memory Paging & Page Replacement Algorithms
 * Supported: FIFO (First-In, First-Out), LRU (Least Recently Used)
 * Strict separation of loadedAt (FIFO) and lastAccessed (LRU) timestamps.
 */

export const MEMORY_ALGORITHMS = {
  FIFO: 'FIFO',
  LRU: 'LRU',
};

/**
 * Creates an empty array of physical memory frames.
 * @param {number} frameCount - Total number of physical frames (default 8)
 */
export function createInitialFrames(frameCount = 8) {
  return Array.from({ length: frameCount }, (_, i) => ({
    frameIndex: i,
    page: null,
    loadedAt: Infinity,
    lastAccessed: -1,
  }));
}

/**
 * Execute a single page reference against physical memory frames.
 * Deterministic and pure function.
 *
 * @param {Object} params
 * @param {Array} params.frames - Current frame state array
 * @param {number} params.page - The requested virtual page number
 * @param {string} params.algorithm - 'FIFO' | 'LRU'
 * @param {number} params.currentTime - Current simulation/reference timestamp
 * @returns {Object} { frames, hit, evicted: null | { page, frameIndex, reason }, frameIndex }
 */
export function stepPageReplacement({ frames, page, algorithm = MEMORY_ALGORITHMS.FIFO, currentTime = 0 }) {
  // Check for Page HIT
  const hitIndex = frames.findIndex(f => f.page === page);
  if (hitIndex !== -1) {
    const updatedFrames = frames.map((f, i) => {
      if (i === hitIndex) {
        return {
          ...f,
          // In LRU, hit updates the lastAccessed timestamp; loadedAt never changes on hit
          lastAccessed: currentTime,
        };
      }
      return { ...f };
    });

    return {
      frames: updatedFrames,
      hit: true,
      evicted: null,
      frameIndex: hitIndex,
      reason: `Page ${page} hit in Frame ${hitIndex}.`,
    };
  }

  // Page FAULT (MISS)
  // 1. Try to find an empty frame
  const emptyIndex = frames.findIndex(f => f.page === null);
  if (emptyIndex !== -1) {
    const updatedFrames = frames.map((f, i) => {
      if (i === emptyIndex) {
        return {
          frameIndex: i,
          page,
          loadedAt: currentTime,
          lastAccessed: currentTime,
        };
      }
      return { ...f };
    });

    return {
      frames: updatedFrames,
      hit: false,
      evicted: null,
      frameIndex: emptyIndex,
      reason: `Page fault: Allocated Page ${page} into empty Frame ${emptyIndex}.`,
    };
  }

  // 2. All frames occupied: select victim based on replacement algorithm
  let victimIndex = 0;

  if (algorithm === MEMORY_ALGORITHMS.LRU) {
    // Evict frame with minimum lastAccessed
    victimIndex = frames.reduce((oldestIdx, frame, idx, arr) => {
      return frame.lastAccessed < arr[oldestIdx].lastAccessed ? idx : oldestIdx;
    }, 0);
  } else {
    // FIFO: Evict frame with minimum loadedAt
    victimIndex = frames.reduce((oldestIdx, frame, idx, arr) => {
      return frame.loadedAt < arr[oldestIdx].loadedAt ? idx : oldestIdx;
    }, 0);
  }

  const victimFrame = frames[victimIndex];
  const evictedPage = victimFrame.page;

  const evictionReason =
    algorithm === MEMORY_ALGORITHMS.LRU
      ? `Page ${evictedPage} evicted from Frame ${victimIndex} because its last access was earliest (t=${victimFrame.lastAccessed}).`
      : `Page ${evictedPage} evicted from Frame ${victimIndex} because it entered memory earliest (t=${victimFrame.loadedAt}).`;

  const updatedFrames = frames.map((f, i) => {
    if (i === victimIndex) {
      return {
        frameIndex: i,
        page,
        loadedAt: currentTime,
        lastAccessed: currentTime,
      };
    }
    return { ...f };
  });

  return {
    frames: updatedFrames,
    hit: false,
    evicted: {
      page: evictedPage,
      frameIndex: victimIndex,
      reason: evictionReason,
      previousLoadedAt: victimFrame.loadedAt,
      previousLastAccessed: victimFrame.lastAccessed,
    },
    frameIndex: victimIndex,
    reason: evictionReason,
  };
}

/**
 * Runs a complete batch memory simulation for a sequence of page references.
 * Used for side-by-side comparison (FIFO vs LRU) and automated testing.
 *
 * @param {Object} params
 * @param {Array<number>} params.referenceString - Sequence of page integers
 * @param {string} params.algorithm - 'FIFO' | 'LRU'
 * @param {number} params.frameCount - Frame capacity (default 8)
 */
export function runMemorySimulation({ referenceString, algorithm, frameCount = 8 }) {
  let frames = createInitialFrames(frameCount);
  let hits = 0;
  let faults = 0;
  let evictions = 0;

  const steps = [];
  const evictionLog = [];

  referenceString.forEach((page, time) => {
    const result = stepPageReplacement({
      frames,
      page,
      algorithm,
      currentTime: time,
    });

    frames = result.frames;

    if (result.hit) {
      hits++;
    } else {
      faults++;
      if (result.evicted) {
        evictions++;
        evictionLog.push({
          time,
          page,
          evictedPage: result.evicted.page,
          frameIndex: result.evicted.frameIndex,
          reason: result.evicted.reason,
        });
      }
    }

    steps.push({
      time,
      page,
      hit: result.hit,
      frameIndex: result.frameIndex,
      evicted: result.evicted,
      framesSnapshot: frames.map(f => ({ ...f })),
      reason: result.reason,
    });
  });

  const total = referenceString.length;
  const hitRatio = total > 0 ? Number(((hits / total) * 100).toFixed(1)) : 0;
  const faultRatio = total > 0 ? Number(((faults / total) * 100).toFixed(1)) : 0;

  return {
    algorithm,
    frameCount,
    totalReferences: total,
    hits,
    faults,
    evictions,
    hitRatio,
    faultRatio,
    steps,
    evictionLog,
    finalFrames: frames,
  };
}
