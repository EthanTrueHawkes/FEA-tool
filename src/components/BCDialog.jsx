import { useState } from 'react';
import { useStore } from '../store/useStore';

function BCDialog() {
  const { showBCDialog, setShowBCDialog, addBoundaryCondition, geometries } = useStore();
  const [name, setName] = useState('');
  const [bcType, setBCType] = useState('fixed');
  const [targetGeometryId, setTargetGeometryId] = useState('');
  const [faceIndex, setFaceIndex] = useState(0);

  if (!showBCDialog) return null;

  const handleCreate = () => {
    if (!targetGeometryId) {
      alert('Please select a geometry');
      return;
    }

    const bcData = {
      type: bcType,
      name: name || `${bcType}-${Date.now()}`,
      targetGeometryId,
      faceIndex
    };

    addBoundaryCondition(bcData);
    setShowBCDialog(false);
    setName('');
    setTargetGeometryId('');
  };

  const handleCancel = () => {
    setShowBCDialog(false);
    setName('');
    setTargetGeometryId('');
  };

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Create Boundary Condition</h2>
        
        <div className="dialog-content">
          <div className="property-row">
            <label>Name (optional)</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fixed Base"
            />
          </div>

          <div className="property-row">
            <label>Type</label>
            <select value={bcType} onChange={(e) => setBCType(e.target.value)}>
              <option value="fixed">Fixed Support</option>
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
        </div>

        <div className="dialog-actions">
          <button onClick={handleCancel} className="button-secondary">Cancel</button>
          <button onClick={handleCreate} className="button-primary">Create</button>
        </div>
      </div>
    </div>
  );
}

export default BCDialog;
