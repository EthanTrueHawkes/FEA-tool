import { useStore } from '../store/useStore';

function ResultsPanel() {
  const { results, resultViewSettings, setResultViewSettings } = useStore();

  if (!results) {
    return (
      <div className="results-panel">
        <h3>Results Viewer</h3>
        <p style={{ color: '#999', fontSize: '13px' }}>Run analysis to view results</p>
      </div>
    );
  }

  return (
    <div className="results-panel">
      <h3>Results Viewer</h3>
      
      <div className="property-row">
        <label>Field</label>
        <select 
          value={resultViewSettings.fieldType}
          onChange={(e) => setResultViewSettings({ fieldType: e.target.value })}
        >
          <option value="displacement">Displacement Magnitude</option>
          <option value="stress">von Mises Stress</option>
        </select>
      </div>

      <div className="property-row">
        <label>
          <input 
            type="checkbox"
            checked={resultViewSettings.showDeformed}
            onChange={(e) => setResultViewSettings({ showDeformed: e.target.checked })}
            style={{ width: 'auto', marginRight: '8px' }}
          />
          Show Deformed Shape
        </label>
      </div>

      {resultViewSettings.showDeformed && (
        <div className="property-row">
          <label>Deformation Scale: {resultViewSettings.deformationScale.toFixed(1)}x</label>
          <input 
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={resultViewSettings.deformationScale}
            onChange={(e) => setResultViewSettings({ deformationScale: parseFloat(e.target.value) })}
          />
        </div>
      )}

      <div style={{ marginTop: '16px', fontSize: '13px', color: '#666' }}>
        <p><strong>Min:</strong> {
          resultViewSettings.fieldType === 'displacement' 
            ? results.displacement.min.toExponential(3) + ' m'
            : (results.stress.min / 1e6).toFixed(2) + ' MPa'
        }</p>
        <p><strong>Max:</strong> {
          resultViewSettings.fieldType === 'displacement' 
            ? results.displacement.max.toExponential(3) + ' m'
            : (results.stress.max / 1e6).toFixed(2) + ' MPa'
        }</p>
      </div>
    </div>
  );
}

export default ResultsPanel;
