import React from 'react';

/**
 * CPU Gantt Chart Component
 * Displays chronological execution blocks with start times and durations.
 */
export default function GanttChart({
  gantt = [],
  onSelectProcess,
  onSelectTick,
}) {
  return (
    <div className="tech-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>CPU Execution Gantt Chart</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {gantt.length} execution segment{gantt.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="panel-body">
        {gantt.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No CPU execution recorded yet. Start the simulation or step forward.
          </div>
        ) : (
          <div style={{ overflowX: 'auto', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', minHeight: '52px' }}>
              {gantt.map((block, idx) => {
                const isIdle = block.processId === 'IDLE';
                const widthPx = Math.max(32, block.duration * 32);

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isIdle && onSelectProcess) {
                        onSelectProcess({ id: block.processId, name: block.name });
                      }
                      if (onSelectTick) {
                        onSelectTick(block.startTime);
                      }
                    }}
                    style={{
                      width: `${widthPx}px`,
                      minWidth: `${widthPx}px`,
                      height: '42px',
                      background: isIdle ? '#f4f4f5' : 'var(--text-main)',
                      color: isIdle ? 'var(--text-muted)' : 'var(--text-inverted)',
                      border: '1px solid var(--border-strong)',
                      borderRight: idx === gantt.length - 1 ? '1px solid var(--border-strong)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      position: 'relative',
                      userSelect: 'none',
                    }}
                    title={`${block.name} (t=${block.startTime} to t=${block.startTime + block.duration}, duration=${block.duration})`}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>
                      {block.name}
                    </span>
                    <span style={{ fontSize: '9px', opacity: 0.8 }}>
                      d={block.duration}
                    </span>

                    {/* Start timestamp marker */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-18px',
                        left: 0,
                        fontSize: '9px',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                      }}
                    >
                      {block.startTime}
                    </span>

                    {/* End timestamp marker on final block */}
                    {idx === gantt.length - 1 && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-18px',
                          right: 0,
                          fontSize: '9px',
                          color: 'var(--text-muted)',
                          fontWeight: 600,
                        }}
                      >
                        {block.startTime + block.duration}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
