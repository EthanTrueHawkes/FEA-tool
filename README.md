# FEA Prototype

A browser-based FEA (Finite Element Analysis) workflow prototype demonstrating improved UX for engineering simulation software.

## Features

✅ **M1: Layout & State** - Three-panel interface with Zustand state management
✅ **M2: 3D Viewport** - Three.js with OrbitControls, primitive creation (box/cylinder/sphere), click-to-select
✅ **M3: Loads & BCs** - Force/pressure loads, fixed boundary conditions, viewport glyphs, localStorage persistence
✅ **M4: Solve & Results** - Mock solver with progress, color-mapped results, deformed shape visualization

## Complete Workflow

1. **Create Geometry** - Add box, cylinder, or sphere primitives
2. **Apply Boundary Conditions** - Fixed supports on selected faces
3. **Add Loads** - Force vectors or pressure on faces
4. **Solve** - Run analysis with progress visualization
5. **View Results** - von Mises stress or displacement with color mapping and deformation

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher) - Download from https://nodejs.org/

### Installation

1. Navigate to this directory:
```bash
cd fea-prototype
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown (typically `http://localhost:5173/`)

## Quick Start Guide

Once running:

1. **Create a Box**
   - Click "+ Add" under Geometry
   - Select Box, leave default size (1×1×1)
   - Click Create

2. **Add Fixed Support**
   - Click "+ Add" under Boundary Conditions
   - Select your box
   - Face Index: 3 (bottom face)
   - Click Create
   - You'll see yellow anchor glyphs

3. **Add Force Load**
   - Click "+ Add" under Loads
   - Type: Force
   - Select your box
   - Face Index: 2 (top face)
   - Force Y: -1000 (downward)
   - Click Create
   - You'll see a green arrow

4. **Run Analysis**
   - Click "Solve" under Analysis
   - Watch progress dialog
   - Results appear automatically

5. **View Results**
   - Geometry shows color mapping (blue=low, red=high stress)
   - Legend shows min/max values
   - Toggle "Show Deformed Shape"
   - Adjust "Deformation Scale" slider
   - Switch between Displacement/Stress fields

6. **Save Your Work**
   - Click "Save" in header (saves to browser localStorage)
   - Click "Load" to restore

## Face Index Reference

**Box Faces:**
- 0: Front (+Z)
- 1: Back (-Z)
- 2: Top (+Y)
- 3: Bottom (-Y)
- 4: Right (+X)
- 5: Left (-X)

**Cylinder Faces:**
- 0: Top (+Y)
- 1: Bottom (-Y)
- 2: Side (radial)

**Sphere:**
- 0: Any point (simplified)

## Architecture

```
src/
├── components/
│   ├── ModelTree.jsx         # Left panel - model hierarchy
│   ├── Viewport.jsx          # Center - Three.js 3D view
│   ├── PropertiesPanel.jsx   # Right panel - item properties
│   ├── ResultsPanel.jsx      # Right panel - results controls
│   ├── GeometryDialog.jsx    # Create geometry modal
│   ├── LoadDialog.jsx        # Create load modal
│   ├── BCDialog.jsx          # Create boundary condition modal
│   └── SolveDialog.jsx       # Solver progress modal
├── store/
│   └── useStore.js           # Zustand global state
├── App.jsx                   # Main app component
├── App.css                   # All styles
└── main.jsx                  # React entry point
```

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Three.js** - 3D graphics
- **Zustand** - State management
- **OrbitControls** - Camera navigation

## Notes

- This is a **UX prototype** demonstrating workflow, not a real FEA solver
- Results are plausibly generated based on loads/BCs but not physically accurate
- Meshing is hidden/automatic (not shown in UI)
- Dimension editing doesn't update geometry (by design for simplicity)
- All data stored in browser localStorage

## Future Enhancements

Possible improvements for a production version:
- Real FEA solver integration (e.g., via WebAssembly)
- Import/export CAD geometry (STEP, IGES)
- Multiple materials assignment
- Contact constraints
- Nonlinear analysis
- Modal analysis
- Export results to CSV/JSON
- Cloud save/share projects

## License

MIT - Feel free to use this as a starting point for your own projects!
