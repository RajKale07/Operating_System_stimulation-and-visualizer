import React, { useState } from 'react';
import { History, Download, Filter } from 'lucide-react';
import EventLog from '../components/EventLog.jsx';
import SystemInspector from '../components/SystemInspector.jsx';

export default function ExecutionHistory({
  events = [],
  processes = [],
  onNavigateToTick,
  currentSnapshot,
}) {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const cpuEventsCount = events.filter(e => e.category === 'cpu').length;
  const memoryEventsCount = events.filter(e => e.category === 'memory').length;
  const systemEventsCount = events.filter(e => e.category === 'system').length;

  return (
    <div>
      {/* Header */}
      <div className="tech-panel">
        <div className="panel-header">
          <div className="panel-title">
            <History size={16} />
            <span>Execution History & Telemetry Logs</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Total Events Logged: {events.length}
          </span>
        </div>
        <div className="panel-body">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
            Chronological audit log of all operating system state transitions, including process arrivals, CPU dispatches, preemptions, quantum expirations, page hits, page faults, and frame evictions.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '10px 14px', border: '1px solid var(--border-subtle)', borderRadius: '2px', background: 'var(--bg-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>CPU Scheduling Events</span>
              <span className="font-mono" style={{ fontSize: '18px', fontWeight: 700 }}>{cpuEventsCount}</span>
            </div>
            <div style={{ padding: '10px 14px', border: '1px solid var(--border-subtle)', borderRadius: '2px', background: 'var(--bg-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Memory Paging Events</span>
              <span className="font-mono" style={{ fontSize: '18px', fontWeight: 700 }}>{memoryEventsCount}</span>
            </div>
            <div style={{ padding: '10px 14px', border: '1px solid var(--border-subtle)', borderRadius: '2px', background: 'var(--bg-subtle)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>System Lifecycle Events</span>
              <span className="font-mono" style={{ fontSize: '18px', fontWeight: 700 }}>{systemEventsCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Event Log + Contextual Event Inspector */}
      <div className="workspace-grid">
        <div>
          <EventLog
            events={events}
            processes={processes}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
            onNavigateToTick={onNavigateToTick}
            selectedEventId={selectedEvent?.id}
          />
        </div>

        <div>
          {selectedEvent ? (
            <SystemInspector
              selection={{ type: 'event', data: selectedEvent }}
              onClose={() => setSelectedEvent(null)}
              onNavigateToTick={onNavigateToTick}
              currentSnapshot={currentSnapshot}
            />
          ) : (
            <div className="tech-panel">
              <div className="panel-header">
                <span className="panel-title">Event Inspector</span>
              </div>
              <div className="panel-body" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '24px' }}>
                Select any log entry on the left to inspect its detailed parameters and jump to the exact timeline tick.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
