import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  StepBack,
  SkipBack,
  SkipForward,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function SimulationControls({
  running,
  onToggleRun,
  onStepForward,
  onStepBackward,
  onJumpToBeginning,
  onJumpToLatest,
  onReset,
  currentTick,
  latestTick,
  speed,
  onChangeSpeed,
  disabled = false,
}) {
  const isHistorical = currentTick < latestTick;

  return (
    <div className="controls-toolbar">
      <div className="controls-group">
        <button
          type="button"
          className="ctrl-btn"
          onClick={onJumpToBeginning}
          disabled={disabled || currentTick === 0}
          title="Jump to beginning (t=0)"
        >
          <SkipBack size={14} />
          <span>Beginning</span>
        </button>

        <button
          type="button"
          className="ctrl-btn"
          onClick={onStepBackward}
          disabled={disabled || currentTick === 0}
          title="Step backward 1 tick (Time travel)"
        >
          <StepBack size={14} />
          <span>Step Back</span>
        </button>

        <button
          type="button"
          className={`ctrl-btn primary`}
          onClick={onToggleRun}
          disabled={disabled}
          title={running ? 'Pause simulation' : 'Start continuous simulation'}
        >
          {running ? <Pause size={14} /> : <Play size={14} />}
          <span>{running ? 'Pause' : 'Start'}</span>
        </button>

        <button
          type="button"
          className="ctrl-btn"
          onClick={onStepForward}
          disabled={disabled || running}
          title="Step forward 1 tick"
        >
          <StepForward size={14} />
          <span>Step Forward</span>
        </button>

        <button
          type="button"
          className="ctrl-btn"
          onClick={onJumpToLatest}
          disabled={disabled || !isHistorical}
          title="Jump to latest simulated tick"
        >
          <SkipForward size={14} />
          <span>Latest</span>
        </button>

        <button
          type="button"
          className="ctrl-btn"
          onClick={onReset}
          disabled={disabled}
          title="Reset simulation to initial state"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      <div className="controls-group">
        <div className="time-indicator font-mono">
          <Clock size={14} />
          <span>t={currentTick}</span>
          {isHistorical && (
            <span className="historical-badge" title="Inspecting historical state">
              History (Latest: {latestTick})
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Speed:</span>
          <select
            value={speed}
            onChange={e => onChangeSpeed(Number(e.target.value))}
            style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 600 }}
          >
            <option value={1500}>0.5x</option>
            <option value={800}>1.0x</option>
            <option value={400}>2.0x</option>
            <option value={150}>5.0x</option>
          </select>
        </div>
      </div>

      {isHistorical && (
        <div style={{ width: '100%', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '4px', borderTop: '1px dashed var(--border-subtle)' }}>
          <AlertCircle size={13} />
          <span>
            You are inspecting a historical simulation snapshot at <strong>t={currentTick}</strong>. Resuming execution will branch from this tick and discard future history.
          </span>
        </div>
      )}
    </div>
  );
}
