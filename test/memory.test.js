import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  MEMORY_ALGORITHMS,
  createInitialFrames,
  stepPageReplacement,
  runMemorySimulation,
} from '../src/algorithms/pageReplacement.js';

describe('Virtual Memory Page Replacement', () => {
  test('Initial empty frames are allocated without eviction', () => {
    let frames = createInitialFrames(3);

    const step1 = stepPageReplacement({ frames, page: 1, algorithm: MEMORY_ALGORITHMS.FIFO, currentTime: 0 });
    assert.equal(step1.hit, false);
    assert.equal(step1.evicted, null);
    assert.equal(step1.frameIndex, 0);

    const step2 = stepPageReplacement({ frames: step1.frames, page: 2, algorithm: MEMORY_ALGORITHMS.FIFO, currentTime: 1 });
    assert.equal(step2.hit, false);
    assert.equal(step2.evicted, null);
    assert.equal(step2.frameIndex, 1);
  });

  test('Page hit correctly identifies resident page and updates LRU lastAccessed', () => {
    let frames = createInitialFrames(3);
    const s1 = stepPageReplacement({ frames, page: 1, algorithm: MEMORY_ALGORITHMS.LRU, currentTime: 0 });
    const s2 = stepPageReplacement({ frames: s1.frames, page: 2, algorithm: MEMORY_ALGORITHMS.LRU, currentTime: 1 });

    // Access page 1 again at t=2
    const s3 = stepPageReplacement({ frames: s2.frames, page: 1, algorithm: MEMORY_ALGORITHMS.LRU, currentTime: 2 });
    assert.equal(s3.hit, true);
    assert.equal(s3.evicted, null);
    assert.equal(s3.frames[0].lastAccessed, 2);
    // loadedAt must stay unchanged
    assert.equal(s3.frames[0].loadedAt, 0);
  });

  test('FIFO evicts page that entered memory earliest', () => {
    // 3 frames, reference string: 1, 2, 3, 4
    const result = runMemorySimulation({
      referenceString: [1, 2, 3, 4],
      algorithm: MEMORY_ALGORITHMS.FIFO,
      frameCount: 3,
    });

    assert.equal(result.totalReferences, 4);
    assert.equal(result.faults, 4);
    assert.equal(result.hits, 0);
    assert.equal(result.evictions, 1);

    // Page 1 loaded at t=0 was evicted when 4 arrived at t=3
    assert.equal(result.evictionLog[0].evictedPage, 1);
    assert.ok(result.evictionLog[0].reason.includes('entered memory earliest'));
  });

  test('LRU evicts page with oldest lastAccessed timestamp', () => {
    // 3 frames: [1, 2, 3] loaded at t=0, 1, 2
    // at t=3, reference 1 (hit, lastAccessed becomes 3)
    // at t=4, reference 4 (must evict page 2 because page 2 has lastAccessed=1 < page 3 lastAccessed=2 < page 1 lastAccessed=3)
    const result = runMemorySimulation({
      referenceString: [1, 2, 3, 1, 4],
      algorithm: MEMORY_ALGORITHMS.LRU,
      frameCount: 3,
    });

    assert.equal(result.totalReferences, 5);
    assert.equal(result.hits, 1);
    assert.equal(result.faults, 4);
    assert.equal(result.evictions, 1);

    // Victim is page 2
    assert.equal(result.evictionLog[0].evictedPage, 2);
    assert.ok(result.evictionLog[0].reason.includes('last access was earliest'));
  });
});
