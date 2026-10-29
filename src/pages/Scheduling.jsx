import React, { useState } from 'react';
import { Plus, Trash2, Cpu, HardDrive } from 'lucide-react';
import SimulationControls from '../components/SimulationControls.jsx';
import ProcessTimeline from '../components/ProcessTimeline.jsx';
import GanttChart from '../components/GanttChart.jsx';
import MemoryFrames from '../components/MemoryFrames.jsx';
import SystemInspector from '../components/SystemInspector.jsx';
import { CPU_PRESETS } from '../presets/workloads.js';

export default function Scheduling({
  currentSnapshot,
  history,
  currentTick,
  latestTick,
  running,
  speed,
  onToggleRun,
  onStepForward,
  onStepBackward,
  onJumpToBeginning,
  onJumpToLatest,
  onReset,
  onChangeSpeed,
  onSelectTick,
  onAddProcess,
  onRemoveProcess,
  onClearProcesses,
  onChangeAlgorithm,
  onChangeQuantum,
  onChangeMemAlgorithm,
  onLoadPreset,
}) {
  const [newProc, setNewProc] = useState({ name: '', arrival: '0', burst: '4', pages: '1, 2, 3' });
  const [inspectorSelection, setInspectorSelection] = useState(null);

  const {
    algorithm,
    quantum,
    memAlgorithm,
    processes,
    readyQueue,
    runningProcessId,
    gantt,
    frames,
    metrics,
  } = currentSnapshot;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const burst = parseInt(newProc.burst, 10);
    const arrival = parseInt(newProc.arrival, 10) || 0;
    const pages = newProc.pages
      .split(',')
      .map(p => parseInt(p.trim(), 10))
      .filter(p => !isNaN(p));

    if (!burst || burst <= 0) {
      alert('Burst time must be a positive integer >= 1.');
      return;
    }

    const name = newProc.name.trim() || `P${processes.length + 1}`;
    const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    onAddProcess({ id, name, arrival, burst, pages });
    setNewProc({ name: '', arrival: '0', burst: '4', pages: '1, 2, 3' });
  };

  const selectedProcessObj = inspectorSelection?.type === 'process'
    ? processes.find(p => p.id === inspectorSelection.data.id) || inspectorSelection.data
    : null;

  return (
    <div>
      {/* Simulation Controls Toolbar */}
      <SimulationControls
        running={running}
        onToggleRun={onToggleRun}
        onStepForward={onStepForward}
        onStepBackward={onStepBackward}
        onJumpToBeginning={onJumpToBeginning}
        onJumpToLatest={onJumpToLatest}
        onReset={onReset}
        currentTick={currentTick}
        latestTick={latestTick}
        speed={speed}
        onChangeSpeed={onChangeSpeed}
      />

      {/* Feature 1: Process Lifecycle Timeline */}
      <ProcessTimeline
        processes={processes}
        history={history}
        currentTick={currentTick}
        onSelectTick={(tick) => {
          onSelectTick(tick);
          setInspectorSelection({ type: 'tick', data: { time: tick } });
        }}
        onSelectProcess={(proc) => setInspectorSelection({ type: 'process', data: proc })}
        selectedProcessId={selectedProcessObj?.id}
      />

      {/* Gantt Chart */}
      <GanttChart
        gantt={gantt}
        onSelectTick={onSelectTick}
        onSelectProcess={(proc) => setInspectorSelection({ type: 'process', data: proc })}
      />

      {/* Workspace Grid */}
      <div className="workspace-grid">
        {/* Left Column: Workload Management & Algorithm Configuration */}
        <div>
          {/* Algorithm & Simulation Configuration */}
          <div className="tech-panel">
            <div className="panel-header">
              <span className="panel-title">Scheduling Policy & Presets</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Configure execution rules</span>
            </div>
            <div className="panel-body">
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                    CPU Algorithm:
                  </label>
                  <select
                    value={algorithm}
                    onChange={e => onChangeAlgorithm(e.target.value)}
                    disabled={running}
                    style={{ minWidth: '180px' }}
                  >
                    <option value="FCFS">FCFS (First-Come, First-Served)</option>
                    <option value="SRTF">SRTF (Shortest Remaining Time First)</option>
                    <option value="RR">Round Robin (Time Sliced)</option>
                  </select>
                </div>

                {algorithm === 'RR' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                      Time Quantum:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={quantum}
                      onChange={e => onChangeQuantum(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      disabled={running}
                      style={{ width: '90px' }}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                    Memory Policy:
                  </label>
                  <select
                    value={memAlgorithm}
                    onChange={e => onChangeMemAlgorithm(e.target.value)}
                    disabled={running}
                  >
                    <option value="FIFO">FIFO Page Replacement</option>
                    <option value="LRU">LRU Page Replacement</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                    Load Preset Workload:
                  </label>
                  <select
                    onChange={e => {
                      const p = CPU_PRESETS.find(x => x.id === e.target.value);
                      if (p) onLoadPreset(p);
                    }}
                    defaultValue=""
                    disabled={running}
                  >
                    <option value="" disabled>Select guided preset...</option>
                    {CPU_PRESETS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.algorithm})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ready Queue visualization */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    READY QUEUE (FIFO ORDER)
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {readyQueue.length} process{readyQueue.length === 1 ? '' : 'es'} ready
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', minHeight: '36px', alignItems: 'center' }}>
                  {readyQueue.length === 0 ? (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Ready queue is currently empty.
                    </span>
                  ) : (
                    readyQueue.map((id, index) => {
                      const p = processes.find(proc => proc.id === id);
                      if (!p) return null;
                      return (
                        <div
                          key={id}
                          onClick={() => setInspectorSelection({ type: 'process', data: p })}
                          style={{
                            padding: '4px 10px',
                            background: '#e4e4e7',
                            border: '1px solid var(--border-strong)',
                            borderRadius: '2px',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                          title={`#${index + 1}: ${p.name} (remaining: ${p.remaining})`}
                        >
                          <span style={{ fontWeight: 700 }}>{p.name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>rem={p.remaining}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Process Workload Configuration Table */}
          <div className="tech-panel">
            <div className="panel-header">
              <span className="panel-title">Active Workload Processes ({processes.length})</span>
              <button
                type="button"
                className="ctrl-btn"
                onClick={onClearProcesses}
                disabled={running || processes.length === 0}
                style={{ padding: '2px 8px', fontSize: '11px' }}
              >
                <Trash2 size={12} />
                <span>Clear All</span>
              </button>
            </div>
            <div className="panel-body">
              {/* Add Process Form */}
              <form onSubmit={handleAddSubmit} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <input
                  placeholder="Name (e.g. P1)"
                  value={newProc.name}
                  onChange={e => setNewProc({ ...newProc, name: e.target.value })}
                  style={{ width: '110px' }}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Arrival Time"
                  value={newProc.arrival}
                  onChange={e => setNewProc({ ...newProc, arrival: e.target.value })}
                  style={{ width: '100px' }}
                />
                <input
                  type="number"
                  min="1"
                  placeholder="Burst Time"
                  value={newProc.burst}
                  onChange={e => setNewProc({ ...newProc, burst: e.target.value })}
                  style={{ width: '100px' }}
                />
                <input
                  placeholder="Pages (1, 2, 3)"
                  value={newProc.pages}
                  onChange={e => setNewProc({ ...newProc, pages: e.target.value })}
                  style={{ flex: 1, minWidth: '140px' }}
                />
                <button type="submit" className="ctrl-btn primary" disabled={running}>
                  <Plus size={13} />
                  <span>Add Process</span>
                </button>
              </form>

              {/* Table of processes */}
              <table className="tech-table">
                <thead>
                  <tr>
                    <th>Process</th>
                    <th>Arrival</th>
                    <th>Burst</th>
                    <th>Remaining</th>
                    <th>Pages</th>
                    <th>State</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {processes.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        No processes added. Use the inputs above or load a preset.
                      </td>
                    </tr>
                  ) : (
                    processes.map(p => (
                      <tr
                        key={p.id}
                        className={inspectorSelection?.type === 'process' && inspectorSelection.data.id === p.id ? 'selected' : ''}
                        onClick={() => setInspectorSelection({ type: 'process', data: p })}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="font-mono" style={{ fontWeight: 700 }}>{p.name}</td>
                        <td className="font-mono">{p.arrival}</td>
                        <td className="font-mono">{p.burst}</td>
                        <td className="font-mono">{p.remaining}</td>
                        <td className="font-mono">{p.pages && p.pages.length ? p.pages.join(', ') : '-'}</td>
                        <td className="font-mono" style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                          {p.remaining === 0 ? 'terminated' : (p.id === runningProcessId ? 'running' : p.state)}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveProcess(p.id);
                            }}
                            disabled={running}
                            className="ctrl-btn"
                            style={{ padding: '2px 6px', fontSize: '10px' }}
                            title="Remove process"
                          >
                            <Trash2 size={11} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Contextual Inspector, Metrics & Frames */}
        <div>
          {/* Feature 4: Contextual System Inspector */}
          {inspectorSelection ? (
            <div style={{ marginBottom: '20px' }}>
              <SystemInspector
                selection={inspectorSelection}
                onClose={() => setInspectorSelection(null)}
                onNavigateToTick={onSelectTick}
                currentSnapshot={currentSnapshot}
              />
            </div>
          ) : (
            <div className="tech-panel" style={{ marginBottom: '20px' }}>
              <div className="panel-header">
                <span className="panel-title">System State Inspector</span>
              </div>
              <div className="panel-body" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '24px' }}>
                Select any process, memory frame, event, or timeline tick to inspect its internal state.
              </div>
            </div>
          )}

          {/* Performance Metrics Table */}
          <div className="tech-panel">
            <div className="panel-header">
              <span className="panel-title">Scheduling Metrics</span>
              <span className="font-mono" style={{ fontSize: '11px' }}>
                {metrics.isComplete ? 'ALL COMPLETED' : 'IN PROGRESS'}
              </span>
            </div>
            <div className="panel-body">
              <div className="property-list">
                <div className="property-row">
                  <span className="property-name">Avg Turnaround Time:</span>
                  <span className="property-value">{metrics.avgTurnaround} ticks</span>
                </div>
                <div className="property-row">
                  <span className="property-name">Avg Waiting Time:</span>
                  <span className="property-value">{metrics.avgWaiting} ticks</span>
                </div>
                <div className="property-row">
                  <span className="property-name">Avg Response Time:</span>
                  <span className="property-value">{metrics.avgResponse} ticks</span>
                </div>
                <div className="property-row">
                  <span className="property-name">CPU Utilization:</span>
                  <span className="property-value">{metrics.cpuUtilization}%</span>
                </div>
                <div className="property-row">
                  <span className="property-name">Total Context Switches:</span>
                  <span className="property-value">{metrics.contextSwitches}</span>
                </div>
                <div className="property-row">
                  <span className="property-name">Total Preemptions:</span>
                  <span className="property-value">{metrics.preemptions}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Physical Memory Preview */}
          <MemoryFrames
            frames={frames}
            algorithm={memAlgorithm}
            onSelectFrame={(frame) => setInspectorSelection({ type: 'frame', data: frame })}
            selectedFrameIndex={inspectorSelection?.type === 'frame' ? inspectorSelection.data.frameIndex : null}
          />
        </div>
      </div>
    </div>
  );
}
