import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Geometry data
  geometries: [],
  
  // Material data
  materials: [
    { id: 'mat-default', name: 'Steel', youngModulus: 200e9, poissonRatio: 0.3 }
  ],
  
  // Loads data
  loads: [],
  
  // Boundary conditions data
  boundaryConditions: [],
  
  // Analysis settings
  analysis: {
    type: 'static',
    solved: false
  },
  
  // Results data
  results: null, // { displacement: {values, min, max}, stress: {values, min, max}, geometryResults: Map<geoId, {displacements, stresses}> }
  
  // UI state
  selection: null,
  showGeometryDialog: false,
  showLoadDialog: false,
  showBCDialog: false,
  showSolveDialog: false,
  creationMode: null, // 'box', 'cylinder', 'sphere', or null
  
  // Results viewing
  resultViewSettings: {
    fieldType: 'stress', // 'displacement' or 'stress'
    showDeformed: false,
    deformationScale: 1.0
  },
  
  // Actions
  setShowGeometryDialog: (show) => set({ showGeometryDialog: show }),
  setShowLoadDialog: (show) => set({ showLoadDialog: show }),
  setShowBCDialog: (show) => set({ showBCDialog: show }),
  setShowSolveDialog: (show) => set({ showSolveDialog: show }),
  setCreationMode: (mode) => set({ creationMode: mode }),
  
  setResultViewSettings: (settings) => set((state) => ({
    resultViewSettings: { ...state.resultViewSettings, ...settings }
  })),
  
  addGeometry: (geometry) => set((state) => ({
    geometries: [...state.geometries, { 
      ...geometry, 
      id: `geo-${Date.now()}`,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    }]
  })),
  
  updateGeometry: (id, updates) => set((state) => ({
    geometries: state.geometries.map(g => 
      g.id === id ? { ...g, ...updates } : g
    )
  })),
  
  removeGeometry: (id) => set((state) => ({
    geometries: state.geometries.filter(g => g.id !== id),
    loads: state.loads.filter(l => l.targetGeometryId !== id),
    boundaryConditions: state.boundaryConditions.filter(bc => bc.targetGeometryId !== id),
    selection: state.selection?.id === id ? null : state.selection
  })),
  
  addLoad: (load) => set((state) => ({
    loads: [...state.loads, { ...load, id: `load-${Date.now()}` }]
  })),
  
  updateLoad: (id, updates) => set((state) => ({
    loads: state.loads.map(l => 
      l.id === id ? { ...l, ...updates } : l
    )
  })),
  
  removeLoad: (id) => set((state) => ({
    loads: state.loads.filter(l => l.id !== id),
    selection: state.selection?.id === id ? null : state.selection
  })),
  
  addBoundaryCondition: (bc) => set((state) => ({
    boundaryConditions: [...state.boundaryConditions, { ...bc, id: `bc-${Date.now()}` }]
  })),
  
  updateBoundaryCondition: (id, updates) => set((state) => ({
    boundaryConditions: state.boundaryConditions.map(bc => 
      bc.id === id ? { ...bc, ...updates } : bc
    )
  })),
  
  removeBoundaryCondition: (id) => set((state) => ({
    boundaryConditions: state.boundaryConditions.filter(bc => bc.id !== id),
    selection: state.selection?.id === id ? null : state.selection
  })),
  
  setSelection: (selection) => set({ selection }),
  
  setResults: (results) => set({ 
    results, 
    analysis: { ...get().analysis, solved: true },
    resultViewSettings: { ...get().resultViewSettings, fieldType: 'stress', showDeformed: false }
  }),
  
  clearResults: () => set({ 
    results: null, 
    analysis: { ...get().analysis, solved: false },
    resultViewSettings: { fieldType: 'stress', showDeformed: false, deformationScale: 1.0 }
  }),
  
  resetProject: () => set({
    geometries: [],
    loads: [],
    boundaryConditions: [],
    results: null,
    selection: null,
    analysis: { type: 'static', solved: false },
    resultViewSettings: { fieldType: 'stress', showDeformed: false, deformationScale: 1.0 }
  }),
  
  // Persistence
  saveProject: () => {
    const state = get();
    const project = {
      geometries: state.geometries,
      loads: state.loads,
      boundaryConditions: state.boundaryConditions,
      materials: state.materials,
      analysis: state.analysis,
      results: state.results
    };
    localStorage.setItem('fea-project', JSON.stringify(project));
  },
  
  loadProject: () => {
    const saved = localStorage.getItem('fea-project');
    if (saved) {
      const project = JSON.parse(saved);
      set({
        geometries: project.geometries || [],
        loads: project.loads || [],
        boundaryConditions: project.boundaryConditions || [],
        materials: project.materials || [{ id: 'mat-default', name: 'Steel', youngModulus: 200e9, poissonRatio: 0.3 }],
        analysis: project.analysis || { type: 'static', solved: false },
        results: project.results || null,
        selection: null,
        resultViewSettings: { fieldType: 'stress', showDeformed: false, deformationScale: 1.0 }
      });
      return true;
    }
    return false;
  }
}));

export { useStore };
