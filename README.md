# Interactive Operating Systems Laboratory

A deterministic, academic-grade operating systems simulator and visual laboratory built with **React 19** and **Vite 7**.

Designed for computer science students, educators, and software engineers to experiment with, compare, and analyze core operating system algorithms—specifically **CPU Process Scheduling** and **Virtual Memory Paging**.

---

## Visual Identity: 2D Monochrome Interface

The application is engineered around a strict **monochrome 2D visual identity**:

- **Color Palette**: High-contrast black (`#09090b`), clean white (`#ffffff`), and neutral slate grays (`#e4e4e7`, `#71717a`, `#f4f4f5`).
- **Zero Emojis**: Replaced with clean typography, borders, and functional Lucide icons.
- **Typography**: Clean sans-serif paired with monospaced typeface (`ui-monospace`) for simulation timestamps, Process IDs (`P1`, `P2`), memory frames (`F0`–`F7`), and metrics.
- **Accessible State Treatment**: Distinct monochrome hatched textures, solid fills, and bordered pills to differentiate process states without relying on bright colors.

---

## Core Laboratory Modules

### 1. Overview Workspace
- Real-time telemetry dashboard summarizing clock status, active scheduling algorithm, CPU utilization, and memory frame occupancy.
- 1-click launcher for guided educational experiment presets.

### 2. CPU Scheduling Laboratory
- **Supported Algorithms**:
  - **FCFS** (First-Come, First-Served): Non-preemptive FIFO ordering.
  - **SRTF** (Shortest Remaining Time First): Preemptive Shortest-Job-First.
  - **Round Robin (RR)**: Preemptive time-slicing with configurable quantum ($q \ge 1$).
- **Live Process Lifecycle Timeline**: Visualizes transitions across `New`, `Ready`, `Running`, and `Terminated` states.
- **Interactive Scrubber & Bidirectional Time Travel**: Step forward, step backward, or scrub to inspect historical states.
- **History Branching**: Resuming continuous simulation from a historical tick branches execution deterministically.
- **Interactive Ready Queue**: Real-time display of queued processes and remaining burst times.
- **CPU Gantt Chart**: Scaled chronological execution blocks with timestamp markings.

### 3. Virtual Memory Laboratory
- **8 Physical Memory Frames**: Selectable frames displaying resident pages, load timestamps (`loadedAt`), and last-access timestamps (`lastAccessed`).
- **Page-Reference Sequence Pointer**: Visual pointer tracking active and pending page requests.
- **Replacement Policies**:
  - **FIFO** (First-In, First-Out): Evicts the resident page that entered memory earliest.
  - **LRU** (Least Recently Used): Evicts the page whose most recent access occurred earliest.
- **Eviction Causality**: Dynamic explanations detailing why a specific victim page was selected.
- **Side-by-Side Policy Comparison**: Runs identical reference strings through FIFO and LRU concurrently, comparing hit ratios, fault ratios, and eviction counts.

### 4. Algorithm Battle Mode
- **Multi-Scheduler Comparison**: Runs FCFS, SRTF, and Round Robin concurrently against identical process workloads using independent simulation instances.
- **Synchronized Timelines**: Aligned to a shared common timescale with crosshair hover synchronization.
- **Comparative Metrics**: Quantitative table evaluating Turnaround Time, Waiting Time, Response Time, CPU Utilization, Makespan, Preemptions, and Context Switches.
- **Comparative Bar Charts**: Clean monochrome Recharts visualization for turnaround and waiting time distributions.

### 5. Execution History & Telemetry
- **Filterable Event Log**: Categorized by CPU scheduling, memory paging, and system lifecycle events.
- **Time Navigation**: Clicking any log event navigates directly to that timestamp in the timeline.
- **Data Export**: Export verified simulation telemetry directly to **JSON** or **CSV**.

### 6. Contextual System State Inspector
- Context-sensitive inspection panel responding immediately to user selection:
  - **Process Inspector**: PID, arrival, burst, remaining, completion time, turnaround, waiting, and response times.
  - **Memory Frame Inspector**: Frame index, resident page, residency status, and replacement order.
  - **Event Inspector**: Timestamp, category, involved entities, and detailed description.
  - **Timeline Tick Inspector**: Complete system snapshot at tick $t$.

---

## Guided Academic Presets

### CPU Scheduling Presets
- **Convoy Effect (FCFS vs. SRTF)**: Long process ($B=12$) followed by short jobs ($B=2, 2, 1$). Demonstrates average waiting time disparities.
- **Simultaneous Arrivals**: Four processes arriving at $t=0$ with varied bursts.
- **CPU Idle Gaps**: Discontinuous arrivals with gaps that force the CPU into idle states.
- **Round Robin Quantum Dynamics**: Multi-slice processes illustrating preemption frequency and rotation.
- **Preemption Cascade**: Successive arrivals with shorter remaining burst times repeatedly preempting running tasks.

### Virtual Memory Presets
- **High Locality of Reference**: Working set of pages cycling with high page hit rates.
- **Thrashing Loop**: Working set exceeding physical frame capacity, triggering frequent page faults.
- **FIFO vs. LRU Divergence**: Reference sequence illustrating where LRU preserves frequently re-referenced pages while FIFO evicts them.
- **Cold Start to Saturation**: Eight distinct pages filling physical memory before triggering page replacement.

---

## Project Structure

```
Operating system/
├── package.json                 # Dependencies and scripts (dev, build, lint, test)
├── vite.config.js               # Vite 7 build configuration
├── index.html                   # HTML entry point
├── test/                        # Automated unit tests
│   ├── scheduling.test.js       # Unit tests for FCFS, SRTF, RR, and metrics
│   ├── memory.test.js           # Unit tests for FIFO, LRU, and evictions
│   └── engine.test.js           # Unit tests for deterministic stepping & time travel
└── src/
    ├── main.jsx                 # React root renderer
    ├── App.jsx                  # Top-level state controller & time-travel manager
    ├── constants.js             # Navigation section constants
    ├── index.css                # 2D monochrome design system & typography tokens
    ├── algorithms/
    │   ├── scheduling.js        # Pure CPU scheduling algorithms & metric calculators
    │   └── pageReplacement.js  # Pure FIFO & LRU page replacement algorithms
    ├── simulation/
    │   └── engine.js            # Deterministic simulation engine & snapshot state machine
    ├── presets/
    │   └── workloads.js         # Curated CPU and memory workload presets
    ├── components/
    │   ├── Navigation.jsx       # Persistent header navigation
    │   ├── SimulationControls.jsx # Playback, time-travel, speed, and reset controls
    │   ├── ProcessTimeline.jsx  # Interactive process lifecycle timeline
    │   ├── GanttChart.jsx       # Scaled CPU Gantt chart
    │   ├── MemoryFrames.jsx     # 8 physical memory frames visualizer
    │   ├── SystemInspector.jsx  # Contextual state inspector panel
    │   └── EventLog.jsx         # Filterable event log with CSV/JSON export
    └── pages/
        ├── Overview.jsx         # System status landing workspace
        ├── Scheduling.jsx       # CPU scheduling laboratory view
        ├── MemoryManagement.jsx # Virtual memory paging laboratory view
        ├── AlgorithmBattle.jsx  # Head-to-head multi-algorithm comparison view
        └── ExecutionHistory.jsx # Telemetry event log view
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (v25+ recommended)
- **npm**: v9.0.0 or later

### Installation
```bash
npm install
```

### Running Locally
Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173/` (or the port shown in your terminal) in your browser.

### Running Automated Tests
Run unit tests across CPU scheduling, memory algorithms, and simulation snapshots:
```bash
npm test
```

### Linting
Verify code style and TypeScript/JSX correctness:
```bash
npm run lint
```

### Production Build
Build the minified production bundle into `dist/`:
```bash
npm run build
```
Preview the production build:
```bash
npm run preview
```

---

## Technical Specifications & Assumptions

- **Preemption Overhead**: Context switching overhead is modeled as 0 simulated ticks (ideal theoretical model).
- **Tie-Breaking Rule**: In SRTF, when two processes share the same remaining burst time, priority is resolved by earliest arrival time, followed by lexical process ID.
- **Memory Capacity**: Configured with 8 physical memory frames with zero-based indexing (`Frame 0` to `Frame 7`).
- **Deterministic Snapshots**: The history stack captures discrete clock states, enabling bidirectional stepping and inspection without state corruption.
