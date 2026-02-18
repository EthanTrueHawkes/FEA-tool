import { useStore } from '../store/useStore';

function Ribbon() {
  const { 
    setShowLoadDialog, 
    setShowBCDialog, 
    setShowSolveDialog,
    setCreationMode,
    creationMode,
    geometries,
    loads,
    boundaryConditions,
    analysis
  } = useStore();

  const canSolve = geometries.length > 0 && boundaryConditions.length > 0 && loads.length > 0;

  const handleGeometryClick = (type) => {
    setCreationMode(type);
  };

  return (
    <div className="ribbon">
      <div className="ribbon-section">
        <div className="ribbon-section-title">Geometry</div>
        <div className="ribbon-buttons">
          <button 
            className={`ribbon-button ${creationMode === 'box' ? 'ribbon-button-active' : ''}`}
            onClick={() => handleGeometryClick('box')}
            title="Click and drag in viewport to create Box"
          >
            <div className="ribbon-icon">📦</div>
            <div className="ribbon-label">Box</div>
          </button>
          <button 
            className={`ribbon-button ${creationMode === 'cylinder' ? 'ribbon-button-active' : ''}`}
            onClick={() => handleGeometryClick('cylinder')}
            title="Click and drag in viewport to create Cylinder"
          >
            <div className="ribbon-icon">🛢️</div>
            <div className="ribbon-label">Cylinder</div>
          </button>
          <button 
            className={`ribbon-button ${creationMode === 'sphere' ? 'ribbon-button-active' : ''}`}
            onClick={() => handleGeometryClick('sphere')}
            title="Click and drag in viewport to create Sphere"
          >
            <div className="ribbon-icon">⚽</div>
            <div className="ribbon-label">Sphere</div>
          </button>
        </div>
      </div>

      <div className="ribbon-divider"></div>

      <div className="ribbon-section">
        <div className="ribbon-section-title">Materials</div>
        <div className="ribbon-buttons">
          <button 
            className="ribbon-button"
            disabled
            title="Material assignment (not implemented)"
          >
            <div className="ribbon-icon">🔧</div>
            <div className="ribbon-label">Assign</div>
          </button>
          <button 
            className="ribbon-button"
            disabled
            title="Material library (not implemented)"
          >
            <div className="ribbon-icon">📚</div>
            <div className="ribbon-label">Library</div>
          </button>
        </div>
      </div>

      <div className="ribbon-divider"></div>

      <div className="ribbon-section">
        <div className="ribbon-section-title">Loads</div>
        <div className="ribbon-buttons">
          <button 
            className="ribbon-button"
            onClick={() => setShowLoadDialog(true)}
            title="Apply force load"
          >
            <div className="ribbon-icon">➡️</div>
            <div className="ribbon-label">Force</div>
          </button>
          <button 
            className="ribbon-button"
            onClick={() => setShowLoadDialog(true)}
            title="Apply pressure load"
          >
            <div className="ribbon-icon">⬇️</div>
            <div className="ribbon-label">Pressure</div>
          </button>
        </div>
      </div>

      <div className="ribbon-divider"></div>

      <div className="ribbon-section">
        <div className="ribbon-section-title">Supports</div>
        <div className="ribbon-buttons">
          <button 
            className="ribbon-button"
            onClick={() => setShowBCDialog(true)}
            title="Apply fixed support"
          >
            <div className="ribbon-icon">🔒</div>
            <div className="ribbon-label">Fixed</div>
          </button>
          <button 
            className="ribbon-button"
            disabled
            title="Roller support (not implemented)"
          >
            <div className="ribbon-icon">🎯</div>
            <div className="ribbon-label">Roller</div>
          </button>
        </div>
      </div>

      <div className="ribbon-divider"></div>

      <div className="ribbon-section">
        <div className="ribbon-section-title">Analysis</div>
        <div className="ribbon-buttons">
          <button 
            className="ribbon-button ribbon-button-primary"
            onClick={() => setShowSolveDialog(true)}
            disabled={!canSolve}
            title={canSolve ? 'Run analysis' : 'Add geometry, loads, and BCs first'}
          >
            <div className="ribbon-icon">▶️</div>
            <div className="ribbon-label">{analysis.solved ? 'Re-solve' : 'Solve'}</div>
          </button>
          <button 
            className="ribbon-button"
            disabled
            title="Settings (not implemented)"
          >
            <div className="ribbon-icon">⚙️</div>
            <div className="ribbon-label">Settings</div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Ribbon;
