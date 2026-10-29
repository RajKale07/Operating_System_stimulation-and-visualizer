import React from 'react';
import { X, Cpu, HardDrive, Bell, Clock, ArrowRight } from 'lucide-react';

/**
 * Contextual System State Inspector (Feature 4)
 * Responds to user selection of Process, Memory Frame, Event, or Timeline Tick.
 */
export default function SystemInspector({
  selection,
  onClose,
  onNavigateToTick,
  currentSnapshot,
}) {
  if (!selection) return null;

  const { type, data } = selection;

  return (
    <div className="inspector-panel">
      <div className="inspector-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          {type === 'process' && <Cpu size={14} />}
          {type === 'frame' && <HardDrive size={14} />}
          {type === 'event' && <Bell size={14} />}
          {type === 'tick' && <Clock size={14} />}
          <span>{type} Inspector</span>
        </div>
        <button
          type="button"
          className="inspector-close-btn"
          onClick={onClose}
          title="Close Inspector"
        >
          <X size={12} />
        </button>
      </div>

      {/* PROCESS INSPECTOR */}
      {type === 'process' && (
        <div className="property-list">
          <div className="property-row">
            <span className="property-name">Process Identifier:</span>
            <span className="property-value">{data.name} ({data.id})</span>
          </div>
          <div className="property-row">
            <span className="property-name">Current State:</span>
            <span className="property-value" style={{ textTransform: 'uppercase' }}>
              {data.state || (data.remaining === 0 ? 'terminated' : 'ready')}
            </span>
          </div>
          <div className="property-row">
            <span className="property-name">Arrival Time (A):</span>
            <span className="property-value">t={data.arrival}</span>
          </div>
          <div className="property-row">
            <span className="property-name">Burst Time (B):</span>
            <span className="property-value">{data.burst} ticks</span>
          </div>
          <div className="property-row">
            <span className="property-name">Remaining Burst:</span>
            <span className="property-value">{data.remaining} ticks</span>
          </div>
          <div className="property-row">
            <span className="property-name">Virtual Page Sequence:</span>
            <span className="property-value">
              {data.pages && data.pages.length ? `[${data.pages.join(', ')}]` : 'None'}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Performance Metrics (Calculated):
            </span>
          </div>

          <div className="property-row">
            <span className="property-name">First CPU Start (R):</span>
            <span className="property-value">
              {data.firstStartTime !== undefined ? `t=${data.firstStartTime}` : 'Pending'}
            </span>
          </div>
          <div className="property-row">
            <span className="property-name">Completion Time (C):</span>
            <span className="property-value">
              {data.completionTime !== undefined ? `t=${data.completionTime}` : 'In progress'}
            </span>
          </div>
          <div className="property-row">
            <span className="property-name">Turnaround Time (C - A):</span>
            <span className="property-value">
              {data.completionTime !== undefined ? `${data.completionTime - data.arrival} ticks` : '-'}
            </span>
          </div>
          <div className="property-row">
            <span className="property-name">Waiting Time (TAT - B):</span>
            <span className="property-value">
              {data.completionTime !== undefined ? `${(data.completionTime - data.arrival) - data.burst} ticks` : '-'}
            </span>
          </div>
          <div className="property-row">
            <span className="property-name">Response Time (R - A):</span>
            <span className="property-value">
              {data.firstStartTime !== undefined ? `${data.firstStartTime - data.arrival} ticks` : '-'}
            </span>
          </div>
        </div>
      )}

      {/* MEMORY FRAME INSPECTOR */}
      {type === 'frame' && (
        <div className="property-list">
          <div className="property-row">
            <span className="property-name">Frame Identifier:</span>
            <span className="property-value">Frame {data.frameIndex}</span>
          </div>
          <div className="property-row">
            <span className="property-name">Resident Page:</span>
            <span className="property-value">
              {data.page !== null ? `Page ${data.page}` : 'Empty (Unallocated)'}
            </span>
          </div>
          <div className="property-row">
            <span className="property-name">Loaded At Timestamp (FIFO):</span>
            <span className="property-value">
              {data.loadedAt !== Infinity ? `t=${data.loadedAt}` : '-'}
            </span>
          </div>
          <div className="property-row">
            <span className="property-name">Last Accessed Timestamp (LRU):</span>
            <span className="property-value">
              {data.lastAccessed !== -1 ? `t=${data.lastAccessed}` : '-'}
            </span>
          </div>
          <div className="property-row">
            <span className="property-name">Frame Status:</span>
            <span className="property-value">
              {data.page !== null ? 'Occupied' : 'Free'}
            </span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
            Physical frame used by memory paging simulation. FIFO evicts earliest loadedAt; LRU evicts earliest lastAccessed.
          </div>
        </div>
      )}

      {/* EVENT INSPECTOR */}
      {type === 'event' && (
        <div className="property-list">
          <div className="property-row">
            <span className="property-name">Simulation Timestamp:</span>
            <span className="property-value">t={data.time}</span>
          </div>
          <div className="property-row">
            <span className="property-name">Event Type:</span>
            <span className="property-value">{data.type}</span>
          </div>
          <div className="property-row">
            <span className="property-name">Category:</span>
            <span className="property-value" style={{ textTransform: 'uppercase' }}>
              {data.category}
            </span>
          </div>
          {data.processName && (
            <div className="property-row">
              <span className="property-name">Associated Process:</span>
              <span className="property-value">{data.processName}</span>
            </div>
          )}
          {data.page !== undefined && (
            <div className="property-row">
              <span className="property-name">Referenced Page:</span>
              <span className="property-value">Page {data.page}</span>
            </div>
          )}
          {data.frameIndex !== undefined && (
            <div className="property-row">
              <span className="property-name">Target Frame:</span>
              <span className="property-value">Frame {data.frameIndex}</span>
            </div>
          )}

          <div style={{ marginTop: '10px', padding: '8px', background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Event Log Details:
            </span>
            <p style={{ fontSize: '12px', fontWeight: 500 }}>{data.message}</p>
          </div>

          {onNavigateToTick && (
            <button
              type="button"
              className="ctrl-btn"
              onClick={() => onNavigateToTick(data.time)}
              style={{ marginTop: '12px', width: '100%', justifyContent: 'center' }}
            >
              <ArrowRight size={14} />
              <span>Jump to Simulation Tick t={data.time}</span>
            </button>
          )}
        </div>
      )}

      {/* TICK INSPECTOR */}
      {type === 'tick' && currentSnapshot && (
        <div className="property-list">
          <div className="property-row">
            <span className="property-name">Snapshot Timestamp:</span>
            <span className="property-value">t={currentSnapshot.systemTime}</span>
          </div>
          <div className="property-row">
            <span className="property-name">CPU Running Process:</span>
            <span className="property-value">
              {currentSnapshot.runningProcessId
                ? currentSnapshot.processes.find(p => p.id === currentSnapshot.runningProcessId)?.name || currentSnapshot.runningProcessId
                : 'IDLE'}
            </span>
          </div>
          <div className="property-row">
            <span className="property-name">Ready Queue Processes:</span>
            <span className="property-value">
              {currentSnapshot.readyQueue.length
                ? currentSnapshot.readyQueue
                    .map(id => currentSnapshot.processes.find(p => p.id === id)?.name || id)
                    .join(', ')
                : 'Empty'}
            </span>
          </div>
          <div className="property-row">
            <span className="property-name">Occupied Memory Frames:</span>
            <span className="property-value">
              {currentSnapshot.frames.filter(f => f.page !== null).length} / {currentSnapshot.frameCount}
            </span>
          </div>
          <div className="property-row">
            <span className="property-name">Page Hits / Faults:</span>
            <span className="property-value">
              {currentSnapshot.memoryStats.hits} Hits / {currentSnapshot.memoryStats.faults} Faults
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
