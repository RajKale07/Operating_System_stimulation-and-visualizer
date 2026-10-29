import React from 'react';
import { Cpu, HardDrive, Swords, ArrowRight } from 'lucide-react';
import { SECTIONS } from '../constants.js';
import { CPU_PRESETS } from '../presets/workloads.js';

export default function Overview({
  currentSnapshot,
  onNavigateSection,
  onLoadCpuPreset,
  running,
}) {
  const {
    systemTime,
    algorithm,
    memAlgorithm,
    processes,
    runningProcessId,
    readyQueue,
    frames,
    memoryStats,
    metrics,
    isCompleted,
  } = currentSnapshot;

  const runningProc = runningProcessId
    ? processes.find(p => p.id === runningProcessId)
    : null;

  const occupiedFrames = frames.filter(f => f.page !== null).length;
  const totalReferences = memoryStats.totalReferences;
  const hitRatio = totalReferences > 0 ? ((memoryStats.hits / totalReferences) * 100).toFixed(1) : 0;

  return (
    <div>
      {/* Top Banner */}
      <div className="tech-panel">
        <div className="panel-body" style={{ padding: '24px' }}>
          <div style={{ maxWidth: '800px' }}>
            <span className="brand-badge font-mono" style={{ marginBottom: '8px', display: 'inline-block' }}>
              Academic Laboratory
            </span>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '8px' }}>
              Interactive Operating Systems Laboratory
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
              A deterministic experimental laboratory for analyzing CPU process scheduling (FCFS, SRTF, Round Robin) and virtual memory page replacement (FIFO, LRU). Features genuine bidirectional time travel, synchronized multi-algorithm comparisons, and physical frame inspection.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="ctrl-btn primary"
                onClick={() => onNavigateSection(SECTIONS.SCHEDULING)}
              >
                <Cpu size={14} />
                <span>Open CPU Scheduling Lab</span>
              </button>
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => onNavigateSection(SECTIONS.BATTLE)}
              >
                <Swords size={14} />
                <span>Algorithm Battle Mode</span>
              </button>
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => onNavigateSection(SECTIONS.MEMORY)}
              >
                <HardDrive size={14} />
                <span>Memory Management Lab</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Status Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Simulation State */}
        <div className="tech-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <span className="panel-title">System Status</span>
            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700 }}>
              t={systemTime}
            </span>
          </div>
          <div className="panel-body">
            <div className="property-list">
              <div className="property-row">
                <span className="property-name">Clock Execution:</span>
                <span className="property-value">
                  {running ? 'RUNNING' : isCompleted ? 'COMPLETED' : 'PAUSED'}
                </span>
              </div>
              <div className="property-row">
                <span className="property-name">Active CPU Algorithm:</span>
                <span className="property-value">{algorithm}</span>
              </div>
              <div className="property-row">
                <span className="property-name">Active Memory Policy:</span>
                <span className="property-value">{memAlgorithm}</span>
              </div>
              <div className="property-row">
                <span className="property-name">Total Workload Size:</span>
                <span className="property-value">{processes.length} Processes</span>
              </div>
            </div>
          </div>
        </div>

        {/* CPU Status */}
        <div className="tech-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <span className="panel-title">CPU Status</span>
            <Cpu size={14} />
          </div>
          <div className="panel-body">
            <div className="property-list">
              <div className="property-row">
                <span className="property-name">Current CPU State:</span>
                <span className="property-value">
                  {runningProc ? `BUSY (${runningProc.name})` : 'IDLE'}
                </span>
              </div>
              <div className="property-row">
                <span className="property-name">Ready Queue Depth:</span>
                <span className="property-value">{readyQueue.length} waiting</span>
              </div>
              <div className="property-row">
                <span className="property-name">CPU Utilization:</span>
                <span className="property-value">{metrics.cpuUtilization}%</span>
              </div>
              <div className="property-row">
                <span className="property-name">Avg Waiting Time:</span>
                <span className="property-value">{metrics.avgWaiting} ticks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Memory Frame Occupancy */}
        <div className="tech-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <span className="panel-title">Physical Memory</span>
            <HardDrive size={14} />
          </div>
          <div className="panel-body">
            <div className="property-list">
              <div className="property-row">
                <span className="property-name">Frame Occupancy:</span>
                <span className="property-value">{occupiedFrames} / {frames.length} frames</span>
              </div>
              <div className="property-row">
                <span className="property-name">Total Page References:</span>
                <span className="property-value">{totalReferences}</span>
              </div>
              <div className="property-row">
                <span className="property-name">Page Hit Ratio:</span>
                <span className="property-value">{hitRatio}% ({memoryStats.hits} hits)</span>
              </div>
              <div className="property-row">
                <span className="property-name">Page Evictions:</span>
                <span className="property-value">{memoryStats.evictions} evictions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guided Academic Experiments / Presets */}
      <div className="tech-panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>Curated Operating System Experiments</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            1-Click Concept Demonstrations
          </span>
        </div>
        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {CPU_PRESETS.map(preset => (
              <div
                key={preset.id}
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '2px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{preset.title}</span>
                    <span className="font-mono" style={{ fontSize: '10px', border: '1px solid var(--border-strong)', padding: '1px 4px', borderRadius: '2px' }}>
                      {preset.algorithm}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '12px' }}>
                    {preset.description}
                  </p>
                </div>
                <button
                  type="button"
                  className="ctrl-btn"
                  onClick={() => {
                    onLoadCpuPreset(preset);
                    onNavigateSection(SECTIONS.SCHEDULING);
                  }}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <span>Load & Run Experiment</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
