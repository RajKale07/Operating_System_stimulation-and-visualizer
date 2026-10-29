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

---

## How to Run the Project

Follow these step-by-step instructions to run the project locally on your machine.

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.0.0` or higher (comes bundled with Node.js)
- **Git**: ([Download Git](https://git-scm.com/))

Check your installed versions by running in your terminal:
```bash
node -v
npm -v
```

---

### 2. Clone the Repository
Open your terminal or command prompt and clone the repository:
```bash
git clone https://github.com/RajKale07/Operating_System_stimulation-and-visualizer.git
```

Navigate into the project directory:
```bash
cd Operating_System_stimulation-and-visualizer
```

---

### 3. Install Dependencies
Install all required Node.js packages:
```bash
npm install
```

---

### 4. Start the Development Server
Launch the interactive visualizer in development mode:
```bash
npm run dev
```

Once the terminal displays `VITE ready`, open your web browser and navigate to:
```
http://localhost:5173/
```
*(If port `5173` is already occupied, Vite will automatically select the next available port, e.g., `http://localhost:5174/`).*

---

### 5. Run Automated Unit Tests
To run the automated test suite verifying CPU scheduling algorithms (FCFS, SRTF, RR), memory paging (FIFO, LRU), and deterministic time travel:
```bash
npm test
```

---

### 6. Build for Production
To create an optimized, minified production build:
```bash
npm run build
```
The compiled files will be output to the `dist/` directory.

To test and preview the production build locally:
```bash
npm run preview
```

---

### Available Scripts Reference

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the local development server with Hot Module Replacement (HMR). |
| `npm test` | Runs all unit tests using Node.js native test runner (`node --test`). |
| `npm run build` | Compiles and bundles the application for production deployment into `dist/`. |
| `npm run preview` | Locally serves the production `dist/` bundle for verification. |
| `npm run lint` | Runs ESLint to check for code quality and syntax issues. |

---

## Technical Specifications & Assumptions

- **Preemption Overhead**: Context switching overhead is modeled as 0 simulated ticks (ideal theoretical model).
- **Tie-Breaking Rule**: In SRTF, when two processes share the same remaining burst time, priority is resolved by earliest arrival time, followed by lexical process ID.
- **Memory Capacity**: Configured with 8 physical memory frames with zero-based indexing (`Frame 0` to `Frame 7`).
- **Deterministic Snapshots**: The history stack captures discrete clock states, enabling bidirectional stepping and inspection without state corruption.
