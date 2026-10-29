import React from 'react';

/**
 * 2D Physical Memory Frame Grid
 * Displays 8 selectable physical frames with resident page and replacement timestamps.
 */
export default function MemoryFrames({
  frames = [],
  onSelectFrame,
  selectedFrameIndex = null,
  algorithm = 'FIFO',
}) {
  return (
    <div className="tech-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>Physical Memory Frames (N={frames.length}, Policy: {algorithm})</span>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {frames.filter(f => f.page !== null).length} / {frames.length} Occupied
        </div>
      </div>

      <div className="panel-body">
        <div className="memory-grid">
          {frames.map(frame => {
            const isSelected = selectedFrameIndex === frame.frameIndex;
            const isOccupied = frame.page !== null;

            return (
              <div
                key={frame.frameIndex}
                className={`memory-frame-card ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectFrame && onSelectFrame(frame)}
                title={`Frame ${frame.frameIndex}: ${isOccupied ? `Page ${frame.page}` : 'Empty'} (Click to inspect)`}
              >
                <div className="frame-head">
                  <span style={{ fontWeight: 700 }}>F{frame.frameIndex}</span>
                  <span style={{ fontSize: '10px' }}>{isOccupied ? 'OCCUPIED' : 'FREE'}</span>
                </div>

                <div className="frame-content">
                  {isOccupied ? `Page ${frame.page}` : '-'}
                </div>

                <div className="frame-foot">
                  <span>loaded: {frame.loadedAt !== Infinity ? `t=${frame.loadedAt}` : '-'}</span>
                  <span>last: {frame.lastAccessed !== -1 ? `t=${frame.lastAccessed}` : '-'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
