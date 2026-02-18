import { useStore } from '../store/useStore';

function PropertiesPanel() {
  const { 
    selection, 
    geometries, 
    loads, 
    boundaryConditions, 
    updateGeometry,
    updateLoad,
    updateBoundaryCondition 
  } = useStore();

  const renderProperties = () => {
    if (!selection) {
      return (
        <div>
          <p style={{ color: '#999', fontSize: '14px' }}>
            Select an item from the model tree or viewport to view its properties.
          </p>
        </div>
      );
    }

    if (selection.type === 'geometry') {
      const geo = geometries.find(g => g.id === selection.id);
      if (!geo) return <p>Geometry not found</p>;

      const handleChange = (field, value) => {
        updateGeometry(geo.id, { [field]: parseFloat(value) || 0 });
      };

      return (
        <div>
          <div className="property-group">
            <h3>Geometry Properties</h3>
            <div className="property-row">
              <label>Name</label>
              <input 
                type="text" 
                value={geo.name || geo.type} 
                onChange={(e) => updateGeometry(geo.id, { name: e.target.value })}
              />
            </div>
            <div className="property-row">
              <label>Type</label>
              <input type="text" value={geo.type} disabled />
            </div>
            <div className="property-row">
              <label>ID</label>
              <input type="text" value={geo.id} disabled />
            </div>
          </div>

          <div className="property-group">
            <h3>Dimensions</h3>
            {geo.type === 'box' && (
              <>
                <div className="property-row">
                  <label>Width</label>
                  <input 
                    type="number" 
                    value={geo.width} 
                    onChange={(e) => handleChange('width', e.target.value)}
                    step="0.1"
                  />
                </div>
                <div className="property-row">
                  <label>Height</label>
                  <input 
                    type="number" 
                    value={geo.height} 
                    onChange={(e) => handleChange('height', e.target.value)}
                    step="0.1"
                  />
                </div>
                <div className="property-row">
                  <label>Depth</label>
                  <input 
                    type="number" 
                    value={geo.depth} 
                    onChange={(e) => handleChange('depth', e.target.value)}
                    step="0.1"
                  />
                </div>
              </>
            )}
            {geo.type === 'cylinder' && (
              <>
                <div className="property-row">
                  <label>Radius</label>
                  <input 
                    type="number" 
                    value={geo.radius} 
                    onChange={(e) => handleChange('radius', e.target.value)}
                    step="0.1"
                  />
                </div>
                <div className="property-row">
                  <label>Height</label>
                  <input 
                    type="number" 
                    value={geo.height} 
                    onChange={(e) => handleChange('height', e.target.value)}
                    step="0.1"
                  />
                </div>
              </>
            )}
            {geo.type === 'sphere' && (
              <div className="property-row">
                <label>Radius</label>
                <input 
                  type="number" 
                  value={geo.radius} 
                  onChange={(e) => handleChange('radius', e.target.value)}
                  step="0.1"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (selection.type === 'load') {
      const load = loads.find(l => l.id === selection.id);
      if (!load) return <p>Load not found</p>;

      const targetGeo = geometries.find(g => g.id === load.targetGeometryId);

      return (
        <div>
          <div className="property-group">
            <h3>Load Properties</h3>
            <div className="property-row">
              <label>Name</label>
              <input 
                type="text" 
                value={load.name} 
                onChange={(e) => updateLoad(load.id, { name: e.target.value })}
              />
            </div>
            <div className="property-row">
              <label>Type</label>
              <input type="text" value={load.type} disabled />
            </div>
            <div className="property-row">
              <label>Target</label>
              <input type="text" value={targetGeo?.name || 'Unknown'} disabled />
            </div>
            <div className="property-row">
              <label>Face Index</label>
              <input type="number" value={load.faceIndex} disabled />
            </div>
          </div>

          {load.type === 'force' && (
            <div className="property-group">
              <h3>Force Vector</h3>
              <div className="property-row">
                <label>X (N)</label>
                <input 
                  type="number" 
                  value={load.force.x} 
                  onChange={(e) => updateLoad(load.id, { 
                    force: { ...load.force, x: parseFloat(e.target.value) }
                  })}
                />
              </div>
              <div className="property-row">
                <label>Y (N)</label>
                <input 
                  type="number" 
                  value={load.force.y} 
                  onChange={(e) => updateLoad(load.id, { 
                    force: { ...load.force, y: parseFloat(e.target.value) }
                  })}
                />
              </div>
              <div className="property-row">
                <label>Z (N)</label>
                <input 
                  type="number" 
                  value={load.force.z} 
                  onChange={(e) => updateLoad(load.id, { 
                    force: { ...load.force, z: parseFloat(e.target.value) }
                  })}
                />
              </div>
            </div>
          )}

          {load.type === 'pressure' && (
            <div className="property-group">
              <h3>Pressure</h3>
              <div className="property-row">
                <label>Magnitude (Pa)</label>
                <input 
                  type="number" 
                  value={load.pressure} 
                  onChange={(e) => updateLoad(load.id, { 
                    pressure: parseFloat(e.target.value)
                  })}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    if (selection.type === 'bc') {
      const bc = boundaryConditions.find(b => b.id === selection.id);
      if (!bc) return <p>Boundary condition not found</p>;

      const targetGeo = geometries.find(g => g.id === bc.targetGeometryId);

      return (
        <div>
          <div className="property-group">
            <h3>Boundary Condition Properties</h3>
            <div className="property-row">
              <label>Name</label>
              <input 
                type="text" 
                value={bc.name} 
                onChange={(e) => updateBoundaryCondition(bc.id, { name: e.target.value })}
              />
            </div>
            <div className="property-row">
              <label>Type</label>
              <input type="text" value={bc.type} disabled />
            </div>
            <div className="property-row">
              <label>Target</label>
              <input type="text" value={targetGeo?.name || 'Unknown'} disabled />
            </div>
            <div className="property-row">
              <label>Face Index</label>
              <input type="number" value={bc.faceIndex} disabled />
            </div>
          </div>
        </div>
      );
    }

    return <p>Unknown selection type</p>;
  };

  return (
    <div className="properties-panel">
      <h2>Properties</h2>
      {renderProperties()}
    </div>
  );
}

export default PropertiesPanel;
