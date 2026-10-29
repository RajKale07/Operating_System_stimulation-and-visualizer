import React, { useState, useMemo } from 'react';
import { Swords, RefreshCw, BarChart2, Info, ArrowRight } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { runBatchSimulation, ALGORITHMS } from '../algorithms/scheduling.js';
import { CPU_PRESETS } from '../presets/workloads.js';

export default function AlgorithmBattle({
  baseProcesses = [],
  onApplyWorkloadToMain,
}) {
  const [workload, setWorkload] = useState(
    baseProcesses.length > 0
      ? baseProcesses
      : CPU_PRESETS[0].processes
  );

  const [selectedAlgorithms, setSelectedAlgorithms] = useState({
    [ALGORITHMS.FCFS]: true,
    [ALGORITHMS.SRTF]: true,
    [ALGORITHMS.RR]: true,
  });

  const [quantum, setQuantum] = useState(2);
  const [syncedHoverTick, setSyncedHoverTick] = useState(null);
  const [selectedPresetId, setSelectedPresetId] = useState('convoy-effect');

  // Run independent simulation instances for each selected algorithm
  const battleResults = useMemo(() => {
    const results = {};

    if (selectedAlgorithms[ALGORITHMS.FCFS]) {
      results[ALGORITHMS.FCFS] = runBatchSimulation({
        processes: workload,
        algorithm: ALGORITHMS.FCFS,
      });
    }

    if (selectedAlgorithms[ALGORITHMS.SRTF]) {
      results[ALGORITHMS.SRTF] = runBatchSimulation({
        processes: workload,
        algorithm: ALGORITHMS.SRTF,
      });
    }

    if (selectedAlgorithms[ALGORITHMS.RR]) {
      results[ALGORITHMS.RR] = runBatchSimulation({
        processes: workload,
        algorithm: ALGORITHMS.RR,
        quantum,
      });
    }

    return results;
  }, [workload, selectedAlgorithms, quantum]);

  // Max makespan among all algorithms to establish common time scale
  const maxMakespan = useMemo(() => {
    const times = Object.values(battleResults).map(r => r.totalTime || 0);
    return Math.max(12, ...times);
  }, [battleResults]);

  // Chart data for Recharts
  const chartData = useMemo(() => {
    return Object.keys(battleResults).map(algKey => {
      const res = battleResults[algKey];
      return {
        algorithm: algKey === ALGORITHMS.RR ? `RR (q=${quantum})` : algKey,
        avgWaiting: res.metrics.avgWaiting,
        avgTurnaround: res.metrics.avgTurnaround,
        avgResponse: res.metrics.avgResponse,
      };
    });
  }, [battleResults, quantum]);

  const handleSelectPreset = (presetId) => {
    setSelectedPresetId(presetId);
    const p = CPU_PRESETS.find(x => x.id === presetId);
    if (p) {
      setWorkload(p.processes);
      if (p.quantum) setQuantum(p.quantum);
    }
  };

  return (
    <div>
      {/* Header and Explanation */}
      <div className="tech-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Swords size={16} />
            <span>Algorithm Battle Mode: Multi-Scheduler Head-to-Head</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Identical Workload, Independent Simulation Engines
          </span>
        </div>
        <div className="panel-body">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
            Compare First-Come, First-Served (FCFS), Shortest Remaining Time First (SRTF), and Round Robin (RR) on an identical process workload. Timelines share a synchronized time scale to visualize preemption dynamics and turn-around differences.
          </p>

          {/* Controls: Preset selector and algorithm toggles */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Workload Preset:</span>
              <select
                value={selectedPresetId}
                onChange={e => handleSelectPreset(e.target.value)}
                style={{ fontSize: '12px', padding: '4px 8px' }}
              >
                {CPU_PRESETS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Compare:</span>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={selectedAlgorithms[ALGORITHMS.FCFS]}
                  onChange={e => setSelectedAlgorithms({ ...selectedAlgorithms, [ALGORITHMS.FCFS]: e.target.checked })}
                />
                FCFS
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={selectedAlgorithms[ALGORITHMS.SRTF]}
                  onChange={e => setSelectedAlgorithms({ ...selectedAlgorithms, [ALGORITHMS.SRTF]: e.target.checked })}
                />
                SRTF (Preemptive)
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <input
                  type="checkbox"
                  checked={selectedAlgorithms[ALGORITHMS.RR]}
                  onChange={e => setSelectedAlgorithms({ ...selectedAlgorithms, [ALGORITHMS.RR]: e.target.checked })}
                />
                Round Robin
              </label>
            </div>

            {selectedAlgorithms[ALGORITHMS.RR] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>RR Quantum:</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={quantum}
                  onChange={e => setQuantum(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={{ width: '60px' }}
                />
              </div>
            )}

            {onApplyWorkloadToMain && (
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => onApplyWorkloadToMain(workload)}
                title="Send this workload to the main interactive CPU laboratory"
              >
                <span>Apply Workload to Main Lab</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Synchronized Common-Scale Gantt Timelines */}
      <div className="tech-panel">
        <div className="panel-header">
          <div className="panel-title">
            <span>Synchronized Common-Scale Timelines</span>
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
            Hover over any timeline to synchronize time crosshair {syncedHoverTick !== null ? `(t=${syncedHoverTick})` : ''}
          </div>
        </div>

        <div className="panel-body" style={{ overflowX: 'auto', paddingBottom: '16px' }}>
          {/* Header Time Axis */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ width: '120px', minWidth: '120px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
              ALGORITHM
            </div>
            <div style={{ display: 'flex' }}>
              {Array.from({ length: maxMakespan + 1 }, (_, t) => (
                <div
                  key={t}
                  onMouseEnter={() => setSyncedHoverTick(t)}
                  onMouseLeave={() => setSyncedHoverTick(null)}
                  style={{
                    width: '32px',
                    minWidth: '32px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    borderRight: '1px dashed var(--border-subtle)',
                    background: syncedHoverTick === t ? 'var(--text-main)' : 'transparent',
                    color: syncedHoverTick === t ? 'var(--text-inverted)' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline for each selected algorithm */}
          {Object.keys(battleResults).map(algKey => {
            const res = battleResults[algKey];
            const gantt = res.gantt || [];

            return (
              <div
                key={algKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '10px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ width: '120px', minWidth: '120px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
                  {algKey === ALGORITHMS.RR ? `RR (q=${quantum})` : algKey}
                </div>

                <div style={{ display: 'flex', position: 'relative' }}>
                  {gantt.map((block, idx) => {
                    const widthPx = block.duration * 32;
                    const isIdle = block.processId === 'IDLE';

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setSyncedHoverTick(block.startTime)}
                        style={{
                          width: `${widthPx}px`,
                          minWidth: `${widthPx}px`,
                          height: '36px',
                          background: isIdle ? '#f4f4f5' : 'var(--text-main)',
                          color: isIdle ? 'var(--text-muted)' : 'var(--text-inverted)',
                          border: '1px solid var(--border-strong)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                        title={`${block.name} on ${algKey} (t=${block.startTime}..${block.startTime + block.duration})`}
                      >
                        <span>{block.name}</span>
                        <span style={{ fontSize: '9px', opacity: 0.8 }}>d={block.duration}</span>
                      </div>
                    );
                  })}

                  {/* Crosshair indicator */}
                  {syncedHoverTick !== null && syncedHoverTick <= maxMakespan && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${syncedHoverTick * 32}px`,
                        top: '-4px',
                        bottom: '-4px',
                        width: '2px',
                        background: 'red',
                        pointerEvents: 'none',
                        zIndex: 10,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparative Performance Metrics Table */}
      <div className="tech-panel">
        <div className="panel-header">
          <span className="panel-title">Quantitative Performance Comparison</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Context switch cost: 0 ticks (documented ideal model)
          </span>
        </div>
        <div className="panel-body">
          <table className="tech-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Avg Turnaround Time</th>
                <th>Avg Waiting Time</th>
                <th>Avg Response Time</th>
                <th>CPU Utilization</th>
                <th>Makespan (Total Time)</th>
                <th>Preemptions</th>
                <th>Context Switches</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(battleResults).map(algKey => {
                const res = battleResults[algKey];
                const m = res.metrics;
                return (
                  <tr key={algKey}>
                    <td className="font-mono" style={{ fontWeight: 700 }}>
                      {algKey === ALGORITHMS.RR ? `Round Robin (q=${quantum})` : algKey}
                    </td>
                    <td className="font-mono">{m.avgTurnaround} ticks</td>
                    <td className="font-mono">{m.avgWaiting} ticks</td>
                    <td className="font-mono">{m.avgResponse} ticks</td>
                    <td className="font-mono">{m.cpuUtilization}%</td>
                    <td className="font-mono">{m.makespan} ticks</td>
                    <td className="font-mono">{m.preemptions}</td>
                    <td className="font-mono">{m.contextSwitches}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recharts Graphical Comparison */}
      <div className="tech-panel">
        <div className="panel-header">
          <div className="panel-title">
            <BarChart2 size={16} />
            <span>Comparative Scheduling Overhead (Bar Chart)</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Lower is better for Waiting and Turnaround times
          </span>
        </div>
        <div className="panel-body" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="algorithm" stroke="#09090b" fontSize={12} fontFamily="ui-monospace" />
              <YAxis stroke="#09090b" fontSize={12} fontFamily="ui-monospace" label={{ value: 'Ticks', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #18181b',
                  borderRadius: '2px',
                  fontFamily: 'ui-monospace',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontFamily: 'ui-monospace', fontSize: '12px' }} />
              <Bar dataKey="avgWaiting" name="Avg Waiting Time" fill="#09090b" />
              <Bar dataKey="avgTurnaround" name="Avg Turnaround Time" fill="#71717a" />
              <Bar dataKey="avgResponse" name="Avg Response Time" fill="#d4d4d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engineering Assumptions & Educational Commentary */}
      <div className="tech-panel">
        <div className="panel-header">
          <div className="panel-title">
            <Info size={15} />
            <span>Theoretical Assumptions & Trade-offs</span>
          </div>
        </div>
        <div className="panel-body">
          <ul style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.7', paddingLeft: '20px' }}>
            <li>
              <strong>Context-Switch Cost:</strong> Assumed zero simulated execution overhead. In real operating systems, each preemption incurs cache invalidation and register save/restore overhead.
            </li>
            <li>
              <strong>Tie-Breaking Rules:</strong> When two processes have identical remaining burst times in SRTF, priority is resolved by earliest arrival time, followed by lexical process ID.
            </li>
            <li>
              <strong>Optimality Trade-off:</strong> While SRTF provably minimizes average waiting time, it can cause indefinite starvation for long processes under heavy arrival loads. Round Robin trades higher average turnaround time for guaranteed bounded response latency and fairness.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
