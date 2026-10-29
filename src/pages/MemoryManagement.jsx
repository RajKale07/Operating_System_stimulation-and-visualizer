import React, { useState, useMemo } from 'react';
import { HardDrive, Play, StepForward, RotateCcw, ArrowRight, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  MEMORY_ALGORITHMS,
  createInitialFrames,
  stepPageReplacement,
  runMemorySimulation,
} from '../algorithms/pageReplacement.js';
import MemoryFrames from '../components/MemoryFrames.jsx';
import SystemInspector from '../components/SystemInspector.jsx';
import { MEMORY_PRESETS } from '../presets/workloads.js';

export default function MemoryManagement() {
  const [referenceInput, setReferenceInput] = useState('1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5');
  const [activeAlgorithm, setActiveAlgorithm] = useState(MEMORY_ALGORITHMS.FIFO);
  const [selectedPresetId, setSelectedPresetId] = useState('fifo-vs-lru-divergence');

  // Single-stepping interactive state
  const [frames, setFrames] = useState(() => createInitialFrames(8));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stepHistory, setStepHistory] = useState([]);
  const [inspectorSelection, setInspectorSelection] = useState(null);

  // Parse reference sequence
  const referenceString = useMemo(() => {
    return referenceInput
      .split(',')
      .map(x => parseInt(x.trim(), 10))
      .filter(x => !isNaN(x) && x >= 0);
  }, [referenceInput]);

  // Batch comparison simulations (independent)
  const fifoComparison = useMemo(() => {
    return runMemorySimulation({
      referenceString,
      algorithm: MEMORY_ALGORITHMS.FIFO,
      frameCount: 8,
    });
  }, [referenceString]);

  const lruComparison = useMemo(() => {
    return runMemorySimulation({
      referenceString,
      algorithm: MEMORY_ALGORITHMS.LRU,
      frameCount: 8,
    });
  }, [referenceString]);

  // Reset interactive single-step memory simulation
  const handleResetInteractive = () => {
    setFrames(createInitialFrames(8));
    setCurrentIndex(0);
    setStepHistory([]);
    setInspectorSelection(null);
  };

  // Step 1 reference forward in interactive mode
  const handleStepInteractive = () => {
    if (currentIndex >= referenceString.length) return;

    const requestedPage = referenceString[currentIndex];
    const result = stepPageReplacement({
      frames,
      page: requestedPage,
      algorithm: activeAlgorithm,
      currentTime: currentIndex,
    });

    setFrames(result.frames);
    setStepHistory(prev => [
      ...prev,
      {
        time: currentIndex,
        page: requestedPage,
        hit: result.hit,
        evicted: result.evicted,
        frameIndex: result.frameIndex,
        reason: result.reason,
      },
    ]);
    setCurrentIndex(idx => idx + 1);
  };

  const handleRunAllInteractive = () => {
    let curFrames = createInitialFrames(8);
    const newHistory = [];

    referenceString.forEach((page, time) => {
      const res = stepPageReplacement({
        frames: curFrames,
        page,
        algorithm: activeAlgorithm,
        currentTime: time,
      });
      curFrames = res.frames;
      newHistory.push({
        time,
        page,
        hit: res.hit,
        evicted: res.evicted,
        frameIndex: res.frameIndex,
        reason: res.reason,
      });
    });

    setFrames(curFrames);
    setStepHistory(newHistory);
    setCurrentIndex(referenceString.length);
  };

  const handleSelectPreset = (presetId) => {
    setSelectedPresetId(presetId);
    const p = MEMORY_PRESETS.find(x => x.id === presetId);
    if (p) {
      setReferenceInput(p.referenceString.join(', '));
      handleResetInteractive();
    }
  };

  const hitsCount = stepHistory.filter(s => s.hit).length;
  const faultsCount = stepHistory.filter(s => !s.hit).length;
  const evictionsCount = stepHistory.filter(s => s.evicted !== null).length;
  const hitRatio = currentIndex > 0 ? ((hitsCount / currentIndex) * 100).toFixed(1) : 0;
  const latestStep = stepHistory[stepHistory.length - 1];

  return (
    <div>
      {/* Header and Controls */}
      <div className="tech-panel">
        <div className="panel-header">
          <div className="panel-title">
            <HardDrive size={16} />
            <span>Virtual Memory Laboratory: Physical Paging & Replacement</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            8 Physical Frames (Configured)
          </span>
        </div>
        <div className="panel-body">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
            Simulate demand paging with fixed physical frame capacity. Track FIFO (earliest loaded order) vs. LRU (recency of access) replacement dynamics, inspect frame metadata, and observe eviction causality.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '16px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                Page-Reference Sequence (Comma-separated integers):
              </label>
              <input
                value={referenceInput}
                onChange={e => {
                  setReferenceInput(e.target.value);
                  handleResetInteractive();
                }}
                placeholder="e.g. 1, 2, 3, 4, 1, 2, 5"
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                Guided Preset:
              </label>
              <select
                value={selectedPresetId}
                onChange={e => handleSelectPreset(e.target.value)}
              >
                {MEMORY_PRESETS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                Algorithm:
              </label>
              <select
                value={activeAlgorithm}
                onChange={e => {
                  setActiveAlgorithm(e.target.value);
                  handleResetInteractive();
                }}
              >
                <option value={MEMORY_ALGORITHMS.FIFO}>FIFO (First-In, First-Out)</option>
                <option value={MEMORY_ALGORITHMS.LRU}>LRU (Least Recently Used)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="ctrl-btn primary"
                onClick={handleStepInteractive}
                disabled={currentIndex >= referenceString.length}
                title="Execute single page reference"
              >
                <StepForward size={14} />
                <span>Step Next</span>
              </button>

              <button
                type="button"
                className="ctrl-btn"
                onClick={handleRunAllInteractive}
                disabled={currentIndex >= referenceString.length}
                title="Run all remaining references"
              >
                <Play size={14} />
                <span>Run All</span>
              </button>

              <button
                type="button"
                className="ctrl-btn"
                onClick={handleResetInteractive}
                title="Reset memory simulation"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Reference String Visual Sequence with Pointer */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '8px' }}>
              REFERENCE SEQUENCE POINTER:
            </span>
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '8px' }}>
              {referenceString.map((page, idx) => {
                const isPast = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                const stepRecord = stepHistory[idx];

                return (
                  <div
                    key={idx}
                    style={{
                      width: '36px',
                      minWidth: '36px',
                      height: '42px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: '1px solid var(--border-strong)',
                      borderRadius: '2px',
                      background: isCurrent
                        ? 'var(--text-main)'
                        : isPast
                        ? '#f4f4f5'
                        : '#ffffff',
                      color: isCurrent
                        ? 'var(--text-inverted)'
                        : isPast
                        ? 'var(--text-main)'
                        : 'var(--text-dim)',
                      position: 'relative',
                    }}
                  >
                    <span>{page}</span>
                    <span style={{ fontSize: '9px', opacity: 0.8 }}>
                      {stepRecord ? (stepRecord.hit ? 'HIT' : 'FLT') : `#${idx}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Interactive Frames + Metrics/Inspector */}
      <div className="workspace-grid" style={{ marginBottom: '24px' }}>
        {/* Left: 8 Physical Memory Frames */}
        <div>
          <MemoryFrames
            frames={frames}
            algorithm={activeAlgorithm}
            onSelectFrame={(frame) => setInspectorSelection({ type: 'frame', data: frame })}
            selectedFrameIndex={inspectorSelection?.type === 'frame' ? inspectorSelection.data.frameIndex : null}
          />

          {/* Eviction Explanation Box */}
          {latestStep && (
            <div className="tech-panel">
              <div className="panel-header">
                <span className="panel-title">
                  {latestStep.hit ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                  <span>Latest Access Result: {latestStep.hit ? 'PAGE HIT' : 'PAGE FAULT'}</span>
                </span>
                <span className="font-mono" style={{ fontSize: '11px' }}>
                  Ref #{latestStep.time}: Page {latestStep.page}
                </span>
              </div>
              <div className="panel-body">
                <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  {latestStep.reason}
                </p>
                {latestStep.evicted && (
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Eviction causality: Under <strong>{activeAlgorithm}</strong>, resident Page {latestStep.evicted.page} was selected because {activeAlgorithm === MEMORY_ALGORITHMS.FIFO ? 'it entered memory earliest' : 'its last access occurred earliest'}.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Metrics & Inspector */}
        <div>
          {inspectorSelection ? (
            <div style={{ marginBottom: '20px' }}>
              <SystemInspector
                selection={inspectorSelection}
                onClose={() => setInspectorSelection(null)}
              />
            </div>
          ) : (
            <div className="tech-panel" style={{ marginBottom: '20px' }}>
              <div className="panel-header">
                <span className="panel-title">Physical Frame Inspector</span>
              </div>
              <div className="panel-body" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '24px' }}>
                Click any physical memory frame to inspect its resident page, allocation order, and access history.
              </div>
            </div>
          )}

          {/* Real-time Memory Metrics */}
          <div className="tech-panel">
            <div className="panel-header">
              <span className="panel-title">Paging Performance Metrics</span>
            </div>
            <div className="panel-body">
              <div className="property-list">
                <div className="property-row">
                  <span className="property-name">Processed References:</span>
                  <span className="property-value">{currentIndex} / {referenceString.length}</span>
                </div>
                <div className="property-row">
                  <span className="property-name">Total Page Hits:</span>
                  <span className="property-value">{hitsCount}</span>
                </div>
                <div className="property-row">
                  <span className="property-name">Total Page Faults:</span>
                  <span className="property-value">{faultsCount}</span>
                </div>
                <div className="property-row">
                  <span className="property-name">Total Page Evictions:</span>
                  <span className="property-value">{evictionsCount}</span>
                </div>
                <div className="property-row">
                  <span className="property-name">Page Hit Ratio:</span>
                  <span className="property-value">{hitRatio}%</span>
                </div>
                <div className="property-row">
                  <span className="property-name">Page Fault Ratio:</span>
                  <span className="property-value">
                    {currentIndex > 0 ? (100 - parseFloat(hitRatio)).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side FIFO vs LRU Comparative Experiment */}
      <div className="tech-panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>Side-by-Side Policy Comparison: FIFO vs. LRU</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Identical Sequence ({referenceString.length} References, 8 Frames)
          </span>
        </div>
        <div className="panel-body">
          <table className="tech-table">
            <thead>
              <tr>
                <th>Policy</th>
                <th>Total References</th>
                <th>Page Hits</th>
                <th>Page Faults</th>
                <th>Hit Ratio</th>
                <th>Fault Ratio</th>
                <th>Total Evictions</th>
                <th>Final Resident Pages</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono" style={{ fontWeight: 700 }}>FIFO</td>
                <td className="font-mono">{fifoComparison.totalReferences}</td>
                <td className="font-mono">{fifoComparison.hits}</td>
                <td className="font-mono">{fifoComparison.faults}</td>
                <td className="font-mono">{fifoComparison.hitRatio}%</td>
                <td className="font-mono">{fifoComparison.faultRatio}%</td>
                <td className="font-mono">{fifoComparison.evictions}</td>
                <td className="font-mono">
                  [{fifoComparison.finalFrames.filter(f => f.page !== null).map(f => f.page).join(', ')}]
                </td>
              </tr>
              <tr>
                <td className="font-mono" style={{ fontWeight: 700 }}>LRU</td>
                <td className="font-mono">{lruComparison.totalReferences}</td>
                <td className="font-mono">{lruComparison.hits}</td>
                <td className="font-mono">{lruComparison.faults}</td>
                <td className="font-mono">{lruComparison.hitRatio}%</td>
                <td className="font-mono">{lruComparison.faultRatio}%</td>
                <td className="font-mono">{lruComparison.evictions}</td>
                <td className="font-mono">
                  [{lruComparison.finalFrames.filter(f => f.page !== null).map(f => f.page).join(', ')}]
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>
              ACADEMIC OBSERVATION:
            </span>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              FIFO replaces the oldest resident page regardless of how frequently it is accessed. LRU exploits temporal locality by preserving recently accessed pages, typically reducing page fault frequency on workloads with high re-reference patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
