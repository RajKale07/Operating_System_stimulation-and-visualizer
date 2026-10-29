import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  HardDrive,
  Swords,
  History,
} from 'lucide-react';
import { SECTIONS } from '../constants.js';

export default function Navigation({ activeSection, onSelectSection, isHistorical, currentTick, latestTick }) {
  const navItems = [
    { id: SECTIONS.OVERVIEW, label: 'Overview', icon: LayoutDashboard },
    { id: SECTIONS.SCHEDULING, label: 'CPU Scheduling', icon: Cpu },
    { id: SECTIONS.MEMORY, label: 'Memory Management', icon: HardDrive },
    { id: SECTIONS.BATTLE, label: 'Algorithm Battle', icon: Swords },
    { id: SECTIONS.HISTORY, label: 'Execution History', icon: History },
  ];

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <span className="brand-badge">OS LAB</span>
          <span className="brand-title">Interactive OS Laboratory</span>
          {isHistorical && (
            <span className="historical-badge font-mono">
              INSPECTING T={currentTick} / {latestTick}
            </span>
          )}
        </div>

        <nav className="nav-links">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`nav-button ${isActive ? 'active' : ''}`}
                type="button"
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
