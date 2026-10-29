import React, { useState } from 'react';
import { Filter, Download, ArrowRight } from 'lucide-react';

/**
 * Filterable System Event Log Component
 * Supports category and process filtering, jump to event tick, and real data export.
 */
export default function EventLog({
  events = [],
  onSelectEvent,
  onNavigateToTick,
  selectedEventId = null,
  processes = [],
}) {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [processFilter, setProcessFilter] = useState('ALL');

  const filteredEvents = events.filter(evt => {
    if (categoryFilter !== 'ALL' && evt.category !== categoryFilter.toLowerCase()) {
      return false;
    }
    if (processFilter !== 'ALL' && evt.processId !== processFilter) {
      return false;
    }
    return true;
  });

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `os_simulation_events_${Date.now()}.json`);
    dlAnchor.click();
  };

  const exportToCsv = () => {
    const headers = ['time', 'category', 'type', 'processName', 'page', 'message'];
    const rows = events.map(e => [
      e.time,
      e.category,
      e.type,
      e.processName || '',
      e.page !== undefined ? e.page : '',
      `"${(e.message || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', encodeURI(csvContent));
    dlAnchor.setAttribute('download', `os_simulation_events_${Date.now()}.csv`);
    dlAnchor.click();
  };

  return (
    <div className="tech-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span>System Execution Log ({filteredEvents.length} Events)</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="ctrl-btn"
            style={{ padding: '3px 8px', fontSize: '11px' }}
            onClick={exportToJson}
            title="Export real simulation events to JSON"
          >
            <Download size={12} />
            <span>JSON</span>
          </button>
          <button
            type="button"
            className="ctrl-btn"
            style={{ padding: '3px 8px', fontSize: '11px' }}
            onClick={exportToCsv}
            title="Export real simulation events to CSV"
          >
            <Download size={12} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      <div className="panel-body" style={{ padding: '12px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={12} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Category:</span>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              style={{ fontSize: '11px', padding: '3px 6px' }}
            >
              <option value="ALL">All Categories</option>
              <option value="CPU">CPU Scheduling</option>
              <option value="MEMORY">Memory Paging</option>
              <option value="SYSTEM">System Lifecycle</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600 }}>Process:</span>
            <select
              value={processFilter}
              onChange={e => setProcessFilter(e.target.value)}
              style={{ fontSize: '11px', padding: '3px 6px' }}
            >
              <option value="ALL">All Processes</option>
              {processes.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Event List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '2px' }}>
          {filteredEvents.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No recorded events match the selected filters.
            </div>
          ) : (
            filteredEvents.map(evt => {
              const isSelected = selectedEventId === evt.id;
              return (
                <div
                  key={evt.id}
                  className={`event-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onSelectEvent && onSelectEvent(evt);
                    onNavigateToTick && onNavigateToTick(evt.time);
                  }}
                  title="Click to inspect event and navigate timeline to this tick"
                >
                  <span className="event-time">t={evt.time}</span>
                  <span className="event-tag">{evt.type}</span>
                  <div style={{ flex: 1, fontSize: '12px' }}>
                    <span>{evt.message}</span>
                  </div>
                  <ArrowRight size={12} style={{ opacity: 0.5 }} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
