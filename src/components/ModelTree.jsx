import { useStore } from '../store/useStore';

function ModelTree() {
  const { 
    geometries, 
    loads, 
    boundaryConditions, 
    analysis,
    results,
    selection, 
    setSelection, 
    removeGeometry, 
    removeLoad, 
    removeBoundaryCondition
  } = useStore();

  const handleSelect = (type, id) => {
    setSelection({ type, id });
  };

  return (
    <div className="model-tree">
      <h2>Model Tree</h2>
      
      <div className="tree-section">
        <h3>Geometry ({geometries.length})</h3>
        {geometries.length === 0 ? (
          <p className="empty-state">No geometry</p>
        ) : (
          <ul className="tree-items">
            {geometries.map((geo) => (
              <li
                key={geo.id}
                className={`tree-item ${selection?.type === 'geometry' && selection?.id === geo.id ? 'selected' : ''}`}
                onClick={() => handleSelect('geometry', geo.id)}
              >
                <span className="tree-item-icon">📦</span>
                <span className="tree-item-label">{geo.name || geo.type}</span>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeGeometry(geo.id);
                  }}
                  title="Delete"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="tree-section">
        <h3>Materials</h3>
        <p className="empty-state">Steel (default)</p>
      </div>

      <div className="tree-section">
        <h3>Loads ({loads.length})</h3>
        {loads.length === 0 ? (
          <p className="empty-state">No loads</p>
        ) : (
          <ul className="tree-items">
            {loads.map((load) => (
              <li
                key={load.id}
                className={`tree-item ${selection?.type === 'load' && selection?.id === load.id ? 'selected' : ''}`}
                onClick={() => handleSelect('load', load.id)}
              >
                <span className="tree-item-icon">{load.type === 'force' ? '➡️' : '⬇️'}</span>
                <span className="tree-item-label">{load.name || `${load.type}-${load.id.slice(-4)}`}</span>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLoad(load.id);
                  }}
                  title="Delete"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="tree-section">
        <h3>Supports ({boundaryConditions.length})</h3>
        {boundaryConditions.length === 0 ? (
          <p className="empty-state">No supports</p>
        ) : (
          <ul className="tree-items">
            {boundaryConditions.map((bc) => (
              <li
                key={bc.id}
                className={`tree-item ${selection?.type === 'bc' && selection?.id === bc.id ? 'selected' : ''}`}
                onClick={() => handleSelect('bc', bc.id)}
              >
                <span className="tree-item-icon">🔒</span>
                <span className="tree-item-label">{bc.name || `${bc.type}-${bc.id.slice(-4)}`}</span>
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBoundaryCondition(bc.id);
                  }}
                  title="Delete"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="tree-section">
        <h3>Analysis</h3>
        <p className={`tree-status ${analysis.solved ? 'solved' : ''}`}>
          {analysis.solved ? '✓ Solved' : '○ Not solved'}
        </p>
      </div>

      <div className="tree-section">
        <h3>Results</h3>
        {results ? (
          <div className="tree-results">
            <p className="tree-status solved">✓ Available</p>
            <div className="tree-results-summary">
              <div className="result-line">
                <span className="result-label">Displacement:</span>
                <span className="result-value">{results.displacement.max.toExponential(2)} m</span>
              </div>
              <div className="result-line">
                <span className="result-label">Max Stress:</span>
                <span className="result-value">{(results.stress.max / 1e6).toFixed(1)} MPa</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="empty-state">No results</p>
        )}
      </div>
    </div>
  );
}

export default ModelTree;
