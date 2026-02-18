import { useState } from 'react';
import { useStore } from '../store/useStore';

function GeometryDialog() {
  const { showGeometryDialog, setShowGeometryDialog, addGeometry } = useStore();
  const [geometryType, setGeometryType] = useState('box');
  const [name, setName] = useState('');

  const [width, setWidth] = useState(1);
  const [height, setHeight] = useState(1);
  const [depth, setDepth] = useState(1);
  const [radius, setRadius] = useState(0.5);

  if (!showGeometryDialog) return null;

  const handleCreate = () => {
    const baseData = {
      type: geometryType,
      name: name || `${geometryType}-${Date.now()}`
    };

    let geometryData;
    switch (geometryType) {
      case 'box':
        geometryData = { ...baseData, width, height, depth };
        break;
      case 'cylinder':
        geometryData = { ...baseData, radius, height };
        break;
      case 'sphere':
        geometryData = { ...baseData, radius };
        break;
      default:
        geometryData = baseData;
    }

    addGeometry(geometryData);
    setShowGeometryDialog(false);
    setName('');
  };

  const handleCancel = () => {
    setShowGeometryDialog(false);
    setName('');
  };

  return (
    <div className="dialog-overlay" onClick={handleCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Create Geometry</h2>
        
        <div className="dialog-content">
          <div className="property-row">
            <label>Name (optional)</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Beam"
            />
          </div>

          <div className="property-row">
            <label>Type</label>
            <select value={geometryType} onChange={(e) => setGeometryType(e.target.value)}>
              <option value="box">Box</option>
              <option value="cylinder">Cylinder</option>
              <option value="sphere">Sphere</option>
            </select>
          </div>

          {geometryType === 'box' && (
            <>
              <div className="property-row">
                <label>Width</label>
                <input 
                  type="number" 
                  value={width} 
                  onChange={(e) => setWidth(parseFloat(e.target.value))}
                  step="0.1"
                  min="0.1"
                />
              </div>
              <div className="property-row">
                <label>Height</label>
                <input 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(parseFloat(e.target.value))}
                  step="0.1"
                  min="0.1"
                />
              </div>
              <div className="property-row">
                <label>Depth</label>
                <input 
                  type="number" 
                  value={depth} 
                  onChange={(e) => setDepth(parseFloat(e.target.value))}
                  step="0.1"
                  min="0.1"
                />
              </div>
            </>
          )}

          {geometryType === 'cylinder' && (
            <>
              <div className="property-row">
                <label>Radius</label>
                <input 
                  type="number" 
                  value={radius} 
                  onChange={(e) => setRadius(parseFloat(e.target.value))}
                  step="0.1"
                  min="0.1"
                />
              </div>
              <div className="property-row">
                <label>Height</label>
                <input 
                  type="number" 
                  value={height} 
                  onChange={(e) => setHeight(parseFloat(e.target.value))}
                  step="0.1"
                  min="0.1"
                />
              </div>
            </>
          )}

          {geometryType === 'sphere' && (
            <div className="property-row">
              <label>Radius</label>
              <input 
                type="number" 
                value={radius} 
                onChange={(e) => setRadius(parseFloat(e.target.value))}
                step="0.1"
                min="0.1"
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

export default GeometryDialog;
