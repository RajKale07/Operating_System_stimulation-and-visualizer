import React from 'react';

/**
 * Process Lifecycle Execution Timeline (Feature 1)
 * Displays process state transitions across simulation time in rows.
 * States: New, Ready, Running, Terminated
 */
export default function ProcessTimeline({
  processes = [],
  history = [],
  currentTick = 0,
  onSelectTick,
  onSelectProcess,
  selectedProcessId = null,
}) {
  const maxTick = Math.max(currentTick, history.length - 1, 15);
  const tickArray = Array.from({ length: maxTick + 1 }, (_, i) => i);

  // Determine state of process p at historical tick t
  const getProcessStateAtTick = (p, t) => {
    if (t >= history.length) {
      // Future or unsimulated tick
      return p.arrival > t ? 'new' : 'ready';
    }

    const snapshot = history[t];
    if (!snapshot) return 'new';

    const snapProc = snapshot.processes.find(sp => sp.id === p.id);
    if (!snapProc) return 'new';

    if (snapProc.remaining === 0 && snapProc.completionTime !== undefined && t >= snapProc.completionTime) {
      return 'terminated';
    }

    if (snapshot.runningProcessId === p.id) {
      return 'running';
    }

    if (snapshot.readyQueue.includes(p.id) || (snapProc.arrival <= t && snapProc.remaining > 0)) {
      return 'ready';
    }

    return 'new';
  };

  return (
    <div className="tech-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>Live Process Lifecycle Timeline</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'normal' }}>
            Click any tick to inspect system state
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: 'var(--text-main)', display: 'inline-block' }}></span> Running
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: '#e4e4e7', border: '1px solid #71717a', display: 'inline-block' }}></span> Ready
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, border: '1px dotted #71717a', display: 'inline-block' }}></span> New
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: '#fff', border: '1px solid #e4e4e7', display: 'inline-block' }}></span> Terminated
          </span>
        </div>
      </div>

      <div className="panel-body">
        {/* Timeline Scrubber */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Scrub Timeline:</span>
          <input
            type="range"
            min={0}
            max={Math.max(0, history.length - 1)}
            value={currentTick}
            onChange={e => onSelectTick(Number(e.target.value))}
            style={{ flex: 1, cursor: 'pointer' }}
          />
          <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700, minWidth: '40px' }}>
            t={currentTick}
          </span>
        </div>

        <div className="timeline-container">
          {/* Time axis header */}
          <div className="timeline-axis">
            <div className="timeline-label" style={{ color: 'var(--text-muted)' }}>
              PROCESS / T
            </div>
            <div className="timeline-cells">
              {tickArray.map(t => (
                <div
                  key={t}
                  className={`timeline-axis-cell ${t === currentTick ? 'current' : ''}`}
                  onClick={() => onSelectTick(Math.min(t, history.length - 1))}
                  title={`Click to jump to t=${t}`}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Process Rows */}
          {processes.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No processes configured in workload. Add a process or load a preset below.
            </div>
          ) : (
            processes.map(proc => {
              const isSelected = selectedProcessId === proc.id;
              return (
                <div key={proc.id} className="timeline-row">
                  <div
                    className="timeline-label"
                    onClick={() => onSelectProcess(proc)}
                    style={{
                      cursor: 'pointer',
                      textDecoration: isSelected ? 'underline' : 'none',
                      color: isSelected ? 'var(--text-main)' : 'inherit',
                    }}
                    title="Click to inspect process details"
                  >
                    <span>{proc.name}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      arr={proc.arrival}
                    </span>
                  </div>

                  <div className="timeline-cells">
                    {tickArray.map(t => {
                      const state = getProcessStateAtTick(proc, t);
                      const isTickActive = t === currentTick;
                      return (
                        <div
                          key={t}
                          className={`timeline-cell ${state} ${isTickActive ? 'active-tick-col' : ''}`}
                          onClick={() => {
                            if (t < history.length) {
                              onSelectTick(t);
                            }
                            onSelectProcess(proc);
                          }}
                          style={{
                            outline: isTickActive ? '2px solid var(--text-main)' : 'none',
                            outlineOffset: '-2px',
                          }}
                          title={`${proc.name} at t=${t}: state=${state}`}
                        >
                          {state === 'running' ? proc.name : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
