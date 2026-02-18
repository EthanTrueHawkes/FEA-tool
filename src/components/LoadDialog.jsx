import { useState } from 'react';
import { useStore } from '../store/useStore';

function LoadDialog() {
  const { showLoadDialog, setShowLoadDialog, addLoad, geometries } = useStore();
  const [name, setName] = useState('');
  const [loadType, setLoadType] = useState('force');
  const [targetGeometryId, setTargetGeometryId] = useState('');
  const [faceIndex, setFaceIndex] = useState(0);
  
  const [forceX, setForceX] = useState(0);
  const [forceY, setForceY] = useState(-1000);
  const [forceZ, setForceZ] = useState(0);
  
  const [pressure, setPressure] = useState(100000);

  if (!showLoadDialog) return null;

  const handleCreate = () => {
    if (!targetGeometryId) {
      alert('Please select a geometry');
      return;
    }

    const baseData = {
      type: loadType,
      name: name || `${loadType}-${Date.now()}`,
      targetGeometryId,
      faceIndex
    };

    let loadData;
    if (loadType === 'force') {
      loadData = { ...baseData, force: { x: forceX, y: forceY, z: forceZ } };
    } else if (loadType === 'pressure') {
      loadData = { ...baseData, pressure };
    }

    addLoad(loadData);
    setShowLoadDialog(false);
    setName('');
    setTargetGeometryId('');
  };

  const handleCancel = () => {
    setShowLoadDialog(false);
    setName('');
    setTargetGeometryId('');
  };

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Create Load</h2>
        
        <div className="dialog-content">
          <div className="property-row">
            <label>Name (optional)</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Wind Load"
            />
          </div>

          <div className="property-row">
            <label>Type</label>
            <select value={loadType} onChange={(e) => setLoadType(e.target.value)}>
              <option value="force">Force</option>
              <option value="pressure">Pressure</option>
            </select>
          </div>

          <div className="property-row">
            <label>Target Geometry</label>
            <select 
              value={targetGeometryId} 
              onChange={(e) => setTargetGeometryId(e.target.value)}
            >
              <option value="">-- Select Geometry --</option>
              {geometries.map(geo => (
                <option key={geo.id} value={geo.id}>
                  {geo.name || geo.type}
                </option>
              ))}
            </select>
          </div>

          <div className="property-row">
            <label>Face Index</label>
            <input 
              type="number" 
              value={faceIndex} 
              onChange={(e) => setFaceIndex(parseInt(e.target.value))}
              min="0"
              max="5"
            />
            <small style={{ color: '#999', fontSize: '12px' }}>
              Box: 0-5, Cylinder: 0-2, Sphere: 0
            </small>
          </div>

          {loadType === 'force' && (
            <>
              <div className="property-row">
                <label>Force X (N)</label>
                <input 
                  type="number" 
                  value={forceX} 
                  onChange={(e) => setForceX(parseFloat(e.target.value))}
                />
              </div>
              <div className="property-row">
                <label>Force Y (N)</label>
                <input 
                  type="number" 
                  value={forceY} 
                  onChange={(e) => setForceY(parseFloat(e.target.value))}
                />
              </div>
              <div className="property-row">
                <label>Force Z (N)</label>
                <input 
                  type="number" 
                  value={forceZ} 
                  onChange={(e) => setForceZ(parseFloat(e.target.value))}
                />
              </div>
            </>
          )}

          {loadType === 'pressure' && (
            <div className="property-row">
              <label>Pressure (Pa)</label>
              <input 
                type="number" 
                value={pressure} 
                onChange={(e) => setPressure(parseFloat(e.target.value))}
              />
            </div>
          )}
        </div>

        <div className="dialog-actions">
          <button onClick={handleCancel} className="button-secondary">Cancel</button>
          <button onClick={handleCreate} className="button-primary">Create</button>
        </div>
      </div>
    </div>
  );
}

export default LoadDialog;
